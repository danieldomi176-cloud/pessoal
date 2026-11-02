# Ambiente na nuvem

Usar `/workspace/pessoal`, checkout existente numa tarefa já isolada. Não criar worktree sem pedido explícito. Não reconfigurar origins ou solicitar tokens GitHub: o proxy da plataforma fornece o acesso de leitura.

## Processos e ficheiros

Dependências (`node_modules`), lockfile e build `.next` podem ser retidos. Os processos do Docker e Next precisam de ser verificados/reiniciados em cada instância. O script `npm run setup:local` inicia os serviços, preserva `.env.local` e volumes, aplica migrações pendentes e verifica o endpoint real de saúde Auth. `npm run start -- --port 3000` inicia o build de produção. Verificar uma resposta HTTP de login e autenticação antes de afirmar que a aplicação está operacional. Não criar links de preview de loopback no onboarding.

## Rede e confiança

Destinos necessários: GitHub e registos npm/imagens Supabase, cobertos pelo preset de gestores de pacotes nesta sessão. O CLI tenta `public.ecr.aws`, que é recusado; o fallback oficial `ghcr.io/supabase/*` funcionou e os downloads foram verificados. Não foi ampliada a lista de rede. Preservar o proxy e os certificados da plataforma; não desativar TLS, assinaturas ou checksums.

Foi diagnosticado um problema no `wget` BusyBox do GoTrue: ignora `no_proxy` na sua verificação de saúde em `http://127.0.0.1:9999/health`. O setup instala um pequeno adaptador no container para executar **apenas essa URL exata de loopback** com a opção de não usar proxy; qualquer outro destino passa ao binário original com o proxy existente. A verificação normal do CLI continua ativa. Não altera a imagem oficial, não desativa healthchecks e não concede acesso externo.

O Docker mantém as credenciais/configuração originais. Nesta instância foi acrescentado `0.0.0.0` e os nomes locais Supabase à exclusão de proxy durante o diagnóstico; o adaptador é a correção que permitiu o arranque. Não há necessidade de replicar esse alargamento para executar o projeto.

O ambiente restringe rede e escrita em pastas do utilizador no sandbox. As operações npm/Docker/CLI foram executadas pelo fluxo de execução autorizado, sem extrair valores de tokens. As ferramentas podem necessitar do mesmo fluxo em futuras tarefas.

## Publicação

Salvar `install_script` e `start_skill` persiste instruções; não executa nem publica. Rever e guardar nas definições do ambiente e depois publicar é uma ação do utilizador. A validação desta instância não demonstra a restauração numa tarefa nova.
