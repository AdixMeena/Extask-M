import { CATEGORY_SUGGESTIONS } from '../lib/constants.js';

/** Suggestions for a category input; use with list={id}. */
export default function CategoryOptions({ id }) {
  return (
    <datalist id={id}>
      {CATEGORY_SUGGESTIONS.map((name) => (
        <option key={name} value={name} />
      ))}
    </datalist>
  );
}
