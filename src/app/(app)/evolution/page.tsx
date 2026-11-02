import { loadWorkspace } from '@/lib/data';
import { localDate, addDays, shortDate } from '@/lib/domain';
import { PageHeading, Card } from '@/components/ui';
import { Icon } from '@/components/icon';
export default async function Evolution() {
  const d = await loadWorkspace();
  const days = Array.from({ length: 7 }, (_, i) => addDays(localDate(), i - 6));
  const series = days.map((day) => ({
    day,
    tasks: d.tasks.filter((t) => t.completed_at && localDate(new Date(t.completed_at)) === day)
      .length,
    habits: d.entries.filter((e) => e.entry_date === day).length,
  }));
  const max = Math.max(1, ...series.map((s) => s.tasks + s.habits));
  const metrics = [
    {
      icon: 'checks',
      value: d.tasks.filter((t) => t.completed_at).length,
      label: 'tarefas concluídas no histórico atual',
    },
    {
      icon: 'focus',
      value: Math.floor(
        d.focus.filter((f) => f.ended_at).reduce((s, f) => s + f.elapsed_seconds, 0) / 60,
      ),
      label: 'minutos em sessões de foco',
    },
    {
      icon: 'book',
      value: d.reading.filter((r) => r.ended_at).reduce((s, r) => s + r.pages_read, 0),
      label: 'páginas em sessões de leitura',
    },
    { icon: 'languages', value: d.attempts.length, label: 'tentativas de exercícios de inglês' },
  ];
  return (
    <>
      <PageHeading
        eyebrow="A MINHA EVOLUÇÃO · O TEU PRÓPRIO CAMINHO"
        title="Olha para os passos que já deste."
        text="Registos reais, sem comparações com outras pessoas. Descansar não apaga o teu progresso."
      />
      <div className="metric-grid">
        {metrics.map((m) => (
          <div className="metric-card" key={m.icon}>
            <span className={`icon-tile ${m.icon}`}>
              <Icon name={m.icon} />
            </span>
            <strong>{m.value}</strong>
            <p>{m.label}</p>
          </div>
        ))}
      </div>
      <div className="two-columns">
        <Card
          title="Os últimos sete dias"
          icon="activity"
          action={<span className="pill">AFRICA/MAPUTO</span>}
        >
          <p className="card-subtitle">
            Tarefas concluídas + hábitos registados. Não é uma pontuação pessoal.
          </p>
          <div
            className="chart"
            role="img"
            aria-label={series
              .map((s) => `${shortDate(s.day)}: ${s.tasks} tarefas e ${s.habits} hábitos`)
              .join('; ')}
          >
            {series.map((s) => (
              <div className="chart-column" key={s.day}>
                <strong>{s.tasks + s.habits}</strong>
                <div className="chart-bars">
                  <div
                    className="chart-bar"
                    style={{ height: `${((s.tasks + s.habits) / max) * 100}%` }}
                  />
                </div>
                <span>
                  {s.day.slice(8)}/{s.day.slice(5, 7)}
                </span>
              </div>
            ))}
          </div>
          <p className="policy-note" style={{ marginTop: 17 }}>
            Os dias sem registos aparecem a zero. Reabrir uma tarefa remove-a das concluídas;
            eliminar um registo também altera este resumo.
          </p>
        </Card>
        <Card title="Evoluir também é recomeçar" icon="sprout">
          <div className="content-prose">
            <h3>O que correu bem esta semana?</h3>
            <p>Olha para uma ação que conseguiste fazer, mesmo pequena.</p>
            <h3>O que precisa de mais espaço?</h3>
            <p>Talvez seja descanso, uma conversa ou uma tarefa mais simples.</p>
            <h3>Qual é o próximo passo possível?</h3>
            <p>Escolhe um gesto concreto para amanhã. Não precisas de compensar dias perdidos.</p>
          </div>
        </Card>
      </div>
    </>
  );
}
