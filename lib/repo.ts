import { getDb, genId } from './db';
import type { MenuItem, InventoryItem, OrderStatus, UserRole } from './types';

/* ------------------------------------------------------------------ */
/* Serialized shapes returned to the client (dates as ISO strings).   */
/* ------------------------------------------------------------------ */

export interface ApiStaff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  joinedAt: string;
}

export interface ApiOrderItem {
  menuItem: Pick<MenuItem, 'id' | 'name' | 'category' | 'price' | 'available'>;
  quantity: number;
}

export interface ApiOrder {
  id: string;
  tableNumber: string;
  customerName?: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
}

/* ------------------------------- Menu ----------------------------- */

interface MenuRow {
  id: string;
  name: string;
  category: string;
  price: number;
  available: number;
  description: string | null;
}

function toMenuItem(r: MenuRow): MenuItem {
  return {
    id: r.id,
    name: r.name,
    category: r.category as MenuItem['category'],
    price: r.price,
    available: !!r.available,
    description: r.description ?? undefined,
  };
}

export function listMenuItems(): MenuItem[] {
  return (getDb().prepare('SELECT * FROM menu_items ORDER BY name').all() as MenuRow[]).map(toMenuItem);
}

export function createMenuItem(data: Omit<MenuItem, 'id'>): MenuItem {
  const id = genId('m-');
  getDb()
    .prepare('INSERT INTO menu_items (id, name, category, price, available, description) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, data.name, data.category, data.price, data.available ? 1 : 0, data.description ?? null);
  return { ...data, id };
}

export function updateMenuItem(id: string, patch: Partial<MenuItem>): MenuItem | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as MenuRow | undefined;
  if (!existing) return null;
  const next = { ...toMenuItem(existing), ...patch };
  db.prepare('UPDATE menu_items SET name = ?, category = ?, price = ?, available = ?, description = ? WHERE id = ?').run(
    next.name,
    next.category,
    next.price,
    next.available ? 1 : 0,
    next.description ?? null,
    id,
  );
  return next;
}

export function deleteMenuItem(id: string): boolean {
  return getDb().prepare('DELETE FROM menu_items WHERE id = ?').run(id).changes > 0;
}

/* ----------------------------- Inventory -------------------------- */

interface InvRow {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  category: string;
}

function toInventoryItem(r: InvRow): InventoryItem {
  return {
    id: r.id,
    name: r.name,
    quantity: r.quantity,
    unit: r.unit,
    lowStockThreshold: r.low_stock_threshold,
    category: r.category,
  };
}

export function listInventoryItems(): InventoryItem[] {
  return (getDb().prepare('SELECT * FROM inventory_items ORDER BY name').all() as InvRow[]).map(toInventoryItem);
}

export function createInventoryItem(data: Omit<InventoryItem, 'id'>): InventoryItem {
  const id = genId('i-');
  getDb()
    .prepare('INSERT INTO inventory_items (id, name, quantity, unit, low_stock_threshold, category) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, data.name, data.quantity, data.unit, data.lowStockThreshold, data.category);
  return { ...data, id };
}

export function updateInventoryItem(id: string, patch: Partial<InventoryItem>): InventoryItem | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(id) as InvRow | undefined;
  if (!existing) return null;
  const next = { ...toInventoryItem(existing), ...patch };
  db.prepare(
    'UPDATE inventory_items SET name = ?, quantity = ?, unit = ?, low_stock_threshold = ?, category = ? WHERE id = ?',
  ).run(next.name, next.quantity, next.unit, next.lowStockThreshold, next.category, id);
  return next;
}

export function deleteInventoryItem(id: string): boolean {
  return getDb().prepare('DELETE FROM inventory_items WHERE id = ?').run(id).changes > 0;
}

/* ------------------------------ Staff ----------------------------- */

interface StaffRow {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
}

function toStaff(r: StaffRow): ApiStaff {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role as UserRole,
    phone: r.phone ?? undefined,
    joinedAt: r.created_at,
  };
}

export function listStaff(): ApiStaff[] {
  return (
    getDb()
      .prepare('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at')
      .all() as StaffRow[]
  ).map(toStaff);
}

export function staffEmailExists(email: string): boolean {
  return !!getDb().prepare('SELECT 1 FROM users WHERE email = ?').get(email);
}

export function createStaff(
  data: { name: string; email: string; phone?: string; role: UserRole },
  passwordHash: string,
): ApiStaff {
  const id = genId('u-');
  const createdAt = new Date().toISOString();
  getDb()
    .prepare('INSERT INTO users (id, name, email, role, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, data.name, data.email, data.role, data.phone ?? null, passwordHash, createdAt);
  return { id, name: data.name, email: data.email, role: data.role, phone: data.phone, joinedAt: createdAt };
}

export function deleteStaff(id: string): boolean {
  return getDb().prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0;
}

/* ------------------------------ Orders ---------------------------- */

interface OrderRow {
  id: string;
  table_number: string;
  customer_name: string | null;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  order_id: string;
  menu_item_id: string | null;
  name: string;
  category: string | null;
  price: number;
  quantity: number;
}

function buildOrders(rows: OrderRow[]): ApiOrder[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => '?').join(',');
  const itemRows = getDb()
    .prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`)
    .all(...ids) as OrderItemRow[];

  const byOrder = new Map<string, ApiOrderItem[]>();
  for (const it of itemRows) {
    const list = byOrder.get(it.order_id) ?? [];
    list.push({
      menuItem: {
        id: it.menu_item_id ?? '',
        name: it.name,
        category: (it.category as MenuItem['category']) ?? 'Coffee',
        price: it.price,
        available: true,
      },
      quantity: it.quantity,
    });
    byOrder.set(it.order_id, list);
  }

  return rows.map((r) => ({
    id: r.id,
    tableNumber: r.table_number,
    customerName: r.customer_name ?? undefined,
    status: r.status as OrderStatus,
    total: r.total,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    items: byOrder.get(r.id) ?? [],
  }));
}

export function listOrders(): ApiOrder[] {
  const rows = getDb().prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as OrderRow[];
  return buildOrders(rows);
}

export function getOrder(id: string): ApiOrder | null {
  const row = getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined;
  return row ? buildOrders([row])[0] : null;
}

export function createOrder(input: {
  items: Array<{ menuItemId: string; quantity: number }>;
  tableNumber: string;
  customerName?: string;
}): ApiOrder {
  const db = getDb();
  const count = (db.prepare('SELECT COUNT(*) AS c FROM orders').get() as { c: number }).c;
  const id = `ORD-${String(count + 1).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const lookup = db.prepare('SELECT id, name, category, price FROM menu_items WHERE id = ?');
  const resolved = input.items.map((line) => {
    const m = lookup.get(line.menuItemId) as
      | { id: string; name: string; category: string; price: number }
      | undefined;
    if (!m) throw new Error(`Menu item not found: ${line.menuItemId}`);
    return { ...m, quantity: line.quantity };
  });
  const total = Math.round(resolved.reduce((s, r) => s + r.price * r.quantity, 0) * 100) / 100;

  const tx = db.transaction(() => {
    db.prepare(
      'INSERT INTO orders (id, table_number, customer_name, status, total, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(id, input.tableNumber, input.customerName ?? null, 'pending', total, now, now);
    const insItem = db.prepare(
      'INSERT INTO order_items (order_id, menu_item_id, name, category, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
    );
    for (const r of resolved) insItem.run(id, r.id, r.name, r.category, r.price, r.quantity);
  });
  tx();

  return getOrder(id)!;
}

export function updateOrderStatus(id: string, status: OrderStatus): ApiOrder | null {
  const db = getDb();
  const changes = db
    .prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
    .run(status, new Date().toISOString(), id).changes;
  return changes > 0 ? getOrder(id) : null;
}

/* ------------------------------ Reports --------------------------- */

export interface ReportsData {
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number; ordersToday: number; revenueToday: number };
  dailySales: Array<{ date: string; revenue: number; orders: number }>;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  categoryRevenue: Array<{ name: string; value: number }>;
  weeklyRevenue: Array<{ week: string; revenue: number }>;
  hourlyData: Array<{ hour: string; orders: number; revenue: number }>;
}

export function getReports(): ReportsData {
  const db = getDb();
  const orders = db.prepare("SELECT * FROM orders WHERE status != 'cancelled'").all() as OrderRow[];
  const items = db
    .prepare(
      "SELECT oi.* FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status != 'cancelled'",
    )
    .all() as OrderItemRow[];

  const totalRevenue = Math.round(orders.reduce((s, o) => s + o.total, 0) * 100) / 100;
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todays = orders.filter((o) => o.created_at.slice(0, 10) === todayStr);
  const revenueToday = Math.round(todays.reduce((s, o) => s + o.total, 0) * 100) / 100;

  // Daily sales over the last 7 days.
  const dayMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const key = o.created_at.slice(0, 10);
    const bucket = dayMap.get(key);
    if (bucket) {
      bucket.revenue += o.total;
      bucket.orders += 1;
    }
  }
  const dailySales = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    revenue: Math.round(v.revenue * 100) / 100,
    orders: v.orders,
  }));

  // Top selling items.
  const itemMap = new Map<string, { quantity: number; revenue: number }>();
  const catMap = new Map<string, number>();
  for (const it of items) {
    const cur = itemMap.get(it.name) ?? { quantity: 0, revenue: 0 };
    cur.quantity += it.quantity;
    cur.revenue += it.price * it.quantity;
    itemMap.set(it.name, cur);
    const cat = it.category ?? 'Other';
    catMap.set(cat, (catMap.get(cat) ?? 0) + it.price * it.quantity);
  }
  const topItems = Array.from(itemMap.entries())
    .map(([name, v]) => ({ name, quantity: v.quantity, revenue: Math.round(v.revenue * 100) / 100 }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  const categoryRevenue = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  // Weekly buckets (group the 7-day window into 2 halves + carryover label).
  const weeklyRevenue = [
    { week: 'Mon–Tue', revenue: 0 },
    { week: 'Wed–Thu', revenue: 0 },
    { week: 'Fri–Sat', revenue: 0 },
    { week: 'Sun', revenue: 0 },
  ];
  dailySales.forEach((d, idx) => {
    const bucket = Math.min(Math.floor(idx / 2), 3);
    weeklyRevenue[bucket].revenue += d.revenue;
  });
  weeklyRevenue.forEach((w) => (w.revenue = Math.round(w.revenue)));

  // Hourly performance.
  const hours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
  const hourMap = new Map<number, { orders: number; revenue: number }>();
  for (const o of orders) {
    const h = new Date(o.created_at).getHours();
    const cur = hourMap.get(h) ?? { orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += o.total;
    hourMap.set(h, cur);
  }
  const hourlyData = hours.map((label, idx) => {
    const h = 8 + idx;
    const v = hourMap.get(h) ?? { orders: 0, revenue: 0 };
    return { hour: label, orders: v.orders, revenue: Math.round(v.revenue) };
  });

  return {
    summary: { totalRevenue, totalOrders, avgOrderValue, ordersToday: todays.length, revenueToday },
    dailySales,
    topItems,
    categoryRevenue,
    weeklyRevenue,
    hourlyData,
  };
}
