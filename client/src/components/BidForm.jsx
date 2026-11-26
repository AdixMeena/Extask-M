import { placeBid } from '../api/bids.js';
import { useForm } from '../hooks/useForm.js';
import { useToast } from '../hooks/useToast.js';
import { rupees } from '../lib/format.js';
import FormError from './FormError.jsx';
import FormField from './FormField.jsx';
import MoneyField from './MoneyField.jsx';

/** Send a new bid, or change your own while it is still waiting. */
export default function BidForm({ task, myBid, onSaved }) {
  const toast = useToast();
  const form = useForm({
    amount: myBid?.amount ?? '',
    message: myBid?.message ?? '',
    availability: myBid?.availability ?? '',
  });

  const submit = form.handleSubmit(async (values) => {
    const { created } = await placeBid(task.id, values);
    toast(created ? 'Bid sent' : 'Bid updated');
    await onSaved();
  });

  return (
    <form className="note stack" onSubmit={submit} noValidate>
      <div>
        <h2>{myBid ? 'Your bid' : 'Bid on this task'}</h2>
        <p className="muted">
          {myBid
            ? `You offered ${rupees(myBid.amount)}. You can change it until someone is hired.`
            : `The poster's budget is ${rupees(task.budget)}. Name your own price.`}
        </p>
      </div>
      <MoneyField label="Your price" required {...form.field('amount')} />
      <FormField
        label="When can you do it?"
        optional
        maxLength={120}
        placeholder="Saturday after 4 pm"
        {...form.field('availability')}
      />
      <FormField
        as="textarea"
        label="Message to the poster"
        optional
        rows={3}
        maxLength={500}
        placeholder="I have done this before and will bring my own tools."
        {...form.field('message')}
      />
      <FormError>{form.message}</FormError>
      <button type="submit" className="btn btn--primary" disabled={form.busy}>
        {form.busy ? 'Sending' : myBid ? 'Update bid' : 'Send bid'}
      </button>
    </form>
  );
}
