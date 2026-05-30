'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useOrderStore, useMenuStore } from '@/lib/store';
import type { MenuItem } from '@/lib/types';
import { cn } from '@/lib/utils';

const categoryColors: Record<MenuItem['category'], string> = {
  Coffee: 'bg-amber-100 text-amber-800',
  Tea: 'bg-green-100 text-green-800',
  Snacks: 'bg-orange-100 text-orange-800',
  Drinks: 'bg-blue-100 text-blue-800',
  Desserts: 'bg-pink-100 text-pink-800',
};

export function NewOrderForm() {
  const menuItems = useMenuStore((state) => state.items);
  const { currentOrder, addToCurrentOrder, removeFromCurrentOrder, updateQuantity, clearCurrentOrder, submitOrder } = useOrderStore();
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuItem['category'] | 'all'>('all');

  const availableItems = menuItems.filter((item) => item.available);
  const filteredItems = selectedCategory === 'all' 
    ? availableItems 
    : availableItems.filter((item) => item.category === selectedCategory);

  const categories: Array<MenuItem['category'] | 'all'> = ['all', 'Coffee', 'Tea', 'Snacks', 'Drinks', 'Desserts'];

  const total = currentOrder.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const handleAddItem = (item: MenuItem) => {
    addToCurrentOrder(item, 1);
    toast.success(`Added ${item.name} to order`);
  };

  const handleSubmitOrder = async () => {
    if (!tableNumber) {
      toast.error('Please enter a table number');
      return;
    }
    if (currentOrder.length === 0) {
      toast.error('Please add items to the order');
      return;
    }
    try {
      await submitOrder(tableNumber, customerName || undefined);
      setTableNumber('');
      setCustomerName('');
      toast.success('Order submitted successfully!');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Menu Items */}
      <div className="lg:col-span-2 space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All Items' : category}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer border-border transition-all hover:border-primary hover:shadow-md"
              onClick={() => handleAddItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <Badge variant="secondary" className={cn('text-xs', categoryColors[item.category])}>
                      {item.category}
                    </Badge>
                  </div>
                  <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Cart */}
      <div className="lg:sticky lg:top-20 lg:h-fit">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Order
              </CardTitle>
              {currentOrder.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCurrentOrder}>
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Info */}
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="tableNumber">Table Number *</Label>
                <Input
                  id="tableNumber"
                  placeholder="Enter table number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Optional"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            {currentOrder.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2">No items in order</p>
                <p className="text-sm">Click on menu items to add</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-3">
                  {currentOrder.map((orderItem) => (
                    <div key={orderItem.menuItem.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{orderItem.menuItem.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${orderItem.menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Decrease quantity"
                            onClick={() => {
                              if (orderItem.quantity > 1) {
                                updateQuantity(orderItem.menuItem.id, orderItem.quantity - 1);
                              } else {
                                removeFromCurrentOrder(orderItem.menuItem.id);
                              }
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{orderItem.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(orderItem.menuItem.id, orderItem.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label="Remove item"
                          onClick={() => removeFromCurrentOrder(orderItem.menuItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4 border-t border-border pt-4">
            <div className="flex w-full items-center justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmitOrder}
              disabled={currentOrder.length === 0 || !tableNumber}
            >
              Submit Order
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
