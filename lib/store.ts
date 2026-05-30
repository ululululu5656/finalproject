'use client';

import { create } from 'zustand';
import type {
  User,
  MenuItem,
  Order,
  InventoryItem,
  StaffMember,
  OrderItem,
  UserRole,
} from './types';

/* ------------------------------------------------------------------ */
/* Fetch helper                                                       */
/* ------------------------------------------------------------------ */

async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Request failed');
  return data as T;
}

// API serializes dates as ISO strings; rebuild Date objects for the UI.
function reviveOrder(o: any): Order {
  return { ...o, createdAt: new Date(o.createdAt), updatedAt: new Date(o.updatedAt) };
}
function reviveStaff(s: any): StaffMember {
  return { ...s, joinedAt: new Date(s.joinedAt) };
}

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  fetchMe: async () => {
    set({ status: 'loading' });
    try {
      const { user } = await api<{ user: User | null }>('/api/auth/me');
      set({ user, status: user ? 'authenticated' : 'unauthenticated' });
    } catch {
      set({ user: null, status: 'unauthenticated' });
    }
  },
  login: async (email, password) => {
    try {
      const { user } = await api<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      set({ user, status: 'authenticated' });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  },
  logout: async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } finally {
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));

/* ------------------------------------------------------------------ */
/* Menu                                                               */
/* ------------------------------------------------------------------ */

interface MenuState {
  items: MenuItem[];
  loading: boolean;
  load: () => Promise<void>;
  addItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const { items } = await api<{ items: MenuItem[] }>('/api/menu');
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addItem: async (item) => {
    const { item: created } = await api<{ item: MenuItem }>('/api/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    set((state) => ({ items: [...state.items, created] }));
  },
  updateItem: async (id, updated) => {
    const { item } = await api<{ item: MenuItem }>(`/api/menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updated),
    });
    set((state) => ({ items: state.items.map((i) => (i.id === id ? item : i)) }));
  },
  deleteItem: async (id) => {
    await api(`/api/menu/${id}`, { method: 'DELETE' });
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },
  toggleAvailability: async (id) => {
    const current = get().items.find((i) => i.id === id);
    if (!current) return;
    const { item } = await api<{ item: MenuItem }>(`/api/menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ available: !current.available }),
    });
    set((state) => ({ items: state.items.map((i) => (i.id === id ? item : i)) }));
  },
}));

/* ------------------------------------------------------------------ */
/* Orders                                                             */
/* ------------------------------------------------------------------ */

interface OrderState {
  orders: Order[];
  currentOrder: OrderItem[];
  loading: boolean;
  load: () => Promise<void>;
  addToCurrentOrder: (item: MenuItem, quantity: number) => void;
  removeFromCurrentOrder: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  submitOrder: (tableNumber: string, customerName?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const { orders } = await api<{ orders: any[] }>('/api/orders');
      set({ orders: orders.map(reviveOrder), loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addToCurrentOrder: (item, quantity) =>
    set((state) => {
      const existingIndex = state.currentOrder.findIndex((o) => o.menuItem.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...state.currentOrder];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity };
        return { currentOrder: updated };
      }
      return { currentOrder: [...state.currentOrder, { menuItem: item, quantity }] };
    }),
  removeFromCurrentOrder: (itemId) =>
    set((state) => ({ currentOrder: state.currentOrder.filter((o) => o.menuItem.id !== itemId) })),
  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      currentOrder: state.currentOrder.map((o) => (o.menuItem.id === itemId ? { ...o, quantity } : o)),
    })),
  clearCurrentOrder: () => set({ currentOrder: [] }),
  submitOrder: async (tableNumber, customerName) => {
    const { currentOrder } = get();
    const { order } = await api<{ order: any }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        tableNumber,
        customerName,
        items: currentOrder.map((o) => ({ menuItemId: o.menuItem.id, quantity: o.quantity })),
      }),
    });
    set((state) => ({ orders: [reviveOrder(order), ...state.orders], currentOrder: [] }));
  },
  updateOrderStatus: async (orderId, status) => {
    const { order } = await api<{ order: any }>(`/api/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    set((state) => ({ orders: state.orders.map((o) => (o.id === orderId ? reviveOrder(order) : o)) }));
  },
}));

/* ------------------------------------------------------------------ */
/* Inventory                                                          */
/* ------------------------------------------------------------------ */

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  load: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const { items } = await api<{ items: InventoryItem[] }>('/api/inventory');
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addItem: async (item) => {
    const { item: created } = await api<{ item: InventoryItem }>('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    set((state) => ({ items: [...state.items, created] }));
  },
  updateItem: async (id, updated) => {
    const { item } = await api<{ item: InventoryItem }>(`/api/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updated),
    });
    set((state) => ({ items: state.items.map((i) => (i.id === id ? item : i)) }));
  },
  deleteItem: async (id) => {
    await api(`/api/inventory/${id}`, { method: 'DELETE' });
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },
}));

/* ------------------------------------------------------------------ */
/* Staff                                                              */
/* ------------------------------------------------------------------ */

interface StaffState {
  staff: StaffMember[];
  loading: boolean;
  load: () => Promise<void>;
  addStaff: (member: { name: string; email: string; phone?: string; role: UserRole }) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set) => ({
  staff: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const { staff } = await api<{ staff: any[] }>('/api/staff');
      set({ staff: staff.map(reviveStaff), loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addStaff: async (member) => {
    const { member: created } = await api<{ member: any }>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(member),
    });
    set((state) => ({ staff: [...state.staff, reviveStaff(created)] }));
  },
  removeStaff: async (id) => {
    await api(`/api/staff/${id}`, { method: 'DELETE' });
    set((state) => ({ staff: state.staff.filter((m) => m.id !== id) }));
  },
}));

/* ------------------------------------------------------------------ */
/* Reports                                                            */
/* ------------------------------------------------------------------ */

export interface ReportsData {
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number; ordersToday: number; revenueToday: number };
  dailySales: Array<{ date: string; revenue: number; orders: number }>;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  categoryRevenue: Array<{ name: string; value: number }>;
  weeklyRevenue: Array<{ week: string; revenue: number }>;
  hourlyData: Array<{ hour: string; orders: number; revenue: number }>;
}

interface ReportsState {
  data: ReportsData | null;
  loading: boolean;
  load: () => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set) => ({
  data: null,
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const data = await api<ReportsData>('/api/reports');
      set({ data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
