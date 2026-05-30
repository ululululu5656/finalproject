'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Coffee, Leaf, Cookie, GlassWater, Cake } from 'lucide-react';
import type { MenuItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MenuCardsProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string) => void;
}

const categoryIcons: Record<MenuItem['category'], React.ElementType> = {
  Coffee: Coffee,
  Tea: Leaf,
  Snacks: Cookie,
  Drinks: GlassWater,
  Desserts: Cake,
};

const categoryColors: Record<MenuItem['category'], string> = {
  Coffee: 'bg-amber-100 text-amber-700',
  Tea: 'bg-green-100 text-green-700',
  Snacks: 'bg-orange-100 text-orange-700',
  Drinks: 'bg-blue-100 text-blue-700',
  Desserts: 'bg-pink-100 text-pink-700',
};

export function MenuCards({ items, onEdit, onDelete, onToggleAvailability }: MenuCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = categoryIcons[item.category];
        return (
          <Card
            key={item.id}
            className={cn(
              'border-border transition-shadow hover:shadow-md',
              !item.available && 'opacity-60'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', categoryColors[item.category])}>
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant={item.available ? 'default' : 'secondary'}>
                  {item.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.description || 'No description'}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="secondary" className={categoryColors[item.category]}>
                  {item.category}
                </Badge>
                <span className="text-lg font-bold text-foreground">${item.price.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border p-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.available}
                  onCheckedChange={() => onToggleAvailability(item.id)}
                />
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
