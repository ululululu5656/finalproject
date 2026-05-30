import type { MenuItem, InventoryItem, StaffMember } from './types';

/**
 * Reference data used to seed the SQLite database on first run
 * (see lib/db.ts). Orders and analytics are generated at seed time and
 * served from the database, so they no longer live here.
 */

export const menuItems: MenuItem[] = [
  { id: '1', name: 'Espresso', category: 'Coffee', price: 3.50, available: true, description: 'Rich and bold single shot' },
  { id: '2', name: 'Cappuccino', category: 'Coffee', price: 4.50, available: true, description: 'Espresso with steamed milk foam' },
  { id: '3', name: 'Latte', category: 'Coffee', price: 4.75, available: true, description: 'Smooth espresso with steamed milk' },
  { id: '4', name: 'Americano', category: 'Coffee', price: 3.75, available: true, description: 'Espresso with hot water' },
  { id: '5', name: 'Mocha', category: 'Coffee', price: 5.25, available: true, description: 'Espresso with chocolate and milk' },
  { id: '6', name: 'Cold Brew', category: 'Coffee', price: 4.25, available: true, description: 'Slow-steeped for 12 hours' },
  { id: '7', name: 'Green Tea', category: 'Tea', price: 3.00, available: true, description: 'Japanese sencha' },
  { id: '8', name: 'Earl Grey', category: 'Tea', price: 3.25, available: true, description: 'Black tea with bergamot' },
  { id: '9', name: 'Chai Latte', category: 'Tea', price: 4.50, available: true, description: 'Spiced tea with steamed milk' },
  { id: '10', name: 'Matcha Latte', category: 'Tea', price: 5.00, available: false, description: 'Premium matcha with milk' },
  { id: '11', name: 'Croissant', category: 'Snacks', price: 3.50, available: true, description: 'Buttery French pastry' },
  { id: '12', name: 'Blueberry Muffin', category: 'Snacks', price: 3.25, available: true, description: 'Fresh baked daily' },
  { id: '13', name: 'Avocado Toast', category: 'Snacks', price: 8.50, available: true, description: 'Sourdough with fresh avocado' },
  { id: '14', name: 'Bagel & Cream Cheese', category: 'Snacks', price: 4.50, available: true, description: 'Toasted with cream cheese' },
  { id: '15', name: 'Fresh Orange Juice', category: 'Drinks', price: 4.00, available: true, description: 'Freshly squeezed' },
  { id: '16', name: 'Smoothie Bowl', category: 'Drinks', price: 7.50, available: true, description: 'Acai with granola toppings' },
  { id: '17', name: 'Sparkling Water', category: 'Drinks', price: 2.50, available: true, description: 'San Pellegrino' },
  { id: '18', name: 'Chocolate Brownie', category: 'Desserts', price: 4.00, available: true, description: 'Rich and fudgy' },
  { id: '19', name: 'Cheesecake', category: 'Desserts', price: 5.50, available: true, description: 'New York style' },
  { id: '20', name: 'Tiramisu', category: 'Desserts', price: 6.00, available: false, description: 'Classic Italian dessert' },
];

export const inventoryItems: InventoryItem[] = [
  { id: '1', name: 'Coffee Beans (Arabica)', quantity: 15, unit: 'kg', lowStockThreshold: 10, category: 'Coffee' },
  { id: '2', name: 'Coffee Beans (Robusta)', quantity: 8, unit: 'kg', lowStockThreshold: 10, category: 'Coffee' },
  { id: '3', name: 'Whole Milk', quantity: 25, unit: 'L', lowStockThreshold: 15, category: 'Dairy' },
  { id: '4', name: 'Oat Milk', quantity: 12, unit: 'L', lowStockThreshold: 8, category: 'Dairy' },
  { id: '5', name: 'Almond Milk', quantity: 6, unit: 'L', lowStockThreshold: 8, category: 'Dairy' },
  { id: '6', name: 'Sugar', quantity: 20, unit: 'kg', lowStockThreshold: 5, category: 'Sweeteners' },
  { id: '7', name: 'Vanilla Syrup', quantity: 3, unit: 'bottles', lowStockThreshold: 5, category: 'Syrups' },
  { id: '8', name: 'Caramel Syrup', quantity: 4, unit: 'bottles', lowStockThreshold: 5, category: 'Syrups' },
  { id: '9', name: 'Chocolate Powder', quantity: 2, unit: 'kg', lowStockThreshold: 3, category: 'Powders' },
  { id: '10', name: 'Matcha Powder', quantity: 0.5, unit: 'kg', lowStockThreshold: 1, category: 'Powders' },
  { id: '11', name: 'Paper Cups (Small)', quantity: 200, unit: 'pcs', lowStockThreshold: 100, category: 'Supplies' },
  { id: '12', name: 'Paper Cups (Large)', quantity: 80, unit: 'pcs', lowStockThreshold: 100, category: 'Supplies' },
  { id: '13', name: 'Napkins', quantity: 500, unit: 'pcs', lowStockThreshold: 200, category: 'Supplies' },
  { id: '14', name: 'Croissants', quantity: 15, unit: 'pcs', lowStockThreshold: 10, category: 'Pastries' },
  { id: '15', name: 'Blueberry Muffins', quantity: 8, unit: 'pcs', lowStockThreshold: 10, category: 'Pastries' },
];

export const staffMembers: StaffMember[] = [
  { id: '1', name: 'David Chen', email: 'david@cafe.com', role: 'admin', phone: '+1 555-0101', joinedAt: new Date('2024-01-15') },
  { id: '2', name: 'Maria Garcia', email: 'maria@cafe.com', role: 'admin', phone: '+1 555-0102', joinedAt: new Date('2024-02-01') },
  { id: '3', name: 'James Wilson', email: 'james@cafe.com', role: 'staff', phone: '+1 555-0103', joinedAt: new Date('2024-03-10') },
  { id: '4', name: 'Lisa Thompson', email: 'lisa@cafe.com', role: 'staff', phone: '+1 555-0104', joinedAt: new Date('2024-04-20') },
  { id: '5', name: 'Robert Brown', email: 'robert@cafe.com', role: 'staff', phone: '+1 555-0105', joinedAt: new Date('2024-06-01') },
  { id: '6', name: 'Jennifer Lee', email: 'jennifer@cafe.com', role: 'staff', phone: '+1 555-0106', joinedAt: new Date('2024-08-15') },
];
