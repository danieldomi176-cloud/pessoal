import { loadWorkspace } from '@/lib/data';
import { dateLabel, localDate, pillars } from '@/lib/domain';
import { Card, Empty, PageHeading, PillarSelect } from '@/components/ui';
import { ActionForm } from '@/components/form';
import { TaskFields, TaskRow } from '@/components/tasks';
import { Icon } from '@/components/icon';
export default async function Today() {
  const d = await loadWorkspace();
  const today = localDate();
  const open = d.tasks
    .filter((t) => !t.completed_at)
    .sort((a, b) => a.due_date.localeCompare(b.due_date) || b.priority - a.priority);
  const complete = d.tasks.filter((t) => t.completed_at);
  return (
    <>
      <PageHeading
        eyebrow="DISCIPLINEOS · O ESSENCIAL PRIMEIRO"
        title="O teu dia, com intenção."
        text={dateLabel()}
      />
      <div className="two-columns">
        <div className="stack">
          <Card title="Hoje e por fazer" icon="calendar">
            <p className="card-subtitle">
              As tarefas em atraso continuam aqui. Podes ajustar o plano sem culpa.
            </p>
            {open.length ? (
              open.map((t) => <TaskRow key={t.id} task={t} />)
            ) : (
              <Empty
                title="Há espaço para um novo começo"
                text="Cria uma tarefa pequena. Não precisas de preencher o dia todo."
              />
            )}
          </Card>
          <Card title="Passos que já deste" icon="checks">
            {complete.length ? (
              <details>
                <summary className="text-link">
                  Ver {complete.length} tarefa(s) concluída(s)
                </summary>
                {complete.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </details>
            ) : (
              <p className="muted">As tarefas concluídas vão aparecer aqui.</p>
            )}
          </Card>
          <div id="habits">
            <Card title="Os meus hábitos e missões" icon="leaf">
              <p className="card-subtitle">
                Marca apenas o que fizeste hoje. Não há punições por dias perdidos.
              </p>
              {d.habits.map((h) => {
                const done = d.entries.some((e) => e.habit_id === h.id && e.entry_date === today);
                return (
                  <div className="habit-row" key={h.id}>
                    <ActionForm action="habit.toggle" className="grow">
                      <input name="id" type="hidden" value={h.id} />
                      <input name="done" type="hidden" value={done ? '0' : '1'} />
                      <button
                        className={`ritual-button ${done ? 'done' : ''}`}
                        aria-label={`${done ? 'Desmarcar' : 'Registar'} ${h.title}`}
                      >
                        <span className="task-check">
                          {done && <Icon name="check" size={14} />}
                        </span>
                        <span>
                          {h.title}
                          <small>{pillars.find((p) => p.id === h.pillar)?.label}</small>
                        </span>
                      </button>
                    </ActionForm>
                    <ActionForm
                      action="habit.delete"
                      confirm="Eliminar este hábito e o respetivo histórico?"
                    >
                      <input type="hidden" name="id" value={h.id} />
                      <input type="hidden" name="confirm" value="yes" />
                      <button className="icon-button" aria-label={`Eliminar hábito ${h.title}`}>
                        <Icon name="trash" size={16} />
                      </button>
                    </ActionForm>
                  </div>
                );
              })}
              {!d.habits.length && (
                <Empty
                  title="Um pequeno ritual pode mudar o teu dia"
                  text="Escolhe uma ação que queiras repetir, como ler duas páginas ou preparar o próximo dia."
                />
              )}
              <details className="disclosure">
                <summary>
                  <Icon name="plus" size={16} /> Criar um hábito
                </summary>
                <ActionForm action="habit.create" className="stack" reset>
                  <label>
                    O meu hábito
                    <input
                      name="title"
                      required
                      maxLength={100}
                      placeholder="Ex.: reservar um momento de oração"
                    />
                  </label>
                  <PillarSelect />
                  <button className="button primary">Criar hábito</button>
                </ActionForm>
              </details>
            </Card>
          </div>
        </div>
        <div id="new-task" className="sticky-column">
          <Card title="Um próximo passo" icon="plus">
            <ActionForm action="task.create" className="stack" reset>
              <TaskFields />
              <button className="button primary full">
                <Icon name="plus" size={17} />
                Adicionar tarefa
              </button>
            </ActionForm>
          </Card>
          <div className="gentle-note">
            <Icon name="sprout" size={22} />
            <h3>Um plano possível é melhor do que um plano perfeito.</h3>
            <p>
              Escolhe até três prioridades. Divide o que parece demasiado grande. Deixa espaço para
              pausas.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
