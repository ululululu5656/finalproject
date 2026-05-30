import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * The suite runs serially (workers: 1) because every test shares one SQLite
 * database. The web server is launched against a dedicated test database that
 * is wiped and re-seeded before it boots, so runs are deterministic.
 * Video is recorded for every test — demo.spec.ts is the full app walkthrough.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node scripts/reset-test-db.mjs && npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DATABASE_PATH: './data/cafeflow-test.db' },
  },
});
