import { describe, it, expect } from 'vitest';
import { localDate, greeting, nextReview, addDays, money, pillars } from '../src/lib/domain';
import {
  lessons,
  gradeLesson,
  CURRICULUM_VERSION,
  normalizeAnswer,
  allWords,
} from '../src/lib/curriculum';
import { interpret } from '../src/lib/lifeai';
describe('Datas e preferências de Moçambique', () => {
  it('muda o dia em Maputo antes da meia-noite UTC', () =>
    expect(localDate(new Date('2026-11-02T22:30:00Z'))).toBe('2026-11-03'));
  it.each([
    ['2026-11-02T05:00:00Z', 'Bom dia'],
    ['2026-11-02T11:00:00Z', 'Boa tarde'],
    ['2026-11-02T19:00:00Z', 'Boa noite'],
  ])('saudação %s', (date, expected) => expect(greeting(new Date(date))).toBe(expected));
  it('soma dias atravessando o ano', () => expect(addDays('2026-12-31', 1)).toBe('2027-01-01'));
  it('usa MZN', () => expect(money(100)).toMatch(/MT|MZN/));
  it('regista exatamente onze pilares com identificadores únicos', () => {
    expect(pillars).toHaveLength(11);
    expect(new Set(pillars.map((p) => p.id)).size).toBe(11);
  });
});
describe('Currículo real versionado', () => {
  it('tem versão e aulas com todos os componentes', () => {
    expect(CURRICULUM_VERSION).toBeTruthy();
    expect(lessons).toHaveLength(3);
    for (const l of lessons) {
      expect(l.explanation.length).toBeGreaterThan(80);
      expect(l.examples.length).toBeGreaterThan(1);
      expect(l.exercises.length).toBe(4);
      expect(l.words.length).toBeGreaterThan(0);
      expect(l.challenge.length).toBeGreaterThan(10);
    }
  });
  it('não duplica palavras ou exercícios', () => {
    expect(new Set(allWords.map((w) => w.id)).size).toBe(allWords.length);
    const ids = lessons.flatMap((l) => l.exercises.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it.each(lessons.map((l) => [l.id] as const))('corrige as respostas oficiais de %s', (id) => {
    const l = lessons.find((l) => l.id === id)!;
    const result = gradeLesson(
      id,
      Object.fromEntries(l.exercises.map((e) => [e.id, e.accepted[0]])),
    );
    expect(result.correct).toBe(l.exercises.length);
    expect(result.total).toBe(4);
    expect(result.feedback.every((f) => f.explanation.length > 10)).toBe(true);
  });
  it('respostas ausentes e inventadas não passam', () => {
    expect(gradeLesson('hello', {}).correct).toBe(0);
    expect(
      gradeLesson('hello', { h1: 'Goodbye', h2: 'Good night', h3: 'abc', h4: 'you how are' })
        .correct,
    ).toBe(0);
  });
  it('tolera maiúsculas, espaços e pontuação final', () =>
    expect(normalizeAnswer('  HOW   ARE YOU? ')).toBe('how are you'));
  it('não aceita aula desconhecida', () => expect(() => gradeLesson('a2-fake', {})).toThrow());
  it('as opções contêm a resposta nas perguntas de escolha', () => {
    for (const e of lessons.flatMap((l) => l.exercises).filter((e) => e.type === 'choice'))
      expect(e.choices).toContain(e.accepted[0]);
  });
});
describe('Revisões sem castigos', () => {
  it.each([
    [0, 1],
    [1, 3],
    [2, 7],
    [3, 14],
    [4, 30],
    [5, 60],
    [20, 60],
  ])('repetição %s gera intervalo %s', (rep, interval) =>
    expect(nextReview(rep, true, '2026-11-02').interval_days).toBe(interval),
  );
  it('um erro agenda amanhã sem eliminar o registo', () =>
    expect(nextReview(8, false, '2026-11-02')).toEqual({
      repetitions: 0,
      interval_days: 1,
      due_date: '2026-11-03',
    }));
});
describe('LifeAI honesto e determinístico', () => {
  const counts = { pending: 3, habits: 2, finished: 5 };
  it.each([
    ['Quero aprender inglês', '/english'],
    ['Estou a procrastinar', '/focus'],
    ['Lembra-me de ler', '/reading'],
    ['Organiza o meu dia', '/today'],
    ['Mostra o meu progresso', '/evolution'],
  ])('encaminha %s', (s, href) => expect(interpret(s, counts).href).toBe(href));
  it('responde com contagens reais e sem alterar dados', () => {
    expect(interpret('Organiza o dia', counts).text).toContain('3 tarefa(s)');
    expect(interpret('Organiza o dia', counts).text).toContain('Não alterei');
  });
  it('declara quando o módulo não foi implementado', () =>
    expect(interpret('Quanto dinheiro gastei?', counts).text).toContain(
      'ainda não está implementado',
    ));
  it('pede esclarecimento em vez de inventar', () =>
    expect(interpret('xyz', counts).text).toContain('ainda não compreendi'));
});
