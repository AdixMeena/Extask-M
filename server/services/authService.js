/**
 * Register, log in, refresh and log out.
 *
 * Supabase Auth signs people in with an email. ExTask lets them use a username,
 * email or phone, so we look up the profile first and then sign in with the
 * email stored in auth_email (generated for phone-only accounts).
 */
import { supabaseAdmin, supabaseSignInClient } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { unwrap } from '../utils/dbErrors.js';
import { parseIdentifier, phoneToAuthEmail } from '../utils/identifiers.js';
import { OWN_PROFILE_COLUMNS } from '../utils/serializers.js';
import { getOwnProfile } from './userService.js';

const TAKEN = {
  username: 'That username is taken.',
  email: 'An account with that email already exists.',
  phone: 'An account with that phone number already exists.',
};

const WRONG_LOGIN = 'Wrong username, email, phone or password.';

/** Reports every clash at once, so the form can mark all the problem fields. */
async function assertNotTaken(values) {
  const checks = Object.keys(TAKEN)
    .filter((column) => values[column])
    .map(async (column) => {
      const { data } = unwrap(
        await supabaseAdmin().from('profiles').select('id').eq(column, values[column]).limit(1),
      );
      return data.length ? { field: column, message: TAKEN[column] } : null;
    });

  const details = (await Promise.all(checks)).filter(Boolean);
  if (details.length) throw new AppError(409, details[0].message, { details });
}

function toSession(session, user) {
  return { accessToken: session.access_token, refreshToken: session.refresh_token, user };
}

/** Turns a Supabase Auth failure into the right HTTP error. */
function authFailure(error, fallbackStatus, fallbackMessage) {
  if (error.status === 429) {
    return new AppError(429, 'Too many attempts. Wait a few minutes and try again.');
  }
  if (!error.status || error.status >= 500) {
    return new AppError(503, 'Sign-in service is unavailable. Try again shortly.', {
      expose: true,
    });
  }
  return new AppError(fallbackStatus, fallbackMessage);
}

async function signIn(authEmail, password) {
  const { data, error } = await supabaseSignInClient().auth.signInWithPassword({
    email: authEmail,
    password,
  });
  if (error) throw authFailure(error, 401, WRONG_LOGIN);
  return data.session;
}

export async function register({ name, username, email, phone, password }) {
  await assertNotTaken({ username, email, phone });

  const admin = supabaseAdmin();
  const authEmail = email ?? phoneToAuthEmail(phone);

  // email_confirm: true means no confirmation mail is needed.
  const { data, error } = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
  });
  if (error) {
    if (error.code === 'email_exists') throw new AppError(409, TAKEN[email ? 'email' : 'phone']);
    if (error.code === 'weak_password') throw new AppError(400, error.message);
    throw authFailure(error, 400, 'Could not create the account. Check your details.');
  }

  const userId = data.user.id;
  const inserted = await admin
    .from('profiles')
    .insert({
      id: userId,
      name,
      username,
      email: email ?? null,
      phone: phone ?? null,
      auth_email: authEmail,
    })
    .select(OWN_PROFILE_COLUMNS)
    .single();

  if (inserted.error) {
    // Do not leave a sign-in account without a profile behind.
    await admin.auth.admin.deleteUser(userId);
    if (inserted.error.code === '23505') {
      throw new AppError(409, 'That username, email or phone was just taken.');
    }
    unwrap(inserted);
  }

  return toSession(await signIn(authEmail, password), inserted.data);
}

export async function login({ identifier, password }) {
  const { column, value } = parseIdentifier(identifier);

  const { data: profile } = unwrap(
    await supabaseAdmin().from('profiles').select('id, auth_email').eq(column, value).maybeSingle(),
  );
  // Same message as a wrong password, so nobody can probe which accounts exist.
  if (!profile) throw new AppError(401, WRONG_LOGIN);

  const session = await signIn(profile.auth_email, password);
  return toSession(session, await getOwnProfile(profile.id));
}

export async function refresh(refreshToken) {
  const { data, error } = await supabaseSignInClient().auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error || !data.session) {
    throw authFailure(
      error ?? { status: 401 },
      401,
      'Your session has ended. Please log in again.',
    );
  }
  return toSession(data.session, await getOwnProfile(data.session.user.id));
}

/** Revokes this device's refresh token. Other devices stay logged in. */
export async function logout(accessToken) {
  const { error } = await supabaseAdmin().auth.admin.signOut(accessToken, 'local');
  if (error) console.warn('Logout could not revoke the session:', error.message);
}
