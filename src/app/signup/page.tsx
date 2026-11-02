import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/form';
import { Icon } from '@/components/icon';
import { isConfigured } from '@/lib/supabase/server';
export default function SignUp() {
  if (!isConfigured()) redirect('/setup');
  return (
    <main className="signup-page">
      <Link href="/login" className="brand">
        <span className="brand-mark">
          <Icon name="sprout" size={25} />
        </span>
        LifeOS
      </Link>
      <section className="card signup-card">
        <p className="eyebrow">UM COMEÇO COM PROPÓSITO</p>
        <h1>
          A tua jornada.
          <br />O teu ritmo.
        </h1>
        <p className="muted">Cria um espaço privado para os passos que importam.</p>
        <AuthForm mode="signup" />
        <p className="auth-switch">
          Já tens conta? <Link href="/login">Entrar no meu espaço</Link>
        </p>
        <small className="muted">
          Não adicionamos tarefas, hábitos ou progresso fictícios à tua conta.
        </small>
      </section>
    </main>
  );
}
