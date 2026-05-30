'use client';

import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Empty } from '@/components/ui/empty';
import { Printer, Search, Receipt, Coffee } from 'lucide-react';
import { toast } from 'sonner';
import { useOrderStore } from '@/lib/store';
import type { Order } from '@/lib/types';

export default function BillingPage() {
  const orders = useOrderStore((state) => state.orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const billRef = useRef<HTMLDivElement>(null);

  const completedOrders = orders.filter(
    (order) => order.status === 'completed' || order.status === 'preparing'
  );

  const filteredOrders = completedOrders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.tableNumber.includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower)
    );
  });

  const handlePrintBill = () => {
    if (!selectedOrder) return;
    
    // In a real app, this would trigger actual printing
    toast.success('Bill sent to printer');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout title="Billing">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Selection */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, table, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredOrders.length === 0 ? (
            <Empty
              icon={<Receipt className="h-10 w-10" />}
              title="No orders to bill"
              description="Completed orders will appear here for billing"
            />
          ) : (
            <div className="grid gap-3">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className={`cursor-pointer border-border transition-all hover:border-primary ${
                    selectedOrder?.id === order.id ? 'border-primary ring-1 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{order.id}</span>
                          <Badge
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            className={order.status === 'completed' ? 'bg-chart-3' : ''}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Table {order.tableNumber} • {order.customerName || 'Walk-in'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} items
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bill Preview */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          {selectedOrder ? (
            <Card className="border-border" ref={billRef}>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Coffee className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-2 text-xl">CafeFlow</CardTitle>
                <p className="text-sm text-muted-foreground">123 Coffee Street, City</p>
                <p className="text-sm text-muted-foreground">Tel: (555) 123-4567</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Order ID:</p>
                    <p className="font-medium">{selectedOrder.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Date:</p>
                    <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Table:</p>
                    <p className="font-medium">{selectedOrder.tableNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Customer:</p>
                    <p className="font-medium">{selectedOrder.customerName || 'Walk-in'}</p>
                  </div>
                </div>
                <Separator />

                {/* Items */}
                <div>
                  <h4 className="mb-3 font-semibold">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex gap-2">
                          <span className="w-6 text-muted-foreground">{item.quantity}x</span>
                          <span>{item.menuItem.name}</span>
                        </div>
                        <span className="font-medium">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  <p>Thank you for visiting CafeFlow!</p>
                  <p>Please come again</p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border pt-4">
                <Button className="w-full" size="lg" onClick={handlePrintBill}>
                  <Printer className="mr-2 h-5 w-5" />
                  Print Bill
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Receipt className="h-16 w-16 text-muted-foreground/50" />
                <p className="mt-4 font-medium text-muted-foreground">Select an order</p>
                <p className="text-sm text-muted-foreground">
                  Click on an order to preview the bill
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
