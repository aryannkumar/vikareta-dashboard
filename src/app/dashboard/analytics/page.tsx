'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
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
  Activity,
  RefreshCw,
  Filter,
  Share,
  Target,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { apiClient } from '@/lib/api/client';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  topCategories: Array<{
    name: string;
    revenue: number;
    percentage: number;
    color: string;
  }>;
}

interface RealtimeMetrics {
  activeUsers: number;
  currentOrders: number;
  todayRevenue: number;
  conversionRate: number;
  cartAbandonment: number;
  averageSessionDuration: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load analytics data with real-time updates
  const loadAnalyticsData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        period: selectedPeriod
      });

      const [analyticsResponse, realtimeResponse] = await Promise.all([
        apiClient.get(`/analytics/dashboard?${params}`),
        apiClient.get('/analytics/realtime')
      ]);

      if (analyticsResponse.success) {
        setAnalyticsData(analyticsResponse.data as AnalyticsData);
      }

      if (realtimeResponse.success) {
        setRealtimeMetrics(realtimeResponse.data as RealtimeMetrics);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  // Real-time WebSocket updates
  useEffect(() => {
    const handleAnalyticsUpdate = (data: any) => {
      if (data.type === 'realtime_metrics') {
        setRealtimeMetrics(data.metrics);
      } else if (data.type === 'analytics_update') {
        loadAnalyticsData();
      }
    };

    apiClient.onWebSocketEvent('analytics_update', handleAnalyticsUpdate);
    
    return () => {
      // Cleanup WebSocket listeners
    };
  }, [loadAnalyticsData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (selectedTab === 'realtime') {
        loadAnalyticsData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedTab, loadAnalyticsData]);

  // Initial load
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Export analytics data
  const handleExport = useCallback(async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        format,
        period: selectedPeriod,
        tab: selectedTab
      });

      const response = await apiClient.get(`/analytics/export?${params}`, {
        responseType: 'blob'
      });

      if (response.success) {
        const blob = new Blob([response.data as BlobPart]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${selectedTab}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Analytics data exported successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        variant: "destructive"
      });
    }
  }, [selectedPeriod, selectedTab]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`} />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Bar */}
      {realtimeMetrics && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Active Users</div>
                <div className="text-lg font-bold text-blue-600">{realtimeMetrics.activeUsers}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Current Orders</div>
                <div className="text-lg font-bold text-green-600">{realtimeMetrics.currentOrders}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Today Revenue</div>
                <div className="text-lg font-bold text-purple-600">{formatCurrency(realtimeMetrics.todayRevenue)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Conversion Rate</div>
                <div className="text-lg font-bold text-orange-600">{realtimeMetrics.conversionRate.toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Cart Abandonment</div>
                <div className="text-lg font-bold text-red-600">{realtimeMetrics.cartAbandonment.toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Avg Session</div>
                <div className="text-lg font-bold text-indigo-600">{Math.round(realtimeMetrics.averageSessionDuration / 60)}m</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Content */}
      {analyticsData && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                    <div className={`flex items-center gap-1 text-sm ${getGrowthColor(analyticsData.overview.revenueGrowth)}`}>
                      {getGrowthIcon(analyticsData.overview.revenueGrowth)}
                      {formatPercentage(analyticsData.overview.revenueGrowth)}
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{analyticsData.overview.totalOrders.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-sm ${getGrowthColor(analyticsData.overview.ordersGrowth)}`}>
                      {getGrowthIcon(analyticsData.overview.ordersGrowth)}
                      {formatPercentage(analyticsData.overview.ordersGrowth)}
                    </div>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold">{analyticsData.overview.totalCustomers.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-sm ${getGrowthColor(analyticsData.overview.customersGrowth)}`}>
                      {getGrowthIcon(analyticsData.overview.customersGrowth)}
                      {formatPercentage(analyticsData.overview.customersGrowth)}
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.averageOrderValue)}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      {analyticsData.overview.conversionRate.toFixed(1)}% conversion
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Revenue, orders, and customer acquisition over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}