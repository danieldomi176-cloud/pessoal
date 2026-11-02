'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient, requireUser } from '@/lib/supabase/server';
import { pillarIds, localDate, nextReview, blockers } from '@/lib/domain';
import { CURRICULUM_VERSION, gradeLesson, lessons, allWords } from '@/lib/curriculum';
import type { ActionResult } from '@/lib/types';
const text = (max: number) => z.string().trim().min(1, 'Preenche os campos obrigatórios.').max(max);
const uuid = z.string().uuid();
const day = z.iso.date();
const pillar = z.enum(pillarIds);
function checked(result: { error: { code?: string; message?: string } | null }) {
  if (result.error) {
    if (result.error.code === '23505')
      throw new Error('Já existe um registo ou uma sessão em curso. Atualiza a página.');
    if (['23514', '23503', 'P0001'].includes(result.error.code ?? ''))
      throw new Error('Verifica os valores e se o registo ainda existe.');
    throw new Error('Não foi possível guardar. Verifica a ligação e tenta novamente.');
  }
}
export async function authenticate(
  mode: string,
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const parsed = z
    .object({
      email: z.email().max(254),
      password: z.string().min(12, 'Usa pelo menos 12 caracteres.').max(128),
      name: z.string().trim().max(60),
    })
    .safeParse({
      email: form.get('email'),
      password: form.get('password'),
      name: form.get('name') ?? '',
    });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const db = await createClient();
  if (mode === 'signup') {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://127.0.0.1:3000';
    const r = await db.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.name },
        emailRedirectTo: origin + '/auth/callback',
      },
    });
    if (r.error)
      return {
        ok: false,
        message: 'Não foi possível criar a conta. Confirma os dados ou tenta mais tarde.',
      };
    if (!r.data.session)
      return { ok: true, message: 'Consulta o teu email para confirmar a conta antes de entrar.' };
    checked(
      await db
        .from('profiles')
        .upsert({ user_id: r.data.user!.id, display_name: parsed.data.name }),
    );
  } else {
    const r = await db.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (r.error)
      return {
        ok: false,
        message: 'Email ou palavra-passe inválidos, ou conta ainda não confirmada.',
      };
  }
  revalidatePath('/', 'layout');
  redirect('/');
}
export async function signOut() {
  const db = await createClient();
  await db.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
export async function mutate(
  action: string,
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db, user } = await requireUser();
  const value = (key: string) => form.get(key) ?? '';
  const id = () => uuid.parse(value('id'));
  const owner = { user_id: user.id };
  try {
    switch (action) {
      case 'task.create':
      case 'task.update': {
        const data = z
          .object({
            title: text(160),
            pillar,
            due_date: day,
            priority: z.coerce.number().int().min(0).max(3),
          })
          .parse({
            title: value('title'),
            pillar: value('pillar'),
            due_date: value('due_date'),
            priority: value('priority'),
          });
        checked(
          action === 'task.create'
            ? await db.from('tasks').insert({ ...owner, ...data })
            : await db.from('tasks').update(data).eq('id', id()).eq('user_id', user.id),
        );
        break;
      }
      case 'task.toggle':
        checked(
          await db
            .from('tasks')
            .update({ completed_at: value('done') === '1' ? new Date().toISOString() : null })
            .eq('id', id())
            .eq('user_id', user.id),
        );
        break;
      case 'habit.create':
        checked(
          await db.from('habits').insert({
            ...owner,
            title: text(100).parse(value('title')),
            pillar: pillar.parse(value('pillar')),
          }),
        );
        break;
      case 'habit.toggle': {
        const habitId = id();
        checked(
          value('done') === '1'
            ? await db
                .from('habit_entries')
                .upsert(
                  { ...owner, habit_id: habitId, entry_date: localDate() },
                  { onConflict: 'user_id,habit_id,entry_date', ignoreDuplicates: true },
                )
            : await db
                .from('habit_entries')
                .delete()
                .eq('habit_id', habitId)
                .eq('user_id', user.id)
                .eq('entry_date', localDate()),
        );
        break;
      }
      case 'task.delete':
      case 'habit.delete':
      case 'book.delete': {
        if (value('confirm') !== 'yes') throw new Error('Confirma a eliminação.');
        const table = { 'task.delete': 'tasks', 'habit.delete': 'habits', 'book.delete': 'books' }[
          action as 'task.delete' | 'habit.delete' | 'book.delete'
        ];
        checked(await db.from(table).delete().eq('id', id()).eq('user_id', user.id));
        break;
      }
      case 'book.create': {
        const data = z
          .object({
            title: text(160),
            author: z.string().trim().max(120),
            total_pages: z.coerce.number().int().min(1).max(50000),
            current_page: z.coerce.number().int().min(0),
          })
          .refine(
            (b) => b.current_page <= b.total_pages,
            'A página atual não pode exceder o total.',
          )
          .parse({
            title: value('title'),
            author: value('author'),
            total_pages: value('total_pages'),
            current_page: value('current_page') || 0,
          });
        checked(await db.from('books').insert({ ...owner, ...data }));
        break;
      }
      case 'book.current':
        checked(await db.from('profiles').upsert({ ...owner, current_book_id: id() }));
        break;
      case 'reading.start':
        checked(
          await db.from('reading_sessions').insert({
            ...owner,
            book_id: id(),
            planned_seconds: z.coerce.number().int().min(1).max(180).parse(value('minutes')) * 60,
          }),
        );
        break;
      case 'reading.finish':
        checked(
          await db.rpc('finish_reading', {
            session_id: id(),
            page_number: z.coerce.number().int().min(0).max(50000).parse(value('page')),
            note: z.string().trim().max(2000).parse(value('reflection')),
          }),
        );
        break;
      case 'focus.start': {
        const taskId = value('task_id');
        const blocker = z
          .enum(['', ...Object.keys(blockers)] as [string, ...string[]])
          .parse(value('blocker'));
        checked(
          await db.from('focus_sessions').insert({
            ...owner,
            objective: text(160).parse(value('objective')),
            planned_seconds: z.coerce.number().int().min(1).max(120).parse(value('minutes')) * 60,
            task_id: taskId ? uuid.parse(taskId) : null,
            blocker,
          }),
        );
        break;
      }
      case 'focus.finish':
        checked(await db.rpc('finish_focus', { session_id: id() }));
        break;
      case 'lesson.submit': {
        const lesson = lessons.find((l) => l.id === value('lesson_id'));
        if (!lesson) throw new Error('Aula indisponível.');
        const answers = Object.fromEntries(
          lesson.exercises.map((e) => [e.id, text(200).parse(value(e.id))]),
        );
        const result = gradeLesson(lesson.id, answers);
        checked(
          await db.from('lesson_attempts').insert({
            ...owner,
            lesson_id: lesson.id,
            curriculum_version: CURRICULUM_VERSION,
            answers,
            correct: result.correct,
            total: result.total,
          }),
        );
        const words = lesson.words.map((w) => ({ ...owner, word_id: w.id, due_date: localDate() }));
        checked(
          await db
            .from('vocabulary_reviews')
            .upsert(words, { onConflict: 'user_id,word_id', ignoreDuplicates: true }),
        );
        revalidatePath('/', 'layout');
        return {
          ok: true,
          message: `${result.correct} de ${result.total} respostas corretas. A tentativa foi guardada. Revê as explicações ao teu ritmo.`,
          feedback: result.feedback,
        };
      }
      case 'review.answer': {
        const wordId = text(60).parse(value('word_id'));
        const word = allWords.find((w) => w.id === wordId);
        if (!word) throw new Error('Palavra indisponível.');
        const answer = text(100).parse(value('answer'));
        const { normalizeAnswer } = await import('@/lib/curriculum');
        const correct = normalizeAnswer(answer) === normalizeAnswer(word.en);
        const old = await db
          .from('vocabulary_reviews')
          .select('*')
          .eq('word_id', wordId)
          .eq('user_id', user.id)
          .single();
        checked(old);
        if (!old.data) throw new Error('Conclui primeiro a aula desta palavra.');
        if (old.data.due_date > localDate())
          throw new Error(
            'Esta revisão já foi feita. Volta na data agendada ou usa os flashcards.',
          );
        checked(
          await db
            .from('vocabulary_reviews')
            .update(nextReview(old.data.repetitions, correct, localDate()))
            .eq('id', old.data.id)
            .eq('user_id', user.id),
        );
        revalidatePath('/', 'layout');
        return {
          ok: true,
          message: correct
            ? 'Correto! Próxima revisão agendada.'
            : `A resposta é «${word.en}». Podes rever amanhã, sem penalização.`,
        };
      }
      case 'profile.save': {
        const cards = form.getAll('cards').map(String);
        const order = String(value('card_order')).split(',').filter(Boolean);
        const allowed = ['focus', 'english', 'reading', 'habits'];
        if (
          new Set(order).size !== 4 ||
          order.some((c) => !allowed.includes(c)) ||
          cards.some((c) => !allowed.includes(c))
        )
          throw new Error('Escolhe uma ordem válida para os cartões.');
        const data = z
          .object({
            display_name: z.string().trim().max(60),
            theme: z.enum(['dark', 'light']),
            daily_reading_minutes: z.coerce.number().int().min(1).max(180),
          })
          .parse({
            display_name: value('display_name'),
            theme: value('theme'),
            daily_reading_minutes: value('daily_reading_minutes'),
          });
        checked(
          await db.from('profiles').upsert({
            ...owner,
            ...data,
            spiritual_reflection: value('spiritual_reflection') === 'on',
            dashboard_cards: order.filter((c) => cards.includes(c)),
          }),
        );
        break;
      }
      case 'profile.erase': {
        if (value('confirmation') !== 'APAGAR') throw new Error('Escreve APAGAR para confirmar.');
        checked(await db.rpc('erase_personal_data'));
        break;
      }
      default:
        throw new Error('Ação indisponível.');
    }
    revalidatePath('/', 'layout');
    return {
      ok: true,
      message:
        action === 'profile.erase'
          ? 'Dados pessoais eliminados. A conta de acesso continua ativa.'
          : 'Guardado. Um pequeno passo conta.',
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? 'Verifica os dados.')
          : error instanceof Error
            ? error.message
            : 'Não foi possível concluir. Tenta novamente.',
    };
  }
}
