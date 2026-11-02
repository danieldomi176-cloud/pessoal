# Validação desta entrega

Executada em **02/11/2026**, neste ambiente Linux x86_64, com Node 24.19.0, npm 11.9.0, Docker 28.4.0 e Supabase local real (PostgreSQL 17). Não demonstra publicação nem restauração numa nova tarefa.

| Verificação                        | Resultado observado                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --strict-ssl=true`         | Instalação limpa pelo lockfile concluída                                                                                         |
| `npm run setup:local`              | Arranque real, Auth saudável, migrações aplicadas; repetição preservou `.env.local` e volumes                                    |
| `npm run typecheck`                | Passou                                                                                                                           |
| `npm run lint`                     | Passou sem erros ou avisos do analisador                                                                                         |
| `npm run test`                     | **32 testes passaram**, sem testes ignorados                                                                                     |
| `npm run test:integration`         | **10 testes passaram**, em PostgreSQL/Auth/REST reais, sem testes ignorados                                                      |
| `npm run build`                    | Build de produção concluído, 16 rotas de aplicação geradas                                                                       |
| `npm run test:e2e`                 | **10 testes passaram**, sem testes ignorados, em Chromium e servidor de produção                                                 |
| Auditoria axe WCAG 2 A/AA + 2.1 AA | Zero violações reportadas nos ecrãs testados: dashboard escuro, perfil claro e dashboard móvel                                   |
| Responsividade                     | Capturas desktop 1440 px e móvel 390 px; ausência de overflow horizontal verificada no dashboard móvel                           |
| Servidor de desenvolvimento        | Login com HTML esperado, cabeçalhos de proteção e redirecionamento de rota privada verificados por pedidos HTTP                  |
| Reinício completo do Supabase      | Conta e tarefa temporárias persistiram após `db:stop` e `setup:local`; foi possível voltar a autenticar com a mesma configuração |
| `npm run format:check`             | Passou; ficheiros gerados pelo Next ficam fora da formatação manual                                                              |

## O que os testes demonstram

- Autenticação real, sessão e proteção de páginas; conta nova sem dados pessoais simulados.
- RLS nas dez tabelas; leitura/alteração entre utilizadores bloqueada e acesso anónimo sem dados.
- Relações entre contas e valores inválidos recusados pela base de dados.
- Sessões de foco com tempo do servidor e finalização sem duplicação.
- Sessões de leitura transacionais, atualização de páginas e proteção contra duas submissões concorrentes.
- Hábitos com apenas um check-in por dia e isolamento do livro atual.
- Histórico sensível privado e protegido contra reescrita/eliminação direta pela API.
- Tarefas criadas, editadas e concluídas, hábitos e leitura persistentes após recarga.
- Aula de inglês com erro real, correção explicada, melhoria na segunda tentativa e revisão espaçada agendada.
- LifeAI baseado em regras com contagens reais e resposta explícita para módulos indisponíveis.
- Tema e cartões persistentes, exportação dos dados da própria conta e eliminação confirmada.
- Encerrar sessão volta a bloquear páginas privadas.

As contas temporárias foram removidas no fim de cada conjunto. As capturas `lifeos-desktop.png` e `lifeos-mobile.png` em `/workspace/artifacts` mostram **uma conta de teste**, não dados pré-carregados para o utilizador.

## Problemas encontrados e resolvidos

O primeiro arranque do Supabase falhou porque o verificador BusyBox encaminhava a sua URL de loopback ao proxy. O helper documentado em CLOUD.md corrigiu essa URL específica, mantendo os healthchecks ativos. Uma migração pendente causou um erro de cache de esquema; reaplicar o setup aplicou-a e os testes passaram.

Os testes de navegador detetaram contraste insuficiente, herança incorreta no tema claro, reset automático de respostas pelo React 19 e desaparecimento prematuro do feedback de revisão. Foram corrigidos e os dez testes passaram. Uma corrida no teste que recarregava a página antes da gravação foi corrigida com espera pelo estado confirmado na interface.

O npm reporta o ESLint 9.39.5 como fora de suporte. Foi mantido por compatibilidade com os plugins atuais do `eslint-config-next`: ESLint 10 gerava conflitos de peer dependencies. A instalação final não usa `--force` nem `--legacy-peer-deps`. Atualizar o lint quando os plugins declararem suporte é uma pendência de ferramentas, não uma dependência de execução da aplicação.

## Não verificado ou não implementado

Sem deploy, Supabase alojado, envio de email real em produção, confirmação de email num fornecedor externo, recuperação de password na interface, PWA/offline, push ou restauração noutra tarefa. A reprodução de áudio depende de vozes reais do dispositivo e não foi validada como avaliação de pronúncia. A auditoria automática não equivale a certificação de acessibilidade ou auditoria independente de segurança.

A Fase 1 é uma fundação funcional local. A Fase 2 é um núcleo utilizável, com os limites indicados no README. O conteúdo A0 são três aulas iniciais; os restantes módulos continuam planeados. Na validação inicial descrita neste documento, o repositório de origem ainda não tinha commits e os ficheiros eram alterações locais. Enviar o código ao GitHub é uma operação separada de publicar a aplicação num alojamento.
