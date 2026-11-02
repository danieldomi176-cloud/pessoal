'use client';
import { useEffect, useState } from 'react';
export function Timer({ startedAt, planned = 0 }: { startedAt: string; planned?: number }) {
  const start = new Date(startedAt).getTime();
  const [now, setNow] = useState(start);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const elapsed = Math.max(0, Math.floor((now - start) / 1000));
  const seconds = planned ? Math.max(0, planned - elapsed) : elapsed;
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return (
    <div className="timer-block">
      <div className="timer-orbit">
        <div className="timer-inner">
          <span className="timer-label">
            {planned
              ? elapsed >= planned
                ? 'HORA DE UMA PAUSA'
                : 'UM PASSO DE CADA VEZ'
              : 'TEMPO DE LEITURA'}
          </span>
          <span
            className="timer-digits"
            role="timer"
            aria-label={planned ? 'Tempo restante' : 'Tempo decorrido'}
          >
            {String(minutes).padStart(2, '0')}
            <span>:</span>
            {String(sec).padStart(2, '0')}
          </span>
          <span className="muted">
            {planned
              ? 'Respira. Concentra-te no próximo passo.'
              : 'Uma página abre novas possibilidades.'}
          </span>
        </div>
      </div>
      {planned > 0 && elapsed >= planned && (
        <p role="status" className="success">
          Bloco terminado. Guarda a sessão e faz uma pausa.
        </p>
      )}
    </div>
  );
}
