'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReportsStore } from '@/lib/store';
import { TrendingUp } from 'lucide-react';

export function PopularItems() {
  const data = useReportsStore((state) => state.data);
  const topItems = data?.topItems ?? [];
  const maxQuantity = Math.max(1, ...topItems.map((item) => item.quantity));

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-chart-3" />
          Popular Items
        </CardTitle>
        <CardDescription>Top selling items this week</CardDescription>
      </CardHeader>
      <CardContent>
        {topItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No sales data yet</p>
        ) : (
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{item.quantity} sold</p>
                    <p className="text-xs text-muted-foreground">${item.revenue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(item.quantity / maxQuantity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
