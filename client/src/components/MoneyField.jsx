import FormField from './FormField.jsx';

/**
 * A rupee input. It is a text box on purpose: a type="number" box changes its
 * value when you scroll over it, which silently alters prices.
 */
export default function MoneyField({ onChange, ...props }) {
  const keepDigits = (event) => {
    event.target.value = event.target.value.replace(/[^\d.]/g, '');
    onChange(event);
  };

  return (
    <FormField
      {...props}
      type="text"
      inputMode="decimal"
      prefix="₹"
      maxLength={11}
      onChange={keepDigits}
    />
  );
}
