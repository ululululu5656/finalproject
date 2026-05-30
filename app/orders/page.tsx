'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { NewOrderForm } from '@/components/orders/new-order-form';
import { OrderList } from '@/components/orders/order-list';
import { useOrderStore, useMenuStore } from '@/lib/store';
import type { OrderStatus } from '@/lib/types';

export default function OrdersPage() {
  const orders = useOrderStore((state) => state.orders);
  const loadOrders = useOrderStore((state) => state.load);
  const loadMenu = useMenuStore((state) => state.load);
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    loadOrders();
    loadMenu();
  }, [loadOrders, loadMenu]);

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status).length;
  };

  return (
    <DashboardLayout title="Order Management">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="new" className="gap-2">
            New Order
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {getStatusCount('pending') > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {getStatusCount('pending')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing" className="gap-2">
            Preparing
            {getStatusCount('preparing') > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {getStatusCount('preparing')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            All Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <NewOrderForm />
        </TabsContent>

        <TabsContent value="pending">
          <OrderList filter="pending" />
        </TabsContent>

        <TabsContent value="preparing">
          <OrderList filter="preparing" />
        </TabsContent>

        <TabsContent value="completed">
          <OrderList filter="completed" />
        </TabsContent>

        <TabsContent value="all">
          <OrderList filter="all" />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
