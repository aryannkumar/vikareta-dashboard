'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  TrendingUp,
  Star,
  DollarSign,
  Award,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface BusinessMetrics {
  summary: {
    totalBusinesses: number;
    activeBusinesses: number;
    verifiedBusinesses: number;
    totalRevenue: number;
  };
  verificationStats: {
    verifiedPercentage: number;
    pendingVerification: number;
    rejectedVerification: number;
  };
  businessesByType: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
  businessGrowth: Array<{
    date: string;
    newBusinesses: number;
    activeBusinesses: number;
  }>;
  topBusinesses: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
    rating: number;
  }>;
}

export default function BusinessAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/analytics/businesses?timeframe=${timeframe}`);
      setAnalytics(response.data as BusinessMetrics);
    } catch (error) {
      console.error('Error loading business analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = 'blue'
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: any;
    trend?: { value: number; label: string };
    color?: string;
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className={`h-4 w-4 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-xs ml-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600 mt-1">Insights into business performance and marketplace activity</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Businesses"
          value={formatNumber(analytics?.summary.totalBusinesses || 0)}
          description={`${analytics?.summary.activeBusinesses || 0} active`}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Verified Businesses"
          value={formatNumber(analytics?.summary.verifiedBusinesses || 0)}
          description={`${analytics?.verificationStats.verifiedPercentage || 0}% verified`}
          icon={Award}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics?.summary.totalRevenue || 0)}
          description="From all businesses"
          icon={DollarSign}
          color="orange"
        />
        <StatCard
          title="Average Rating"
          value="4.6/5"
          description="Across all businesses"
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Verification Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Business verification breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {analytics?.summary.verifiedBusinesses || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {analytics?.verificationStats.pendingVerification || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {analytics?.verificationStats.rejectedVerification || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Types</CardTitle>
            <CardDescription>Distribution by business type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.businessesByType.map((type) => (
                <div key={type.type} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{type.type}</span>
                  <div className="text-right">
                    <Badge variant="secondary">{type.count}</Badge>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatCurrency(type.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
            <CardDescription>Business registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.businessGrowth.slice(-3).map((growth) => (
                <div key={growth.date} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{growth.date}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">
                      +{growth.newBusinesses}
                    </div>
                    <div className="text-xs text-gray-600">
                      {growth.activeBusinesses} active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="businesses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="businesses">Top Businesses</TabsTrigger>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Businesses</CardTitle>
              <CardDescription>Businesses with highest revenue and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topBusinesses.map((business, index) => (
                  <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{business.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{business.rating}</span>
                          <span>•</span>
                          <span>{business.orders} orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(business.revenue)}</div>
                      <div className="text-sm text-gray-600">Total revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Growth Trends</CardTitle>
              <CardDescription>New business registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.businessGrowth.map((growth) => (
                  <div key={growth.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{growth.date}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">+{growth.newBusinesses} new</div>
                      <div className="text-sm text-gray-600">{growth.activeBusinesses} total active</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Verification Rate</span>
                  <Badge variant="secondary">
                    {analytics?.verificationStats.verifiedPercentage || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Verified Businesses</span>
                  <Badge variant="secondary">
                    {analytics?.summary.verifiedBusinesses || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Verification</span>
                  <Badge variant="secondary">
                    {analytics?.verificationStats.pendingVerification || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rejected Applications</span>
                  <Badge variant="secondary">
                    {analytics?.verificationStats.rejectedVerification || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Businesses</span>
                  <Badge variant="secondary">
                    {analytics?.summary.activeBusinesses || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Inactive Businesses</span>
                  <Badge variant="secondary">
                    {(analytics?.summary.totalBusinesses || 0) - (analytics?.summary.activeBusinesses || 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Revenue</span>
                  <Badge variant="secondary">
                    {formatCurrency((analytics?.summary.totalRevenue || 0) / (analytics?.summary.totalBusinesses || 1))}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <Badge variant="secondary">
                    {formatCurrency(analytics?.summary.totalRevenue || 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}