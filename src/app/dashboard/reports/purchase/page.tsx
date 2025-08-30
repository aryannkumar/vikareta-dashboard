'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  Calendar,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Printer
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

interface PurchaseReport {
  summary: {
    totalPurchases: number;
    totalAmount: number;
    averageOrderValue: number;
    totalSuppliers: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
  };
  trends: {
    purchaseGrowth: number;
    amountGrowth: number;
    supplierGrowth: number;
  };
  topCategories: Array<{
    category: string;
    amount: number;
    orders: number;
    percentage: number;
  }>;
  topSuppliers: Array<{
    id: string;
    name: string;
    amount: number;
    orders: number;
    rating: number;
  }>;
  monthlyData: Array<{
    month: string;
    purchases: number;
    amount: number;
    suppliers: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: {
    id: string;
    name: string;
    logo?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export default function PurchaseReportsPage() {
  const [report, setReport] = useState<PurchaseReport | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'supplier' | 'category'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { toast } = useToast();

  const loadPurchaseReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reportResponse, ordersResponse] = await Promise.all([
        vikaretaApiClient.get('/reports/purchase', {
          params: {
            type: reportType,
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString()
          }
        }),
        vikaretaApiClient.get('/orders/purchase', {
          params: {
            search: searchQuery,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString(),
            limit: 20
          }
        })
      ]);

      setReport((reportResponse.data as any) || null);
      setOrders((ordersResponse.data as any)?.orders || []);
    } catch (error) {
      console.error('Failed to load purchase report:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [reportType, dateRange, searchQuery, statusFilter, toast]);

  useEffect(() => {
    loadPurchaseReport();
  }, [loadPurchaseReport]);

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await vikaretaApiClient.get('/reports/purchase/export', {
        params: {
          format,
          type: reportType,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString()
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `purchase-report-${dateRange.from.toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  if (isLoading && !report) {
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
          <h1 className="text-3xl font-bold text-gray-900">Purchase Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of your purchasing activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="supplier">Supplier Analysis</option>
                <option value="category">Category Analysis</option>
              </select>

              <input
                type="date"
                value={dateRange.from.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />

              <input
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">{report.summary.totalPurchases.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                  {getTrendIcon(report.trends.purchaseGrowth)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {report.trends.purchaseGrowth > 0 ? '+' : ''}{report.trends.purchaseGrowth.toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.summary.totalAmount)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  {getTrendIcon(report.trends.amountGrowth)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {report.trends.amountGrowth > 0 ? '+' : ''}{report.trends.amountGrowth.toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.summary.averageOrderValue)}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Per order average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{report.summary.totalSuppliers}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-8 w-8 text-orange-600" />
                  {getTrendIcon(report.trends.supplierGrowth)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {report.trends.supplierGrowth > 0 ? '+' : ''}{report.trends.supplierGrowth.toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        {report?.topCategories && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-gray-600">{category.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(category.amount)}</p>
                      <p className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Suppliers */}
        {report?.topSuppliers && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.topSuppliers.map((supplier, index) => (
                  <div key={supplier.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">{supplier.orders} orders</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-yellow-600">★ {supplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(supplier.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {order.supplier.logo ? (
                      <img src={order.supplier.logo} alt={order.supplier.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">#{order.orderNumber}</h4>
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">{order.supplier.name}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatDate(order.orderDate)}</span>
                      <span>{order.items.length} items</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  {order.expectedDelivery && (
                    <p className="text-sm text-gray-600">
                      Expected: {formatDate(order.expectedDelivery)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Status Summary */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Order Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Completed</h4>
                <p className="text-2xl font-bold text-gray-900">{report.summary.completedOrders}</p>
                <p className="text-sm text-gray-600">
                  {((report.summary.completedOrders / report.summary.totalPurchases) * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Pending</h4>
                <p className="text-2xl font-bold text-gray-900">{report.summary.pendingOrders}</p>
                <p className="text-sm text-gray-600">
                  {((report.summary.pendingOrders / report.summary.totalPurchases) * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Cancelled</h4>
                <p className="text-2xl font-bold text-gray-900">{report.summary.cancelledOrders}</p>
                <p className="text-sm text-gray-600">
                  {((report.summary.cancelledOrders / report.summary.totalPurchases) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}