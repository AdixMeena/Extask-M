import { createReview } from '../api/users.js';
import { useForm } from '../hooks/useForm.js';
import { useToast } from '../hooks/useToast.js';
import FormError from './FormError.jsx';
import FormField from './FormField.jsx';
import { StarPicker } from './RatingStars.jsx';

/** Rate the other person once the task is done. */
export default function ReviewForm({ taskId, personName, onSaved }) {
  const toast = useToast();
  const form = useForm({ rating: 0, comment: '' });

  const submit = form.handleSubmit(async (values) => {
    await createReview(taskId, values);
    toast('Rating saved');
    await onSaved();
  });

  return (
    <form className="note stack" onSubmit={submit} noValidate>
      <h2>Rate {personName}</h2>
      <StarPicker
        value={form.values.rating}
        onChange={(rating) => form.setValue('rating', rating)}
        error={form.errors.rating}
      />
      <FormField
        as="textarea"
        label="Comment"
        optional
        rows={3}
        maxLength={500}
        placeholder="What went well? What could be better?"
        {...form.field('comment')}
      />
      <FormError>{form.message}</FormError>
      <button type="submit" className="btn btn--primary" disabled={form.busy}>
        {form.busy ? 'Saving' : 'Save rating'}
      </button>
    </form>
  );
}
