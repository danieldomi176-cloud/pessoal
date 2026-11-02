# LifeOS

**A melhor versão de mim, um dia de cada vez.**

Aplicação pessoal em português, com datas `DD/MM/AAAA`, fuso `Africa/Maputo`, referência monetária MZN e interface escura por padrão. O repositório estava vazio: esta entrega cria a fundação e um primeiro conjunto funcional de ferramentas. Não é a implementação integral dos onze pilares.

## Código no GitHub e acesso à aplicação

O código está no repositório [danieldomi176-cloud/pessoal](https://github.com/danieldomi176-cloud/pessoal). Esse link abre os ficheiros e as instruções do projeto.

A aplicação completa precisa de um servidor Next.js e do Supabase. GitHub Pages serve ficheiros estáticos e não executa as Server Actions, a autenticação de servidor e as rotas privadas desta arquitetura. Para obter um link da aplicação, importa este repositório num alojamento compatível com Next.js e configura o Supabase conforme a secção de publicação abaixo.

## O que funciona

- Supabase Auth: criar conta, entrar, confirmar email quando o fornecedor o exige, renovar sessão e terminar sessão. Páginas e ações autenticadas no servidor.
- PostgreSQL real, dez tabelas com RLS e relações que impedem ligar dados de contas diferentes. A aplicação não usa service role.
- Dashboard com saudação, data de Maputo, três prioridades, tarefas, hábitos, leitura, inglês e foco. As métricas vêm apenas dos registos. Contas novas começam vazias.
- Perfil persistente: nome, tema claro/escuro, reflexão espiritual opcional, meta de leitura e cartões que se podem ordenar ou ocultar.
- Tarefas com datas, áreas, prioridades, edição, conclusão, reabertura e eliminação confirmada. Hábitos/missões configuráveis com um check-in por dia.
- ReadOS: biblioteca pessoal, livro atual, página inicial, total, sessões com meta de 5/10/15/20 minutos ou duração personalizada, tempo medido no servidor, páginas e reflexão privada. Guardar sessão e atualizar o livro é uma transação.
- FocusOS: bloqueios de procrastinação e sugestões específicas, objetivo, tarefa opcional, bloco configurável de 1 a 120 minutos e histórico de tempo real. Blocos de 5 ou 25 minutos e pausas manuais permitem uma rotina inicial de foco.
- EnglishOS inicial: **três aulas A0 e 12 exercícios**, com explicações em português, exemplos, tradução, transcrição fonética, correção explicada no servidor, tentativas, flashcards, revisão espaçada e resumo dos últimos sete dias. Áudio opcional por Web Speech.
- Evolução com registos e gráfico dos últimos sete dias. Sem ranking, pontuação de fé ou julgamentos sobre valor pessoal.
- LifeAI inicial, gratuito e determinístico: comandos de consulta/navegação, respostas predefinidas e limites explícitos. Não é um modelo generativo nem executa alterações por comandos.
- Exportação JSON autenticada, histórico de operações sensíveis e eliminação confirmada dos dados pessoais.

## Executar localmente

Pré-requisitos: **Node.js 22+**, npm e daemon Docker local em funcionamento. Neste ambiente foram usados Node 24.19.0 e npm 11.9.0. O setup foi testado em Linux x86_64. O CLI e o helper usam o socket Docker Unix; Windows exige adaptação/WSL.

```bash
cd /workspace/pessoal
npm ci
npm run setup:local
npm run dev
```

O setup descarrega imagens oficiais, inicia o Supabase local, aplica apenas migrações pendentes e cria `.env.local` com a URL e a chave **pública** locais. Repetir o comando mantém os dados e a configuração existente. A primeira execução precisa de Internet e espaço para as imagens. O servidor Next usa a porta 3000; Supabase usa 54321/54322 e o servidor de email local usa 54324.

Cria a tua conta na interface. Não há utilizador predefinido nem dados de demonstração. A confirmação de email está desativada **apenas no Supabase de desenvolvimento**. Não reutilizes esta política numa publicação pessoal na Internet.

```bash
npm run build
npm run start
# Parar os serviços que o setup iniciou, mantendo os volumes locais:
npm run db:stop
# Reiniciar serviços e aplicar novas migrações sem apagar dados:
npm run setup:local
```

Não uses `supabase db reset` sobre dados pessoais: é destrutivo e não faz parte do setup. Cada tarefa na nuvem já é isolada; usa o checkout existente e não cries worktrees salvo pedido explícito.

## Configuração alojada e publicação

O Supabase local funciona sem conta externa. Para uma instância alojada são necessários um projeto Supabase próprio e um alojamento compatível com Next.js/Node. Não foram criados serviços pagos nem foi efetuado deploy.

1. Executa as três migrações em `supabase/migrations` pela ordem dos nomes no projeto escolhido, usando o SQL Editor ou o fluxo oficial de migrações. Não substituas esquemas existentes nem apagues dados.
2. Configura as variáveis abaixo no serviço de alojamento. Nunca introduzas service role, password PostgreSQL ou tokens administrativos numa variável `NEXT_PUBLIC_*`.
3. No Supabase Auth, ativa confirmação de email, define Site URL e autoriza apenas o callback da tua origem em `/auth/callback`. Configura SMTP se os limites de email do fornecedor não forem suficientes. Depois de criar a conta pessoal, desativa novos registos se só pretendes um utilizador.
4. Publica com HTTPS, verifica login/renovação, isolamento RLS, exportação e limites do plano. Não uses a base local desta máquina como serviço de produção público.

| Variável                               | Utilização                                                               |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL da tua instância Supabase                                            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publicável; a chave anon legada também é suportada                 |
| `NEXT_PUBLIC_SITE_URL`                 | Origem HTTPS do LifeOS; usada no callback de confirmação de email        |
| `TEST_DATABASE_URL`                    | Só testes locais. Não fornecer credenciais de produção aos testes        |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE`       | Opcional, caminho do Chromium para os testes; padrão `/usr/bin/chromium` |

A política CSP atual suporta Supabase alojado em `*.supabase.co` e a instância local padrão. Domínios personalizados exigem ajustar `connect-src` e testar. É uma política de base que permite scripts inline necessários ao Next; nonces e revisão de segurança de produção são uma melhoria futura.

Dependências são abertas. O Supabase local não exige subscrição. Hosting, Supabase alojado, SMTP e armazenamento de backups podem ter quotas ou custos: verificar preços atuais antes de contratar. Não há APIs de IA pagas, publicidade ou analytics na aplicação; a telemetria Next está desativada nos scripts.

## Estrutura

```text
src/
  app/
    (app)/              dashboard, today, reading, focus, english, evolution,
                        lifeai, areas e profile (layout autenticado)
    actions.ts          validação, mutações autenticadas e correção de aulas
    api/export/         exportação privada e auditada
    auth/callback/      confirmação por código Supabase
    login/ signup/      autenticação real
    setup/              instruções quando faltam variáveis
    globals.css         design responsivo, temas e redução de movimento
  components/           shell, formulários, temporizadores e componentes acessíveis
  lib/
    curriculum.ts       conteúdo A0 original e versionado
    domain.ts           pilares, datas de Maputo e revisão espaçada
    lifeai.ts           intérprete de intenções por regras
    data.ts             consultas privadas paginadas
    supabase/server.ts  cliente de servidor por cookies
  proxy.ts              renovação/verificação de sessão sem cache público
supabase/
  config.toml           desenvolvimento local mínimo, sem dados seed
  migrations/           esquema, preferências e permissões de auditoria
scripts/setup-local.mjs setup repetível e verificação real de Auth
tests/                  domínio, integração PostgreSQL e navegador
```

## Migrações

1. `202611020001_lifeos.sql`: profiles, tasks, habits, habit_entries, books, reading_sessions, focus_sessions, lesson_attempts, vocabulary_reviews e audit_events; constraints, índices, RLS, finalização de sessões e eliminação transacional.
2. `202611020002_reading_preferences.sql`: livro atual com relação por proprietário e duração planeada de leitura. Alteração aditiva.
3. `202611020003_audit_permissions.sql`: impede reescrever/apagar diretamente o histórico; a função de eliminação usa `SECURITY DEFINER`, `search_path` fixo e filtra cada operação pelo utilizador autenticado.

As funções de sessões usam locks para não contar a mesma leitura duas vezes. Todos os dados pessoais têm `user_id` ligado ao Supabase Auth. A eliminação pessoal remove os dados da aplicação e mantém apenas um evento de eliminação. **A identidade Auth/email continuam ativos**; a eliminação integral da conta deve ser feita pelo administrador do projeto. Ficheiros exportados e backups do fornecedor não são eliminados pela aplicação.

## Testes

```bash
npm run typecheck
npm run lint
npm run test
npm run test:integration
npm run build
npm run test:e2e
npm run format:check
```

Os testes de integração e navegador exigem `npm run setup:local`. Recusam bases externas, usam contas temporárias e removem apenas os próprios utilizadores no fim. Os E2E usam o build de produção, a porta 3000 livre e Chromium; configuram `PLAYWRIGHT_CHROMIUM_EXECUTABLE` para outra instalação. Para instalar o browser oficial, podes usar `npx playwright install chromium` e indicar o caminho correspondente. Não executam deploy nem usam mocks como prova de persistência.

A auditoria automática WCAG cobre os ecrãs selecionados; não substitui uma revisão humana ou avaliação de todos os navegadores. Testes e resultados verificados estão em [docs/VALIDATION.md](docs/VALIDATION.md).

## Limites desta entrega e próxima fase

A Fase 1 tem a fundação funcional validada localmente. A Fase 2 tem o núcleo de tarefas, hábitos, biblioteca e foco; faltam agenda horária/compromissos, edição completa de livros, destaques, lista de leituras futuras, pausas cronometradas e registo de distrações. O temporizador mede tempo de relógio, não atenção; sessões são limitadas a quatro horas de tempo contabilizado. Não bloqueia aplicações.

O EnglishOS é um **início de A0**: faltam alfabeto, cores, dias, meses e o restante currículo, além de A1/A2. Nesta versão a repetição de exercícios é escrita; não há avaliação profissional de pronúncia. As vozes Web Speech dependem do browser e podem enviar o texto falado ao fabricante; o utilizador inicia cada reprodução. Não há gravação nem reconhecimento de fala.

FaithOS completo (textos licenciados, planos, devocionais revistos e diário de oração), SoulOS, BodyOS, GrowthOS, MoneyOS, MindOS e VisionOS ainda estão planeados. A aplicação permite associar tarefas e hábitos a esses pilares, mas não apresenta métricas ou conteúdo especializado inventados. LifeAI não faz planeamento automático nem extrai valores/datas para mutações.

Não há PWA instalável/offline, notificações push, sincronização de calendário, conectores Agexa/Ordexa, recuperação de password na interface, MFA ou deploy nesta entrega. O cache offline de conteúdo privado exige projeto específico antes de adicionar service worker.

**Próximo passo recomendado:** completar a rotina e a leitura/foco da Fase 2, ampliar o currículo A0 com testes de conteúdo e só depois iniciar os diários privados e conteúdos licenciados da Fase 4. A arquitetura e a sequência completa estão em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
