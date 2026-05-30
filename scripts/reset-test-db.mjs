// Remove the e2e test database so each Playwright run starts from a fresh seed.
import fs from 'node:fs';
import path from 'node:path';

const base = path.join(process.cwd(), 'data', 'cafeflow-test.db');
for (const file of [base, `${base}-wal`, `${base}-shm`]) {
  try {
    fs.rmSync(file);
    console.log('removed', file);
  } catch {
    /* nothing to remove */
  }
}
