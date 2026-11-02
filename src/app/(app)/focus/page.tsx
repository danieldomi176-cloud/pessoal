import { loadWorkspace } from '@/lib/data';
import { shortDate } from '@/lib/domain';
import { PageHeading, Card, Empty } from '@/components/ui';
import { ActionForm } from '@/components/form';
import { Timer } from '@/components/timer';
import { FocusGuidance } from '@/components/interactive';
import { Icon } from '@/components/icon';
export default async function Focus() {
  const d = await loadWorkspace();
  const active = d.focus.find((f) => !f.ended_at);
  const history = d.focus.filter((f) => f.ended_at).reverse();
  return (
    <>
      <PageHeading
        eyebrow="FOCUSOS · SÓ O PRÓXIMO PASSO"
        title="O mais difícil pode ser começar."
        text="Dá cinco minutos a uma tarefa. Depois, decide com calma como continuar."
      />
      <div className="two-columns">
        <div className="stack">
          <Card title={active ? 'O teu momento de foco' : 'Começar agora'} icon="focus">
            {active ? (
              <>
                <span className="pill purple">SESSÃO EM CURSO</span>
                <h2 style={{ marginTop: 20 }}>{active.objective}</h2>
                <Timer startedAt={active.started_at} planned={active.planned_seconds} />
                <ActionForm action="focus.finish">
                  <input type="hidden" name="id" value={active.id} />
                  <button className="button primary full">
                    <Icon name="check" size={17} />
                    Terminar e guardar sessão
                  </button>
                </ActionForm>
                <p className="policy-note" style={{ marginTop: 15 }}>
                  Guarda o tempo decorrido, mesmo se terminares antes da meta. Depois do bloco,
                  experimenta uma pausa de cinco minutos. O temporizador acompanha tempo, não mede
                  atenção.
                </p>
              </>
            ) : (
              <ActionForm action="focus.start" className="stack">
                <label>
                  O que vais fazer nestes minutos?
                  <input
                    name="objective"
                    required
                    maxLength={160}
                    placeholder="Ex.: escrever a primeira frase do trabalho"
                  />
                </label>
                <FocusGuidance />
                <div className="form-row">
                  <label>
                    Bloco de concentração (minutos)
                    <input
                      type="number"
                      name="minutes"
                      defaultValue={5}
                      min={1}
                      max={120}
                      required
                    />
                    <small>5 para começar · 25 para um Pomodoro · até 120.</small>
                  </label>
                  <label>
                    Associar a uma tarefa (opcional)
                    <select name="task_id">
                      <option value="">Sem tarefa associada</option>
                      {d.tasks
                        .filter((t) => !t.completed_at)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                <button className="button primary full">
                  <Icon name="focus" size={18} />
                  Iniciar o meu bloco de foco
                </button>
              </ActionForm>
            )}
          </Card>
          <Card title="O que já fizeste" icon="clock">
            {history.length ? (
              history.map((s) => (
                <div key={s.id} className="session-row">
                  <div>
                    <strong>{s.objective}</strong>
                    <p>
                      {shortDate(s.started_at)} · Meta: {Math.round(s.planned_seconds / 60)} min
                      {s.blocker && ` · ${s.blocker}`}
                    </p>
                  </div>
                  <span>
                    {Math.floor(s.elapsed_seconds / 60)} min {s.elapsed_seconds % 60} s
                  </span>
                </div>
              ))
            ) : (
              <Empty
                icon="focus"
                title="O teu primeiro bloco começa aqui"
                text="As sessões guardadas vão mostrar o tempo real decorrido, sem números inventados."
              />
            )}
          </Card>
        </div>
        <div className="stack">
          <div className="gentle-note">
            <Icon name="leaf" size={24} />
            <h3>
              O objetivo não é fazer tudo.
              <br />É tornar o começo mais leve.
            </h3>
            <p>
              1. Escolhe uma ação concreta.
              <br />
              2. Afasta uma distração possível.
              <br />
              3. Começa com cinco minutos.
              <br />
              4. Regista o que fizeste.
              <br />
              5. Faz uma pausa e escolhe o próximo passo.
            </p>
          </div>
          <Card title="Adiados muitas vezes?" icon="help">
            <p className="content-prose">
              Esta versão mantém as tarefas em atraso visíveis em Hoje. Podes editar a data, reduzir
              o tamanho da tarefa ou usar um bloco curto. Ainda não conta quantas vezes cada tarefa
              foi adiada.
            </p>
          </Card>
          <p className="policy-note">
            O LifeOS não bloqueia outras aplicações nem controla o telemóvel. O relógio continua ao
            mudar de página; só uma sessão terminada entra no histórico de tempo.
          </p>
        </div>
      </div>
    </>
  );
}
