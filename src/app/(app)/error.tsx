'use client';
import { Icon } from '@/components/icon';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state error-page">
      <span className="empty-icon">
        <Icon name="leaf" size={30} />
      </span>
      <h1>Vamos tentar de novo.</h1>
      <p>
        Não foi possível carregar este espaço. Confirma a ligação e se as migrações da base de dados
        foram aplicadas.
      </p>
      <button onClick={reset} className="button primary">
        Tentar novamente
      </button>
    </div>
  );
}
