/**
 * Supabase clients.
 *
 * admin  - uses the SECRET key. Full database access, skips row level security.
 *          Used for all data work. Never sign a user in with this client, or
 *          its requests would start running as that user.
 * public - uses the publishable key. Used only to sign in and check tokens.
 *
 * The server keeps no login state: persistSession is off everywhere, and each
 * sign-in gets a fresh client so one user's session can never leak to another.
 */
import { createClient } from '@supabase/supabase-js';
import { env, missingEnv } from './env.js';
import { AppError } from '../utils/AppError.js';

const NO_SESSION = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

function build(key) {
  const missing = missingEnv();
  if (missing.length) {
    throw new AppError(
      500,
      `The server is not configured. Missing environment variables: ${missing.join(', ')}`,
      { expose: true },
    );
  }
  return createClient(env.supabaseUrl, key, NO_SESSION);
}

let adminClient;
let verifierClient;

/** Database and user administration (secret key). */
export function supabaseAdmin() {
  adminClient ??= build(env.supabaseServiceKey);
  return adminClient;
}

/** Token verification (publishable key). */
export function supabasePublic() {
  verifierClient ??= build(env.supabaseAnonKey);
  return verifierClient;
}

/** A throwaway client for signing in or refreshing one user's session. */
export function supabaseSignInClient() {
  return build(env.supabaseAnonKey);
}
