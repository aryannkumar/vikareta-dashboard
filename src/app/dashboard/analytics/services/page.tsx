'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Settings,
  TrendingUp,
  Star,
  Calendar,
  DollarSign,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ServiceAnalytics {
  summary: {
    totalServices: number;
    activeServices: number;
    inactiveServices: number;
    totalBookings: number;
    totalRevenue: number;
    averagePrice: number;
  };
  servicePerformance: {
    completionRate: number;
    customerSatisfaction: number;
    averageRating: number;
  };
  topServices: Array<{
    id: string;
    title: string;
    bookings: number;
    revenue: number;
    rating: number;
  }>;
  servicesByCategory: Array<{
    category: string;
    count: number;
    bookings: number;
    revenue: number;
  }>;
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
}

export default function ServiceAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<ServiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/analytics/services?timeframe=${timeframe}`);
      setAnalytics(response.data as ServiceAnalytics);
    } catch (error) {
      console.error('Error loading service analytics:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Service Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into service performance and customer satisfaction</p>
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
          title="Total Services"
          value={formatNumber(analytics?.summary.totalServices || 0)}
          description={`${analytics?.summary.activeServices || 0} active`}
          icon={Settings}
          color="blue"
        />
        <StatCard
          title="Total Bookings"
          value={formatNumber(analytics?.summary.totalBookings || 0)}
          description="Service bookings"
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics?.summary.totalRevenue || 0)}
          description="From service bookings"
          icon={DollarSign}
          color="orange"
        />
        <StatCard
          title="Average Rating"
          value={`${analytics?.servicePerformance.averageRating || 0}/5`}
          description="Customer satisfaction"
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
            <CardDescription>Services completed on time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analytics?.servicePerformance.completionRate || 0}%
            </div>
            <Progress value={analytics?.servicePerformance.completionRate || 0} className="mb-2" />
            <p className="text-sm text-gray-600">
              Target: 95% | Current: {analytics?.servicePerformance.completionRate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction</CardTitle>
            <CardDescription>Overall customer happiness score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analytics?.servicePerformance.customerSatisfaction || 0}%
            </div>
            <Progress value={analytics?.servicePerformance.customerSatisfaction || 0} className="mb-2" />
            <p className="text-sm text-gray-600">
              Based on post-service surveys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
            <CardDescription>Star rating across all services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-3xl font-bold text-yellow-600">
                {analytics?.servicePerformance.averageRating || 0}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (analytics?.servicePerformance.averageRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Top Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Booking Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Services</CardTitle>
              <CardDescription>Services with highest bookings and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topServices.map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{service.title}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{service.rating}</span>
                          <span>•</span>
                          <span>{service.bookings} bookings</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(service.revenue)}</div>
                      <div className="text-sm text-gray-600">Total revenue</div>
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
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Performance breakdown by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.servicesByCategory.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-gray-600">
                        {category.count} services • {category.bookings} bookings
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(category.revenue)}</div>
                      <div className="text-sm text-gray-600">
                        {((category.revenue / (analytics?.summary.totalRevenue || 1)) * 100).toFixed(1)}% of total revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Service booking patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.bookingTrends.map((trend) => (
                  <div key={trend.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{trend.date}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{trend.bookings} bookings</div>
                      <div className="text-sm text-green-600">{formatCurrency(trend.revenue)} revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Services</span>
                  <Badge variant="secondary">
                    {analytics?.summary.activeServices || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Inactive Services</span>
                  <Badge variant="secondary">
                    {analytics?.summary.inactiveServices || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Price</span>
                  <Badge variant="secondary">
                    {formatCurrency(analytics?.summary.averagePrice || 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Bookings</span>
                  <Badge variant="secondary">
                    {analytics?.summary.totalBookings || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <Badge variant="secondary">
                    {analytics?.servicePerformance.completionRate || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Rating</span>
                  <Badge variant="secondary">
                    {analytics?.servicePerformance.averageRating || 0}/5
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <Badge variant="secondary">
                    {analytics?.servicePerformance.customerSatisfaction || 0}%
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