'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './icon';
import { interpret, type Intent } from '@/lib/lifeai';
import { blockers } from '@/lib/domain';
export function FocusGuidance() {
  const [blocker, setBlocker] = useState('');
  return (
    <>
      <label>
        O que está a dificultar o primeiro passo?
        <select name="blocker" value={blocker} onChange={(e) => setBlocker(e.target.value)}>
          <option value="">Estou pronto para começar</option>
          {Object.keys(blockers).map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </label>
      {blocker && (
        <div className="gentle-note">
          <strong>{blockers[blocker].advice}</strong>
          <p>Primeiro passo sugerido: {blockers[blocker].step}</p>
        </div>
      )}
    </>
  );
}
export function Speak({ text }: { text: string }) {
  const [message, setMessage] = useState('');
  function speak() {
    if (!('speechSynthesis' in window)) {
      setMessage('Áudio indisponível neste navegador. Usa a transcrição e a tradução.');
      return;
    }
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
    if (!voices.length) {
      setMessage('Não há voz inglesa disponível neste dispositivo. Usa a transcrição escrita.');
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.voice = voices.find((v) => v.lang === 'en-GB') ?? voices[0];
    u.rate = 0.8;
    u.onerror = () =>
      setMessage('Não foi possível reproduzir. A alternativa escrita continua disponível.');
    window.speechSynthesis.speak(u);
    setMessage('');
  }
  return (
    <span className="speech">
      <button type="button" onClick={speak} className="icon-button" aria-label={`Ouvir ${text}`}>
        <Icon name="volume" size={18} />
      </button>
      {message && <small role="status">{message}</small>}
    </span>
  );
}
export function CardOrder({ current }: { current: string[] }) {
  const labels: Record<string, string> = {
    focus: 'Foco',
    english: 'Inglês',
    reading: 'Leitura',
    habits: 'Hábitos',
  };
  const [order, setOrder] = useState([
    ...current,
    ...Object.keys(labels).filter((k) => !current.includes(k)),
  ]);
  return (
    <div className="stack">
      <input type="hidden" name="card_order" value={order.join(',')} />
      {order.map((key, i) => (
        <div className="order-row" key={key}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="cards"
              value={key}
              defaultChecked={current.includes(key)}
            />
            {labels[key]}
          </label>
          <div>
            <button
              type="button"
              className="icon-button"
              aria-label={`Mover ${labels[key]} para cima`}
              disabled={i === 0}
              onClick={() => {
                const n = [...order];
                [n[i - 1], n[i]] = [n[i], n[i - 1]];
                setOrder(n);
              }}
            >
              ↑
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Mover ${labels[key]} para baixo`}
              disabled={i === order.length - 1}
              onClick={() => {
                const n = [...order];
                [n[i], n[i + 1]] = [n[i + 1], n[i]];
                setOrder(n);
              }}
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
export function LifeAI({
  pending,
  habits,
  finished,
}: {
  pending: number;
  habits: number;
  finished: number;
}) {
  const [command, setCommand] = useState('');
  const [answer, setAnswer] = useState<Intent | null>(null);
  const send = (s: string) => {
    setCommand(s);
    setAnswer(interpret(s, { pending, habits, finished }));
  };
  return (
    <div className="ai-space">
      <div className="ai-orb">
        <Icon name="sparkles" size={42} />
      </div>
      <span className="pill purple">LIFEAI · MOTOR DE REGRAS</span>
      <h2>
        Um próximo passo.
        <br />
        <span className="muted">Quando precisares.</span>
      </h2>
      <p className="muted">
        Ajudo-te a encontrar as ferramentas certas e a consultar os teus registos.
        <br />
        Sem modelos generativos. Sem enviar o teu diário a uma API de IA.
      </p>
      <div className="ai-suggestions">
        {[
          'Organiza o meu dia',
          'Quero aprender inglês',
          'Estou a procrastinar',
          'Mostra o meu progresso',
        ].map((s) => (
          <button key={s} onClick={() => send(s)}>
            {s}
            <Icon name="arrow" size={16} />
          </button>
        ))}
      </div>
      <form
        className="ai-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(command);
        }}
      >
        <Icon name="sparkles" />
        <input
          aria-label="Comando para o LifeAI"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="De que precisas para dar o próximo passo?"
          required
          maxLength={300}
        />
        <button className="button primary" aria-label="Enviar comando">
          <Icon name="arrow" />
        </button>
      </form>
      {answer && (
        <div className="ai-response" role="status">
          <span className="icon-tile sparkles">
            <Icon name="sparkles" />
          </span>
          <div>
            <p>{answer.text}</p>
            {answer.href && (
              <Link href={answer.href} className="text-link">
                {answer.label}
                <Icon name="arrow" size={16} />
              </Link>
            )}
          </div>
        </div>
      )}
      <small className="muted">Esta versão não cria nem altera registos através de comandos.</small>
    </div>
  );
}
