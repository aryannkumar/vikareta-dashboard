'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Calendar,
  User,
  Package,
  RefreshCw,
  Download,
  MessageSquare,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface Quote {
  id: string;
  rfqId: string;
  rfqTitle: string;
  sellerId: string;
  sellerName: string;
  sellerBusinessName: string;
  totalPrice: number;
  deliveryTimeline: string;
  termsConditions: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReceivedQuotes({
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
        limit: 50
      });

      if (response.success && response.data) {
        const data = response.data as any;
        const quotesList = Array.isArray(data) ? data : data.quotes || data.data || [];
        setQuotes(quotesList);
      } else {
        setQuotes([]);
      }
    } catch (error) {
      console.error('Failed to load quotes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotes. Please try again.',
        variant: 'destructive',
      });
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteAction = async (quoteId: string, action: 'accept' | 'reject') => {
    const confirmMessage = action === 'accept' 
      ? 'Are you sure you want to accept this quote? This will create an order.'
      : 'Are you sure you want to reject this quote?';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await apiClient.post(`/quotes/${quoteId}/${action}`);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Quote ${action}ed successfully.`,
        });
        loadQuotes();
      } else {
        throw new Error(`Failed to ${action} quote`);
      }
    } catch (error) {
      console.error(`Failed to ${action} quote:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} quote. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    loadQuotes();
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
    loadQuotes();
  }, [sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const isQuoteExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">Manage quotes received for your RFQs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadQuotes} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/rfqs">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              View RFQs
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{quotes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {quotes.filter(q => q.status === 'pending' && !isQuoteExpired(q.validUntil)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {quotes.filter(q => q.status === 'accepted').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(quotes.reduce((sum, q) => sum + q.totalPrice, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by RFQ title or seller name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotes ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2 text-muted-foreground">Loading quotes...</p>
            </div>
          ) : quotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFQ & Seller</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('totalPrice')}
                      className="flex items-center space-x-1 hover:text-primary"
                    >
                      <span>Quote Value</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center space-x-1 hover:text-primary"
                    >
                      <span>Received</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link 
                          href={`/dashboard/rfqs/${quote.rfqId}`}
                          className="font-medium hover:text-primary"
                        >
                          {quote.rfqTitle}
                        </Link>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          <span>{quote.sellerName}</span>
                          {quote.sellerBusinessName && (
                            <span className="ml-1">({quote.sellerBusinessName})</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(quote.totalPrice)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{quote.items.length} items</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{quote.deliveryTimeline}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(
                        isQuoteExpired(quote.validUntil) && quote.status === 'pending' 
                          ? 'expired' 
                          : quote.status
                      )}>
                        {isQuoteExpired(quote.validUntil) && quote.status === 'pending' 
                          ? 'Expired' 
                          : quote.status.charAt(0).toUpperCase() + quote.status.slice(1)
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(quote.validUntil)}</div>
                        {isQuoteExpired(quote.validUntil) && (
                          <div className="text-red-600 text-xs">Expired</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(quote.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/dashboard/quotes/${quote.id}`} className="flex items-center w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`/messages/${quote.sellerId}`, '_blank')}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Seller
                          </DropdownMenuItem>
                          {quote.status === 'pending' && !isQuoteExpired(quote.validUntil) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleQuoteAction(quote.id, 'accept')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Quote
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleQuoteAction(quote.id, 'reject')}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Quote
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filters.'
                  : 'Quotes from sellers will appear here when they respond to your RFQs.'
                }
              </p>
              {searchTerm || statusFilter ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    loadQuotes();
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href="/dashboard/rfqs/new">
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Your First RFQ
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}