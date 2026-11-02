import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const connectionString = process.env.TEST_DATABASE_URL!;
if (!url || !key || !connectionString)
  throw new Error('Executa npm run setup:local antes dos testes.');
if (
  !['127.0.0.1', 'localhost'].includes(new URL(url).hostname) ||
  !['127.0.0.1', 'localhost'].includes(new URL(connectionString).hostname)
)
  throw new Error('Estes testes só podem criar/apagar dados numa instância local.');
const pg = new Client({ connectionString });
await pg.connect();
const client = () =>
  createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const a = client(),
  b = client(),
  anon = client();
const ids: string[] = [];
const suffix = randomBytes(6).toString('hex');
try {
  for (const [c, name] of [
    [a, 'a'],
    [b, 'b'],
  ] as const) {
    const r = await c.auth.signUp({
      email: `integration-${name}-${suffix}@example.com`,
      password: randomBytes(24).toString('base64url'),
    });
    assert.equal(r.error, null);
    assert.ok(r.data.user);
    assert.ok(r.data.session);
    ids.push(r.data.user.id);
  }
  const [aid, bid] = ids;
  let taskId = '',
    bookId = '',
    habitId = '';
  await test('Auth real e RLS: cada conta só lê e altera os seus registos', async () => {
    const r = await a
      .from('tasks')
      .insert({ user_id: aid, title: 'Privada A', pillar: 'discipline' })
      .select()
      .single();
    assert.equal(r.error, null);
    taskId = r.data!.id;
    const other = await b.from('tasks').select('*').eq('id', taskId);
    assert.equal(other.error, null);
    assert.deepEqual(other.data, []);
    const edit = await b.from('tasks').update({ title: 'Intrusão' }).eq('id', taskId).select();
    assert.equal(edit.error, null);
    assert.deepEqual(edit.data, []);
    const forged = await b.from('tasks').insert({ user_id: aid, title: 'Intrusão' });
    assert.ok(forged.error);
    const own = await a.from('tasks').select('*').eq('id', taskId).single();
    assert.equal(own.data!.title, 'Privada A');
    assert.equal((await b.from('tasks').insert({ user_id: bid, title: 'Privada B' })).error, null);
  });
  await test('acesso anónimo não revela dados pessoais', async () => {
    const r = await anon.from('tasks').select('*');
    assert.ok(r.error || r.data?.length === 0);
  });
  await test('todas as dez tabelas têm RLS ativo', async () => {
    const r = await pg.query(
      "select relname,relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relkind='r' and relname=any($1)",
      [
        [
          'profiles',
          'tasks',
          'habits',
          'habit_entries',
          'books',
          'reading_sessions',
          'focus_sessions',
          'lesson_attempts',
          'vocabulary_reviews',
          'audit_events',
        ],
      ],
    );
    assert.equal(r.rows.length, 10);
    assert.ok(r.rows.every((r) => r.relrowsecurity));
  });
  await test('constraints e relações bloqueiam valores e referências inválidos', async () => {
    assert.ok((await a.from('tasks').insert({ user_id: aid, title: ' ' })).error);
    assert.ok(
      (
        await a
          .from('books')
          .insert({ user_id: aid, title: 'Inválido', total_pages: 5, current_page: 6 })
      ).error,
    );
    assert.ok(
      (
        await b
          .from('focus_sessions')
          .insert({ user_id: bid, task_id: taskId, objective: 'Inválido', planned_seconds: 300 })
      ).error,
    );
  });
  await test('foco guarda tempo medido no servidor e não termina duas vezes', async () => {
    const r = await a
      .from('focus_sessions')
      .insert({ user_id: aid, task_id: taskId, objective: 'Teste de foco', planned_seconds: 300 })
      .select()
      .single();
    assert.equal(r.error, null);
    const id = r.data!.id;
    assert.ok(
      (
        await a
          .from('focus_sessions')
          .insert({ user_id: aid, objective: 'Duplicada', planned_seconds: 300 })
      ).error,
    );
    await pg.query(
      "update public.focus_sessions set started_at=now()-interval '121 seconds' where id=$1",
      [id],
    );
    assert.ok((await b.rpc('finish_focus', { session_id: id })).error);
    assert.equal((await a.rpc('finish_focus', { session_id: id })).error, null);
    const done = await a.from('focus_sessions').select('*').eq('id', id).single();
    assert.ok(done.data!.elapsed_seconds >= 121 && done.data!.elapsed_seconds < 130);
    assert.ok(done.data!.ended_at);
    assert.ok((await a.rpc('finish_focus', { session_id: id })).error);
  });
  await test('leitura é transacional, não recua páginas e resiste a submissão concorrente', async () => {
    const book = await a
      .from('books')
      .insert({ user_id: aid, title: 'Livro de teste', total_pages: 100, current_page: 10 })
      .select()
      .single();
    assert.equal(book.error, null);
    bookId = book.data!.id;
    const session = await a
      .from('reading_sessions')
      .insert({ user_id: aid, book_id: bookId })
      .select()
      .single();
    assert.equal(session.error, null);
    const sid = session.data!.id;
    assert.ok((await b.from('reading_sessions').insert({ user_id: bid, book_id: bookId })).error);
    assert.ok((await a.rpc('finish_reading', { session_id: sid, page_number: 9, note: '' })).error);
    assert.equal(
      (await a.from('books').select('current_page').eq('id', bookId).single()).data!.current_page,
      10,
    );
    const results = await Promise.all([
      a.rpc('finish_reading', { session_id: sid, page_number: 15, note: 'Uma ideia privada' }),
      a.rpc('finish_reading', { session_id: sid, page_number: 15, note: 'Uma ideia privada' }),
    ]);
    assert.equal(results.filter((r) => !r.error).length, 1);
    const done = await a.from('reading_sessions').select('*').eq('id', sid).single();
    assert.equal(done.data!.pages_read, 5);
    assert.equal(done.data!.reflection, 'Uma ideia privada');
    assert.equal(
      (await a.from('books').select('current_page').eq('id', bookId).single()).data!.current_page,
      15,
    );
  });
  await test('hábitos têm um check-in por dia e cascatas respeitam propriedade', async () => {
    const h = await a.from('habits').insert({ user_id: aid, title: 'Ler' }).select().single();
    assert.equal(h.error, null);
    habitId = h.data!.id;
    assert.equal(
      (await a.from('habit_entries').insert({ user_id: aid, habit_id: habitId })).error,
      null,
    );
    assert.ok((await a.from('habit_entries').insert({ user_id: aid, habit_id: habitId })).error);
    assert.ok((await b.from('habit_entries').insert({ user_id: bid, habit_id: habitId })).error);
  });
  await test('preferência do livro atual não aceita livro de outra pessoa', async () => {
    assert.ok((await b.from('profiles').upsert({ user_id: bid, current_book_id: bookId })).error);
    assert.equal(
      (await a.from('profiles').upsert({ user_id: aid, current_book_id: bookId })).error,
      null,
    );
  });
  await test('histórico sensível é privado e não pode ser reescrito ou apagado pela API', async () => {
    const r = await a
      .from('audit_events')
      .insert({ user_id: aid, action: 'export' })
      .select()
      .single();
    assert.equal(r.error, null);
    assert.deepEqual((await b.from('audit_events').select('*').eq('id', r.data!.id)).data, []);
    assert.ok(
      (await a.from('audit_events').update({ action: 'erase_personal_data' }).eq('id', r.data!.id))
        .error,
    );
    assert.ok((await a.from('audit_events').delete().eq('id', r.data!.id)).error);
    assert.ok((await anon.rpc('erase_personal_data')).error);
  });
  await test('eliminação pessoal é isolada, auditada e preserva identidade Auth', async () => {
    assert.equal((await a.rpc('erase_personal_data')).error, null);
    for (const table of [
      'tasks',
      'habits',
      'habit_entries',
      'books',
      'reading_sessions',
      'focus_sessions',
      'profiles',
    ]) {
      const r = await a.from(table).select('*');
      assert.equal(r.error, null);
      assert.equal(r.data!.length, 0);
    }
    const audit = await a.from('audit_events').select('*');
    assert.equal(audit.data!.length, 1);
    assert.equal(audit.data![0].action, 'erase_personal_data');
    assert.equal((await b.from('tasks').select('*')).data!.length, 1);
    assert.equal((await pg.query('select id from auth.users where id=$1', [aid])).rowCount, 1);
  });
} finally {
  if (ids.length) await pg.query('delete from auth.users where id=any($1::uuid[])', [ids]);
  await pg.end();
}
