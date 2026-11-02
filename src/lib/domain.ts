export const TIMEZONE = 'Africa/Maputo';
export const pillars = [
  {
    id: 'faith',
    name: 'FaithOS',
    label: 'Fé & propósito',
    description: 'Um espaço para a tua caminhada com Deus.',
    icon: 'cross',
    available: false,
  },
  {
    id: 'english',
    name: 'EnglishOS',
    label: 'Inglês',
    description: 'Pequenas aulas. Novas possibilidades.',
    icon: 'languages',
    available: true,
    href: '/english',
  },
  {
    id: 'reading',
    name: 'ReadOS',
    label: 'Leitura',
    description: 'Uma página de cada vez.',
    icon: 'book',
    available: true,
    href: '/reading',
  },
  {
    id: 'focus',
    name: 'FocusOS',
    label: 'Foco',
    description: 'O primeiro passo pode durar cinco minutos.',
    icon: 'focus',
    available: true,
    href: '/focus',
  },
  {
    id: 'body',
    name: 'BodyOS',
    label: 'Corpo & saúde',
    description: 'Movimento, recuperação e cuidado.',
    icon: 'heart',
    available: false,
  },
  {
    id: 'growth',
    name: 'GrowthOS',
    label: 'Desenvolvimento',
    description: 'Acompanha o teu desenvolvimento natural.',
    icon: 'ruler',
    available: false,
  },
  {
    id: 'discipline',
    name: 'DisciplineOS',
    label: 'Hábitos & disciplina',
    description: 'Consistência sem exigir perfeição.',
    icon: 'check',
    available: true,
    href: '/today',
  },
  {
    id: 'money',
    name: 'MoneyOS',
    label: 'Finanças',
    description: 'Decisões responsáveis, em meticais.',
    icon: 'wallet',
    available: false,
  },
  {
    id: 'mind',
    name: 'MindOS',
    label: 'Estudos',
    description: 'Aprende com intenção.',
    icon: 'graduation',
    available: false,
  },
  {
    id: 'vision',
    name: 'VisionOS',
    label: 'Projetos & objetivos',
    description: 'Transforma ideias em próximos passos.',
    icon: 'target',
    available: false,
  },
  {
    id: 'soul',
    name: 'SoulOS',
    label: 'Bem-estar & relações',
    description: 'Descansar também é evoluir.',
    icon: 'sparkles',
    available: false,
  },
] as const;
export const pillarIds = pillars.map((p) => p.id) as [string, ...string[]];
export type PillarId = (typeof pillars)[number]['id'];
export function localDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function dateLabel(date = new Date()) {
  return new Intl.DateTimeFormat('pt-MZ', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
export function shortDate(value: string) {
  return new Intl.DateTimeFormat('pt-MZ', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value.length === 10 ? value + 'T12:00:00+02:00' : value));
}
export function greeting(date = new Date()) {
  const h = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(date),
  );
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}
export function money(value: number) {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
}
export function addDays(day: string, n: number) {
  const d = new Date(day + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function nextReview(repetitions: number, correct: boolean, day: string) {
  const rep = correct ? repetitions + 1 : 0;
  const interval = correct ? Math.min(60, [1, 3, 7, 14, 30, 60][Math.min(rep - 1, 5)]) : 1;
  return { repetitions: rep, interval_days: interval, due_date: addDays(day, interval) };
}
export const blockers: Record<string, { advice: string; step: string }> = {
  'Tarefa difícil': {
    advice:
      'Reduz o tamanho, não a tua confiança. Qual é a parte mais pequena que consegues fazer?',
    step: 'Faz apenas a primeira parte durante cinco minutos.',
  },
  'Não sei como começar': {
    advice: 'Começa por abrir o material e escrever o resultado que procuras.',
    step: 'Abre o material e escreve uma primeira frase.',
  },
  'Falta de energia': {
    advice: 'Experimenta uma pausa, água ou descanso. Podes escolher uma ação mais leve.',
    step: 'Escolhe uma pequena ação que respeite a tua energia.',
  },
  Distrações: {
    advice: 'Silencia o que puderes e anota as distrações para depois.',
    step: 'Afasta uma distração e prepara o teu espaço.',
  },
  'Falta de clareza': {
    advice: 'Escreve o que significa terminar esta tarefa.',
    step: 'Define um resultado pequeno e concreto.',
  },
  'Medo de errar': {
    advice: 'O primeiro rascunho pode ser imperfeito. Ele só precisa de existir.',
    step: 'Cria um rascunho sem o avaliar.',
  },
  'Outro motivo': {
    advice: 'Ajusta o plano à tua realidade. Um passo pequeno continua a contar.',
    step: 'Escolhe o próximo passo possível.',
  },
};
