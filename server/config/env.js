/**
 * Reads and checks environment variables in one place, so the rest of the code
 * never touches process.env and a missing key fails with a clear message.
 */
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Resolve .env relative to this file so scripts work from any folder.
// On Vercel there is no .env file: variables come from the project settings.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5050,
  supabaseUrl: process.env.SUPABASE_URL?.trim(),
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY?.trim(),
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean),
};

/** Names of required variables that are empty or still hold the example text. */
export function missingEnv() {
  return REQUIRED.filter((name) => {
    const value = process.env[name]?.trim();
    return !value || value.includes('your-');
  });
}
