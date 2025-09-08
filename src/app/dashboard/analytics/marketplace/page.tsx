'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {trend && (
        <div className={`flex items-center text-xs mt-1 ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendingUp className={`h-3 w-3 mr-1 ${
            trend.isPositive ? '' : 'rotate-180'
          }`} />
          {Math.abs(trend.value)}% from last month
        </div>
      )}
    </CardContent>
  </Card>
);

export default function MarketplaceAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30d');
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [marketplaceStats, setMarketplaceStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketplaceAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from dashboard API
      const [statsResponse, marketplaceResponse, analyticsResponse] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/analytics/sales', { params: { dateRange: timeframe } }),
        apiClient.get('/analytics/dashboard', { params: { period: timeframe } })
      ]);

      if (statsResponse.success) {
        setPlatformStats(statsResponse.data);
      }

      if (marketplaceResponse.success) {
        setMarketplaceStats(marketplaceResponse.data);
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace analytics:', err);
      setError('Failed to load marketplace analytics');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchMarketplaceAnalytics();
  }, [fetchMarketplaceAnalytics]);

  const handleRefresh = () => {
    fetchMarketplaceAnalytics();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting marketplace analytics...');
  };

  const formatPrice = (price: number | null | undefined): string => {
    const safePrice = price || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(safePrice);
  };

  const formatNumber = (number: number | null | undefined): string => {
    const safeNumber = number || 0;
    return new Intl.NumberFormat('en-IN').format(safeNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !platformStats && !marketplaceStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of platform performance and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(platformStats?.totalRevenue || 0)}
          description="Platform revenue"
          icon={<DollarSign className="h-4 w-4 text-green-600" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(platformStats?.totalOrders || 0)}
          description="Completed orders"
          icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
        />
        <StatCard
          title="Active Users"
          value={formatNumber(platformStats?.activeUsers || 0)}
          description="Currently active"
          icon={<Users className="h-4 w-4 text-purple-600" />}
        />
        <StatCard
          title="Growth Rate"
          value={`${platformStats?.revenueChange || 0}%`}
          description="Monthly growth"
          icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
          trend={{ value: platformStats?.revenueChange || 0, isPositive: (platformStats?.revenueChange || 0) >= 0 }}
        />
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Key platform statistics and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(platformStats?.totalProducts || 0)}</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatNumber(platformStats?.totalServices || 0)}</div>
                <div className="text-sm text-gray-600">Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatNumber(platformStats?.totalSuppliers || 0)}</div>
                <div className="text-sm text-gray-600">Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatNumber(platformStats?.totalBuyers || 0)}</div>
                <div className="text-sm text-gray-600">Buyers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Reports
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Product Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Performance Metrics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Revenue and activity by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketplaceStats?.categories?.map((category: any, index: number) => (
                  <div key={category.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-600">
                        {category.productCount || 0} products • {category.serviceCount || 0} services
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatPrice(category.revenue || 0)}</div>
                      <div className="text-sm text-gray-600">
                        {category.orderCount || 0} orders • {(category.growth || 0) >= 0 ? '+' : ''}{category.growth || 0}% growth
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    No category data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketplaceStats?.trends?.daily?.slice(-7).map((day: any, index: number) => (
                    <div key={day.date || index} className="flex justify-between items-center">
                      <span className="text-sm">{day.date ? new Date(day.date).toLocaleDateString() : `Day ${index + 1}`}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(day.value || 0)}</div>
                        <div className="text-xs text-gray-600">{day.transactions || 0} transactions</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No daily trend data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketplaceStats?.trends?.weekly?.map((week: any, index: number) => (
                    <div key={week.week || index} className="flex justify-between items-center">
                      <span className="text-sm">{week.week || `Week ${index + 1}`}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(week.value || 0)}</div>
                        <div className="text-xs text-gray-600">{week.transactions || 0} transactions</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No weekly trend data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketplaceStats?.trends?.monthly?.map((month: any, index: number) => (
                    <div key={month.month || index} className="flex justify-between items-center">
                      <span className="text-sm">{month.month || `Month ${index + 1}`}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(month.value || 0)}</div>
                        <div className="text-xs text-gray-600">{month.transactions || 0} transactions</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No monthly trend data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top-performers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketplaceStats?.topPerformers?.categories?.map((category: any, index: number) => (
                    <div key={category.name || index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">#{index + 1}</Badge>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(category.revenue || 0)}</div>
                        <div className="text-xs text-green-600">+{category.growth || 0}%</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No category data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketplaceStats?.topPerformers?.products?.map((product: any, index: number) => (
                    <div key={product.name || index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">#{index + 1}</Badge>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(product.revenue || 0)}</div>
                        <div className="text-xs text-gray-600">{product.sales || 0} sales</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No product data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketplaceStats?.topPerformers?.services?.map((service: any, index: number) => (
                    <div key={service.name || index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">#{index + 1}</Badge>
                        <span className="text-sm font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(service.revenue || 0)}</div>
                        <div className="text-xs text-gray-600">{service.bookings || 0} bookings</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No service data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.usersByType?.map((userType: any, index: number) => (
                    <div key={userType.type || index} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{userType.type}</span>
                      <Badge variant="secondary">{formatNumber(userType.count || 0)}</Badge>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No user analytics data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.ordersByStatus?.map((status: any, index: number) => (
                    <div key={status.status || index} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{status.status}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(status.count || 0)}</div>
                        <div className="text-xs text-gray-600">{formatPrice(status.revenue || 0)}</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No order status data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}