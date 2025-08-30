'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  Star
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalRevenue: number;
  totalSold: number;
  averagePrice: number;
  topPerformers: Array<{
    id: string;
    name: string;
    category: string;
    revenue: number;
    unitsSold: number;
    views: number;
    conversionRate: number;
    rating: number;
    stock: number;
    growth: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    products: number;
    revenue: number;
    unitsSold: number;
    averagePrice: number;
    growth: number;
  }>;
  inventoryStatus: Array<{
    status: string;
    count: number;
    percentage: number;
    value: number;
  }>;
  salesTrend: Array<{
    period: string;
    revenue: number;
    unitsSold: number;
    averageOrderValue: number;
  }>;
  lowStockAlerts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minimumStock: number;
    category: string;
    lastSold: string;
  }>;
}

export default function ProductAnalyticsPage() {
  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadProductAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getProductAnalytics({
        dateRange,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        includeInventory: true
      });

      if (response.success && response.data) {
        setMetrics(response.data as ProductMetrics);
      } else {
        // Fallback data for development
        setMetrics({
          totalProducts: 156,
          activeProducts: 142,
          lowStockProducts: 8,
          outOfStockProducts: 6,
          totalRevenue: 285000,
          totalSold: 1247,
          averagePrice: 228.50,
          topPerformers: [
            {
              id: '1',
              name: 'Industrial Pump Model X200',
              category: 'Industrial Equipment',
              revenue: 45000,
              unitsSold: 25,
              views: 1250,
              conversionRate: 2.0,
              rating: 4.8,
              stock: 12,
              growth: 15.2
            },
            {
              id: '2',
              name: 'Steel Pipes Bundle (10m)',
              category: 'Raw Materials',
              revenue: 32000,
              unitsSold: 64,
              views: 890,
              conversionRate: 7.2,
              rating: 4.6,
              stock: 45,
              growth: -2.1
            },
            {
              id: '3',
              name: 'Electrical Components Kit',
              category: 'Electronics',
              revenue: 28500,
              unitsSold: 95,
              views: 1580,
              conversionRate: 6.0,
              rating: 4.7,
              stock: 23,
              growth: 22.8
            }
          ],
          categoryPerformance: [
            {
              category: 'Industrial Equipment',
              products: 45,
              revenue: 125000,
              unitsSold: 285,
              averagePrice: 438.60,
              growth: 12.5
            },
            {
              category: 'Raw Materials',
              products: 38,
              revenue: 85000,
              unitsSold: 425,
              averagePrice: 200.00,
              growth: 8.3
            },
            {
              category: 'Electronics',
              products: 42,
              revenue: 65000,
              unitsSold: 325,
              averagePrice: 200.00,
              growth: 18.7
            },
            {
              category: 'Tools & Hardware',
              products: 31,
              revenue: 35000,
              unitsSold: 212,
              averagePrice: 165.09,
              growth: -5.2
            }
          ],
          inventoryStatus: [
            { status: 'In Stock', count: 142, percentage: 91.0, value: 425000 },
            { status: 'Low Stock', count: 8, percentage: 5.1, value: 18500 },
            { status: 'Out of Stock', count: 6, percentage: 3.9, value: 0 }
          ],
          salesTrend: [
            { period: 'Week 1', revenue: 65000, unitsSold: 285, averageOrderValue: 228.07 },
            { period: 'Week 2', revenue: 72000, unitsSold: 315, averageOrderValue: 228.57 },
            { period: 'Week 3', revenue: 78000, unitsSold: 342, averageOrderValue: 228.07 },
            { period: 'Week 4', revenue: 70000, unitsSold: 305, averageOrderValue: 229.51 }
          ],
          lowStockAlerts: [
            {
              id: '1',
              name: 'Premium Steel Rods',
              currentStock: 3,
              minimumStock: 10,
              category: 'Raw Materials',
              lastSold: '2024-01-15'
            },
            {
              id: '2',
              name: 'Industrial Bearings Set',
              currentStock: 2,
              minimumStock: 8,
              category: 'Industrial Equipment',
              lastSold: '2024-01-14'
            }
          ]
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product analytics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, categoryFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProductAnalytics();
    setRefreshing(false);
  };

  const exportData = () => {
    console.log('Exporting product analytics data...');
  };

  useEffect(() => {
    loadProductAnalytics();
  }, [loadProductAnalytics]);

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
            <Button onClick={loadProductAnalytics} variant="outline">
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
            <p className="text-gray-500">No product data available</p>
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
          <h1 className="text-3xl font-bold">Product Analytics</h1>
          <p className="text-gray-600">Product performance insights and inventory analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="industrial">Industrial Equipment</SelectItem>
              <SelectItem value="materials">Raw Materials</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="tools">Tools & Hardware</SelectItem>
            </SelectContent>
          </Select>
          
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
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalProducts)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeProducts} active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {formatNumber(metrics.totalSold)} units sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averagePrice)}</div>
            <p className="text-xs text-muted-foreground">
              Per product average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.outOfStockProducts} out of stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Top Performers</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products with highest revenue and sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topPerformers.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{product.category}</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            <span>{product.rating}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>{formatNumber(product.views)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      <div className="flex items-center justify-end space-x-2 text-sm text-gray-600">
                        <span>{product.unitsSold} sold</span>
                        <span>•</span>
                        <span>{product.conversionRate}% conv.</span>
                        <span>•</span>
                        <span className={product.stock < 10 ? 'text-orange-600' : 'text-green-600'}>
                          {product.stock} in stock
                        </span>
                      </div>
                      <div className="flex items-center justify-end mt-1">
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

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Revenue and sales breakdown by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.categoryPerformance.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-gray-600">
                        {category.products} products • {category.unitsSold} units sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(category.revenue)}</p>
                      <p className="text-sm text-gray-600">
                        Avg: {formatCurrency(category.averagePrice)}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        {category.growth >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                        )}
                        <span className={`text-xs ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(category.growth)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status Distribution</CardTitle>
                <CardDescription>Current stock status across all products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.inventoryStatus.map((status, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{status.status}</span>
                        <span className="text-sm text-gray-600">{status.count} products</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            status.status === 'In Stock' ? 'bg-green-600' :
                            status.status === 'Low Stock' ? 'bg-orange-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{status.percentage}%</span>
                        <span>{formatCurrency(status.value)} value</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Product sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.salesTrend.map((period, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{period.period}</p>
                        <p className="text-sm text-gray-600">{period.unitsSold} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(period.revenue)}</p>
                        <p className="text-sm text-gray-600">
                          AOV: {formatCurrency(period.averageOrderValue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products that need immediate restocking attention</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.lowStockAlerts.length > 0 ? (
                <div className="space-y-4">
                  {metrics.lowStockAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium">{alert.name}</p>
                          <p className="text-sm text-gray-600">
                            {alert.category} • Last sold: {formatDate(alert.lastSold)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">
                          {alert.currentStock} / {alert.minimumStock}
                        </p>
                        <p className="text-sm text-gray-600">Current / Minimum</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No low stock alerts at the moment</p>
                  <p className="text-sm text-gray-400">All products are adequately stocked</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}