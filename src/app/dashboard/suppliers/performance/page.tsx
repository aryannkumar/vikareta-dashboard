'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Clock, 
  Package, 
  DollarSign,
  Truck,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  BarChart3,
  Calendar,
  Users,
  Award,
  Target
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

interface SupplierPerformance {
  id: string;
  supplier: {
    id: string;
    name: string;
    logo?: string;
    category: string;
    location: string;
  };
  metrics: {
    overallRating: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    qualityScore: number;
    communicationScore: number;
    totalSpent: number;
    averageOrderValue: number;
  };
  trends: {
    ratingTrend: 'up' | 'down' | 'stable';
    deliveryTrend: 'up' | 'down' | 'stable';
    qualityTrend: 'up' | 'down' | 'stable';
  };
  recentActivity: {
    lastOrderDate: string;
    lastDeliveryDate: string;
    issuesReported: number;
    issuesResolved: number;
  };
  certifications: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendationScore: number;
}

interface PerformanceStats {
  totalSuppliers: number;
  activeSuppliers: number;
  topPerformers: number;
  averageRating: number;
  totalSpent: number;
  onTimeDeliveryRate: number;
}

export default function SupplierPerformancePage() {
  const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    to: new Date()
  });

  const { toast } = useToast();

  const loadSupplierPerformance = useCallback(async () => {
    try {
      setIsLoading(true);
      const [performanceResponse, statsResponse] = await Promise.all([
        vikaretaApiClient.get('/suppliers/performance', {
          params: {
            search: searchQuery,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            sortBy,
            sortOrder,
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString()
          }
        }),
        vikaretaApiClient.get('/suppliers/performance/stats', {
          params: {
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString()
          }
        })
      ]);

      setSuppliers((performanceResponse.data as any).suppliers);
      setStats(statsResponse.data as any);
    } catch (error) {
      console.error('Failed to load supplier performance:', error);
      toast({
        title: "Error",
        description: "Failed to load supplier performance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, sortOrder, dateRange, toast]);

  useEffect(() => {
    loadSupplierPerformance();
  }, [loadSupplierPerformance]);

  const handleExportReport = async () => {
    try {
      const response = await vikaretaApiClient.get('/suppliers/performance/export', {
        params: {
          format: 'xlsx',
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString()
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `supplier-performance-${dateRange.from.toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Performance report exported successfully",
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: "Error",
        description: "Failed to export performance report",
        variant: "destructive",
      });
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[riskLevel as keyof typeof variants]}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
      </Badge>
    );
  };

  const getPerformanceScore = (supplier: SupplierPerformance) => {
    const { overallRating, onTimeDeliveryRate, qualityScore, communicationScore } = supplier.metrics;
    return Math.round((overallRating * 20 + onTimeDeliveryRate + qualityScore + communicationScore) / 4);
  };

  if (isLoading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Performance</h1>
          <p className="text-gray-600 mt-1">
            Track and analyze your supplier performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Performers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.topPerformers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.onTimeDeliveryRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="textiles">Textiles</option>
              <option value="machinery">Machinery</option>
              <option value="chemicals">Chemicals</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="rating">Rating</option>
              <option value="orders">Total Orders</option>
              <option value="delivery">Delivery Time</option>
              <option value="quality">Quality Score</option>
              <option value="spent">Amount Spent</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Performance List */}
      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Supplier Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {supplier.supplier.logo ? (
                      <img src={supplier.supplier.logo} alt={supplier.supplier.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Supplier Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {supplier.supplier.name}
                      </h3>
                      <Badge variant="outline">{supplier.supplier.category}</Badge>
                      {getRiskBadge(supplier.riskLevel)}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {getRatingStars(supplier.metrics.overallRating)}
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {supplier.metrics.overallRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{supplier.supplier.location}</span>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Package className="h-4 w-4 text-blue-600" />
                          {getTrendIcon(supplier.trends.deliveryTrend)}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{supplier.metrics.totalOrders}</p>
                        <p className="text-xs text-gray-600">Total Orders</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-4 w-4 text-green-600" />
                          {getTrendIcon(supplier.trends.deliveryTrend)}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{supplier.metrics.onTimeDeliveryRate}%</p>
                        <p className="text-xs text-gray-600">On-Time Rate</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-4 w-4 text-purple-600" />
                          {getTrendIcon(supplier.trends.qualityTrend)}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{supplier.metrics.qualityScore}%</p>
                        <p className="text-xs text-gray-600">Quality Score</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(supplier.metrics.totalSpent)}</p>
                        <p className="text-xs text-gray-600">Total Spent</p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Last Order: {formatDate(supplier.recentActivity.lastOrderDate)}</span>
                      <span>Issues: {supplier.recentActivity.issuesReported}/{supplier.recentActivity.issuesResolved}</span>
                      <span>Performance Score: {getPerformanceScore(supplier)}%</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">
                    Contact
                  </Button>
                </div>
              </div>

              {/* Certifications */}
              {supplier.certifications.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700">Certifications:</span>
                    {supplier.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Top Performer</h4>
              <p className="text-sm text-gray-600 mb-2">
                {suppliers.length > 0 ? suppliers[0].supplier.name : 'N/A'}
              </p>
              <Badge className="bg-yellow-100 text-yellow-800">
                {suppliers.length > 0 ? `${suppliers[0].metrics.overallRating.toFixed(1)} ★` : 'N/A'}
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Needs Attention</h4>
              <p className="text-sm text-gray-600 mb-2">
                {suppliers.filter(s => s.riskLevel === 'high').length} suppliers
              </p>
              <Badge variant="destructive">
                High Risk
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Improving</h4>
              <p className="text-sm text-gray-600 mb-2">
                {suppliers.filter(s => s.trends.ratingTrend === 'up').length} suppliers
              </p>
              <Badge className="bg-green-100 text-green-800">
                Trending Up
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}