import { loadWorkspace } from '@/lib/data';
import { shortDate } from '@/lib/domain';
import { PageHeading, Card, Empty, Progress } from '@/components/ui';
import { ActionForm } from '@/components/form';
import { Timer } from '@/components/timer';
import { Icon } from '@/components/icon';
export default async function Reading() {
  const d = await loadWorkspace();
  const active = d.reading.find((r) => !r.ended_at);
  const activeBook = d.books.find((b) => b.id === active?.book_id);
  const history = d.reading.filter((r) => r.ended_at).reverse();
  const pages = history.reduce((s, r) => s + r.pages_read, 0);
  return (
    <>
      <PageHeading
        eyebrow="READOS · ABRE ESPAÇO PARA DESCOBRIR"
        title="Uma página pode ser um começo."
        text={`A tua meta pessoal: ${d.profile.daily_reading_minutes} minutos. Podes ajustá-la no perfil, ao teu ritmo.`}
      />
      <div className="two-columns">
        <div className="stack">
          {active && activeBook && (
            <Card title={`A ler · ${activeBook.title}`} icon="book">
              <Timer startedAt={active.started_at} planned={active.planned_seconds} />
              <ActionForm action="reading.finish" className="stack">
                <input type="hidden" name="id" value={active.id} />
                <label>
                  Em que página ficaste?
                  <input
                    name="page"
                    type="number"
                    min={activeBook.current_page}
                    max={activeBook.total_pages}
                    defaultValue={activeBook.current_page}
                    required
                  />
                </label>
                <label>
                  O que aprendeste? Qual foi a ideia mais importante? Como a podes aplicar?
                  <textarea
                    name="reflection"
                    maxLength={2000}
                    placeholder="Uma reflexão pessoal, se quiseres."
                  />
                </label>
                <button className="button primary">
                  <Icon name="check" size={17} />
                  Guardar a minha leitura
                </button>
                <p className="policy-note">
                  A reflexão é opcional e privada. O tempo é calculado pelo servidor; a página atual
                  e as páginas lidas são guardadas em conjunto.
                </p>
              </ActionForm>
            </Card>
          )}
          <div className="book-list">
            {d.books.map((b) => (
              <section className="book-card" key={b.id}>
                <div className="book-cover" aria-hidden="true">
                  <strong>{b.title}</strong>
                  <Icon name="book" size={20} />
                </div>
                <div className="lesson-topline">
                  <span className={`pill ${b.current_page === b.total_pages ? 'green' : ''}`}>
                    {b.current_page === b.total_pages
                      ? 'CONCLUÍDO'
                      : d.profile.current_book_id === b.id
                        ? 'A MINHA LEITURA ATUAL'
                        : 'NA MINHA BIBLIOTECA'}
                  </span>
                </div>
                <h3>{b.title}</h3>
                <p>{b.author || 'Autor não indicado'}</p>
                <Progress
                  value={(b.current_page / b.total_pages) * 100}
                  label={`Progresso de ${b.title}`}
                />
                <p>
                  {b.current_page} de {b.total_pages} páginas
                </p>
                {!active && b.current_page < b.total_pages && (
                  <ActionForm action="reading.start" className="stack">
                    <input type="hidden" name="id" value={b.id} />
                    <label>
                      Tempo para ler (minutos)
                      <input
                        name="minutes"
                        type="number"
                        min={1}
                        max={180}
                        defaultValue={d.profile.daily_reading_minutes}
                        list="reading-durations"
                        required
                      />
                    </label>
                    <button className="button primary full">
                      <Icon name="book" size={16} />
                      Começar a ler
                    </button>
                  </ActionForm>
                )}
                <div className="book-actions">
                  {d.profile.current_book_id !== b.id && (
                    <ActionForm action="book.current">
                      <input type="hidden" name="id" value={b.id} />
                      <button className="text-link" style={{ background: 'none', border: 0 }}>
                        Definir como atual
                      </button>
                    </ActionForm>
                  )}
                  <ActionForm
                    action="book.delete"
                    confirm="Eliminar este livro e as respetivas sessões e notas? Esta ação não pode ser desfeita."
                  >
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="confirm" value="yes" />
                    <button className="icon-button" aria-label={`Eliminar livro ${b.title}`}>
                      <Icon name="trash" size={16} />
                    </button>
                  </ActionForm>
                </div>
              </section>
            ))}
          </div>
          <datalist id="reading-durations">
            {[5, 10, 15, 20].map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
          {!d.books.length && (
            <Card>
              <Empty
                icon="book"
                title="A tua biblioteca começa com um livro"
                text="Adiciona um livro teu. O LifeOS guarda o teu progresso e as tuas notas, sem distribuir conteúdos protegidos."
              />
            </Card>
          )}
          <Card title="O que ficou contigo" icon="book">
            {history.length ? (
              history.map((s) => (
                <div key={s.id} className="session-row">
                  <div>
                    <strong>{d.books.find((b) => b.id === s.book_id)?.title ?? 'Livro'}</strong>
                    <p>
                      {shortDate(s.started_at)} · {Math.floor(s.elapsed_seconds / 60)} min{' '}
                      {s.elapsed_seconds % 60} s
                    </p>
                    {s.reflection && (
                      <p style={{ whiteSpace: 'pre-wrap', color: 'var(--muted)' }}>
                        {s.reflection}
                      </p>
                    )}
                  </div>
                  <span>{s.pages_read} pág.</span>
                </div>
              ))
            ) : (
              <p className="muted">
                O teu histórico de leitura e as tuas reflexões vão aparecer aqui.
              </p>
            )}
          </Card>
        </div>
        <div className="sticky-column">
          <Card title="Adicionar à biblioteca" icon="plus">
            <ActionForm action="book.create" className="stack" reset>
              <label>
                Título
                <input name="title" required maxLength={160} placeholder="O livro que queres ler" />
              </label>
              <label>
                Autor (opcional)
                <input name="author" maxLength={120} placeholder="Nome do autor" />
              </label>
              <div className="form-row">
                <label>
                  Total de páginas
                  <input name="total_pages" type="number" min={1} max={50000} required />
                </label>
                <label>
                  Página atual
                  <input
                    name="current_page"
                    type="number"
                    min={0}
                    max={50000}
                    defaultValue={0}
                    required
                  />
                </label>
              </div>
              <button className="button primary full">Adicionar livro</button>
            </ActionForm>
          </Card>
          <div className="reading-summary">
            <span>{pages}</span>
            <p>
              páginas em sessões registadas
              <br />
              <strong>
                {d.books.filter((b) => b.current_page === b.total_pages).length} livro(s)
                concluído(s)
              </strong>
            </p>
          </div>
          <div className="gentle-note">
            <Icon name="book" />
            <h3>O teu ritmo é suficiente.</h3>
            <p>
              Hoje podes ler só duas páginas. Deixa o telemóvel de lado quando puderes, encontra um
              sítio tranquilo e descobre uma ideia nova.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
