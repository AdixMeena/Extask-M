import { updateMyProfile } from '../api/users.js';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import { useToast } from '../hooks/useToast.js';
import FormError from './FormError.jsx';
import FormField from './FormField.jsx';

/** Edit your own details and submit ID details for the verified badge. */
export default function ProfileForm({ onSaved }) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const form = useForm({
    name: user.name,
    location: user.location ?? '',
    bio: user.bio ?? '',
    idDetails: user.id_details ?? '',
  });

  const submit = form.handleSubmit(async (values) => {
    const { user: updated } = await updateMyProfile(values);
    setUser(updated);
    toast('Profile saved');
    onSaved();
  });

  let verification = 'Add ID details to ask for a verified badge. We check them by hand.';
  if (user.id_verified) {
    verification = 'You are verified. Changing these details removes the badge until rechecked.';
  } else if (user.id_details) {
    verification = 'Submitted. Your badge appears once the details are checked.';
  }

  return (
    <form className="note stack" onSubmit={submit} noValidate>
      <div>
        <h2>Edit your profile</h2>
        <p className="muted small">
          Logs in as @{user.username}
          {user.email && `, ${user.email}`}
          {user.phone && `, +91 ${user.phone}`}. Only people you hire, or who hire you, see your
          email and phone.
        </p>
      </div>
      <FormField label="Full name" required maxLength={60} {...form.field('name')} />
      <FormField label="Location" optional maxLength={80} {...form.field('location')} />
      <FormField
        as="textarea"
        label="About you"
        optional
        rows={3}
        maxLength={400}
        placeholder="What can you do? Since when?"
        {...form.field('bio')}
      />
      <FormField
        label="ID details"
        optional
        maxLength={120}
        placeholder="College ID, enrolment number ending 1008"
        hint={`${verification} Never type a full Aadhaar or PAN number.`}
        {...form.field('idDetails')}
      />
      <FormError>{form.message}</FormError>
      <button type="submit" className="btn btn--primary" disabled={form.busy}>
        {form.busy ? 'Saving' : 'Save profile'}
      </button>
    </form>
  );
}
