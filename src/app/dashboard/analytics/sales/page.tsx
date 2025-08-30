'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    orders: number;
  }>;
  salesByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  salesByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  salesByRegion: Array<{
    region: string;
    revenue: number;
    orders: number;
  }>;
}

export default function SalesAnalyticsPage() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const loadSalesAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getSalesAnalytics({
        dateRange,
        includeComparisons: true,
        includeBreakdowns: true
      });

      if (response.success && response.data) {
        setMetrics(response.data as SalesMetrics);
      } else {
        // Fallback data for development
        setMetrics({
          totalRevenue: 125000,
          totalOrders: 342,
          averageOrderValue: 365.50,
          conversionRate: 3.2,
          revenueGrowth: 12.5,
          ordersGrowth: 8.3,
          topProducts: [
            { id: '1', name: 'Industrial Pump Model X200', revenue: 25000, orders: 15, growth: 15.2 },
            { id: '2', name: 'Steel Pipes Bundle', revenue: 18500, orders: 23, growth: -2.1 },
            { id: '3', name: 'Electrical Components Kit', revenue: 16200, orders: 31, growth: 22.8 }
          ],
          topCustomers: [
            { id: '1', name: 'ABC Manufacturing', email: 'orders@abc-mfg.com', totalSpent: 45000, orders: 12 },
            { id: '2', name: 'XYZ Industries', email: 'procurement@xyz.com', totalSpent: 32000, orders: 8 },
            { id: '3', name: 'Global Solutions Ltd', email: 'buying@global.com', totalSpent: 28500, orders: 15 }
          ],
          salesByPeriod: [
            { period: 'Week 1', revenue: 28000, orders: 85, customers: 42 },
            { period: 'Week 2', revenue: 32000, orders: 92, customers: 48 },
            { period: 'Week 3', revenue: 35000, orders: 98, customers: 51 },
            { period: 'Week 4', revenue: 30000, orders: 67, customers: 39 }
          ],
          salesByCategory: [
            { category: 'Industrial Equipment', revenue: 45000, percentage: 36 },
            { category: 'Raw Materials', revenue: 35000, percentage: 28 },
            { category: 'Electronics', revenue: 25000, percentage: 20 },
            { category: 'Tools & Hardware', revenue: 20000, percentage: 16 }
          ],
          salesByRegion: [
            { region: 'North America', revenue: 52000, orders: 145 },
            { region: 'Europe', revenue: 38000, orders: 112 },
            { region: 'Asia Pacific', revenue: 25000, orders: 65 },
            { region: 'Others', revenue: 10000, orders: 20 }
          ]
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales analytics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSalesAnalytics();
    setRefreshing(false);
  };

  const exportData = () => {
    // Export functionality would be implemented here
    console.log('Exporting sales analytics data...');
  };

  useEffect(() => {
    loadSalesAnalytics();
  }, [loadSalesAnalytics]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadSalesAnalytics} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">No sales data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
          <p className="text-gray-600">Comprehensive sales performance insights and trends</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
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
          
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.revenueGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
              )}
              <span className={metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(metrics.revenueGrowth)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalOrders)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.ordersGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
              )}
              <span className={metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(metrics.ordersGrowth)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Visitor to customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
          <TabsTrigger value="regions">By Region</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Period */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Revenue and orders over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.salesByPeriod.map((period, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{period.period}</p>
                        <p className="text-sm text-gray-600">{period.orders} orders • {period.customers} customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(period.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.salesByCategory.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-gray-600">{category.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{formatCurrency(category.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products generating the highest revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      <div className="flex items-center">
                        {product.growth >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                        )}
                        <span className={`text-xs ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(product.growth)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Customers with highest total spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-sm text-gray-600">{customer.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Region</CardTitle>
              <CardDescription>Geographic distribution of sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.salesByRegion.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{region.region}</p>
                      <p className="text-sm text-gray-600">{region.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(region.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}