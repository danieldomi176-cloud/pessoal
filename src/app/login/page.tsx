import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/form';
import { Icon } from '@/components/icon';
import { isConfigured, createClient } from '@/lib/supabase/server';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ confirmation?: string }>;
}) {
  if (!isConfigured()) redirect('/setup');
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (user) redirect('/');
  const params = await searchParams;
  return (
    <div className="auth-layout">
      <div className="auth-art">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Icon name="sprout" size={28} />
          </span>
          <span>
            Life<span className="brand-light">OS</span>
          </span>
        </Link>
        <div>
          <p className="eyebrow">O TEU NOVO CAPÍTULO COMEÇA AQUI</p>
          <h1>
            Uma vida.
            <br />
            Infinitas formas
            <br />
            de <em>evoluir.</em>
          </h1>
          <p>
            Mais intenção. Menos pressão.
            <br />A melhor versão de ti, um dia de cada vez.
          </p>
        </div>
        <span className="auth-private">
          <Icon name="shield" size={16} /> O teu progresso pertence-te.
        </span>
        <div className="auth-orbit" aria-hidden="true" />
      </div>
      <main className="auth-form-panel">
        <span className="pill purple">BEM-VINDO DE VOLTA</span>
        <h2>O teu espaço espera por ti.</h2>
        <p className="muted">Não precisas de fazer tudo. Só de dar o próximo passo.</p>
        {params.confirmation === 'failed' && (
          <p className="failure" role="alert">
            A confirmação expirou ou é inválida. Tenta entrar ou pede uma nova confirmação no
            Supabase.
          </p>
        )}
        <AuthForm mode="login" />
        <p className="auth-switch">
          Ainda não tens conta?{' '}
          <Link href="/signup">
            Começar a minha jornada <span aria-hidden="true">→</span>
          </Link>
        </p>
        <div className="privacy-line">
          <Icon name="lock" size={14} /> Autenticação segura. Dados privados por padrão.
        </div>
      </main>
    </div>
  );
}
