/**
 * Reads "Authorization: Bearer <token>", asks Supabase whether the token is
 * genuine, and attaches the user id to the request.
 */
import { supabasePublic } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

function readToken(req) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

async function verify(token) {
  const { data, error } = await supabasePublic().auth.getUser(token);
  if (error || !data?.user) {
    // A problem reaching Supabase must not log people out, so it is not a 401.
    if (error && (!error.status || error.status >= 500)) {
      throw new AppError(503, 'Sign-in service is unavailable. Try again shortly.', {
        expose: true,
      });
    }
    throw new AppError(401, 'Your session has ended. Please log in again.');
  }
  return data.user.id;
}

/** For routes that need a logged-in user. */
export async function requireAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) throw new AppError(401, 'Please log in to continue.');
  req.userId = await verify(token);
  req.token = token;
  next();
}

/**
 * For public routes that show extra detail to a logged-in user. No token is
 * fine; a bad or expired token is still a 401 so the app can refresh it.
 */
export async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) req.userId = await verify(token);
  next();
}
