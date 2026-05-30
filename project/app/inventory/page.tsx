'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Package, AlertTriangle, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Empty } from '@/components/ui/empty';
import { useInventoryStore, useAuthStore } from '@/lib/store';
import type { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
  const { items, addItem, updateItem, deleteItem } = useInventoryStore();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: '',
    lowStockThreshold: 0,
    category: '',
  });

  const isAdmin = user?.role === 'admin';

  const categories = useMemo(() => {
    return ['all', ...new Set(items.map((item) => item.category))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  const lowStockCount = items.filter(
    (item) => item.quantity <= item.lowStockThreshold
  ).length;

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        lowStockThreshold: item.lowStockThreshold,
        category: item.category,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        quantity: 0,
        unit: '',
        lowStockThreshold: 0,
        category: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.unit || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingItem) {
      updateItem(editingItem.id, formData);
      toast.success('Inventory item updated');
    } else {
      addItem(formData);
      toast.success('Inventory item added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    toast.success('Inventory item deleted');
  };

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.quantity / (item.lowStockThreshold * 3)) * 100;
    if (item.quantity <= item.lowStockThreshold) {
      return { status: 'Low Stock', color: 'destructive' as const, percentage: Math.min(percentage, 100) };
    }
    if (item.quantity <= item.lowStockThreshold * 1.5) {
      return { status: 'Warning', color: 'secondary' as const, percentage: Math.min(percentage, 100) };
    }
    return { status: 'In Stock', color: 'default' as const, percentage: Math.min(percentage, 100) };
  };

  return (
    <DashboardLayout title="Inventory Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                  <Package className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                  <p className="text-2xl font-bold">{items.length - lowStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn('border-border', lowStockCount > 0 && 'border-destructive/50')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-destructive">{lowStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isAdmin && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>

        {/* Table */}
        {filteredItems.length === 0 ? (
          <Empty
            icon={<Package className="h-10 w-10" />}
            title="No inventory items found"
            description={searchQuery || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding inventory items'}
            action={isAdmin ? (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            ) : undefined}
          />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const stock = getStockStatus(item);
                  const isLowStock = item.quantity <= item.lowStockThreshold;

                  return (
                    <TableRow key={item.id} className={cn(isLowStock && 'bg-destructive/5')}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(isLowStock && 'text-destructive font-medium')}>
                          {item.quantity} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="space-y-1">
                          <Progress
                            value={stock.percentage}
                            className={cn(
                              'h-2',
                              isLowStock && '[&>div]:bg-destructive'
                            )}
                          />
                          <p className="text-xs text-muted-foreground">
                            Threshold: {item.lowStockThreshold} {item.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stock.color}>
                          {isLowStock && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {stock.status}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the inventory item details.' : 'Add a new item to your inventory.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Coffee Beans"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., kg, L, pcs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="threshold">Low Stock Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Coffee, Dairy"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
