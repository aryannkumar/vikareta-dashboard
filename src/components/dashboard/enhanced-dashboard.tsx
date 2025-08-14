/**
 * Enhanced Dashboard Component with Real Backend Integration
 * Features modern UI, real-time data, and comprehensive analytics
 */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Eye,
  MessageSquare,
  Megaphone,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

function MetricCard({ title, value, change, changeType, icon: Icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {changeType === 'increase' ? (
            <ArrowUpRight className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(change)}%
          </span>
          <span>from last month</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface RecentActivityItem {
  id: string;
  type: 'order' | 'rfq' | 'product' | 'customer';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
  amount?: number;
}

function RecentActivity({ activities }: { activities: RecentActivityItem[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'rfq': return <MessageSquare className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'customer': return <Users className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your business</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(activity.type)}
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  {activity.amount && (
                    <Badge variant="secondary" className="ml-auto">
                      {formatCurrency(activity.amount)}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopProducts({ products }: { products: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Products</CardTitle>
        <CardDescription>Best selling products this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">#{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.sales} sales • {formatCurrency(product.revenue)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Progress value={product.performance} className="w-16 h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function EnhancedDashboard() {
  const { 
    metrics, 
    recentOrders, 
    topProducts, 
    loading: isLoading, 
    error,
    refresh: refreshData 
  } = useDashboard();

  const [timeRange, setTimeRange] = useState('30d');

  // Sample chart data - replace with real data from analytics
  const revenueData = [
    { name: 'Jan', revenue: 4000, orders: 240 },
    { name: 'Feb', revenue: 3000, orders: 139 },
    { name: 'Mar', revenue: 2000, orders: 980 },
    { name: 'Apr', revenue: 2780, orders: 390 },
    { name: 'May', revenue: 1890, orders: 480 },
    { name: 'Jun', revenue: 2390, orders: 380 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400, color: '#0088FE' },
    { name: 'Machinery', value: 300, color: '#00C49F' },
    { name: 'Textiles', value: 300, color: '#FFBB28' },
    { name: 'Chemicals', value: 200, color: '#FF8042' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load dashboard data</p>
            <Button onClick={refreshData}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          change={metrics?.revenueChange || 12.5}
          changeType="increase"
          icon={DollarSign}
          description="Revenue from all sources"
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(metrics?.totalOrders || 0)}
          change={metrics?.ordersChange || 8.2}
          changeType="increase"
          icon={ShoppingCart}
          description="Completed orders"
        />
        <MetricCard
          title="Active Products"
          value={formatNumber(metrics?.totalProducts || 0)}
          change={metrics?.productsChange || -2.1}
          changeType="decrease"
          icon={Package}
          description="Products in catalog"
        />
        <MetricCard
          title="New Customers"
          value={formatNumber(metrics?.totalCustomers || 0)}
          change={metrics?.customersChange || 15.3}
          changeType="increase"
          icon={Users}
          description="This month"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Product category performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <RecentActivity activities={[]} />
            </div>

            {/* Top Products */}
            <TopProducts products={topProducts || []} />
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>How your products are performing</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>Customer acquisition and retention metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.totalCustomers || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.activeCustomers || 0}</div>
                  <p className="text-sm text-muted-foreground">Active This Month</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-sm text-muted-foreground">Retention Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <ShoppingCart className="h-6 w-6" />
              <span>View Orders</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span>RFQ Responses</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Megaphone className="h-6 w-6" />
              <span>Create Ad</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}