'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  BarChart3,
  PieChart,
  RefreshCw,
  Eye,
  Share
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SalesReport {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'comparison' | 'trend';
  period: {
    start: string;
    end: string;
    label: string;
  };
  status: 'generating' | 'ready' | 'failed';
  createdAt: string;
  generatedAt?: string;
  fileUrl?: string;
  fileSize?: number;
  data: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    growth: number;
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
      revenue: number;
      orders: number;
    }>;
    salesByPeriod: Array<{
      period: string;
      revenue: number;
      orders: number;
    }>;
    salesByCategory: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'comparison' | 'trend';
  defaultPeriod: string;
  fields: string[];
}

export default function SalesReportsPage() {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<SalesReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  const [reportProgress, setReportProgress] = useState<Map<string, number>>(new Map());
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);
  const [newReport, setNewReport] = useState({
    templateId: '',
    name: '',
    description: '',
    period: 'last_30_days',
    customDateRange: null as any,
    format: 'pdf',
    schedule: null as any
  });
  const { toast } = useToast();

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await apiClient.getSalesReports(params);

      if (response.success && response.data) {
        setReports(response.data as SalesReport[]);
      } else {
        // Fallback data for development
        const fallbackReports: SalesReport[] = [
          {
            id: '1',
            name: 'Monthly Sales Summary - January 2024',
            description: 'Comprehensive sales summary for January 2024 including revenue, orders, and top performers',
            type: 'summary',
            period: {
              start: '2024-01-01',
              end: '2024-01-31',
              label: 'January 2024'
            },
            status: 'ready',
            createdAt: '2024-02-01T09:00:00Z',
            generatedAt: '2024-02-01T09:05:00Z',
            fileUrl: '/reports/sales-summary-jan-2024.pdf',
            fileSize: 2048576,
            data: {
              totalRevenue: 485000,
              totalOrders: 1247,
              averageOrderValue: 389.50,
              growth: 12.5,
              topProducts: [
                { id: '1', name: 'Industrial Pump Model X200', revenue: 85000, orders: 45, growth: 15.2 },
                { id: '2', name: 'Steel Pipes Bundle', revenue: 62000, orders: 78, growth: -2.1 },
                { id: '3', name: 'Electrical Components Kit', revenue: 48500, orders: 95, growth: 22.8 }
              ],
              topCustomers: [
                { id: '1', name: 'ABC Manufacturing', revenue: 125000, orders: 24 },
                { id: '2', name: 'XYZ Industries', revenue: 98000, orders: 18 },
                { id: '3', name: 'Global Solutions', revenue: 75000, orders: 32 }
              ],
              salesByPeriod: [
                { period: 'Week 1', revenue: 125000, orders: 285 },
                { period: 'Week 2', revenue: 135000, orders: 315 },
                { period: 'Week 3', revenue: 145000, orders: 342 },
                { period: 'Week 4', revenue: 80000, orders: 305 }
              ],
              salesByCategory: [
                { category: 'Industrial Equipment', revenue: 185000, percentage: 38.1 },
                { category: 'Raw Materials', revenue: 145000, percentage: 29.9 },
                { category: 'Electronics', revenue: 95000, percentage: 19.6 },
                { category: 'Tools & Hardware', revenue: 60000, percentage: 12.4 }
              ]
            }
          },
          {
            id: '2',
            name: 'Q4 2023 Sales Comparison',
            description: 'Quarterly comparison report showing Q4 2023 performance vs Q3 2023',
            type: 'comparison',
            period: {
              start: '2023-10-01',
              end: '2023-12-31',
              label: 'Q4 2023'
            },
            status: 'ready',
            createdAt: '2024-01-05T14:30:00Z',
            generatedAt: '2024-01-05T14:35:00Z',
            fileUrl: '/reports/q4-2023-comparison.pdf',
            fileSize: 3145728,
            data: {
              totalRevenue: 1250000,
              totalOrders: 3456,
              averageOrderValue: 361.63,
              growth: 8.7,
              topProducts: [
                { id: '1', name: 'Industrial Pump Model X200', revenue: 245000, orders: 125, growth: 18.5 },
                { id: '2', name: 'Steel Pipes Bundle', revenue: 185000, orders: 234, growth: 5.2 },
                { id: '3', name: 'Electrical Components Kit', revenue: 165000, orders: 298, growth: 12.1 }
              ],
              topCustomers: [
                { id: '1', name: 'ABC Manufacturing', revenue: 385000, orders: 78 },
                { id: '2', name: 'XYZ Industries', revenue: 295000, orders: 56 },
                { id: '3', name: 'Global Solutions', revenue: 225000, orders: 89 }
              ],
              salesByPeriod: [
                { period: 'October', revenue: 425000, orders: 1156 },
                { period: 'November', revenue: 445000, orders: 1234 },
                { period: 'December', revenue: 380000, orders: 1066 }
              ],
              salesByCategory: [
                { category: 'Industrial Equipment', revenue: 475000, percentage: 38.0 },
                { category: 'Raw Materials', revenue: 375000, percentage: 30.0 },
                { category: 'Electronics', revenue: 250000, percentage: 20.0 },
                { category: 'Tools & Hardware', revenue: 150000, percentage: 12.0 }
              ]
            }
          },
          {
            id: '3',
            name: 'Weekly Sales Trend - Current Week',
            description: 'Real-time sales trend analysis for the current week',
            type: 'trend',
            period: {
              start: '2024-01-15',
              end: '2024-01-21',
              label: 'Week of Jan 15, 2024'
            },
            status: 'generating',
            createdAt: '2024-01-16T10:30:00Z',
            data: {
              totalRevenue: 125000,
              totalOrders: 342,
              averageOrderValue: 365.50,
              growth: 5.2,
              topProducts: [],
              topCustomers: [],
              salesByPeriod: [],
              salesByCategory: []
            }
          }
        ];

        setReports(fallbackReports);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, statusFilter]);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await apiClient.getReportTemplates();
      
      if (response.success && response.data) {
        setTemplates(response.data as ReportTemplate[]);
      } else {
        // Fallback templates for development
        const fallbackTemplates: ReportTemplate[] = [
        {
          id: 'summary',
          name: 'Sales Summary Report',
          description: 'Comprehensive overview of sales performance including revenue, orders, and key metrics',
          type: 'summary',
          defaultPeriod: 'last_30_days',
          fields: ['revenue', 'orders', 'customers', 'products', 'categories']
        },
        {
          id: 'detailed',
          name: 'Detailed Sales Report',
          description: 'In-depth analysis with transaction-level details and customer breakdowns',
          type: 'detailed',
          defaultPeriod: 'last_7_days',
          fields: ['transactions', 'customer_details', 'product_details', 'payment_methods']
        },
        {
          id: 'comparison',
          name: 'Period Comparison Report',
          description: 'Compare sales performance between different time periods',
          type: 'comparison',
          defaultPeriod: 'last_quarter',
          fields: ['revenue_comparison', 'growth_metrics', 'trend_analysis']
        },
        {
          id: 'trend',
          name: 'Sales Trend Analysis',
          description: 'Track sales trends and patterns over time with forecasting',
          type: 'trend',
          defaultPeriod: 'last_90_days',
          fields: ['trend_lines', 'forecasting', 'seasonality', 'patterns']
        }
      ];

        setTemplates(fallbackTemplates);
      }
    } catch (err) {
      console.error('Failed to load report templates:', err);
    }
  }, []);

  const generateReport = async () => {
    if (!newReport.templateId || !newReport.name) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      const response = await apiClient.generateSalesReport({
        templateId: newReport.templateId,
        name: newReport.name,
        description: newReport.description,
        period: newReport.period,
        customDateRange: newReport.customDateRange
      });
      
      if (response.success) {
        setShowCreateForm(false);
        setNewReport({
          templateId: '',
          name: '',
          description: '',
          period: 'last_30_days',
          customDateRange: null,
          format: 'pdf',
          schedule: null
        });
        // Refresh reports to show the new report
        await loadReports();
      } else {
        setError(response.error?.message || 'Failed to generate report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Failed to generate report:', err);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      // This would trigger a download in production
      console.log('Downloading report:', reportId);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summary': return <BarChart3 className="w-4 h-4" />;
      case 'detailed': return <FileText className="w-4 h-4" />;
      case 'comparison': return <TrendingUp className="w-4 h-4" />;
      case 'trend': return <PieChart className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    loadReports();
    loadTemplates();
  }, [loadReports, loadTemplates]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Reports</h1>
          <p className="text-gray-600">Generate and manage comprehensive sales reports and analytics</p>
        </div>
        
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Create Report Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New Sales Report</CardTitle>
            <CardDescription>Create a custom sales report based on your requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Report Template</label>
                  <Select value={newReport.templateId} onValueChange={(value) => setNewReport({ ...newReport, templateId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(template.type)}
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Report Name</label>
                  <Input
                    value={newReport.name}
                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                    placeholder="Enter report name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Brief description of the report"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={newReport.period} onValueChange={(value) => setNewReport({ ...newReport, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_7_days">Last 7 days</SelectItem>
                      <SelectItem value="last_30_days">Last 30 days</SelectItem>
                      <SelectItem value="last_90_days">Last 90 days</SelectItem>
                      <SelectItem value="last_quarter">Last quarter</SelectItem>
                      <SelectItem value="last_year">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newReport.period === 'custom' && (
                  <div>
                    <label className="text-sm font-medium">Custom Date Range</label>
                    <Input
                      type="date"
                      placeholder="Select date range (feature coming soon)"
                      disabled
                    />
                  </div>
                )}
                
                {newReport.templateId && (
                  <div>
                    <label className="text-sm font-medium">Template Details</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {templates.find(t => t.id === newReport.templateId)?.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={generateReport} disabled={!newReport.templateId || !newReport.name}>
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="comparison">Comparison</SelectItem>
                <SelectItem value="trend">Trend</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadReports} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>
              {reports.length} reports found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadReports} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found</p>
                <p className="text-sm text-gray-400">Generate your first sales report to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(report.type)}
                        <div>
                          <h4 className="font-medium text-sm">{report.name}</h4>
                          <p className="text-xs text-gray-600">{report.period.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {report.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {formatDate(report.createdAt)}</span>
                      <div className="flex items-center space-x-2">
                        {report.status === 'ready' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadReport(report.id);
                            }}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {selectedReport ? selectedReport.name : 'Select a report to view preview'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReport ? (
              <div className="space-y-6">
                {/* Report Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{selectedReport.name}</h3>
                      <p className="text-sm text-gray-600">{selectedReport.period.label}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(selectedReport.status)}>
                        {selectedReport.status}
                      </Badge>
                      {selectedReport.status === 'ready' && (
                        <Button size="sm" onClick={() => downloadReport(selectedReport.id)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{selectedReport.description}</p>
                </div>

                {/* Key Metrics */}
                {selectedReport.status === 'ready' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Total Revenue</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedReport.data.totalRevenue)}</p>
                      <div className="flex items-center text-xs">
                        {selectedReport.data.growth >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                        )}
                        <span className={selectedReport.data.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(selectedReport.data.growth)}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Total Orders</p>
                      <p className="text-lg font-bold">{formatNumber(selectedReport.data.totalOrders)}</p>
                      <p className="text-xs text-gray-600">
                        AOV: {formatCurrency(selectedReport.data.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Top Products */}
                {selectedReport.status === 'ready' && selectedReport.data.topProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Top Products</h4>
                    <div className="space-y-2">
                      {selectedReport.data.topProducts.slice(0, 3).map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm">{product.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
                            <p className="text-xs text-gray-600">{product.orders} orders</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Created: {formatDate(selectedReport.createdAt)}</p>
                  {selectedReport.generatedAt && (
                    <p>Generated: {formatDate(selectedReport.generatedAt)}</p>
                  )}
                  {selectedReport.fileSize && (
                    <p>File Size: {(selectedReport.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a report to view preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}