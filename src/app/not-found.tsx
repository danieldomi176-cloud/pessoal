import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="setup-page">
      <p className="eyebrow">LIFEOS · 404</p>
      <h1>Este caminho ainda não existe.</h1>
      <Link className="button primary" href="/">
        Voltar ao meu espaço
      </Link>
    </main>
  );
}
