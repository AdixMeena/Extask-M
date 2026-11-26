/**
 * Decides exactly which profile fields leave the server. Listing the columns
 * means a new private column is never exposed by accident.
 */

/** Safe for anyone to see. */
export const PUBLIC_PROFILE_COLUMNS =
  'id, name, username, bio, location, id_verified, rating_avg, rating_count, created_at';

/** The small version shown next to tasks, bids and reviews. */
export const PROFILE_SUMMARY_COLUMNS = 'id, name, username, id_verified, rating_avg, rating_count';

/** The signed-in user's own profile. auth_email stays internal. */
export const OWN_PROFILE_COLUMNS = `${PUBLIC_PROFILE_COLUMNS}, email, phone, id_details`;

/** Shared only between a poster and the doer they hired. */
export const CONTACT_COLUMNS = 'id, name, username, email, phone';
