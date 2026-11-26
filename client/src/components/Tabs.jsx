/** A row of filter buttons with counts. */
export default function Tabs({ label, options, value, onChange, count }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {options.map(([key, text]) => (
        <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)}>
          {text} <span>{count(key)}</span>
        </button>
      ))}
    </div>
  );
}
