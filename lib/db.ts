import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { menuItems, inventoryItems, staffMembers } from './mock-data';

/**
 * SQLite data layer for CafeFlow.
 *
 * A single file-backed database (data/cafeflow.db) holds every module:
 * users (auth + staff roster), menu items, inventory, orders + order items,
 * and login sessions. The connection is cached on globalThis so Next.js dev
 * hot-reloads reuse one handle. The schema is created on first connect and
 * the database is auto-seeded when empty, so `pnpm dev` and the e2e suite
 * both work with zero manual setup.
 */

export const DB_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'cafeflow.db');

type DB = Database.Database;

const globalForDb = globalThis as unknown as { __cafeflowDb?: DB };

export function getDb(): DB {
  if (globalForDb.__cafeflowDb) return globalForDb.__cafeflowDb;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  migrate(db);
  seedDatabase(db, { force: false });

  globalForDb.__cafeflowDb = db;
  return db;
}

function migrate(db: DB) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      role          TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
      phone         TEXT,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      price       REAL NOT NULL,
      available   INTEGER NOT NULL DEFAULT 1,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      quantity            REAL NOT NULL,
      unit                TEXT NOT NULL,
      low_stock_threshold REAL NOT NULL,
      category            TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT PRIMARY KEY,
      table_number  TEXT NOT NULL,
      customer_name TEXT,
      status        TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
      total         REAL NOT NULL,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id TEXT,
      name         TEXT NOT NULL,
      category     TEXT,
      price        REAL NOT NULL,
      quantity     INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);
}

/** Accounts you can sign in with. Documented in the README + login screen. */
export const SEED_CREDENTIALS = [
  { email: 'admin@cafe.com', password: 'admin123', name: 'Admin User', role: 'admin' as const, phone: '+1 555-0100' },
  { email: 'staff@cafe.com', password: 'staff123', name: 'Staff User', role: 'staff' as const, phone: '+1 555-0110' },
];

const DEFAULT_STAFF_PASSWORD = 'password123';

function genId(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

/**
 * Build a week of realistic completed/preparing/pending orders so the
 * dashboard and reports have meaningful data to chart.
 */
function generateOrders() {
  const orders: Array<{
    id: string;
    tableNumber: string;
    customerName: string | null;
    status: 'pending' | 'preparing' | 'completed' | 'cancelled';
    total: number;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{ menuItemId: string; name: string; category: string; price: number; quantity: number }>;
  }> = [];

  const customers = ['John D.', 'Sarah M.', 'Mike R.', 'Emma W.', 'Alex P.', 'Olivia K.', 'Liam T.', null];
  const available = menuItems.filter((m) => m.available);
  let counter = 1;

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const ordersThatDay = dayOffset === 0 ? 5 : 6 + Math.floor(Math.random() * 4); // 6–9 historical, 5 today
    for (let i = 0; i < ordersThatDay; i++) {
      const created = new Date();
      created.setDate(created.getDate() - dayOffset);
      created.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);

      const itemCount = 1 + Math.floor(Math.random() * 3);
      const items: ReturnType<typeof generateOrders>[number]['items'] = [];
      for (let j = 0; j < itemCount; j++) {
        const m = available[Math.floor(Math.random() * available.length)];
        const quantity = 1 + Math.floor(Math.random() * 3);
        items.push({ menuItemId: m.id, name: m.name, category: m.category, price: m.price, quantity });
      }
      const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

      // Older days are completed; today's mix pending/preparing/completed.
      let status: 'pending' | 'preparing' | 'completed';
      if (dayOffset > 0) status = 'completed';
      else status = (['pending', 'preparing', 'completed'] as const)[i % 3];

      const updated = new Date(created.getTime() + 15 * 60 * 1000);

      orders.push({
        id: `ORD-${pad(counter++)}`,
        tableNumber: String(1 + Math.floor(Math.random() * 15)),
        customerName: customers[Math.floor(Math.random() * customers.length)] ?? null,
        status,
        total: Math.round(total * 100) / 100,
        createdAt: created,
        updatedAt: updated,
        items,
      });
    }
  }
  return orders;
}

/** Seed reference data. With `force`, wipes existing rows first. */
export function seedDatabase(db: DB, { force = false }: { force?: boolean } = {}) {
  const userCount = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c;
  if (userCount > 0 && !force) return;

  const tx = db.transaction(() => {
    if (force) {
      db.exec(
        'DELETE FROM order_items; DELETE FROM orders; DELETE FROM sessions; DELETE FROM menu_items; DELETE FROM inventory_items; DELETE FROM users;',
      );
    }

    // Users: dedicated test credentials + the staff roster from mock data.
    const insertUser = db.prepare(
      'INSERT INTO users (id, name, email, role, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    const seen = new Set<string>();
    for (const c of SEED_CREDENTIALS) {
      insertUser.run(genId('u-'), c.name, c.email, c.role, c.phone, bcrypt.hashSync(c.password, 10), new Date().toISOString());
      seen.add(c.email);
    }
    const staffHash = bcrypt.hashSync(DEFAULT_STAFF_PASSWORD, 10);
    for (const s of staffMembers) {
      if (seen.has(s.email)) continue;
      insertUser.run(s.id, s.name, s.email, s.role, s.phone ?? null, staffHash, s.joinedAt.toISOString());
    }

    // Menu
    const insertMenu = db.prepare(
      'INSERT INTO menu_items (id, name, category, price, available, description) VALUES (?, ?, ?, ?, ?, ?)',
    );
    for (const m of menuItems) {
      insertMenu.run(m.id, m.name, m.category, m.price, m.available ? 1 : 0, m.description ?? null);
    }

    // Inventory
    const insertInv = db.prepare(
      'INSERT INTO inventory_items (id, name, quantity, unit, low_stock_threshold, category) VALUES (?, ?, ?, ?, ?, ?)',
    );
    for (const it of inventoryItems) {
      insertInv.run(it.id, it.name, it.quantity, it.unit, it.lowStockThreshold, it.category);
    }

    // Orders
    const insertOrder = db.prepare(
      'INSERT INTO orders (id, table_number, customer_name, status, total, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    const insertOrderItem = db.prepare(
      'INSERT INTO order_items (order_id, menu_item_id, name, category, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
    );
    for (const o of generateOrders()) {
      insertOrder.run(o.id, o.tableNumber, o.customerName, o.status, o.total, o.createdAt.toISOString(), o.updatedAt.toISOString());
      for (const it of o.items) {
        insertOrderItem.run(o.id, it.menuItemId, it.name, it.category, it.price, it.quantity);
      }
    }
  });

  tx();
}

export { genId };
