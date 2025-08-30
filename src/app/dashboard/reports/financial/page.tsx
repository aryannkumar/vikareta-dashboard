'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Printer,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Calculator
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

interface FinancialReport {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalTransactions: number;
    averageTransactionValue: number;
    cashFlow: number;
    accountsReceivable: number;
    accountsPayable: number;
  };
  trends: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
    transactionGrowth: number;
  };
  revenueBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
    growth: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    growth: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    transactions: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    transactions: number;
    percentage: number;
  }>;
  kpis: {
    roi: number;
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
    churnRate: number;
    averageOrderValue: number;
    conversionRate: number;
  };
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  reference?: string;
}

export default function FinancialReportsPage() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'cash-flow' | 'profit-loss'>('summary');
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous-period' | 'previous-year' | 'none'>('previous-period');

  const { toast } = useToast();

  const loadFinancialReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reportResponse, transactionsResponse] = await Promise.all([
        vikaretaApiClient.get('/reports/financial', {
          params: {
            type: reportType,
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString(),
            comparison: comparisonPeriod
          }
        }),
        vikaretaApiClient.get('/transactions', {
          params: {
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString(),
            limit: 20
          }
        })
      ]);

      setReport((reportResponse.data as any) || null);
      setTransactions((transactionsResponse.data as any)?.transactions || []);
    } catch (error) {
      console.error('Failed to load financial report:', error);
      toast({
        title: "Error",
        description: "Failed to load financial report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [reportType, dateRange, comparisonPeriod, toast]);

  useEffect(() => {
    loadFinancialReport();
  }, [loadFinancialReport]);

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await vikaretaApiClient.get('/reports/financial/export', {
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
      link.download = `financial-report-${dateRange.from.toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Financial report exported successfully",
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: "Error",
        description: "Failed to export financial report",
        variant: "destructive",
      });
    }
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive financial analysis and insights
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
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="summary">Financial Summary</option>
              <option value="detailed">Detailed Report</option>
              <option value="cash-flow">Cash Flow Statement</option>
              <option value="profit-loss">Profit & Loss</option>
            </select>

            <select
              value={comparisonPeriod}
              onChange={(e) => setComparisonPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">No Comparison</option>
              <option value="previous-period">Previous Period</option>
              <option value="previous-year">Previous Year</option>
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
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.summary.totalRevenue)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  {getTrendIcon(report.trends.revenueGrowth)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {report.trends.revenueGrowth > 0 ? '+' : ''}{report.trends.revenueGrowth.toFixed(1)}% from comparison period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.summary.totalExpenses)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-8 w-8 text-red-600" />
                  {getTrendIcon(report.trends.expenseGrowth)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {report.trends.expenseGrowth > 0 ? '+' : ''}{report.trends.expenseGrowth.toFixed(1)}% from comparison period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${report.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(report.summary.netProfit)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-8 w-8 text-blue-600" />
                  {getTrendIcon(report.trends.profitGrowth)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {report.summary.profitMargin.toFixed(1)}% profit margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cash Flow</p>
                  <p className={`text-2xl font-bold ${report.summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(report.summary.cashFlow)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current cash position
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        {report?.revenueBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.revenueBreakdown.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-600" style={{ 
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                      }}></div>
                      <div>
                        <p className="font-medium">{source.source}</p>
                        <p className="text-sm text-gray-600">{source.percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(source.amount)}</p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(source.growth)}
                        <span className="text-sm text-gray-600">
                          {source.growth > 0 ? '+' : ''}{source.growth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expense Breakdown */}
        {report?.expenseBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.expenseBreakdown.map((expense, index) => (
                  <div key={expense.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-600" style={{ 
                        backgroundColor: `hsl(${index * 60 + 180}, 70%, 50%)` 
                      }}></div>
                      <div>
                        <p className="font-medium">{expense.category}</p>
                        <p className="text-sm text-gray-600">{expense.percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(expense.amount)}</p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(expense.growth)}
                        <span className="text-sm text-gray-600">
                          {expense.growth > 0 ? '+' : ''}{expense.growth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key Performance Indicators */}
      {report?.kpis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">ROI</h4>
                <p className="text-2xl font-bold text-gray-900">{report.kpis.roi.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Return on Investment</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">CAC</h4>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.kpis.customerAcquisitionCost)}</p>
                <p className="text-sm text-gray-600">Customer Acquisition Cost</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">CLV</h4>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.kpis.customerLifetimeValue)}</p>
                <p className="text-sm text-gray-600">Customer Lifetime Value</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Churn Rate</h4>
                <p className="text-2xl font-bold text-gray-900">{report.kpis.churnRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Monthly Churn Rate</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Calculator className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">AOV</h4>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.kpis.averageOrderValue)}</p>
                <p className="text-sm text-gray-600">Average Order Value</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Conversion</h4>
                <p className="text-2xl font-bold text-gray-900">{report.kpis.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{transaction.paymentMethod}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accounts Summary */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(report.summary.accountsReceivable)}
                </p>
                <p className="text-gray-600">Outstanding invoices</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accounts Payable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 mb-2">
                  {formatCurrency(report.summary.accountsPayable)}
                </p>
                <p className="text-gray-600">Outstanding bills</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}