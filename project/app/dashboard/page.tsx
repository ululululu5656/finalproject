'use client';

import { DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { PopularItems } from '@/components/dashboard/popular-items';
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { useOrderStore, useInventoryStore, useAuthStore } from '@/lib/store';
import { dailySales } from '@/lib/mock-data';

export default function DashboardPage() {
  const orders = useOrderStore((state) => state.orders);
  const inventoryItems = useInventoryStore((state) => state.items);
  const user = useAuthStore((state) => state.user);
  
  const todayOrders = orders.filter(o => o.status !== 'cancelled');
  const todayRevenue = dailySales[dailySales.length - 1].revenue;
  const lowStockCount = inventoryItems.filter(item => item.quantity <= item.lowStockThreshold).length;
  
  const isAdmin = user?.role === 'admin';

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Orders Today"
            value={todayOrders.length}
            description={`${orders.filter(o => o.status === 'pending').length} pending`}
            icon={ShoppingBag}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Revenue Today"
            value={`$${todayRevenue.toFixed(2)}`}
            description="Based on completed orders"
            icon={DollarSign}
            trend={{ value: 8.2, isPositive: true }}
            variant="success"
          />
          <StatCard
            title="Avg Order Value"
            value={`$${(todayRevenue / Math.max(todayOrders.length, 1)).toFixed(2)}`}
            description="Per order average"
            icon={TrendingUp}
          />
          {isAdmin && (
            <StatCard
              title="Low Stock Items"
              value={lowStockCount}
              description={lowStockCount > 0 ? 'Items need restocking' : 'All items stocked'}
              icon={Package}
              variant={lowStockCount > 0 ? 'destructive' : 'success'}
            />
          )}
        </div>

        {/* Charts */}
        {isAdmin && (
          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart />
            <RevenueChart />
          </div>
        )}

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>
          <div className="space-y-6">
            <PopularItems />
            {isAdmin && <LowStockAlerts />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
