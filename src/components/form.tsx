'use client';
import { useActionState, useEffect, useRef } from 'react';
import { authenticate, mutate } from '@/app/actions';
import type { ActionResult } from '@/lib/types';
const initial: ActionResult = { ok: false, message: '' };
export function ActionForm({
  action,
  children,
  className = '',
  reset = false,
  confirm,
}: {
  action: string;
  children: React.ReactNode;
  className?: string;
  reset?: boolean;
  confirm?: string;
}) {
  const [state, submit, pending] = useActionState(mutate.bind(null, action), initial);
  const ref = useRef<HTMLFormElement>(null);
  const allowReset = useRef(false);
  // React 19 repõe formulários não controlados após uma ação. Preservar respostas
  // e valores inválidos; limpar apenas formulários de criação que tiveram sucesso.
  useEffect(() => {
    if (state.ok && reset) {
      allowReset.current = true;
      ref.current?.reset();
      allowReset.current = false;
    }
  }, [state, reset]);
  return (
    <form
      ref={ref}
      action={submit}
      className={className}
      onReset={(e) => {
        if (!allowReset.current) e.preventDefault();
      }}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      <fieldset disabled={pending} className="form-fields">
        {children}
      </fieldset>
      {pending && (
        <p className="form-status" role="status">
          A guardar…
        </p>
      )}
      {state.message && (
        <div
          className={`form-status ${state.ok ? 'success' : 'failure'}`}
          role={state.ok ? 'status' : 'alert'}
        >
          {state.message}
        </div>
      )}
      {state.feedback && (
        <div className="feedback">
          {state.feedback.map((f, i) => (
            <div key={i} className={f.correct ? 'correct' : 'incorrect'}>
              <strong>
                {f.correct ? '✓ Correto' : 'Vamos rever'} · {f.prompt}
              </strong>
              <p>
                {!f.correct && <>Resposta: {f.answer}. </>}
                {f.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [state, action, pending] = useActionState(authenticate.bind(null, mode), initial);
  return (
    <form action={action} className="stack" onReset={(e) => e.preventDefault()}>
      <fieldset disabled={pending} className="form-fields stack">
        {mode === 'signup' && (
          <label>
            Como te chamas?
            <input
              name="name"
              autoComplete="given-name"
              maxLength={60}
              placeholder="O teu primeiro nome"
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@exemplo.com"
            maxLength={254}
          />
        </label>
        <label>
          Palavra-passe
          <input
            name="password"
            type="password"
            minLength={12}
            maxLength={128}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            placeholder="Pelo menos 12 caracteres"
          />
        </label>
        <button className="button primary full" disabled={pending}>
          {pending
            ? 'A preparar o teu espaço…'
            : mode === 'signup'
              ? 'Criar o meu espaço'
              : 'Entrar no meu espaço'}{' '}
          <span aria-hidden="true">→</span>
        </button>
      </fieldset>
      {state.message && (
        <p
          role={state.ok ? 'status' : 'alert'}
          className={`form-status ${state.ok ? 'success' : 'failure'}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
