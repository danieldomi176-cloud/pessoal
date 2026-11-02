-- LifeOS 0.1: dados vazios por padrão. Todos os horários persistidos em UTC.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 60),
  theme text not null default 'dark' check (theme in ('dark','light')),
  spiritual_reflection boolean not null default true,
  dashboard_cards text[] not null default array['focus','english','reading','habits'],
  daily_reading_minutes integer not null default 10 check (daily_reading_minutes between 1 and 180),
  created_at timestamptz not null default now()
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  pillar text not null default 'discipline' check (pillar in ('faith','english','reading','focus','body','growth','discipline','money','mind','vision','soul')),
  due_date date not null default ((now() at time zone 'Africa/Maputo')::date),
  priority integer not null default 0 check (priority between 0 and 3),
  completed_at timestamptz, created_at timestamptz not null default now(), unique(user_id,id)
);
create table public.habits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  pillar text not null default 'discipline' check (pillar in ('faith','english','reading','focus','body','growth','discipline','money','mind','vision','soul')),
  created_at timestamptz not null default now(), unique(user_id,id)
);
create table public.habit_entries (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null, entry_date date not null default ((now() at time zone 'Africa/Maputo')::date),
  created_at timestamptz not null default now(), unique(user_id,habit_id,entry_date),
  foreign key(user_id,habit_id) references public.habits(user_id,id) on delete cascade
);
create table public.books (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  author text not null default '' check (char_length(author) <= 120),
  total_pages integer not null check (total_pages between 1 and 50000),
  current_page integer not null default 0 check (current_page >= 0 and current_page <= total_pages),
  created_at timestamptz not null default now(), unique(user_id,id)
);
create table public.reading_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null, started_at timestamptz not null default now(), ended_at timestamptz,
  elapsed_seconds integer not null default 0 check (elapsed_seconds between 0 and 14400),
  pages_read integer not null default 0 check (pages_read >= 0),
  reflection text not null default '' check (char_length(reflection) <= 2000),
  foreign key(user_id,book_id) references public.books(user_id,id) on delete cascade,
  check (ended_at is null or ended_at >= started_at)
);
create unique index one_active_reading on public.reading_sessions(user_id) where ended_at is null;
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid, objective text not null check (char_length(trim(objective)) between 1 and 160),
  blocker text not null default '' check (char_length(blocker) <= 100),
  planned_seconds integer not null check (planned_seconds between 60 and 7200),
  started_at timestamptz not null default now(), ended_at timestamptz,
  elapsed_seconds integer not null default 0 check (elapsed_seconds between 0 and 14400),
  foreign key(user_id,task_id) references public.tasks(user_id,id) on delete set null (task_id),
  check (ended_at is null or ended_at >= started_at)
);
create unique index one_active_focus on public.focus_sessions(user_id) where ended_at is null;
create table public.lesson_attempts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null, curriculum_version text not null,
  answers jsonb not null, correct integer not null check(correct >= 0), total integer not null check(total > 0 and correct <= total),
  created_at timestamptz not null default now()
);
create table public.vocabulary_reviews (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null, repetitions integer not null default 0 check(repetitions >= 0),
  interval_days integer not null default 1 check(interval_days between 1 and 60),
  due_date date not null default ((now() at time zone 'Africa/Maputo')::date),
  unique(user_id,word_id)
);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('export','erase_personal_data')),
  created_at timestamptz not null default now()
);

-- RLS também bloqueia relações entre registos de proprietários diferentes.
do $$ declare t text; begin
  foreach t in array array['profiles','tasks','habits','habit_entries','books','reading_sessions','focus_sessions','lesson_attempts','vocabulary_reviews','audit_events'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('create policy own_rows on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t);
    execute format('grant select, insert, update, delete on public.%I to authenticated',t);
    execute format('revoke all on public.%I from anon',t);
  end loop;
end $$;
create index tasks_owner_date on public.tasks(user_id,due_date);
create index habits_owner on public.habits(user_id);
create index entries_owner_date on public.habit_entries(user_id,entry_date);
create index books_owner on public.books(user_id);
create index focus_owner_date on public.focus_sessions(user_id,started_at);
create index reading_owner_date on public.reading_sessions(user_id,started_at);
create index attempts_owner_date on public.lesson_attempts(user_id,created_at);
create index reviews_owner_date on public.vocabulary_reviews(user_id,due_date);
create index audit_owner on public.audit_events(user_id);

create function public.finish_focus(session_id uuid) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  update public.focus_sessions set ended_at = clock_timestamp(),
    elapsed_seconds = least(14400,greatest(0,floor(extract(epoch from clock_timestamp()-started_at))::integer))
  where id = session_id and user_id = auth.uid() and ended_at is null;
  if not found then raise exception 'Sessão não encontrada ou já terminada'; end if;
end $$;
create function public.finish_reading(session_id uuid, page_number integer, note text) returns void
language plpgsql security invoker set search_path = '' as $$
declare s public.reading_sessions; b public.books;
begin
  select * into s from public.reading_sessions where id=session_id and user_id=auth.uid() and ended_at is null for update;
  if not found then raise exception 'Sessão não encontrada ou já terminada'; end if;
  select * into b from public.books where id=s.book_id and user_id=auth.uid() for update;
  if page_number < b.current_page or page_number > b.total_pages then raise exception 'Página inválida'; end if;
  update public.reading_sessions set ended_at=clock_timestamp(),
    elapsed_seconds=least(14400,greatest(0,floor(extract(epoch from clock_timestamp()-started_at))::integer)),
    pages_read=page_number-b.current_page, reflection=note where id=s.id;
  update public.books set current_page=page_number where id=b.id;
end $$;
create function public.erase_personal_data() returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sessão necessária'; end if;
  delete from public.tasks where user_id=auth.uid();
  delete from public.habits where user_id=auth.uid();
  delete from public.books where user_id=auth.uid();
  delete from public.focus_sessions where user_id=auth.uid();
  delete from public.lesson_attempts where user_id=auth.uid();
  delete from public.vocabulary_reviews where user_id=auth.uid();
  delete from public.profiles where user_id=auth.uid();
  delete from public.audit_events where user_id=auth.uid();
  insert into public.audit_events(user_id,action) values(auth.uid(),'erase_personal_data');
end $$;
revoke all on function public.finish_focus(uuid), public.finish_reading(uuid,integer,text), public.erase_personal_data() from public, anon;
grant execute on function public.finish_focus(uuid), public.finish_reading(uuid,integer,text), public.erase_personal_data() to authenticated;
