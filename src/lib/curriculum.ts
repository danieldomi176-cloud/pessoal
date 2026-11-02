// Conteúdo original LifeOS. A versão acompanha todas as tentativas persistidas.
export const CURRICULUM_VERSION = 'a0-2026.11.1';
export type Word = { id: string; en: string; pt: string; ipa: string };
export type Exercise = {
  id: string;
  type: 'choice' | 'write' | 'order';
  prompt: string;
  choices?: string[];
  accepted: string[];
  explanation: string;
};
export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  explanation: string;
  examples: { en: string; pt: string }[];
  words: Word[];
  exercises: Exercise[];
  challenge: string;
};
export const lessons: Lesson[] = [
  {
    id: 'hello',
    title: 'O teu primeiro hello',
    subtitle: 'Saudações e despedidas',
    minutes: 10,
    explanation:
      'Hello e Hi são formas de dizer olá. Hello funciona em situações formais e informais; Hi é mais informal. Good morning usa-se de manhã; Good afternoon, à tarde; Good evening, ao chegar à noite. Good night costuma ser uma despedida à noite ou antes de dormir.',
    examples: [
      { en: 'Hello! Good morning.', pt: 'Olá! Bom dia.' },
      { en: 'Hi! How are you?', pt: 'Olá! Como estás?' },
      { en: 'Goodbye. See you!', pt: 'Adeus. Até à próxima!' },
    ],
    words: [
      { id: 'hello', en: 'Hello', pt: 'Olá', ipa: '/həˈləʊ/' },
      { id: 'good-morning', en: 'Good morning', pt: 'Bom dia', ipa: '/ɡʊd ˈmɔːnɪŋ/' },
      { id: 'goodbye', en: 'Goodbye', pt: 'Adeus', ipa: '/ˌɡʊdˈbaɪ/' },
    ],
    exercises: [
      {
        id: 'h1',
        type: 'choice',
        prompt: 'Como dizes «Olá» em inglês?',
        choices: ['Hello', 'Goodbye', 'Night'],
        accepted: ['Hello'],
        explanation: 'Hello significa olá. Goodbye significa adeus.',
      },
      {
        id: 'h2',
        type: 'choice',
        prompt: 'Chegas a uma aula às 8h. O que dizes?',
        choices: ['Good night', 'Good morning', 'Goodbye'],
        accepted: ['Good morning'],
        explanation: 'De manhã usamos Good morning.',
      },
      {
        id: 'h3',
        type: 'write',
        prompt: 'Escreve «Adeus» em inglês.',
        accepted: ['Goodbye', 'Bye'],
        explanation: 'Goodbye e a forma informal Bye são despedidas.',
      },
      {
        id: 'h4',
        type: 'order',
        prompt: 'Ordena as palavras para dizer «Como estás?»: you / How / are',
        accepted: ['How are you', 'How are you?'],
        explanation: 'A ordem desta pergunta é How + are + you?',
      },
    ],
    challenge: 'Cumprimenta alguém, ou escreve no teu caderno: Hello! Good morning.',
  },
  {
    id: 'introductions',
    title: 'Este sou eu',
    subtitle: 'Apresentações e verbo to be',
    minutes: 15,
    explanation:
      'I significa eu; you significa tu ou você. O verbo to be pode significar ser ou estar. Com I usamos am; com you usamos are. I am também pode ser escrito I’m. Para dizer o nome usamos My name is… («O meu nome é…»).',
    examples: [
      { en: 'I am a student.', pt: 'Eu sou estudante.' },
      { en: 'My name is Ana.', pt: 'O meu nome é Ana.' },
      { en: 'You are welcome.', pt: 'És bem-vindo/a.' },
    ],
    words: [
      { id: 'student', en: 'Student', pt: 'Estudante', ipa: '/ˈstjuːdənt/' },
      { id: 'name', en: 'Name', pt: 'Nome', ipa: '/neɪm/' },
      { id: 'welcome', en: 'Welcome', pt: 'Bem-vindo/a', ipa: '/ˈwelkəm/' },
    ],
    exercises: [
      {
        id: 'i1',
        type: 'choice',
        prompt: 'Completa: I ___ a student.',
        choices: ['are', 'am', 'is'],
        accepted: ['am'],
        explanation: 'O pronome I acompanha a forma am.',
      },
      {
        id: 'i2',
        type: 'choice',
        prompt: 'O que significa «My name is Ana»?',
        choices: ['O meu nome é Ana', 'A Ana é estudante', 'Olá, Ana'],
        accepted: ['O meu nome é Ana'],
        explanation: 'My name is… é a expressão para apresentar o nome.',
      },
      {
        id: 'i3',
        type: 'write',
        prompt: 'Completa: You ___ welcome.',
        accepted: ['are'],
        explanation: 'Com you, usamos are.',
      },
      {
        id: 'i4',
        type: 'order',
        prompt: 'Ordena para dizer «Eu sou estudante»: student / a / am / I',
        accepted: ['I am a student'],
        explanation: 'A ordem é sujeito I + verbo am + a student.',
      },
    ],
    challenge: 'Escreve duas frases sobre ti: My name is… e I am a student (se se aplicar).',
  },
  {
    id: 'numbers',
    title: 'Até dez novas possibilidades',
    subtitle: 'Números de 0 a 10',
    minutes: 10,
    explanation:
      'Os números de zero a dez são: zero, one, two, three, four, five, six, seven, eight, nine, ten. Para contar objetos dizemos o número antes do nome: two books. Na maior parte dos nomes, acrescentamos -s para formar o plural: book → books.',
    examples: [
      { en: 'One book.', pt: 'Um livro.' },
      { en: 'Two books.', pt: 'Dois livros.' },
      { en: 'I have three books.', pt: 'Eu tenho três livros.' },
    ],
    words: [
      { id: 'one', en: 'One', pt: 'Um', ipa: '/wʌn/' },
      { id: 'two', en: 'Two', pt: 'Dois', ipa: '/tuː/' },
      { id: 'three', en: 'Three', pt: 'Três', ipa: '/θriː/' },
      { id: 'ten', en: 'Ten', pt: 'Dez', ipa: '/ten/' },
    ],
    exercises: [
      {
        id: 'n1',
        type: 'choice',
        prompt: 'Qual é o número «two»?',
        choices: ['1', '2', '3'],
        accepted: ['2'],
        explanation: 'Two corresponde a 2.',
      },
      {
        id: 'n2',
        type: 'write',
        prompt: 'Escreve o número 5 em inglês.',
        accepted: ['five'],
        explanation: 'O número 5 escreve-se five.',
      },
      {
        id: 'n3',
        type: 'choice',
        prompt: 'Como dizes «dois livros»?',
        choices: ['Two book', 'Two books', 'Book two'],
        accepted: ['Two books'],
        explanation: 'O número vem antes do nome; books é o plural de book.',
      },
      {
        id: 'n4',
        type: 'write',
        prompt: 'Escreve o número 10 em inglês.',
        accepted: ['ten'],
        explanation: 'O número 10 escreve-se ten.',
      },
    ],
    challenge: 'Conta cinco objetos à tua volta em inglês: one, two, three, four, five.',
  },
];
export const allWords = lessons.flatMap((l) => l.words);
export function normalizeAnswer(answer: string) {
  return answer
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en')
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ');
}
export function gradeLesson(id: string, answers: Record<string, string>) {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) throw new Error('Aula desconhecida');
  const feedback = lesson.exercises.map((e) => ({
    prompt: e.prompt,
    answer: e.accepted[0],
    correct: e.accepted.some((a) => normalizeAnswer(a) === normalizeAnswer(answers[e.id] ?? '')),
    explanation: e.explanation,
  }));
  return { correct: feedback.filter((f) => f.correct).length, total: feedback.length, feedback };
}
