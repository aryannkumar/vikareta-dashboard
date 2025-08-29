'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FileText,
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  User,
  Calendar,
  ArrowRight,
  MessageSquare,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ReceivedQuote {
  id: string;
  quoteNumber: string;
  rfqId: string;
  rfqTitle: string;
  supplier: {
    id: string;
    name: string;
    email: string;
    company: string;
    rating: number;
    verified: boolean;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specifications?: string;
  }>;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'negotiating';
  validUntil: string;
  deliveryTime: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  paymentTerms: string;
  shippingTerms: string;
  notes?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
  }>;
  negotiationHistory?: Array<{
    id: string;
    message: string;
    author: 'buyer' | 'supplier';
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  expiresIn: number; // days until expiration
}

interface ReceivedQuoteStats {
  totalReceived: number;
  pendingReview: number;
  accepted: number;
  rejected: number;
  expired: number;
  averageQuoteValue: number;
  responseRate: number;
  averageResponseTime: number;
}

export default function ReceivedQuotesPage() {
  const [quotes, setQuotes] = useState<ReceivedQuote[]>([]);
  const [stats, setStats] = useState<ReceivedQuoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadReceivedQuotes = useCallback(async (p = 1, searchT = searchTerm, statusF = statusFilter, supplierF = supplierFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20,
        type: 'received' // Filter for received quotes
      };
      
      if (searchT.trim()) params.search = searchT.trim();
      if (statusF !== 'all' && statusF) params.status = statusF;
      if (supplierF !== 'all' && supplierF) params.supplierId = supplierF;

      const response = await apiClient.getReceivedQuotes(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setQuotes(data);
          setPages(1);
          setTotal(data.length);
        } else {
          setQuotes(data.quotes || data.data || []);
          setPages(data.pagination?.pages || 0);
          setTotal(data.pagination?.total || 0);
        }
      } else {
        setQuotes([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load received quotes:', err);
      setError(err?.message || 'Failed to load received quotes');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, supplierFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getReceivedQuoteStats();
      
      if (response.success && response.data) {
        setStats(response.data as ReceivedQuoteStats);
      } else {
        // Calculate stats from current quotes if API doesn't exist
        const pendingReview = quotes.filter(q => q.status === 'pending').length;
        const accepted = quotes.filter(q => q.status === 'accepted').length;
        const rejected = quotes.filter(q => q.status === 'rejected').length;
        const expired = quotes.filter(q => q.status === 'expired').length;
        const totalValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);
        const averageQuoteValue = quotes.length > 0 ? totalValue / quotes.length : 0;
        
        setStats({
          totalReceived: quotes.length,
          pendingReview,
          accepted,
          rejected,
          expired,
          averageQuoteValue,
          responseRate: 85.5, // Default value
          averageResponseTime: 2.3 // Default value in days
        });
      }
    } catch (err) {
      console.error('Failed to load received quote stats:', err);
      // Use fallback stats
      setStats({
        totalReceived: 0,
        pendingReview: 0,
        accepted: 0,
        rejected: 0,
        expired: 0,
        averageQuoteValue: 0,
        responseRate: 0,
        averageResponseTime: 0
      });
    }
  }, [quotes]);

  const handleQuoteAction = async (quoteId: string, action: 'accept' | 'reject', reason?: string) => {
    try {
      let response;
      if (action === 'accept') {
        response = await apiClient.acceptQuote(quoteId);
      } else {
        response = await apiClient.rejectQuote(quoteId, reason);
      }
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Quote ${action}ed successfully.`,
        });
        loadReceivedQuotes();
        loadStats();
      } else {
        throw new Error(response.error?.message || `Failed to ${action} quote`);
      }
    } catch (error: any) {
      console.error(`Failed to ${action} quote:`, error);
      toast({
        title: 'Error',
        description: error?.message || `Failed to ${action} quote. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadReceivedQuotes(1, searchTerm, statusFilter, supplierFilter);
  };

  const handleRefresh = () => {
    loadReceivedQuotes(page, searchTerm, statusFilter, supplierFilter);
    loadStats();
  };

  useEffect(() => {
    loadReceivedQuotes(1);
  }, [loadReceivedQuotes]);

  useEffect(() => {
    if (quotes.length > 0) {
      loadStats();
    }
  }, [quotes, loadStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'negotiating': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'negotiating': return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDeliveryTimeDisplay = (deliveryTime: ReceivedQuote['deliveryTime']) => {
    return `${deliveryTime.value} ${deliveryTime.unit}`;
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
      <h3 className="text-lg font-semibold mb-2">No Received Quotes</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm || statusFilter !== 'all' || supplierFilter !== 'all'
          ? 'No quotes match your current filters.'
          : 'You haven\'t received any quotes yet. Create an RFQ to start receiving quotes.'
        }
      </p>
      {(searchTerm || statusFilter !== 'all' || supplierFilter !== 'all') ? (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setSupplierFilter('all');
            setPage(1);
            loadReceivedQuotes(1, '', 'all', 'all');
          }}
        >
          Clear Filters
        </Button>
      ) : (
        <Link href="/dashboard/rfqs/new">
          <Button>
            Create RFQ
          </Button>
        </Link>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <XCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Received Quotes</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Received Quotes</h1>
          <p className="text-muted-foreground">
            Review and manage quotes received from suppliers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/quotes">
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              My Quotes
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
                  <div className="text-2xl font-bold">{stats.totalReceived}</div>
                  <div className="text-sm text-muted-foreground">Total Received</div>
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
                  <div className="text-2xl font-bold">{stats.pendingReview}</div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
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
                  <div className="text-2xl font-bold">{stats.accepted}</div>
                  <div className="text-sm text-muted-foreground">Accepted</div>
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
                  <div className="text-2xl font-bold">{formatCurrency(stats.averageQuoteValue)}</div>
                  <div className="text-sm text-muted-foreground">Avg Value</div>
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
                  placeholder="Search by quote number, RFQ title, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
                <option value="negotiating">Negotiating</option>
              </select>
              
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
          <CardTitle>Received Quotes ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && quotes.length === 0 ? (
            renderLoadingState()
          ) : error && quotes.length === 0 ? (
            renderErrorState()
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
                          <h3 className="font-medium">#{quote.quoteNumber}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{quote.supplier.company}</span>
                            <span>{quote.items.length} item{quote.items.length !== 1 ? 's' : ''}</span>
                            <span>Delivery: {getDeliveryTimeDisplay(quote.deliveryTime)}</span>
                            <span>Expires in {quote.expiresIn} days</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            RFQ: {quote.rfqTitle}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(quote.totalAmount)}</div>
                          <div className="text-sm text-muted-foreground">
                            {quote.paymentTerms}
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status.toUpperCase()}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Actions
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
                              <Link href={`/dashboard/rfqs/${quote.rfqId}`} className="flex items-center w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                View RFQ
                              </Link>
                            </DropdownMenuItem>
                            {quote.attachments && quote.attachments.length > 0 && (
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Attachments
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {quote.status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleQuoteAction(quote.id, 'accept')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept Quote
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleQuoteAction(quote.id, 'reject', 'Not suitable')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Quote
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Start Negotiation
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <User className="h-4 w-4 mr-2" />
                              Contact Supplier
                            </DropdownMenuItem>
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} received quotes
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadReceivedQuotes(np, searchTerm, statusFilter, supplierFilter); 
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
                loadReceivedQuotes(np, searchTerm, statusFilter, supplierFilter); 
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