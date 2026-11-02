import { spawn, spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Só contém configuração local. Nunca imprime JWT, service-role ou palavras-passe.
const root = resolve(import.meta.dirname, '..');
process.chdir(root);
const cli = resolve('node_modules/.bin/supabase');
if (!existsSync(cli)) throw new Error('Executa npm ci primeiro.');
const dockerEnv = { ...process.env };
for (const name of [
  'DOCKER_HOST',
  'DOCKER_CONTEXT',
  'DOCKER_TLS',
  'DOCKER_TLS_VERIFY',
  'DOCKER_CERT_PATH',
])
  delete dockerEnv[name];
const docker = (args) =>
  spawnSync('docker', ['--host=unix:///var/run/docker.sock', ...args], {
    env: dockerEnv,
    encoding: 'utf8',
  });
if (docker(['info', '--format', '{{.ServerVersion}}']).status !== 0)
  throw new Error('O daemon Docker local deve estar ativo e acessível.');
console.log(
  'A iniciar PostgreSQL, Auth, REST e gateway locais. A primeira execução descarrega imagens oficiais.',
);
const child = spawn(cli, ['start'], { env: dockerEnv, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
child.stdout.on('data', (chunk) => {
  output += chunk.toString();
});
child.stderr.on('data', (chunk) => {
  output += chunk.toString();
});
let patched = false;
// BusyBox wget de GoTrue ignora no_proxy neste runtime. O adaptador limita-se
// à URL de saúde de loopback; todos os outros pedidos mantêm o proxy original.
const patchHealth = () => {
  if (patched || !process.env.HTTP_PROXY) return;
  const inspect = docker([
    'inspect',
    '--format',
    '{{json .Config.Healthcheck.Test}}',
    'supabase_auth_lifeos',
  ]);
  if (inspect.status !== 0 || !inspect.stdout.includes('http://127.0.0.1:9999/health')) return;
  const which = docker(['exec', 'supabase_auth_lifeos', 'sh', '-c', 'command -v wget']);
  if (which.status !== 0) return;
  const original = which.stdout.trim();
  if (original === '/usr/local/bin/wget') {
    patched = true;
    return;
  }
  if (!['/usr/bin/wget', '/bin/wget'].includes(original)) return;
  const wrapper =
    '#!/bin/sh\n# LifeOS local health adapter\nfor arg in "$@"; do\n  if [ "$arg" = "http://127.0.0.1:9999/health" ]; then\n    exec ' +
    original +
    ' -Y off "$@"\n  fi\ndone\nexec ' +
    original +
    ' "$@"\n';
  const result = spawnSync(
    'docker',
    [
      '--host=unix:///var/run/docker.sock',
      'exec',
      '-u',
      '0',
      '-i',
      'supabase_auth_lifeos',
      'sh',
      '-c',
      'test ! -e /usr/local/bin/wget && cat > /usr/local/bin/wget && chmod 755 /usr/local/bin/wget',
    ],
    { env: dockerEnv, input: wrapper, encoding: 'utf8' },
  );
  if (result.status === 0) {
    patched = true;
    console.log('Verificador de saúde adaptado apenas para o loopback local.');
  }
};
const tick = setInterval(patchHealth, 1500);
const status = await new Promise((resolveExit) => child.on('close', (code) => resolveExit(code)));
clearInterval(tick);
if (status !== 0) {
  const safe = output
    .split('\n')
    .filter(
      (line) =>
        /error|failed|unhealthy|forbidden/i.test(line) &&
        !/key|secret|token|password|jwt|eyJ|postgresql:\/\//i.test(line),
    )
    .slice(-5)
    .map((line) => line.slice(0, 400));
  console.error(
    safe.join('\n') || 'O Supabase não iniciou. Verifica o Docker e a política de rede.',
  );
  process.exit(Number(status) || 1);
}
const result = spawnSync(cli, ['status', '-o', 'json'], { env: dockerEnv, encoding: 'utf8' });
if (result.status !== 0) throw new Error('Não foi possível obter o estado local.');
const raw = result.stdout;
const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
const url = json.API_URL ?? json.api_url;
const key = json.PUBLISHABLE_KEY ?? json.publishable_key ?? json.ANON_KEY ?? json.anon_key;
if (!url || !key) throw new Error('URL/chave publicável locais ausentes.');
const file = resolve('.env.local');
if (!existsSync(file)) {
  writeFileSync(
    file,
    `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\nTEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres\n`,
    { mode: 0o600 },
  );
  console.log('.env.local criado com URL e chave pública locais.');
} else {
  const existing = readFileSync(file, 'utf8');
  if (!existing.includes('NEXT_PUBLIC_SUPABASE_URL=' + url))
    throw new Error(
      'Configuração existente preservada: aponta para outro projeto. Seleciona explicitamente a instância que pretendes usar.',
    );
  console.log('.env.local existente preservado.');
}
// start reutiliza volumes; aplicar apenas migrações pendentes, sem reset destrutivo.
const migrate = spawnSync(cli, ['migration', 'up'], { env: dockerEnv, encoding: 'utf8' });
if (migrate.status !== 0)
  throw new Error('Falha ao aplicar migrações locais; os dados existentes foram preservados.');
const response = await fetch(url + '/auth/v1/health', { headers: { apikey: key } });
if (!response.ok) throw new Error('A verificação real do serviço Auth falhou: ' + response.status);
console.log('Supabase local ativo; Auth respondeu, migrações aplicadas e configuração guardada.');
