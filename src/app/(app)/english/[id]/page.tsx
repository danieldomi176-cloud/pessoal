import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lessons, CURRICULUM_VERSION } from '@/lib/curriculum';
import { loadWorkspace } from '@/lib/data';
import { PageHeading, Card } from '@/components/ui';
import { ActionForm } from '@/components/form';
import { Speak } from '@/components/interactive';
import { Icon } from '@/components/icon';
export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) notFound();
  const d = await loadWorkspace();
  const attempts = d.attempts.filter(
    (a) => a.lesson_id === id && a.curriculum_version === CURRICULUM_VERSION,
  );
  return (
    <>
      <div className="lesson-topline">
        <Link href="/english" className="text-link">
          ← Todas as aulas
        </Link>
        <span className="pill purple">
          A0 · {lesson.minutes} MIN · {attempts.length} TENTATIVA(S)
        </span>
      </div>
      <PageHeading
        eyebrow={`ENGLISHOS · ${lesson.subtitle}`}
        title={lesson.title}
        text="Lê. Experimenta. Repete. Não há problema em errar."
      />
      <div className="two-columns">
        <div className="stack">
          <Card title="Vamos descobrir" icon="languages">
            <p className="lesson-explanation">{lesson.explanation}</p>
            <div className="examples">
              {lesson.examples.map((e) => (
                <div className="example" key={e.en}>
                  <div>
                    <strong lang="en">{e.en}</strong>
                    <p>{e.pt}</p>
                  </div>
                  <Speak text={e.en} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Agora é a tua vez" icon="graduation">
            <p className="card-subtitle">
              A correção inclui uma explicação. Podes rever os erros e tentar novamente.
            </p>
            <ActionForm action="lesson.submit" className="stack">
              <input type="hidden" name="lesson_id" value={lesson.id} />
              {lesson.exercises.map((e, i) => (
                <fieldset key={e.id} className="exercise">
                  <legend>
                    {i + 1}. {e.prompt}
                  </legend>
                  {e.type === 'choice' ? (
                    e.choices!.map((choice) => (
                      <label key={choice} className="radio-choice">
                        <input type="radio" name={e.id} value={choice} required />
                        {choice}
                      </label>
                    ))
                  ) : (
                    <label>
                      <span className="sr-only">Resposta ao exercício {i + 1}</span>
                      <input
                        name={e.id}
                        autoComplete="off"
                        required
                        maxLength={200}
                        placeholder={
                          e.type === 'order'
                            ? 'Escreve as palavras na ordem certa'
                            : 'Escreve a tua resposta'
                        }
                      />
                    </label>
                  )}
                </fieldset>
              ))}
              <button className="button primary">
                <Icon name="check" size={18} />
                Corrigir e guardar a minha tentativa
              </button>
            </ActionForm>
          </Card>
        </div>
        <aside className="stack">
          <Card title="Novas palavras" icon="book">
            {lesson.words.map((w) => (
              <div className="word-row" key={w.id}>
                <div>
                  <strong lang="en">{w.en}</strong>
                  <p>{w.pt}</p>
                  <small>{w.ipa}</small>
                </div>
                <Speak text={w.en} />
              </div>
            ))}
            <p className="policy-note" style={{ marginTop: 15 }}>
              Os símbolos entre barras são uma transcrição fonética (IPA). O áudio é opcional; podes
              aprender com os exemplos e as traduções.
            </p>
          </Card>
          <div className="gentle-note">
            <Icon name="target" />
            <h3>Leva o inglês para o teu dia.</h3>
            <p>{lesson.challenge}</p>
          </div>
          <p className="policy-note">
            Conteúdo original LifeOS · currículo {CURRICULUM_VERSION}. As respostas são verificadas
            no servidor e a tentativa fica no teu histórico privado.
          </p>
        </aside>
      </div>
    </>
  );
}
