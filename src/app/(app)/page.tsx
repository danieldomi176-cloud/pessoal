import Link from 'next/link';
import { loadWorkspace } from '@/lib/data';
import { dateLabel, greeting, localDate } from '@/lib/domain';
import { lessons, CURRICULUM_VERSION } from '@/lib/curriculum';
import { Icon } from '@/components/icon';
import { Card, Empty, Progress } from '@/components/ui';
import { TaskRow } from '@/components/tasks';
import { ActionForm } from '@/components/form';
export default async function Dashboard() {
  const d = await loadWorkspace();
  const today = localDate();
  const open = d.tasks
    .filter((t) => !t.completed_at && t.due_date <= today)
    .sort((a, b) => b.priority - a.priority || a.due_date.localeCompare(b.due_date));
  const completed = d.tasks.filter(
    (t) => t.completed_at && localDate(new Date(t.completed_at)) === today,
  ).length;
  const habitsDone = d.entries.filter((e) => e.entry_date === today).length;
  const focusMinutes = Math.floor(
    d.focus
      .filter((f) => f.ended_at && localDate(new Date(f.started_at)) === today)
      .reduce((s, f) => s + f.elapsed_seconds, 0) / 60,
  );
  const pages = d.reading
    .filter((r) => r.ended_at && localDate(new Date(r.started_at)) === today)
    .reduce((s, r) => s + r.pages_read, 0);
  const total = open.length + completed + d.habits.length;
  const done = completed + habitsDone;
  const percentage = total ? Math.round((done / total) * 100) : 0;
  const passed = new Set(
    d.attempts
      .filter(
        (a) =>
          a.correct === a.total &&
          a.curriculum_version === CURRICULUM_VERSION &&
          lessons.some((l) => l.id === a.lesson_id),
      )
      .map((a) => a.lesson_id),
  );
  const next = lessons.find((l) => !passed.has(l.id)) ?? lessons[0];
  const book =
    d.books.find((b) => b.id === d.profile.current_book_id) ??
    d.books.find((b) => b.current_page < b.total_pages);
  const quickCards: Record<string, React.ReactNode> = {
    focus: (
      <Link href="/focus" className="journey-card focus-card">
        <span className="icon-tile focus">
          <Icon name="focus" />
        </span>
        <span className="mini-tag">FOCUSOS</span>
        <h3>
          Menos adiar.
          <br />
          Mais começar.
        </h3>
        <p>Uma pequena ação. Cinco minutos.</p>
        <span className="journey-link">
          Entrar em foco <Icon name="arrow" size={16} />
        </span>
        <span className="card-orbit" aria-hidden="true" />
      </Link>
    ),
    english: (
      <Link href="/english" className="journey-card">
        <span className="icon-tile languages">
          <Icon name="languages" />
        </span>
        <span className="mini-tag">ENGLISHOS</span>
        <h3>{next.title}</h3>
        <p>A0 · {next.minutes} min · Ao teu ritmo</p>
        <Progress value={(passed.size / lessons.length) * 100} label="Aulas iniciais concluídas" />
        <span className="journey-link">
          {passed.size ? 'Continuar a aprender' : 'Começar do zero'} <Icon name="arrow" size={16} />
        </span>
      </Link>
    ),
    reading: (
      <Link href="/reading" className="journey-card">
        <span className="icon-tile book">
          <Icon name="book" />
        </span>
        <span className="mini-tag">READOS</span>
        <h3>{book?.title ?? 'A tua próxima boa leitura.'}</h3>
        <p>
          {book
            ? `${book.current_page} de ${book.total_pages} páginas`
            : 'Adiciona o livro que queres descobrir.'}
        </p>
        {book && (
          <Progress
            value={(book.current_page / book.total_pages) * 100}
            label="Progresso do livro"
          />
        )}
        <span className="journey-link">
          {book ? 'Reservar tempo para ler' : 'Abrir a biblioteca'} <Icon name="arrow" size={16} />
        </span>
      </Link>
    ),
    habits: (
      <Link href="/today#habits" className="journey-card">
        <span className="icon-tile leaf">
          <Icon name="leaf" />
        </span>
        <span className="mini-tag">DISCIPLINEOS</span>
        <h3>
          O que repetes
          <br />
          torna-se parte de ti.
        </h3>
        <p>
          {d.habits.length
            ? `${habitsDone} de ${d.habits.length} hábitos registados hoje`
            : 'Escolhe um hábito que faça sentido para ti.'}
        </p>
        <span className="journey-link">
          Cuidar da minha rotina <Icon name="arrow" size={16} />
        </span>
      </Link>
    ),
  };
  return (
    <>
      <div className="dashboard-greeting">
        <div>
          <p className="eyebrow">
            <span className="tiny-line" /> {dateLabel()}
          </p>
          <h1>
            {greeting()}
            {d.profile.display_name ? `, ${d.profile.display_name}` : ''}{' '}
            <span className="greeting-sun">
              <Icon name="sun" size={29} />
            </span>
          </h1>
          <p className="muted">Um novo momento para cuidar de quem estás a tornar-te.</p>
        </div>
        <Link href="/today#new-task" className="button secondary">
          <Icon name="plus" size={17} />
          Nova tarefa
        </Link>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="hero-card">
            <div className="hero-copy">
              <span className="hero-badge">
                <span className="status-dot" />A TUA JORNADA IMPORTA
              </span>
              <h2>
                Pequenos passos.
                <br />
                <em>Uma vida com propósito.</em>
              </h2>
              <p>
                Não precisas de mudar tudo hoje.
                <br />
                Só de fazer espaço para o que realmente importa.
              </p>
              <Link href="/today" className="button light">
                Vamos cuidar do teu dia <Icon name="arrow" size={17} />
              </Link>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="orbit orbit-three" />
              <div className="hero-planet">
                <Icon name="sprout" size={63} />
              </div>
              <span className="orbit-star star-one">✦</span>
              <span className="orbit-star star-two">✧</span>
              <span className="orbit-dot" />
            </div>
            <div className="hero-stats">
              <div>
                <span className="stat-icon">
                  <Icon name="checks" size={18} />
                </span>
                <strong>{completed}</strong>
                <span>tarefas concluídas</span>
              </div>
              <div>
                <span className="stat-icon">
                  <Icon name="focus" size={18} />
                </span>
                <strong>
                  {focusMinutes}
                  <small> min</small>
                </strong>
                <span>de foco hoje</span>
              </div>
              <div>
                <span className="stat-icon">
                  <Icon name="book" size={18} />
                </span>
                <strong>{pages}</strong>
                <span>páginas lidas hoje</span>
              </div>
            </div>
          </section>
          <Card
            title="O que importa hoje"
            icon="target"
            action={
              <Link className="subtle-link" href="/today">
                Ver o meu dia <Icon name="arrow" size={15} />
              </Link>
            }
          >
            <p className="card-subtitle">Até três prioridades. Espaço para o resto da vida.</p>
            {open.length ? (
              <div className="task-list">
                {open.slice(0, 3).map((t) => (
                  <TaskRow key={t.id} task={t} compact />
                ))}
              </div>
            ) : (
              <Empty
                icon="check"
                title="Um dia com espaço para o essencial"
                text="Escolhe a primeira pequena ação. As tuas prioridades aparecem aqui."
                href="/today#new-task"
                label="Definir a minha primeira prioridade"
              />
            )}
            <div className="card-bottom-note">
              <Icon name="leaf" size={15} />
              {open.length > 3
                ? `${open.length - 3} outras tarefas estão em Hoje. Uma de cada vez.`
                : 'O descanso também merece um lugar no teu dia.'}
            </div>
          </Card>
          <div className="section-title">
            <div>
              <h2>Continua a tua jornada</h2>
              <p className="muted">Cuida das pequenas coisas que fazem a diferença.</p>
            </div>
            <Link href="/areas" className="subtle-link">
              Todas as áreas <Icon name="arrow" size={15} />
            </Link>
          </div>
          <div className="journey-grid">
            {d.profile.dashboard_cards.map(
              (c) => quickCards[c] && <div key={c}>{quickCards[c]}</div>,
            )}
          </div>
          <Link href="/lifeai" className="ai-banner">
            <span className="ai-mini-orb">
              <Icon name="sparkles" size={25} />
            </span>
            <span>
              <strong>Não sabes por onde começar?</strong>
              <small>O LifeAI ajuda-te a encontrar o próximo passo.</small>
            </span>
            <span className="ai-banner-cta">
              Vamos conversar <Icon name="arrow" size={16} />
            </span>
          </Link>
        </div>
        <aside className="dashboard-aside">
          <Card title="O teu ritmo, hoje" icon="activity" className="rhythm-card">
            <div className="rhythm-ring">
              <svg
                viewBox="0 0 160 160"
                role="img"
                aria-label={
                  total ? `${done} de ${total} ações registadas hoje` : 'Ainda sem ações planeadas'
                }
              >
                <circle cx="80" cy="80" r="64" className="ring-bg" />
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  className="ring-fill"
                  strokeDasharray={`${percentage * 4.02} 402`}
                  transform="rotate(-90 80 80)"
                />
                <circle cx="80" cy="80" r="53" className="ring-inner" />
              </svg>
              <div>
                <strong>{total ? `${percentage}%` : '—'}</strong>
                <span>do teu plano</span>
              </div>
            </div>
            <p>
              {total ? (
                <>
                  <strong>
                    {done} de {total}
                  </strong>{' '}
                  ações registadas
                </>
              ) : (
                'O primeiro passo pode ser pequeno.'
              )}
            </p>
            <div className="rhythm-legend">
              <span>
                <i />
                Tarefas <strong>{completed}</strong>
              </span>
              <span>
                <i />
                Hábitos <strong>{habitsDone}</strong>
              </span>
            </div>
            <small className="muted">Ações observáveis. Nunca uma medida do teu valor.</small>
          </Card>
          <Card
            title="Pequenos rituais"
            icon="leaf"
            action={
              <Link href="/today#habits" className="icon-button" aria-label="Gerir hábitos">
                <Icon name="plus" size={16} />
              </Link>
            }
          >
            {d.habits.length ? (
              <div className="ritual-list">
                {d.habits.slice(0, 4).map((h) => {
                  const checked = d.entries.some(
                    (e) => e.habit_id === h.id && e.entry_date === today,
                  );
                  return (
                    <ActionForm key={h.id} action="habit.toggle">
                      <input type="hidden" name="id" value={h.id} />
                      <input type="hidden" name="done" value={checked ? '0' : '1'} />
                      <button className={`ritual-button ${checked ? 'done' : ''}`}>
                        <span className="task-check">
                          {checked && <Icon name="check" size={14} />}
                        </span>
                        {h.title}
                      </button>
                    </ActionForm>
                  );
                })}
              </div>
            ) : (
              <Empty
                icon="leaf"
                title="Uma rotina que é tua"
                text="Adiciona um hábito de oração, leitura, descanso ou outra pequena ação."
                href="/today#habits"
                label="Criar um ritual"
              />
            )}
          </Card>
          {d.profile.spiritual_reflection && (
            <section className="reflection-card">
              <span className="reflection-icon">
                <Icon name="cross" size={19} />
              </span>
              <p className="mini-tag">UM MOMENTO DE PAZ</p>
              <h3>
                Respira. Agradece.
                <br />
                Recomeça.
              </h3>
              <p>
                Reserva um momento para Deus, para a gratidão e para aquilo que dá sentido ao teu
                dia.
              </p>
              <span className="reflection-note">Reflexão original · sem pontuações</span>
            </section>
          )}
          <div className="quiet-note">
            <Icon name="moon" size={19} />
            <p>
              Não tens de ser perfeito.
              <br />
              <strong>Só precisas de continuar a cuidar de ti.</strong>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
