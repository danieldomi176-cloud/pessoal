import 'server-only';
import { cache } from 'react';
import { requireUser } from './supabase/server';
import type { Workspace } from './types';
export const loadWorkspace = cache(async (): Promise<Workspace> => {
  const { db, user } = await requireUser();
  // Paginação explícita: não transformar o limite padrão da API em métricas truncadas.
  async function rows(table: string, order: string) {
    const data: unknown[] = [];
    for (let page = 0; ; page++) {
      const r = await db
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .order(order, { ascending: true })
        .order('id', { ascending: true })
        .range(page * 500, page * 500 + 499);
      if (r.error)
        throw new Error(
          'Não foi possível carregar os dados. Verifica a base de dados e tenta novamente.',
        );
      data.push(...r.data);
      if (r.data.length < 500) return data;
    }
  }
  const [profile, tasks, habits, entries, books, reading, focus, attempts, reviews] =
    await Promise.all([
      db.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      rows('tasks', 'created_at'),
      rows('habits', 'created_at'),
      rows('habit_entries', 'entry_date'),
      rows('books', 'created_at'),
      rows('reading_sessions', 'started_at'),
      rows('focus_sessions', 'started_at'),
      rows('lesson_attempts', 'created_at'),
      rows('vocabulary_reviews', 'due_date'),
    ]);
  if (profile.error) throw new Error('Não foi possível carregar o perfil.');
  return {
    profile: profile.data ?? {
      user_id: user.id,
      display_name: '',
      theme: 'dark',
      spiritual_reflection: true,
      dashboard_cards: ['focus', 'english', 'reading', 'habits'],
      daily_reading_minutes: 10,
    },
    tasks,
    habits,
    entries,
    books,
    reading,
    focus,
    attempts,
    reviews,
    email: user.email ?? '',
  } as Workspace;
});
