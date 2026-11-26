/**
 * Creates the local .env files from the examples, without overwriting anything
 * you have already filled in. Works the same on Windows, macOS and Linux.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const folder of ['server', 'client']) {
  const target = join(root, folder, '.env');
  if (existsSync(target)) {
    console.log(`${folder}/.env already exists, leaving it as it is.`);
  } else {
    copyFileSync(join(root, folder, '.env.example'), target);
    console.log(`Created ${folder}/.env`);
  }
}

console.log('\nNext: put your Supabase URL and keys in server/.env, then run "npm run check".');
