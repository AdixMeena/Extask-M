/** Loading, empty and error states shared by all pages. */

export function Skeleton({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton ${className}`}>
      <span className="skeleton__title" />
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className="skeleton__line" />
      ))}
    </div>
  );
}

export function CardSkeletons({ count = 6 }) {
  return (
    <div className="board" role="status" aria-label="Loading tasks">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="skeleton--card" />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="stack" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} lines={2} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container section" role="status" aria-label="Loading page">
      <Skeleton lines={5} />
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="note note--center">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="note note--center note--error" role="alert">
      <h2>That did not work</h2>
      <p>{error.message}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
