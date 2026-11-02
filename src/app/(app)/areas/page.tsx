import Link from 'next/link';
import { pillars } from '@/lib/domain';
import { Icon } from '@/components/icon';
import { PageHeading } from '@/components/ui';
const phases: Record<string, string> = {
  faith: 'Fase 4',
  body: 'Fase 5',
  growth: 'Fase 5',
  money: 'Fase 6',
  mind: 'Fase 6',
  vision: 'Fase 6',
  soul: 'Fase 4',
};
export default function Areas() {
  return (
    <>
      <PageHeading
        eyebrow="ONZE PILARES · UMA VIDA INTEIRA"
        title="O teu universo, com propósito."
        text="Quatro áreas funcionais nesta versão. Os próximos pilares crescem sobre a mesma base privada."
      />
      <div className="area-grid">
        {pillars.map((p) => (
          <section className="card area-card" key={p.id}>
            <span className={`icon-tile ${p.icon}`}>
              <Icon name={p.icon} size={23} />
            </span>
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            <span className={`pill ${p.available ? 'green' : ''}`}>
              {p.available ? 'DISPONÍVEL' : `PLANEADO · ${phases[p.id]}`}
            </span>
            {'href' in p && (
              <div>
                <Link className="text-link" href={p.href}>
                  Explorar {p.label.toLowerCase()} <Icon name="arrow" size={16} />
                </Link>
              </div>
            )}
            {!p.available && (
              <p className="policy-note">
                Ainda sem registos ou funcionalidades próprias. Podes organizar ações desta área
                como tarefas e hábitos em Hoje.
              </p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
