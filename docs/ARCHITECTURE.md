# LifeOS — arquitetura e plano

## Ponto de partida

Repositório remoto e checkout sem commits, código ou dependências. Não há funcionalidades anteriores. Esta implementação começa pela fundação e só avança após validação. Idioma pt-MZ, moeda MZN e datas Africa/Maputo.

## Decisões

- Next.js App Router, React, TypeScript estrito, Tailwind e CSS de componentes; ícones Lucide. Geist incluída em ficheiros locais, sem pedidos externos de fontes.
- Supabase Auth com cookies seguros geridos por @supabase/ssr e PostgreSQL com RLS em todas as tabelas pessoais. Apenas a chave publicável no browser; nenhuma service role na aplicação.
- Server Actions autenticadas, validação Zod, constraints SQL e verificações de propriedade nas relações. Resultados e erros explícitos.
- Auth por email/password. Confirmação de email exigida pelo fornecedor em produção; redirecionamentos internos permitidos explicitamente. Instância local isolada para desenvolvimento.
- Sem dados pessoais de exemplo, APIs de IA, analytics ou rastreadores. Currículo estático é conteúdo educativo versionado, não progresso simulado.
- Onze pilares: FaithOS, EnglishOS, ReadOS, FocusOS, BodyOS, GrowthOS, DisciplineOS, MoneyOS, MindOS, VisionOS e SoulOS. Registo central tipado distingue disponível e planeado. A interface não representa módulos planeados como concluídos.
- LifeAI inicial: intérprete determinístico de comandos de navegação/consulta; não altera dados nem finge ser IA generativa.

## Fases e critérios

1. Fundação: sessão real, perfil e preferências, shell responsiva, dashboard sem métricas inventadas, migrações RLS. Verificar build, login e isolamento entre dois utilizadores.
2. Disciplina/leitura/foco: tarefas e prioridades, hábitos e check-ins diários, livros e sessões, temporizador com duração medida e persistência. Verificar criação, edição, conclusão e permanência após recarga.
3. EnglishOS inicial: pequeno currículo A0 com explicações, traduções, vocabulário e exercícios corrigidos no servidor; histórico, revisão espaçada e áudio opcional. Não constitui curso A0/A1/A2 completo.
4. FaithOS e desenvolvimento pessoal: conteúdos revistos/licenciados e diários privados (planeado).
5. Saúde e crescimento: preferências e limitações antes de recomendações, sem promessas de altura (planeado).
6. Finanças/estudos/projetos: MZN, cálculo real e gestão ligada a tarefas (planeado).
7. LifeAI completo: extração de entidades, planos e alterações confirmadas (planeado).
8. Qualidade contínua; PWA, auditoria e deploy após validar requisitos de produção.

## Validação necessária e opcional

Obrigatórios: TypeScript, lint, build, testes do domínio, integração real PostgreSQL/RLS e fluxos de autenticação/tarefas/hábitos/leitura/foco/inglês no browser. Se o runtime impedir alguma execução, documentar exatamente o que não foi testado. Opcional nesta entrega: deploy público, push em segundo plano, currículo extenso e auditoria externa de segurança.

## Dados

profiles; tasks; habits; habit_entries; books; reading_sessions; focus_sessions; lesson_attempts; vocabulary_reviews; audit_events. user_id referencia auth.users; todos os acessos pessoais passam por auth.uid(). Deletes via UI pedem confirmação. Exportação é produzida no servidor. Eliminação integral dos dados pessoais usa função transacional; eliminação da identidade Auth exige pedido administrativo separado quando não há integração privilegiada.

## Custos e privacidade

Dependências abertas e Supabase local sem subscrição. Supabase alojado e hosting podem ter quotas/custos: verificar planos antes de publicar. Web Speech é opcional, depende do navegador e pode usar serviços do fabricante; a leitura escrita está sempre disponível. Sem reconhecimento nem classificação profissional de pronúncia.
