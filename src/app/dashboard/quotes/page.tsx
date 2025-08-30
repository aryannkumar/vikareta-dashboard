'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit,
  Send,
  Download,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  MoreHorizontal,
  User,
  Building
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Quote {
  id: string;
  quoteNumber: string;
  rfqId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  title: string;
  description: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';
  validUntil: string;
  terms: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
}

interface QuoteItem {
  id: string;
  productId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
}

interface QuoteStats {
  totalQuotes: number;
  sentQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  totalValue: number;
  acceptanceRate: number;
  averageValue: number;
  pendingQuotes: number;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadQuotes = useCallback(async (p = 1, searchTerm = search, statusF = statusFilter) => {
    try {
      setLoading(true);

      const params: any = { 
        page: p, 
        limit: 20,
        sortBy,
        sortOrder
      };
      
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusF !== 'all') params.status = statusF;

      const response = await apiClient.get('/quotes', { params });
      
      if (response.success && response.data) {
        const data = response.data as any;
        setQuotes(data.quotes || []);
        setPages(data.pagination?.pages || 0);
        setTotal(data.pagination?.total || 0);
      } else {
        setQuotes([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load quotes:', err);
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive"
      });
      setQuotes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, sortBy, sortOrder]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/quotes/stats');
      
      if (response.success && response.data) {
        setStats(response.data as QuoteStats);
      } else {
        // Calculate fallback stats
        const sentQuotes = quotes.filter(q => ['sent', 'viewed', 'accepted', 'rejected'].includes(q.status)).length;
        const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
        const rejectedQuotes = quotes.filter(q => q.status === 'rejected').length;
        const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);
        
        setStats({
          totalQuotes: quotes.length,
          sentQuotes,
          acceptedQuotes,
          rejectedQuotes,
          totalValue,
          acceptanceRate: sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0,
          averageValue: quotes.length > 0 ? totalValue / quotes.length : 0,
          pendingQuotes: quotes.filter(q => ['sent', 'viewed'].includes(q.status)).length
        });
      }
    } catch (err) {
      console.error('Failed to load quote stats:', err);
    }
  }, [quotes]);

  const handleSendQuote = async (quoteId: string) => {
    try {
      const response = await apiClient.post(`/quotes/${quoteId}/send`);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Quote sent successfully"
        });
        loadQuotes();
        loadStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quote",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async (quoteId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/quotes/${quoteId}/status`, {
        status: newStatus
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Quote status updated successfully"
        });
        loadQuotes();
        loadStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quote status",
        variant: "destructive"
      });
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadQuotes(1, search, statusFilter);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadQuotes(page, search, statusFilter);
    loadStats();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  useEffect(() => {
    loadQuotes(1);
  }, [loadQuotes]);

  useEffect(() => {
    if (quotes.length > 0) {
      loadStats();
    }
  }, [quotes, loadStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      case 'converted': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Quotes Found</h3>
      <p className="text-muted-foreground mb-4">
        {search || statusFilter !== 'all'
          ? 'No quotes match your current filters. Try adjusting your search criteria.'
          : 'You haven\'t created any quotes yet. Start by creating your first quote.'
        }
      </p>
      {(search || statusFilter !== 'all') ? (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setPage(1);
            loadQuotes(1, '', 'all');
          }}
        >
          Clear Filters
        </Button>
      ) : (
        <Link href="/dashboard/quotes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Create and manage customer quotes and proposals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/quotes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalQuotes}</div>
                  <div className="text-sm text-muted-foreground">Total Quotes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.acceptanceRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotes by number, customer, or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>Quotes ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && quotes.length === 0 ? (
            renderLoadingState()
          ) : quotes.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getStatusIcon(quote.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{quote.quoteNumber}</h3>
                            {isExpiringSoon(quote.validUntil) && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Expires Soon
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{quote.customerName}</span>
                            </div>
                            {quote.customerCompany && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span>{quote.customerCompany}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(quote.createdAt)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {quote.title}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium text-lg">{formatCurrency(quote.total)}</div>
                          <div className="text-sm text-muted-foreground">
                            Valid until {formatDate(quote.validUntil)}
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/dashboard/quotes/${quote.id}`} className="flex items-center w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/quotes/${quote.id}/edit`} className="flex items-center w-full">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Quote
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {quote.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleSendQuote(quote.id)}>
                                <Send className="h-4 w-4 mr-2" />
                                Send Quote
                              </DropdownMenuItem>
                            )}
                            {quote.status === 'accepted' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'converted')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Convert to Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} quotes
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadQuotes(np, search, statusFilter); 
              }}
            >
              Previous
            </Button>
            <div className="text-sm px-3 py-2">
              Page {page} of {pages}
            </div>
            <Button 
              variant="outline" 
              disabled={page >= pages || loading} 
              onClick={() => { 
                const np = page + 1; 
                setPage(np); 
                loadQuotes(np, search, statusFilter); 
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}