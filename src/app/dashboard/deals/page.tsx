'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/lib/hooks/use-api';
import { usePagination } from '@/lib/hooks/use-pagination';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { apiClient } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  RefreshCw,
  ArrowUpDown,
  MoreHorizontal,
  DollarSign,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

// Types
interface Deal {
  id: string;
  dealNumber: string;
  title: string;
  description: string;
  dealType: 'product' | 'service' | 'partnership';
  value: number;
  currency: string;
  status: 'negotiating' | 'pending_approval' | 'approved' | 'signed' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';
  probability: number; // 0-100
  expectedCloseDate: string;
  actualCloseDate?: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  clientId: string;
  assignedTo: string;
  assignedToId: string;
  products?: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  tags?: string[];
}

interface DealFilters {
  status?: string;
  stage?: string;
  priority?: string;
  dealType?: string;
  assignedTo?: string;
  dateRange?: string;
  minValue?: number;
  maxValue?: number;
}

interface DealMetrics {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalValue: number;
  wonValue: number;
  averageDealValue: number;
  winRate: number;
  averageSalesCycle: number;
  dealsGrowth: number;
  valueGrowth: number;
}

export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useLocalStorage<DealFilters>('deal-filters', {});
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [metrics, setMetrics] = useState<DealMetrics | null>(null);
  const [, setMetricsLoading] = useState(true);

  const {
    currentPage,
    itemsPerPage,
    goToPage,
  } = usePagination({ totalItems: 0 });

  const {
    data: dealsResponse,
    isLoading: loading,
    execute: fetchDeals,
  } = useApi<{ data: Deal[]; pagination: { total: number; page: number; limit: number } }>();

  const fetchDealMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      
      // Use the new getDealMetrics method with better error handling
      const response = await apiClient.getDealMetrics();
      
      if (response.success && response.data) {
        setMetrics(response.data as DealMetrics);
      } else {
        // Fallback to count-based metrics
        const countResponse = await apiClient.getDealCount();
        if (countResponse.success) {
          setMetrics({
            totalDeals: countResponse.data?.count || 0,
            activeDeals: 0,
            wonDeals: 0,
            lostDeals: 0,
            totalValue: 0,
            wonValue: 0,
            averageDealValue: 0,
            winRate: 0,
            averageSalesCycle: 0,
            dealsGrowth: 0,
            valueGrowth: 0,
          });
        } else {
          // Set empty metrics (no deals scenario)
          setMetrics({
            totalDeals: 0,
            activeDeals: 0,
            wonDeals: 0,
            lostDeals: 0,
            totalValue: 0,
            wonValue: 0,
            averageDealValue: 0,
            winRate: 0,
            averageSalesCycle: 0,
            dealsGrowth: 0,
            valueGrowth: 0,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch deal metrics:', error);
      
      // Set empty metrics on any error (graceful degradation)
      setMetrics({
        totalDeals: 0,
        activeDeals: 0,
        wonDeals: 0,
        lostDeals: 0,
        totalValue: 0,
        wonValue: 0,
        averageDealValue: 0,
        winRate: 0,
        averageSalesCycle: 0,
        dealsGrowth: 0,
        valueGrowth: 0,
      });
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const loadDeals = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy,
        sortOrder,
        ...filters,
      };
      await fetchDeals(() => apiClient.getDeals(params));
    } catch (error) {
      console.error('Failed to load deals:', error);
      // Don't throw error, let the component handle empty state gracefully
    }
  }, [currentPage, itemsPerPage, searchTerm, sortBy, sortOrder, filters, fetchDeals]);

  useEffect(() => {
    loadDeals();
    fetchDealMetrics();
  }, [loadDeals, fetchDealMetrics]);

  const handleSearch = () => {
    goToPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/deals/export', {
        params: { ...filters, search: searchTerm },
        responseType: 'blob'
      });
      
      if (response.success) {
        const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `deals-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDeals.length === 0) return;
    
    try {
      await apiClient.post(`/deals/bulk-${action}`, {
        dealIds: selectedDeals
      });
      setSelectedDeals([]);
      loadDeals();
      fetchDealMetrics();
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  const deals = dealsResponse?.data || [];
  const pagination = dealsResponse?.pagination;

  if (loading && !deals.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading deals...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      negotiating: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      signed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getStageColor = (stage: string) => {
    const colors = {
      prospecting: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      qualification: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      proposal: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      closing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      won: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Deals</h1>
            <p className="text-muted-foreground">Track and manage your business deals</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => { loadDeals(); fetchDealMetrics(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                  <p className="text-2xl font-bold">{metrics?.totalDeals || 0}</p>
                  {metrics?.dealsGrowth !== undefined && (
                    <div className={`flex items-center mt-1 ${metrics.dealsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.dealsGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      <span className="text-sm font-medium">{Math.abs(metrics.dealsGrowth).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics?.activeDeals || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">In progress</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Won Deals</p>
                  <p className="text-2xl font-bold text-green-600">{metrics?.wonDeals || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {metrics?.winRate ? `${metrics.winRate.toFixed(1)}% win rate` : 'No data'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">₹{metrics?.totalValue?.toLocaleString() || 0}</p>
                  {metrics?.valueGrowth !== undefined && (
                    <div className={`flex items-center mt-1 ${metrics.valueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.valueGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      <span className="text-sm font-medium">{Math.abs(metrics.valueGrowth).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search deals by title, client name, or deal number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <option value="">All Status</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="signed">Signed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
                <Select
                  value={filters.stage || ''}
                  onValueChange={(value) => setFilters({ ...filters, stage: value })}
                >
                  <option value="">All Stages</option>
                  <option value="prospecting">Prospecting</option>
                  <option value="qualification">Qualification</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closing">Closing</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </Select>
                <Select
                  value={filters.priority || ''}
                  onValueChange={(value) => setFilters({ ...filters, priority: value })}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
                <Button variant="outline" onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals Table */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Deals ({pagination?.total || 0})</CardTitle>
              {selectedDeals.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedDeals.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('close')}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No deals found</h3>
                <p className="text-muted-foreground mb-8">
                  {searchTerm || Object.keys(filters).length > 0 
                    ? 'Try adjusting your search or filters.' 
                    : 'Start tracking your business deals to manage your sales pipeline.'}
                </p>
                {(searchTerm || Object.keys(filters).length > 0) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({});
                      goToPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedDeals.length === deals.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeals(deals.map(d => d.id));
                            } else {
                              setSelectedDeals([]);
                            }
                          }}
                          className="rounded border-border"
                        />
                      </th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('dealNumber')}
                          className="flex items-center space-x-1 hover:text-primary"
                        >
                          <span>Deal #</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">Title & Client</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('value')}
                          className="flex items-center space-x-1 hover:text-primary"
                        >
                          <span>Value</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Stage</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Probability</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('expectedCloseDate')}
                          className="flex items-center space-x-1 hover:text-primary"
                        >
                          <span>Expected Close</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">Assigned To</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal) => (
                      <tr key={deal.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedDeals.includes(deal.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDeals([...selectedDeals, deal.id]);
                              } else {
                                setSelectedDeals(selectedDeals.filter(id => id !== deal.id));
                              }
                            }}
                            className="rounded border-border"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Link 
                            href={`/dashboard/deals/${deal.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {deal.dealNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{deal.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {deal.clientName}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">₹{deal.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{deal.currency}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(deal.status)}>
                            {deal.status.replace('_', ' ').charAt(0).toUpperCase() + deal.status.replace('_', ' ').slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStageColor(deal.stage)}>
                            {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getPriorityColor(deal.priority)}>
                            {deal.priority.charAt(0).toUpperCase() + deal.priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${deal.probability}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{deal.probability}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(deal.expectedCloseDate)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{deal.assignedTo}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/deals/${deal.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination && pagination.total > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} deals
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {Math.ceil(pagination.total / itemsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(pagination.total / itemsPerPage)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}