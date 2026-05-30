'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useInventoryStore } from '@/lib/store';

export function LowStockAlerts() {
  const items = useInventoryStore((state) => state.items);
  const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Low Stock Alerts
        </CardTitle>
        <CardDescription>Items that need restocking</CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
              <AlertTriangle className="h-6 w-6 text-chart-3" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">All stocked up!</p>
            <p className="text-sm text-muted-foreground">No items are running low</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <Badge variant="destructive">
                  {item.quantity} {item.unit}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
