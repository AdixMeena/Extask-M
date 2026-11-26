import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { unwrap } from '../utils/dbErrors.js';
import { OWN_PROFILE_COLUMNS, PUBLIC_PROFILE_COLUMNS } from '../utils/serializers.js';

async function findProfile(id, columns) {
  const { data } = unwrap(
    await supabaseAdmin().from('profiles').select(columns).eq('id', id).maybeSingle(),
  );
  if (!data) throw new AppError(404, 'This user does not exist.');
  return data;
}

export const getOwnProfile = (userId) => findProfile(userId, OWN_PROFILE_COLUMNS);

export const getPublicProfile = (userId) => findProfile(userId, PUBLIC_PROFILE_COLUMNS);

export async function updateProfile(userId, { name, bio, location, idDetails }) {
  const current = await getOwnProfile(userId);
  const changes = { name, bio, location, id_details: idDetails };

  // The badge vouches for specific ID details. New details need a new check.
  if (idDetails !== current.id_details) changes.id_verified = false;

  const { data } = unwrap(
    await supabaseAdmin()
      .from('profiles')
      .update(changes)
      .eq('id', userId)
      .select(OWN_PROFILE_COLUMNS)
      .single(),
  );
  return data;
}
