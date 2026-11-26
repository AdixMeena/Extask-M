import { useId } from 'react';

/**
 * A labelled input with a hint and an error message.
 * Use as="textarea" or as="select" for other controls.
 */
export default function FormField({
  label,
  hint,
  error,
  optional = false,
  prefix,
  as: Control = 'input',
  children,
  ...props
}) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error || hint;

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      <div className="field__control">
        {prefix && <span className="field__prefix">{prefix}</span>}
        <Control
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          {...props}
        >
          {children}
        </Control>
      </div>
      {note && (
        <p id={noteId} className="field__note">
          {note}
        </p>
      )}
    </div>
  );
}
