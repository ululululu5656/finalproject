/**
 * Seed the SQLite database.
 *
 *   pnpm db:seed    seed only when empty (no-op if data already exists)
 *   pnpm db:reset   wipe and re-seed everything (`--force`)
 */
import { getDb, seedDatabase, DB_PATH, SEED_CREDENTIALS } from '../lib/db';

const force = process.argv.includes('--force');

const db = getDb(); // creates the file, runs migrations, seeds if empty
seedDatabase(db, { force });

console.log(`\n  CafeFlow database ready → ${DB_PATH}`);
console.log(force ? '  (reset: all data wiped and re-seeded)\n' : '  (seeded if it was empty)\n');
console.log('  Test credentials:');
for (const c of SEED_CREDENTIALS) {
  console.log(`    ${c.role.padEnd(5)}  ${c.email}  /  ${c.password}`);
}
console.log('');
