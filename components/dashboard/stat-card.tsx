'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatCard({ title, value, description, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-chart-3/10 text-chart-3',
    warning: 'bg-chart-4/10 text-chart-4',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <Card className="border-border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-chart-3' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}% from yesterday
              </p>
            )}
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', variantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
