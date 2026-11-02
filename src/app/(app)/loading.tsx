export default function Loading() {
  return (
    <div className="loading-space" role="status" aria-live="polite">
      <div className="skeleton heading" />
      <div className="skeleton hero" />
      <div className="dashboard-grid">
        <div className="skeleton tile" />
        <div className="skeleton tile" />
      </div>
      <span className="sr-only">A carregar o teu espaço…</span>
    </div>
  );
}
