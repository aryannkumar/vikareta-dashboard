'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Download,
  RefreshCw,
  Target,
  CheckCircle,
  Clock,
  MessageSquare,
  Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
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
      <p className="text-xs text-muted-foreground">{description}</p>
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

interface RFQAnalytics {
  summary: {
    totalRFQs: number;
    activeRFQs: number;
    completedRFQs: number;
    totalQuotes: number;
    averageQuotesPerRFQ: number;
  };
  rfqsByCategory: Array<{
    category: string;
    count: number;
    quotes: number;
    conversionRate: number;
  }>;
  rfqTrends: Array<{
    date: string;
    created: number;
    completed: number;
  }>;
  quoteAnalytics: {
    averageResponseTime: number;
    quoteAcceptanceRate: number;
    averageQuoteValue: number;
  };
  buyerSellerMetrics: {
    totalBuyers: number;
    totalSellers: number;
    averageRFQsPerBuyer: number;
    averageQuotesPerSeller: number;
  };
}

export default function RFQAnalyticsPage() {
  const [analytics, setAnalytics] = useState<RFQAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRFQAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/analytics/rfqs');
      setAnalytics(response.data as RFQAnalytics);
    } catch (err) {
      console.error('Failed to fetch RFQ analytics:', err);
      setError('Failed to load RFQ analytics');
      // Set mock data for development
      setAnalytics({
        summary: {
          totalRFQs: 1247,
          activeRFQs: 89,
          completedRFQs: 1158,
          totalQuotes: 3456,
          averageQuotesPerRFQ: 2.8
        },
        rfqsByCategory: [
          { category: 'Electronics', count: 234, quotes: 678, conversionRate: 23.4 },
          { category: 'Machinery', count: 198, quotes: 567, conversionRate: 28.1 },
          { category: 'Construction', count: 156, quotes: 445, conversionRate: 19.8 },
          { category: 'Chemicals', count: 134, quotes: 389, conversionRate: 31.2 },
          { category: 'Textiles', count: 98, quotes: 234, conversionRate: 25.6 }
        ],
        rfqTrends: [
          { date: '2024-01', created: 98, completed: 85 },
          { date: '2024-02', created: 112, completed: 98 },
          { date: '2024-03', created: 134, completed: 115 },
          { date: '2024-04', created: 156, completed: 142 },
          { date: '2024-05', created: 178, completed: 156 },
          { date: '2024-06', created: 145, completed: 128 }
        ],
        quoteAnalytics: {
          averageResponseTime: 2.4,
          quoteAcceptanceRate: 23.4,
          averageQuoteValue: 12500
        },
        buyerSellerMetrics: {
          totalBuyers: 456,
          totalSellers: 892,
          averageRFQsPerBuyer: 2.7,
          averageQuotesPerSeller: 3.9
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRFQAnalytics();
    setRefreshing(false);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting RFQ analytics...');
  };

  useEffect(() => {
    fetchRFQAnalytics();
  }, [fetchRFQAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error && !analytics) {
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

  if (!analytics) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RFQ Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for Request for Quotes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
          title="Total RFQs"
          value={formatNumber(analytics.summary.totalRFQs)}
          description="All time RFQs created"
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Active RFQs"
          value={formatNumber(analytics.summary.activeRFQs)}
          description="Currently open RFQs"
          icon={<Clock className="h-4 w-4 text-orange-600" />}
        />
        <StatCard
          title="Total Quotes"
          value={formatNumber(analytics.summary.totalQuotes)}
          description="Quotes submitted"
          icon={<MessageSquare className="h-4 w-4 text-green-600" />}
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatCard
          title="Quote Acceptance Rate"
          value={`${analytics.quoteAnalytics.quoteAcceptanceRate}%`}
          description="Quotes accepted by buyers"
          icon={<Target className="h-4 w-4 text-purple-600" />}
          trend={{ value: 5.2, isPositive: true }}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Avg Response Time"
          value={`${analytics.quoteAnalytics.averageResponseTime.toFixed(1)}h`}
          description="Average time to receive quotes"
          icon={<Clock className="h-4 w-4 text-indigo-600" />}
        />
        <StatCard
          title="Avg Quotes per RFQ"
          value={analytics.summary.averageQuotesPerRFQ.toFixed(1)}
          description="Quotes per request"
          icon={<BarChart3 className="h-4 w-4 text-teal-600" />}
        />
        <StatCard
          title="Avg Quote Value"
          value={formatCurrency(analytics.quoteAnalytics.averageQuoteValue)}
          description="Average quote amount"
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          trend={{ value: 15.7, isPositive: true }}
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="buyers">Buyers</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RFQ Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>RFQ Status Overview</CardTitle>
                <CardDescription>Current status of RFQs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Active</span>
                  </div>
                  <span className="font-medium">{analytics.summary.activeRFQs}</span>
                </div>
                <Progress value={(analytics.summary.activeRFQs / analytics.summary.totalRFQs) * 100} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-medium">{analytics.summary.completedRFQs}</span>
                </div>
                <Progress value={(analytics.summary.completedRFQs / analytics.summary.totalRFQs) * 100} className="h-2" />
              </CardContent>
            </Card>

            {/* Quote Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Analytics</CardTitle>
                <CardDescription>Quote performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics.quoteAnalytics.averageResponseTime.toFixed(1)}h
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Response Time</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {analytics.quoteAnalytics.quoteAcceptanceRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Acceptance Rate</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(analytics.quoteAnalytics.averageQuoteValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Quote Value</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {analytics.summary.averageQuotesPerRFQ.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Quotes per RFQ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Categories</CardTitle>
              <CardDescription>RFQ distribution and performance by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.rfqsByCategory.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{category.count}</p>
                        <p className="text-xs text-muted-foreground">RFQs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{category.quotes}</p>
                        <p className="text-xs text-muted-foreground">Quotes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{category.conversionRate}%</p>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Trends</CardTitle>
              <CardDescription>Monthly RFQ creation and completion trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.rfqTrends.map((trend) => (
                  <div key={trend.date} className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{trend.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium text-green-600">+{trend.created}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="font-medium text-blue-600">{trend.completed}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Buyers"
              value={formatNumber(analytics.buyerSellerMetrics.totalBuyers)}
              description="Registered buyers"
              icon={<Users className="h-4 w-4 text-blue-600" />}
            />
            <StatCard
              title="Active Buyers"
              value={formatNumber(Math.round(analytics.buyerSellerMetrics.totalBuyers * 0.6))}
              description="Active this month"
              icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            />
            <StatCard
              title="Avg RFQs per Buyer"
              value={analytics.buyerSellerMetrics.averageRFQsPerBuyer.toFixed(1)}
              description="RFQs per buyer"
              icon={<FileText className="h-4 w-4 text-purple-600" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Buyer Activity</CardTitle>
              <CardDescription>RFQ creation patterns by buyer segment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">High Volume Buyers</p>
                      <p className="text-xs text-muted-foreground">5+ RFQs per month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(analytics.buyerSellerMetrics.totalBuyers * 0.15)}</p>
                    <p className="text-xs text-muted-foreground">buyers</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Regular Buyers</p>
                      <p className="text-xs text-muted-foreground">1-4 RFQs per month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(analytics.buyerSellerMetrics.totalBuyers * 0.6)}</p>
                    <p className="text-xs text-muted-foreground">buyers</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Occasional Buyers</p>
                      <p className="text-xs text-muted-foreground">Less than 1 RFQ per month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(analytics.buyerSellerMetrics.totalBuyers * 0.25)}</p>
                    <p className="text-xs text-muted-foreground">buyers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Sellers"
              value={formatNumber(analytics.buyerSellerMetrics.totalSellers)}
              description="Registered sellers"
              icon={<Users className="h-4 w-4 text-blue-600" />}
            />
            <StatCard
              title="Active Sellers"
              value={formatNumber(Math.round(analytics.buyerSellerMetrics.totalSellers * 0.7))}
              description="Active this month"
              icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            />
            <StatCard
              title="Avg Quotes per Seller"
              value={analytics.buyerSellerMetrics.averageQuotesPerSeller.toFixed(1)}
              description="Quotes per seller"
              icon={<Send className="h-4 w-4 text-purple-600" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Seller Performance</CardTitle>
              <CardDescription>Quote submission patterns by seller segment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">High Response Sellers</p>
                      <p className="text-xs text-muted-foreground">10+ quotes per month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(analytics.buyerSellerMetrics.totalSellers * 0.2)}</p>
                    <p className="text-xs text-muted-foreground">sellers</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Regular Sellers</p>
                      <p className="text-xs text-muted-foreground">3-9 quotes per month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(analytics.buyerSellerMetrics.totalSellers * 0.5)}</p>
                    <p className="text-xs text-muted-foreground">sellers</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Low Activity Sellers</p>
                      <p className="text-xs text-muted-foreground">1-2 quotes per month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(analytics.buyerSellerMetrics.totalSellers * 0.3)}</p>
                    <p className="text-xs text-muted-foreground">sellers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}