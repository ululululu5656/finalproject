'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';
import { dailySales, topSellingItems, weeklyRevenue } from '@/lib/mock-data';
import { useOrderStore } from '@/lib/store';

const COLORS = ['oklch(0.55 0.18 250)', 'oklch(0.65 0.15 180)', 'oklch(0.55 0.18 145)', 'oklch(0.75 0.15 85)', 'oklch(0.55 0.22 25)'];

const categoryRevenue = [
  { name: 'Coffee', value: 3245 },
  { name: 'Tea', value: 1890 },
  { name: 'Snacks', value: 2456 },
  { name: 'Drinks', value: 1234 },
  { name: 'Desserts', value: 987 },
];

const hourlyData = [
  { hour: '8AM', orders: 12, revenue: 145 },
  { hour: '9AM', orders: 25, revenue: 312 },
  { hour: '10AM', orders: 38, revenue: 456 },
  { hour: '11AM', orders: 42, revenue: 523 },
  { hour: '12PM', orders: 55, revenue: 678 },
  { hour: '1PM', orders: 48, revenue: 589 },
  { hour: '2PM', orders: 35, revenue: 423 },
  { hour: '3PM', orders: 28, revenue: 345 },
  { hour: '4PM', orders: 32, revenue: 398 },
  { hour: '5PM', orders: 22, revenue: 267 },
];

export default function ReportsPage() {
  const orders = useOrderStore((state) => state.orders);
  
  const totalRevenue = dailySales.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = dailySales.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const formattedDailySales = dailySales.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }));

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">Comprehensive analytics for your cafe</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="7d">
              <SelectTrigger className="w-[160px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-chart-3">+12.5% from last week</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
                  <DollarSign className="h-6 w-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-sm text-chart-3">+8.2% from last week</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
                  <p className="text-sm text-chart-3">+5.1% from last week</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                  <TrendingUp className="h-6 w-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orders Today</p>
                  <p className="text-2xl font-bold">{dailySales[dailySales.length - 1].orders}</p>
                  <p className="text-sm text-destructive">-15% from yesterday</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/10">
                  <Calendar className="h-6 w-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="items">Top Items</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Trend */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formattedDailySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0 0)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: '1px solid oklch(0.91 0 0)', borderRadius: '8px' }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.18 250)" strokeWidth={2} fill="url(#revenueGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Category */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                  <CardDescription>Sales distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryRevenue}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {categoryRevenue.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: '1px solid oklch(0.91 0 0)', borderRadius: '8px' }}
                          formatter={(value: number) => [`$${value}`, 'Revenue']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Performance */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Hourly Performance</CardTitle>
                <CardDescription>Orders and revenue throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0 0)" vertical={false} />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 11 }} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid oklch(0.91 0 0)', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" name="Orders" fill="oklch(0.55 0.18 250)" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="oklch(0.65 0.15 180)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            {/* Daily Sales Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Daily Sales Report</CardTitle>
                <CardDescription>Detailed breakdown of daily performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg Order</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailySales.map((day, index) => {
                      const prevDay = dailySales[index - 1];
                      const trend = prevDay ? ((day.revenue - prevDay.revenue) / prevDay.revenue) * 100 : 0;
                      
                      return (
                        <TableRow key={day.date}>
                          <TableCell className="font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell>{day.orders}</TableCell>
                          <TableCell>${day.revenue.toFixed(2)}</TableCell>
                          <TableCell>${(day.revenue / day.orders).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={trend >= 0 ? 'default' : 'destructive'} className={trend >= 0 ? 'bg-chart-3' : ''}>
                              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Weekly Comparison */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Weekly Revenue Comparison</CardTitle>
                <CardDescription>Revenue trends week over week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0 0)" vertical={false} />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid oklch(0.91 0 0)', borderRadius: '8px' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="oklch(0.55 0.18 145)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            {/* Top Selling Items */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>Best performing menu items this period</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Quantity Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSellingItems.map((item, index) => {
                      const maxQty = topSellingItems[0].quantity;
                      const percentage = (item.quantity / maxQty) * 100;
                      
                      return (
                        <TableRow key={item.name}>
                          <TableCell>
                            <Badge variant={index < 3 ? 'default' : 'secondary'}>
                              #{index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.revenue.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Items Revenue Chart */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Top Items Revenue</CardTitle>
                <CardDescription>Revenue contribution by top items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSellingItems} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0 0)" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.45 0 0)', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid oklch(0.91 0 0)', borderRadius: '8px' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="oklch(0.55 0.18 250)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
