'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Eye, 
  Users,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { apiClient } from '@/lib/api/client';
import { Loading } from '@/components/ui/loading';

interface RevenueData {
  period: string;
  totalRevenue: number;
  growthRate: number;
  chartData: Array<{
    date: string;
    revenue: number;
  }>;
  summary: {
    currentPeriod: number;
    previousPeriod: number;
    change: number;
  };
}

interface ProductPerformance {
  products: Array<{
    id: string;
    name: string;
    image: string | null;
    price: number;
    revenue: number;
    orders: number;
    views: number;
    conversionRate: number;
    stock: number;
    category: string;
  }>;
  summary: {
    totalProducts: number;
    totalRevenue: number;
    totalOrders: number;
    averageConversion: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenueResponse, performanceResponse] = await Promise.all([
        apiClient.get(`/analytics/revenue?period=${selectedPeriod}`),
        apiClient.get('/analytics/products/performance?limit=10')
      ]);

      if (revenueResponse.success && revenueResponse.data) {
        setRevenueData(revenueResponse.data as RevenueData);
      } else {
        // Set default revenue data if API fails
        setRevenueData({
          period: selectedPeriod,
          totalRevenue: 0,
          growthRate: 0,
          chartData: [],
          summary: {
            currentPeriod: 0,
            previousPeriod: 0,
            change: 0
          }
        });
      }

      if (performanceResponse.success && performanceResponse.data) {
        setProductPerformance(performanceResponse.data as ProductPerformance);
      } else {
        // Set default performance data if API fails
        setProductPerformance({
          products: [],
          summary: {
            totalProducts: 0,
            totalRevenue: 0,
            totalOrders: 0,
            averageConversion: 0
          }
        });
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number | undefined | null) => {
    const safeValue = value || 0;
    return `${safeValue >= 0 ? '+' : ''}${safeValue.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Unavailable</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadAnalyticsData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      {revenueData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(revenueData.totalRevenue || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {(revenueData.growthRate || 0) >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={(revenueData.growthRate || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(revenueData.growthRate)}
                </span>
                <span className="ml-1">from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productPerformance?.summary.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total completed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productPerformance?.summary.totalProducts || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(productPerformance?.summary.averageConversion || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Product conversion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          {revenueData && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Revenue over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {productPerformance && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>
                  Products ranked by revenue performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance.products.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{formatCurrency(product.revenue)}</p>
                          <p className="text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{product.orders}</p>
                          <p className="text-muted-foreground">Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{product.views}</p>
                          <p className="text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={(product.conversionRate || 0) > 5 ? 'default' : 'secondary'}>
                            {(product.conversionRate || 0).toFixed(1)}%
                          </Badge>
                          <p className="text-muted-foreground">Conversion</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {productPerformance && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Distribution</CardTitle>
                    <CardDescription>
                      Revenue by top products
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={productPerformance.products.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {productPerformance.products.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Volume</CardTitle>
                    <CardDescription>
                      Orders by product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={productPerformance.products.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}