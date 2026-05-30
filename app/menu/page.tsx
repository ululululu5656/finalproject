'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, LayoutGrid, List, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MenuTable } from '@/components/menu/menu-table';
import { MenuCards } from '@/components/menu/menu-cards';
import { MenuItemDialog } from '@/components/menu/menu-item-dialog';
import { Empty } from '@/components/ui/empty';
import { useMenuStore, useAuthStore } from '@/lib/store';
import type { MenuItem } from '@/lib/types';

type ViewMode = 'table' | 'cards';
type CategoryFilter = 'all' | MenuItem['category'];

export default function MenuPage() {
  const { items, addItem, updateItem, deleteItem, toggleAvailability } = useMenuStore();
  const user = useAuthStore((state) => state.user);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const isAdmin = user?.role === 'admin';

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  const handleSave = (itemData: Omit<MenuItem, 'id'>) => {
    if (editingItem) {
      updateItem(editingItem.id, itemData);
      toast.success('Menu item updated successfully');
    } else {
      addItem(itemData);
      toast.success('Menu item added successfully');
    }
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    toast.success('Menu item deleted');
  };

  const handleToggleAvailability = (id: string) => {
    toggleAvailability(id);
    const item = items.find(i => i.id === id);
    toast.success(`${item?.name} is now ${item?.available ? 'unavailable' : 'available'}`);
  };

  const handleNewItem = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout title="Menu Management">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Coffee">Coffee</SelectItem>
                <SelectItem value="Tea">Tea</SelectItem>
                <SelectItem value="Snacks">Snacks</SelectItem>
                <SelectItem value="Drinks">Drinks</SelectItem>
                <SelectItem value="Desserts">Desserts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border p-1">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            {isAdmin && (
              <Button onClick={handleNewItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <Empty
            icon={<Search className="h-10 w-10" />}
            title="No menu items found"
            description={searchQuery || categoryFilter !== 'all' 
              ? "Try adjusting your search or filter" 
              : "Get started by adding your first menu item"}
            action={isAdmin ? (
              <Button onClick={handleNewItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            ) : undefined}
          />
        ) : viewMode === 'table' ? (
          <MenuTable
            items={filteredItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleAvailability={handleToggleAvailability}
          />
        ) : (
          <MenuCards
            items={filteredItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleAvailability={handleToggleAvailability}
          />
        )}
      </div>

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
