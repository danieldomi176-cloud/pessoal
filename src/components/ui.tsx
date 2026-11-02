import Link from 'next/link';
import { Icon } from './icon';
import { pillars } from '@/lib/domain';
export function PageHeading({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{text}</p>
      </div>
      {action}
    </div>
  );
}
export function Card({
  title,
  icon,
  children,
  action,
  className = '',
}: {
  title?: string;
  icon?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <div className="card-heading">
          <h2>
            {icon && (
              <span className={`icon-tile ${icon}`}>
                <Icon name={icon} size={18} />
              </span>
            )}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Empty({
  icon = 'sprout',
  title,
  text,
  href,
  label,
}: {
  icon?: string;
  title: string;
  text: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={24} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {href && (
        <Link href={href} className="text-link">
          {label ?? 'Começar'} <Icon name="arrow" size={15} />
        </Link>
      )}
    </div>
  );
}
export function PillarSelect({ value = 'discipline' }: { value?: string }) {
  return (
    <label>
      Área
      <select name="pillar" defaultValue={value}>
        {pillars.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Progress({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${v}%` }} />
    </div>
  );
}
