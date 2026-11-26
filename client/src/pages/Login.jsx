import { useIsPresent } from 'framer-motion';
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import FormError from '../components/FormError.jsx';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useForm } from '../hooks/useForm.js';

export default function Login() {
  useDocumentTitle('Log in');
  const { user, login } = useAuth();
  const location = useLocation();
  const present = useIsPresent();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({ identifier: '', password: '' });

  // Send people back to the page that asked them to log in.
  // (A page that is animating away must not redirect anyone.)
  if (user && present) return <Navigate to={location.state?.from?.pathname ?? '/tasks'} replace />;

  return (
    <AuthLayout title="Welcome back">
      <form className="note stack" onSubmit={form.handleSubmit(login)} noValidate>
        <FormField
          label="Username, email or phone"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          required
          {...form.field('identifier')}
        />
        <FormField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
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
          {form.busy ? 'Logging in' : 'Log in'}
        </button>
        <p>
          New here?{' '}
          <Link to="/register" state={location.state}>
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
