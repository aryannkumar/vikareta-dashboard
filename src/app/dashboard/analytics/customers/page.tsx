'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  UserPlus,
  Heart,
  Calendar,
  Download,
  RefreshCw,
  Star,
  MapPin
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerGrowth: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  retentionRate: number;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    company?: string;
    totalSpent: number;
    orders: number;
    lastOrder: string;
    averageOrderValue: number;
    loyaltyScore: number;
    segment: string;
  }>;
  customerSegments: Array<{
    segment: string;
    customers: number;
    percentage: number;
    revenue: number;
    averageOrderValue: number;
    retentionRate: number;
  }>;
  acquisitionChannels: Array<{
    channel: string;
    customers: number;
    percentage: number;
    cost: number;
    revenue: number;
    roi: number;
  }>;
  geographicDistribution: Array<{
    region: string;
    customers: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  customerActivity: Array<{
    period: string;
    newCustomers: number;
    returningCustomers: number;
    churnedCustomers: number;
    revenue: number;
  }>;
  cohortAnalysis: Array<{
    cohort: string;
    customers: number;
    retentionRates: number[];
  }>;
}

export default function CustomerAnalyticsPage() {
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadCustomerAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getCustomerAnalytics({
        dateRange,
        segmentId: segmentFilter !== 'all' ? segmentFilter : undefined,
        includeSegmentation: true
      });

      if (response.success && response.data) {
        setMetrics(response.data as CustomerMetrics);
      } else {
        // Fallback data for development
        setMetrics({
          totalCustomers: 1247,
          activeCustomers: 892,
          newCustomers: 156,
          returningCustomers: 736,
          customerGrowth: 12.5,
          totalRevenue: 485000,
          averageOrderValue: 389.50,
          customerLifetimeValue: 1250.00,
          retentionRate: 68.5,
          topCustomers: [
            {
              id: '1',
              name: 'ABC Manufacturing Corp',
              email: 'orders@abc-mfg.com',
              company: 'ABC Manufacturing',
              totalSpent: 85000,
              orders: 24,
              lastOrder: '2024-01-15',
              averageOrderValue: 3541.67,
              loyaltyScore: 95,
              segment: 'Enterprise'
            },
            {
              id: '2',
              name: 'XYZ Industries Ltd',
              email: 'procurement@xyz.com',
              company: 'XYZ Industries',
              totalSpent: 62000,
              orders: 18,
              lastOrder: '2024-01-14',
              averageOrderValue: 3444.44,
              loyaltyScore: 88,
              segment: 'Enterprise'
            },
            {
              id: '3',
              name: 'Global Solutions Inc',
              email: 'buying@global.com',
              company: 'Global Solutions',
              totalSpent: 45000,
              orders: 32,
              lastOrder: '2024-01-16',
              averageOrderValue: 1406.25,
              loyaltyScore: 82,
              segment: 'Premium'
            }
          ],
          customerSegments: [
            {
              segment: 'Enterprise',
              customers: 45,
              percentage: 3.6,
              revenue: 185000,
              averageOrderValue: 4111.11,
              retentionRate: 89.5
            },
            {
              segment: 'Premium',
              customers: 125,
              percentage: 10.0,
              revenue: 145000,
              averageOrderValue: 1160.00,
              retentionRate: 75.2
            },
            {
              segment: 'Standard',
              customers: 678,
              percentage: 54.4,
              revenue: 125000,
              averageOrderValue: 184.36,
              retentionRate: 65.8
            },
            {
              segment: 'Basic',
              customers: 399,
              percentage: 32.0,
              revenue: 30000,
              averageOrderValue: 75.19,
              retentionRate: 45.2
            }
          ],
          acquisitionChannels: [
            {
              channel: 'Organic Search',
              customers: 425,
              percentage: 34.1,
              cost: 12000,
              revenue: 165000,
              roi: 1275.0
            },
            {
              channel: 'Referrals',
              customers: 312,
              percentage: 25.0,
              cost: 8500,
              revenue: 125000,
              roi: 1370.6
            },
            {
              channel: 'Social Media',
              customers: 285,
              percentage: 22.9,
              cost: 15000,
              revenue: 95000,
              roi: 533.3
            },
            {
              channel: 'Paid Ads',
              customers: 225,
              percentage: 18.0,
              cost: 25000,
              revenue: 100000,
              roi: 300.0
            }
          ],
          geographicDistribution: [
            {
              region: 'North America',
              customers: 485,
              revenue: 195000,
              averageOrderValue: 402.06
            },
            {
              region: 'Europe',
              customers: 385,
              revenue: 165000,
              averageOrderValue: 428.57
            },
            {
              region: 'Asia Pacific',
              customers: 285,
              revenue: 95000,
              averageOrderValue: 333.33
            },
            {
              region: 'Others',
              customers: 92,
              revenue: 30000,
              averageOrderValue: 326.09
            }
          ],
          customerActivity: [
            {
              period: 'Week 1',
              newCustomers: 35,
              returningCustomers: 185,
              churnedCustomers: 12,
              revenue: 125000
            },
            {
              period: 'Week 2',
              newCustomers: 42,
              returningCustomers: 195,
              churnedCustomers: 8,
              revenue: 135000
            },
            {
              period: 'Week 3',
              newCustomers: 38,
              returningCustomers: 205,
              churnedCustomers: 15,
              revenue: 145000
            },
            {
              period: 'Week 4',
              newCustomers: 41,
              returningCustomers: 151,
              churnedCustomers: 18,
              revenue: 80000
            }
          ],
          cohortAnalysis: [
            {
              cohort: 'Jan 2024',
              customers: 125,
              retentionRates: [100, 85, 72, 65, 58, 52]
            },
            {
              cohort: 'Dec 2023',
              customers: 118,
              retentionRates: [100, 82, 68, 61, 55, 48]
            },
            {
              cohort: 'Nov 2023',
              customers: 142,
              retentionRates: [100, 88, 75, 68, 62, 58]
            }
          ]
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer analytics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, segmentFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCustomerAnalytics();
    setRefreshing(false);
  };

  const exportData = () => {
    console.log('Exporting customer analytics data...');
  };

  useEffect(() => {
    loadCustomerAnalytics();
  }, [loadCustomerAnalytics]);

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
            <Button onClick={loadCustomerAnalytics} variant="outline">
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
            <p className="text-gray-500">No customer data available</p>
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
          <h1 className="text-3xl font-bold">Customer Analytics</h1>
          <p className="text-gray-600">Customer insights, segmentation, and behavior analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
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
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalCustomers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">
                +{metrics.customerGrowth}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.customerLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">
              Average lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Customer retention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.activeCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.newCustomers} new this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="top-customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="top-customers">Top Customers</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="top-customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
              <CardDescription>Highest value customers and their performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{customer.email}</span>
                          {customer.company && (
                            <>
                              <span>•</span>
                              <span>{customer.company}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <Badge variant="secondary">{customer.segment}</Badge>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            <span>{customer.loyaltyScore}/100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(customer.totalSpent)}</p>
                      <div className="text-sm text-gray-600">
                        <p>{customer.orders} orders</p>
                        <p>AOV: {formatCurrency(customer.averageOrderValue)}</p>
                        <p>Last: {formatDate(customer.lastOrder)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Customer distribution and performance by segment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.customerSegments.map((segment, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{segment.segment}</h4>
                        <p className="text-sm text-gray-600">
                          {segment.customers} customers ({segment.percentage}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(segment.revenue)}</p>
                        <p className="text-sm text-gray-600">
                          AOV: {formatCurrency(segment.averageOrderValue)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Retention Rate</span>
                        <span className="font-medium">{segment.retentionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${segment.retentionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition Channels</CardTitle>
              <CardDescription>Performance and ROI of different acquisition channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.acquisitionChannels.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{channel.channel}</p>
                      <p className="text-sm text-gray-600">
                        {channel.customers} customers ({channel.percentage}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(channel.revenue)}</p>
                      <div className="text-sm text-gray-600">
                        <p>Cost: {formatCurrency(channel.cost)}</p>
                        <p className="text-green-600">ROI: {channel.roi}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Customer and revenue distribution by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.geographicDistribution.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{region.region}</p>
                        <p className="text-sm text-gray-600">{region.customers} customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(region.revenue)}</p>
                      <p className="text-sm text-gray-600">
                        AOV: {formatCurrency(region.averageOrderValue)}
                      </p>
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