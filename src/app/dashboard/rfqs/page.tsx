'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRFQs } from '@/lib/hooks/use-rfqs';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  ArrowUpDown,
  Plus,
  MessageSquare,
  Package
} from 'lucide-react';
import Link from 'next/link';


// Types
interface RFQFilters {
  status?: string;
  category?: string;
  dateRange?: string;
  minBudget?: number;
  maxBudget?: number;
}

export default function RFQsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<RFQFilters>({});
  const [selectedRFQs, setSelectedRFQs] = useState<string[]>([]);

  const {
    rfqs,
    loading,
    error,
    pagination,
    loadRFQs,
    deleteRFQ,
    refresh,
    setPage,
    setPageSize: _setPageSize
  } = useRFQs({
    autoLoad: true,
    search: searchTerm,
    ...filters
  });

  const handleSearch = () => {
    setPage(1);
    loadRFQs({ search: searchTerm, ...filters });
  };

  const handleSort = (field: string) => {
    loadRFQs({ sortBy: field });
  };

  const handleExport = async () => {
    // Export functionality would be implemented here
    console.log('Export RFQs');
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRFQs.length === 0) return;

    // Bulk actions would be implemented here
    console.log(`Bulk ${action}:`, selectedRFQs);
    setSelectedRFQs([]);
    refresh();
  };

  const handleDeleteRFQ = async (rfqId: string) => {
    if (!confirm('Are you sure you want to delete this RFQ? This action cannot be undone.')) {
      return;
    }

    const success = await deleteRFQ(rfqId);
    if (success) {
      setSelectedRFQs(prev => prev.filter(id => id !== rfqId));
    }
  };

  if (loading && !rfqs.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading RFQs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading RFQs</h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      closed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">RFQs</h1>
            <p className="text-muted-foreground">Manage your Request for Quotations</p>
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/rfqs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create RFQ
              </Button>
            </Link>
            <Button
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
                  <p className="text-sm font-medium text-muted-foreground">Total RFQs</p>
                  <p className="text-2xl font-bold">{pagination.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Active RFQs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {rfqs.filter(r => r.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Currently active</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Expired RFQs</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {rfqs.filter(r => r.status === 'expired').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Past deadline</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Closed RFQs</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {rfqs.filter(r => r.status === 'closed').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                    placeholder="Search RFQs by title, description, or RFQ number..."
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
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="expired">Expired</option>
                </Select>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="textiles">Textiles</option>
                  <option value="machinery">Machinery</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="automotive">Automotive</option>
                </Select>
                <Button variant="outline" onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RFQs Table */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>RFQs ({pagination?.total || 0})</CardTitle>
              {selectedRFQs.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedRFQs.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                  >
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('close')}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {rfqs.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No RFQs found</h3>
                <p className="text-muted-foreground mb-8">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first RFQ to start receiving quotes.'}
                </p>
                {searchTerm || Object.keys(filters).length > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({});
                      setPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/dashboard/rfqs/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First RFQ
                    </Button>
                  </Link>
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
                          checked={selectedRFQs.length === rfqs.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRFQs(rfqs.map(r => r.id));
                            } else {
                              setSelectedRFQs([]);
                            }
                          }}
                          className="rounded border-border"
                        />
                      </th>
                      <th className="text-left py-3 px-4">RFQ</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Budget Range</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Responses</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center space-x-1 hover:text-primary"
                        >
                          <span>Created</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfqs.map((rfq) => (
                      <tr key={rfq.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedRFQs.includes(rfq.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRFQs([...selectedRFQs, rfq.id]);
                              } else {
                                setSelectedRFQs(selectedRFQs.filter(id => id !== rfq.id));
                              }
                            }}
                            className="rounded border-border"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <Link
                                href={`/dashboard/rfqs/${rfq.id}`}
                                className="font-medium hover:text-primary"
                              >
                                {rfq.title}
                              </Link>
                              <div className="text-sm text-muted-foreground">RFQ #{rfq.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{rfq.quantity} units</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {formatCurrency(rfq.budgetMin)} - {formatCurrency(rfq.budgetMax)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(rfq.status)}>
                            {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{rfq.quotes?.length || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{formatDate(rfq.createdAt)}</div>
                            <div className="text-muted-foreground">
                              {new Date(rfq.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/rfqs/${rfq.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRFQ(rfq.id)}
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination && pagination.total > pagination.pageSize && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.current - 1) * pagination.pageSize) + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} RFQs
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.current - 1)}
                        disabled={pagination.current === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {pagination.current} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.current + 1)}
                        disabled={pagination.current >= pagination.totalPages}
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