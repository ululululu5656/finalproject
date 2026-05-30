# CafeFlow — Cafe Management System

A full-stack cafe management system built with **Next.js 16 (App Router)**, **React 19**,
**Tailwind CSS 4**, and a **SQLite** database. It covers authentication, menu management,
order taking, billing, inventory, staff management, and reporting/analytics, with
role-based access for **admins** and **staff**.

This is a final-year project (FYP). Project documentation and diagrams live in [`docs/`](docs/).

---

## Features

| Module | Description | Access |
| --- | --- | --- |
| **Auth** | Email + password login, bcrypt-hashed passwords, httpOnly session cookies | Everyone |
| **Dashboard** | Live stats (orders, revenue, low stock), charts, recent orders | Admin + Staff |
| **Menu** | Create / edit / delete items, toggle availability, search & filter | Admin |
| **Orders** | Build an order from the menu, submit, track status (pending → preparing → completed) | Admin + Staff |
| **Billing** | Generate and preview itemised bills for orders | Admin + Staff |
| **Inventory** | Track stock, units and low-stock thresholds | Admin |
| **Reports** | Revenue trends, top items, category split, hourly performance — derived from real orders | Admin |
| **Staff** | Manage the team (add/remove users and roles) | Admin |

Everything persists to SQLite — refresh the page or restart the server and the data is still there.

---

## Tech stack

- **Framework:** Next.js 16 (App Router, Route Handlers), React 19
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix UI), lucide-react icons
- **State:** Zustand stores backed by REST API routes
- **Database:** SQLite via `better-sqlite3`
- **Auth:** `bcryptjs` password hashing + cookie sessions
- **Charts:** Recharts
- **Testing:** Playwright (end-to-end)
- **Package manager:** npm (pnpm also supported)

---

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+ (ships with Node). pnpm also works if you prefer it.

### Install & run

```bash
npm install         # installs deps and builds the native SQLite module
npm run dev         # start the dev server → http://localhost:3000
```

Then open <http://localhost:3000> and sign in with one of the test accounts below.

> The database is created at `data/cafeflow.db` and **auto-seeds on first use**, so the
> app works straight after `npm run dev` with no extra steps. Run `npm run db:seed` to
> print the credentials, or `npm run db:reset` to wipe and re-seed.
>
> Prefer pnpm? Every command works with `pnpm <script>` too (e.g. `pnpm dev`).

### Test credentials

| Role | Email | Password |
| --- | --- | --- |
| **Admin** | `admin@cafe.com` | `admin123` |
| **Staff** | `staff@cafe.com` | `staff123` |

The seeded staff roster (David, Maria, James, …) can also sign in with the password
`password123`. The login screen shows the two primary accounts and lets you fill them
in with one click.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm run db:seed` | Seed the database if empty (prints test credentials) |
| `npm run db:reset` | Wipe and re-seed the database (`--force`) |
| `npm run test:e2e` | Run the Playwright end-to-end suite |
| `npm run test:e2e:ui` | Run Playwright in interactive UI mode |

---

## End-to-end tests

Playwright specs live in [`e2e/`](e2e/) — **25 tests** that drive the app like a real
user and cover every feature and function in every module:

```bash
npm run test:e2e       # headless run (boots its own server on :3100 with a fresh test DB)
npm run test:e2e:ui    # watch / debug in the Playwright UI
```

> First time only: `npx playwright install chromium` to download the browser.

| Spec | What it exercises |
| --- | --- |
| `auth.spec.ts` | Login, invalid credentials, admin vs staff navigation, route guards, logout |
| `dashboard.spec.ts` | Admin stats + charts; the limited staff view |
| `menu.spec.ts` | Search, category filter, table/card views, add, toggle availability, edit, delete |
| `orders.spec.ts` | Category filter, cart add/increase/decrease/remove/clear, submit, tabs, view details, status pipeline |
| `billing.spec.ts` | Empty state, search, select order, bill preview, print |
| `inventory.spec.ts` | Search, category filter, add, edit, delete |
| `staff.spec.ts` | Stat cards, add with role, search, delete with confirmation |
| `reports.spec.ts` | Summary cards, analytics tabs, date-range selector, export |
| `demo.spec.ts` | One continuous walkthrough of everything above (the demo video) |

The suite spins up the app on port `3100` against a throwaway database
(`data/cafeflow-test.db`) that is reset before each run, so tests are deterministic and
never touch your dev data. A video is recorded for every test.

### Full demo video

[`e2e/demo.spec.ts`](e2e/demo.spec.ts) is a single, paced walkthrough of the entire app
(login → menu → orders → billing → inventory → reports → staff → logout) that exercises
every feature. Running the suite records it as one continuous video. The checked-in copy
(converted to MP4) lives at:

```
docs/demo-walkthrough.mp4
```

Re-record it any time with `npm run test:e2e` — Playwright writes the raw video to
`test-results/demo-.../video.webm` (and the full HTML report to `playwright-report/`).
Convert it to MP4 with:

```bash
ffmpeg -i test-results/demo-*/video.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart docs/demo-walkthrough.mp4
```

---

## Project structure

```
app/
  api/                 REST route handlers (auth, menu, orders, inventory, staff, reports)
  dashboard/ menu/ …   page routes (one folder per module)
  login/               email + password login screen
  layout.tsx           root layout
components/
  ui/                  shadcn/ui primitives
  dashboard/ menu/ …   feature components
  app-sidebar, app-header, dashboard-layout (shell + auth guard)
lib/
  db.ts                SQLite connection, schema, seeding
  repo.ts              typed data-access functions
  auth.ts              password hashing + session management
  api.ts               route-handler auth guard
  store.ts             Zustand stores (API-backed)
  mock-data.ts         reference data used to seed the DB
  types.ts             shared TypeScript types
e2e/                   Playwright tests + the demo walkthrough
scripts/               seed / reset helpers
docs/                  FYP report, proposal, diagrams, demo video
data/                  SQLite database (git-ignored)
```

---

## Architecture notes

- **Data flow:** UI → Zustand store → `fetch` → Next.js Route Handler → `lib/repo` →
  SQLite. Stores normalise API responses (e.g. ISO date strings → `Date`).
- **Auth:** Login verifies the bcrypt hash, creates a row in `sessions`, and sets an
  httpOnly cookie. Every protected route handler validates the session via `authGuard`,
  and admin-only mutations require the `admin` role. The client also guards admin-only
  pages (`requireAdmin`) and redirects unauthenticated users to `/login`.
- **Database:** A single file (`data/cafeflow.db`) with tables for `users`, `sessions`,
  `menu_items`, `inventory_items`, `orders`, and `order_items`. The schema is created on
  first connect and seeded when empty. Order line items snapshot the item name/price so
  historical bills stay correct even if the menu later changes.
- **Reports** are computed from real order data, so the dashboard and analytics reflect
  whatever orders exist in the database.

---

## License

Educational / final-year-project use.
