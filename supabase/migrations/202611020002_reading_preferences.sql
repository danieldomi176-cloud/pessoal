-- Fase 2: preferências de leitura, sem perda de dados existentes.
alter table public.profiles add column current_book_id uuid;
alter table public.profiles add constraint profiles_current_book_owner
  foreign key(user_id,current_book_id) references public.books(user_id,id) on delete set null (current_book_id);
alter table public.reading_sessions add column planned_seconds integer not null default 600
  check (planned_seconds between 60 and 10800);
