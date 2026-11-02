'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icon';
import { signOut } from '@/app/actions';
const links = [
  { href: '/', label: 'O meu espaço', icon: 'home' },
  { href: '/today', label: 'Hoje', icon: 'calendar' },
  { href: '/evolution', label: 'A minha evolução', icon: 'trend' },
];
const areaLinks = [
  { href: '/english', label: 'EnglishOS', icon: 'languages' },
  { href: '/reading', label: 'ReadOS', icon: 'book' },
  { href: '/focus', label: 'FocusOS', icon: 'focus' },
  { href: '/areas', label: 'Todas as áreas', icon: 'grid' },
];
export function Shell({
  name,
  theme,
  children,
}: {
  name: string;
  theme: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const nav = (l: { href: string; label: string; icon: string }) => (
    <Link
      key={l.href}
      href={l.href}
      className={`nav-link ${path === l.href ? 'active' : ''}`}
      aria-current={path === l.href ? 'page' : undefined}
    >
      <Icon name={l.icon} />
      <span>{l.label}</span>
      {path === l.href && <span className="active-dot" />}
    </Link>
  );
  return (
    <div className="app" data-theme={theme}>
      <a className="skip-link" href="#main">
        Saltar para o conteúdo
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Icon name="sprout" size={25} />
          </span>
          <span>
            Life<span className="brand-light">OS</span>
            <small>PERSONAL EVOLUTION</small>
          </span>
        </Link>
        <div className="workspace-label">
          <span className="status-dot" /> O TEU UNIVERSO PESSOAL
        </div>
        <nav aria-label="Navegação principal">
          <div className="nav-group">{links.map(nav)}</div>
          <p className="nav-heading">OS MEUS PILARES</p>
          <div className="nav-group">{areaLinks.map(nav)}</div>
          <p className="nav-heading">O TEU COPILOTO</p>
          {nav({ href: '/lifeai', label: 'LifeAI', icon: 'sparkles' })}
        </nav>
        <div className="sidebar-bottom">
          <div className="private-note">
            <Icon name="shield" size={16} />
            <span>
              Um espaço só teu.<small>Privado por natureza.</small>
            </span>
          </div>
          {nav({ href: '/profile', label: 'Definições', icon: 'settings' })}
          <form action={signOut}>
            <button className="nav-link signout">
              <Icon name="logout" />
              <span>Terminar sessão</span>
            </button>
          </form>
          <div className="sidebar-profile">
            <span className="avatar">{(name || 'L').slice(0, 1).toUpperCase()}</span>
            <span>
              {name || 'O teu espaço'}
              <small>Um dia de cada vez</small>
            </span>
            <Icon name="leaf" size={17} />
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumb">
            <Icon name="grid" size={17} />
            <span>O meu universo</span>
            <span>/</span>
            <strong>
              {path === '/'
                ? 'Início'
                : ([
                    ...links,
                    ...areaLinks,
                    { href: '/profile', label: 'Perfil' },
                    { href: '/lifeai', label: 'LifeAI' },
                  ].find((l) => l.href === path)?.label ?? 'EnglishOS')}
            </strong>
          </div>
          <div className="topbar-actions">
            <span className="maputo">
              <span className="status-dot" /> Africa/Maputo
            </span>
            <Link href="/lifeai" className="icon-button" aria-label="Abrir LifeAI">
              <Icon name="sparkles" />
            </Link>
            <Link href="/profile" className="avatar small" aria-label="O meu perfil">
              {(name || 'L').slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        <main id="main" className="main-content">
          {children}
          <footer className="footer">
            <span>
              <Icon name="sprout" size={14} /> A melhor versão de mim, um dia de cada vez.
            </span>
            <span>O progresso é teu. O ritmo também.</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Navegação móvel">
        {[
          { href: '/', label: 'Início', icon: 'home' },
          { href: '/today', label: 'Hoje', icon: 'calendar' },
          { href: '/lifeai', label: 'LifeAI', icon: 'sparkles' },
          { href: '/evolution', label: 'Evolução', icon: 'trend' },
          { href: '/profile', label: 'Perfil', icon: 'user' },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={path === l.href ? 'selected' : ''}
            aria-current={path === l.href ? 'page' : undefined}
          >
            <Icon name={l.icon} size={21} />
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
