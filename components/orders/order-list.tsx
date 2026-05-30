'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Check, ChefHat, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useOrderStore } from '@/lib/store';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusConfig: Record<OrderStatus, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
  preparing: { icon: ChefHat, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Preparing' },
  completed: { icon: Check, color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
  cancelled: { icon: X, color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
};

interface OrderListProps {
  filter?: OrderStatus | 'all';
}

export function OrderList({ filter = 'all' }: OrderListProps) {
  const { orders, updateOrderStatus } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((order) => order.status === filter);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
        <Clock className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 font-medium text-muted-foreground">No orders found</p>
        <p className="text-sm text-muted-foreground">
          {filter === 'all' ? 'Orders will appear here' : `No ${filter} orders`}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;

          return (
            <Card key={order.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Table {order.tableNumber} • {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn('border', status.color)}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {order.customerName && (
                    <p className="text-sm text-muted-foreground">
                      Customer: <span className="text-foreground">{order.customerName}</span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ${order.total.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="text-foreground">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-chart-3 hover:bg-chart-3/90"
                      onClick={() => handleStatusUpdate(order.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Table {selectedOrder?.tableNumber} • {selectedOrder?.customerName || 'Walk-in'}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-medium">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Created: {formatTime(selectedOrder.createdAt)}</span>
                <span>Updated: {formatTime(selectedOrder.updatedAt)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
