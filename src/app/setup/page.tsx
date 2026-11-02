import { Icon } from '@/components/icon';
export default function Setup() {
  return (
    <main className="setup-page">
      <span className="brand-mark">
        <Icon name="sprout" size={30} />
      </span>
      <p className="eyebrow">LIFEOS · PREPARAR O TEU ESPAÇO</p>
      <h1>
        Uma base privada.
        <br />
        Um começo verdadeiro.
      </h1>
      <p>O Supabase ainda não está configurado nesta instância.</p>
      <div className="card stack">
        <h2>Desenvolvimento local</h2>
        <p>Com Node.js 22+ e Docker ativos, executa na pasta do projeto:</p>
        <pre>
          npm ci{'\n'}npm run setup:local{'\n'}npm run dev
        </pre>
        <p className="muted">
          O setup inicia PostgreSQL e autenticação reais, aplica as migrações e cria a configuração
          local. Para Supabase alojado, segue o README e configura a URL e a chave publicável. Nunca
          coloques uma service role no navegador.
        </p>
      </div>
    </main>
  );
}
