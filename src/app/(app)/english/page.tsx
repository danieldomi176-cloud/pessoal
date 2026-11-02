import Link from 'next/link';
import { loadWorkspace } from '@/lib/data';
import { localDate, addDays } from '@/lib/domain';
import { lessons, allWords, CURRICULUM_VERSION } from '@/lib/curriculum';
import { PageHeading, Card, Progress, Empty } from '@/components/ui';
import { Icon } from '@/components/icon';
import { ActionForm } from '@/components/form';
export default async function English() {
  const d = await loadWorkspace();
  const passed = new Set(
    d.attempts
      .filter((a) => a.correct === a.total && a.curriculum_version === CURRICULUM_VERSION)
      .map((a) => a.lesson_id),
  );
  const today = localDate();
  const due = d.reviews.filter((r) => r.due_date <= today);
  const weekStart = addDays(localDate(), -6);
  const week = d.attempts.filter((a) => localDate(new Date(a.created_at)) >= weekStart);
  return (
    <>
      <PageHeading
        eyebrow="ENGLISHOS · UM MUNDO DE NOVAS POSSIBILIDADES"
        title="Every journey starts with hello."
        text="Começa mesmo do zero. Explicações em português, passos curtos e tempo para praticar."
      />
      <div className="two-columns">
        <div className="stack">
          <Card
            title="Os teus primeiros passos"
            icon="languages"
            action={<span className="pill purple">A0 · INICIANTE ABSOLUTO</span>}
          >
            <p className="content-prose">
              Este é um conjunto inicial de três aulas, não o curso A0 completo. Não precisas de
              saber inglês para começar. Experimenta sessões de 10 a 20 minutos e repete o que
              precisares.
            </p>
            <Progress
              value={(passed.size / lessons.length) * 100}
              label="Aulas iniciais dominadas"
            />
            <p className="policy-note">
              {passed.size} de {lessons.length} aulas com todos os exercícios corretos.
            </p>
          </Card>
          <div>
            {lessons.map((l, i) => {
              const attempts = d.attempts.filter(
                (a) => a.lesson_id === l.id && a.curriculum_version === CURRICULUM_VERSION,
              );
              const best = attempts.length
                ? Math.max(...attempts.map((a) => a.correct / a.total))
                : null;
              return (
                <section className="lesson-card" key={l.id}>
                  <span className="lesson-number">
                    {passed.has(l.id) ? (
                      <Icon name="check" size={25} />
                    ) : (
                      String(i + 1).padStart(2, '0')
                    )}
                  </span>
                  <div>
                    <span className="mini-tag">
                      {l.minutes} MIN · {l.subtitle}
                    </span>
                    <h2>{l.title}</h2>
                    <p>
                      {best === null
                        ? 'Uma nova descoberta espera por ti.'
                        : `Melhor tentativa: ${Math.round(best * 100)}% · Podes praticar outra vez.`}
                    </p>
                  </div>
                  <Link
                    href={`/english/${l.id}`}
                    className={`button ${passed.has(l.id) ? 'secondary' : 'primary'}`}
                  >
                    {attempts.length ? 'Praticar' : 'Começar'}
                    <Icon name="arrow" size={16} />
                  </Link>
                </section>
              );
            })}
          </div>
          <Card title="Revisão espaçada" icon="clock">
            <p className="card-subtitle">
              Escreve em inglês. As revisões voltam em 1, 3, 7, 14, 30 e 60 dias; um erro volta
              amanhã.
            </p>
            <p className="policy-note">{due.length} palavra(s) pronta(s) para rever hoje.</p>
            {d.reviews.length ? (
              d.reviews.map((r) => {
                const w = allWords.find((w) => w.id === r.word_id);
                return (
                  w && (
                    <div className="review-card" key={r.id}>
                      <ActionForm action="review.answer">
                        <fieldset className="form-fields" disabled={r.due_date > today}>
                          <input name="word_id" type="hidden" value={w.id} />
                          <div className="review-row">
                            <label>
                              {w.pt}
                              <input
                                name="answer"
                                placeholder="Como se escreve em inglês?"
                                autoComplete="off"
                                required
                                maxLength={100}
                              />
                            </label>
                            <button className="button secondary">Verificar</button>
                          </div>
                        </fieldset>
                      </ActionForm>
                      {r.due_date > today && (
                        <p className="policy-note">
                          Próxima revisão: {r.due_date.split('-').reverse().join('/')}. Podes
                          praticar com o flashcard entretanto.
                        </p>
                      )}
                    </div>
                  )
                );
              })
            ) : (
              <Empty
                icon="languages"
                title={
                  d.reviews.length
                    ? 'Por hoje, as revisões estão em dia.'
                    : 'O teu vocabulário vai crescer aqui.'
                }
                text={
                  d.reviews.length
                    ? 'Volta na data da próxima revisão. Podes sempre repetir uma aula.'
                    : 'Termina uma aula para adicionar as primeiras palavras às revisões.'
                }
              />
            )}
          </Card>
          <Card title="Os teus flashcards" icon="book">
            {d.reviews.length ? (
              <div className="word-list">
                {d.reviews.map((r) => {
                  const w = allWords.find((w) => w.id === r.word_id);
                  return (
                    w && (
                      <details className="disclosure" key={r.id}>
                        <summary>{w.pt} · revelar a palavra</summary>
                        <strong>{w.en}</strong>
                        <p className="muted">
                          {w.ipa} · Próxima revisão: {r.due_date.split('-').reverse().join('/')}
                        </p>
                      </details>
                    )
                  );
                })}
              </div>
            ) : (
              <p className="muted">Os flashcards são criados a partir das aulas que terminas.</p>
            )}
          </Card>
        </div>
        <aside className="stack">
          <Card title="Esta semana, aprendeste" icon="trend">
            <div className="reading-summary">
              <span>{week.length}</span>
              <p>
                tentativa(s) registada(s)
                <br />
                {new Set(week.map((a) => localDate(new Date(a.created_at)))).size} dia(s) com
                prática
              </p>
            </div>
            <p className="policy-note" style={{ marginTop: 16 }}>
              Últimos sete dias em Africa/Maputo. Repetir uma aula faz parte de aprender.
            </p>
          </Card>
          <div className="gentle-note">
            <Icon name="sprout" />
            <h3>Não saber ainda é um ponto de partida.</h3>
            <p>
              Lê os exemplos em voz alta se te sentires confortável. Escreve as palavras. Volta
              amanhã. Cada tentativa é uma oportunidade de aprender.
            </p>
          </div>
          <p className="policy-note">
            Áudio opcional pela Web Speech API, quando existe voz inglesa. As vozes dependem do
            dispositivo e podem recorrer a serviços do fabricante do navegador. A alternativa
            escrita está sempre disponível. Não avaliamos a pronúncia. A1 e A2 ainda não estão
            disponíveis.
          </p>
        </aside>
      </div>
    </>
  );
}
