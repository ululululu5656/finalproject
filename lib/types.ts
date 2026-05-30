export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Coffee' | 'Tea' | 'Snacks' | 'Drinks' | 'Desserts';
  price: number;
  available: boolean;
  description?: string;
  image?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  items: OrderItem[];
  tableNumber: string;
  customerName?: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  category: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  joinedAt: Date;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
}
