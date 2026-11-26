import { useIsPresent } from 'framer-motion';
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import FormError from '../components/FormError.jsx';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useForm } from '../hooks/useForm.js';

export default function Register() {
  useDocumentTitle('Create your account');
  const { user, register } = useAuth();
  const location = useLocation();
  const present = useIsPresent();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({ name: '', username: '', email: '', phone: '', password: '' });

  // Also runs right after a successful sign-up.
  // (A page that is animating away must not redirect anyone.)
  if (user && present) return <Navigate to={location.state?.from?.pathname ?? '/tasks'} replace />;

  return (
    <AuthLayout title="Join ExTask">
      <form className="note stack" onSubmit={form.handleSubmit(register)} noValidate>
        <FormField label="Full name" autoComplete="name" required {...form.field('name')} />
        <FormField
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          required
          hint="3 to 20 letters, numbers or underscores. Starts with a letter."
          {...form.field('username')}
        />
        <p className="muted small">Add an email, a phone number, or both.</p>
        <FormField label="Email" type="email" autoComplete="email" {...form.field('email')} />
        <FormField
          label="Mobile number"
          type="tel"
          autoComplete="tel"
          prefix="+91"
          hint="No OTP. Shared only with people you hire or who hire you."
          {...form.field('phone')}
        />
        <FormField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          hint="At least 8 characters."
          {...form.field('password')}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Show password
        </label>
        <FormError>{form.message}</FormError>
        <button type="submit" className="btn btn--primary" disabled={form.busy}>
          {form.busy ? 'Creating account' : 'Create account'}
        </button>
        <p>
          Already a member?{' '}
          <Link to="/login" state={location.state}>
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
