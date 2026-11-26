/** The message above a form's submit button when saving fails. */
export default function FormError({ children }) {
  if (!children) return null;
  return (
    <p className="form-error" role="alert">
      {children}
    </p>
  );
}
