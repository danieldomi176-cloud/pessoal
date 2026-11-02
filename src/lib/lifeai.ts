export type Intent = { text: string; href?: string; label?: string };
export function interpret(
  command: string,
  counts: { pending: number; habits: number; finished: number },
): Intent {
  const s = command
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  if (/ingles|english|aula/.test(s))
    return {
      text: 'Uma sessão de 10 a 15 minutos é um bom começo. Escolhe uma das aulas A0 disponíveis.',
      href: '/english',
      label: 'Abrir EnglishOS',
    };
  if (/procrastin|comecar|foco|estudar/.test(s))
    return {
      text: 'Escolhe uma tarefa e identifica o bloqueio. O FocusOS ajuda-te a escolher um primeiro passo pequeno.',
      href: '/focus',
      label: 'Começar com cinco minutos',
    };
  if (/ler|leitura|livro/.test(s))
    return {
      text: 'Podes começar por duas páginas ou cinco minutos. Adiciona o teu livro e inicia uma sessão. Lembretes em segundo plano ainda não estão disponíveis.',
      href: '/reading',
      label: 'Abrir a biblioteca',
    };
  if (/dia|tarefa|habito|missao|meta/.test(s))
    return {
      text: `Tens ${counts.pending} tarefa(s) pendente(s) e ${counts.habits} hábito(s) configurado(s). Escolhe até três prioridades e reserva tempo para descansar. Não alterei o teu plano.`,
      href: '/today',
      label: 'Organizar o meu dia',
    };
  if (/progresso|evolucao/.test(s))
    return {
      text: `Tens ${counts.finished} tarefa(s) concluída(s) no histórico carregado. Podes consultar os teus registos por dia.`,
      href: '/evolution',
      label: 'Ver a minha evolução',
    };
  if (/oracao|deus|fe/.test(s))
    return {
      text: 'Podes reservar um momento de oração e criar um hábito pessoal em Hoje. O diário de oração e a biblioteca bíblica ainda estão planeados.',
      href: '/today',
      label: 'Criar um hábito de oração',
    };
  if (/dinheiro|gastei|agexa|ordexa|exercicio|treino/.test(s))
    return {
      text: 'Esse módulo ainda não está implementado. Podes registar uma próxima ação como tarefa em Hoje, sem recomendações financeiras ou de treino automáticas.',
      href: '/today',
      label: 'Registar uma próxima ação',
    };
  return {
    text: 'Sou um assistente baseado em regras e ainda não compreendi esse pedido. Experimenta «Organiza o meu dia», «Quero aprender inglês» ou «Estou a procrastinar».',
  };
}
