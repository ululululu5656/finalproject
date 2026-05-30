'use client';

import { create } from 'zustand';
import type { User, MenuItem, Order, InventoryItem, StaffMember, OrderItem } from './types';
import { menuItems as initialMenuItems, orders as initialOrders, inventoryItems as initialInventory, staffMembers as initialStaff } from './mock-data';

interface AuthState {
  user: User | null;
  login: (role: 'admin' | 'staff') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (role) => set({
    user: {
      id: role === 'admin' ? '1' : '3',
      name: role === 'admin' ? 'David Chen' : 'James Wilson',
      email: role === 'admin' ? 'david@cafe.com' : 'james@cafe.com',
      role,
    }
  }),
  logout: () => set({ user: null }),
}));

interface MenuState {
  items: MenuItem[];
  addItem: (item: Omit<MenuItem, 'id'>) => void;
  updateItem: (id: string, item: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  items: initialMenuItems,
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: Date.now().toString() }]
  })),
  updateItem: (id, updatedItem) => set((state) => ({
    items: state.items.map(item => item.id === id ? { ...item, ...updatedItem } : item)
  })),
  deleteItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  toggleAvailability: (id) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    )
  })),
}));

interface OrderState {
  orders: Order[];
  currentOrder: OrderItem[];
  addToCurrentOrder: (item: MenuItem, quantity: number) => void;
  removeFromCurrentOrder: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  submitOrder: (tableNumber: string, customerName?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: initialOrders,
  currentOrder: [],
  addToCurrentOrder: (item, quantity) => set((state) => {
    const existingIndex = state.currentOrder.findIndex(o => o.menuItem.id === item.id);
    if (existingIndex >= 0) {
      const updated = [...state.currentOrder];
      updated[existingIndex].quantity += quantity;
      return { currentOrder: updated };
    }
    return { currentOrder: [...state.currentOrder, { menuItem: item, quantity }] };
  }),
  removeFromCurrentOrder: (itemId) => set((state) => ({
    currentOrder: state.currentOrder.filter(o => o.menuItem.id !== itemId)
  })),
  updateQuantity: (itemId, quantity) => set((state) => ({
    currentOrder: state.currentOrder.map(o => 
      o.menuItem.id === itemId ? { ...o, quantity } : o
    )
  })),
  clearCurrentOrder: () => set({ currentOrder: [] }),
  submitOrder: (tableNumber, customerName) => {
    const { currentOrder, orders } = get();
    const total = currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      items: [...currentOrder],
      tableNumber,
      customerName,
      status: 'pending',
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({ orders: [newOrder, ...orders], currentOrder: [] });
  },
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(order => 
      order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
    )
  })),
}));

interface InventoryState {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: initialInventory,
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: Date.now().toString() }]
  })),
  updateItem: (id, updatedItem) => set((state) => ({
    items: state.items.map(item => item.id === id ? { ...item, ...updatedItem } : item)
  })),
  deleteItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
}));

interface StaffState {
  staff: StaffMember[];
  addStaff: (member: Omit<StaffMember, 'id' | 'joinedAt'>) => void;
  removeStaff: (id: string) => void;
}

export const useStaffStore = create<StaffState>((set) => ({
  staff: initialStaff,
  addStaff: (member) => set((state) => ({
    staff: [...state.staff, { ...member, id: Date.now().toString(), joinedAt: new Date() }]
  })),
  removeStaff: (id) => set((state) => ({
    staff: state.staff.filter(m => m.id !== id)
  })),
}));
