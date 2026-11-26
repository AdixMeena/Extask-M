import { useState } from 'react';

/**
 * For actions that cannot be undone: the first click asks, the second does it.
 */
export default function ConfirmButton({
  children,
  question,
  confirmLabel,
  onConfirm,
  className = 'btn',
}) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!asking) {
    return (
      <button type="button" className={className} onClick={() => setAsking(true)}>
        {children}
      </button>
    );
  }

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setAsking(false);
    }
  };

  return (
    <div className="confirm" role="group" aria-label={question}>
      <p>{question}</p>
      <div className="row">
        <button
          type="button"
          className="btn btn--small"
          onClick={confirm}
          disabled={busy}
          autoFocus
        >
          {busy ? 'Please wait' : confirmLabel}
        </button>
        <button
          type="button"
          className="btn btn--small btn--plain"
          onClick={() => setAsking(false)}
          disabled={busy}
        >
          Go back
        </button>
      </div>
    </div>
  );
}
