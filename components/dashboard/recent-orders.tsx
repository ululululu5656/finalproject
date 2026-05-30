'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrderStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

const statusStyles: Record<OrderStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
  pending: { variant: 'secondary', label: 'Pending' },
  preparing: { variant: 'outline', label: 'Preparing' },
  completed: { variant: 'default', label: 'Completed' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
};

export function RecentOrders() {
  const orders = useOrderStore((state) => state.orders);
  const recentOrders = orders.slice(0, 5);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest orders from today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => {
            const status = statusStyles[order.status];
            return (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-medium">
                    #{order.tableNumber}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.customerName || 'Walk-in'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium text-foreground">${order.total.toFixed(2)}</p>
                  <Badge 
                    variant={status.variant}
                    className={cn(
                      order.status === 'preparing' && 'border-chart-4 bg-chart-4/10 text-chart-4',
                      order.status === 'completed' && 'bg-chart-3 text-white'
                    )}
                  >
                    {status.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
