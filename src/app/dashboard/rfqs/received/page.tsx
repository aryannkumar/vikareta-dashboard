"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { rfqService, type RFQ } from '@/lib/api/services/rfq.service';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Package, 
  Wrench, 
  DollarSign, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function ReceivedRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const router = useRouter();

  const loadData = useCallback(async (p = 1, searchTerm = search, statusF = statusFilter, typeF = typeFilter) => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('checking');
      
      const params: any = { 
        page: p, 
        limit: 10 
      };
      
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusF !== 'all') params.status = statusF;
      if (typeF !== 'all') params.type = typeF;

      console.log('Loading RFQs with params:', params);
      const res = await rfqService.getRelevantRFQs(params);
      
      setRfqs(res.rfqs || []);
      setPages(res.pagination?.pages || 0);
      setTotal(res.pagination?.total || 0);
      setConnectionStatus('connected');
      
      console.log('RFQs loaded successfully:', res);
    } catch (e: any) {
      console.error('Failed to load RFQs:', e);
      setError(e?.message || 'Failed to load RFQs');
      setConnectionStatus('disconnected');
      
      // Set empty state on error
      setRfqs([]);
      setPages(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  const handleSearch = () => {
    setPage(1);
    loadData(1, search, statusFilter, typeFilter);
  };

  const handleRefresh = () => {
    loadData(page, search, statusFilter, typeFilter);
  };

  const handleRFQClick = (rfq: RFQ) => {
    router.push(`/dashboard/rfqs/${rfq.id}`);
  };

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const renderConnectionStatus = () => {
    if (connectionStatus === 'connected') {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <Wifi className="h-4 w-4" />
          <span>Connected to backend</span>
        </div>
      );
    } else if (connectionStatus === 'disconnected') {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff className="h-4 w-4" />
          <span>Backend connection failed</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Checking connection...</span>
        </div>
      );
    }
  };

  const renderRFQCard = (rfq: RFQ) => (
    <Card 
      key={rfq.id} 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500"
      onClick={() => handleRFQClick(rfq)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">
              {rfq.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={rfq.type === 'product' ? 'default' : 'secondary'}>
                {rfq.type === 'product' ? <Package className="h-3 w-3 mr-1" /> : <Wrench className="h-3 w-3 mr-1" />}
                {rfq.type}
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(rfq.createdAt).toLocaleDateString()}
              </Badge>
              {rfq.status && (
                <Badge variant={rfq.status === 'active' ? 'default' : 'secondary'}>
                  {rfq.status}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {rfq.quotesCount || 0} quotes
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {rfq.description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {(rfq.budgetMin || rfq.budgetMax) && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>
                ${rfq.budgetMin || 0} - ${rfq.budgetMax || 0}
              </span>
            </div>
          )}
          
          {rfq.deliveryLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="truncate">{rfq.deliveryLocation}</span>
            </div>
          )}
          
          {rfq.deliveryTimeline && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="truncate">{rfq.deliveryTimeline}</span>
            </div>
          )}
        </div>

        {rfq.category && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{rfq.category}</span>
              {rfq.subcategory && (
                <>
                  <span>•</span>
                  <span>{rfq.subcategory}</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Package className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No RFQs Found</h3>
      <p className="text-muted-foreground mb-4">
        {search || statusFilter !== 'all' || typeFilter !== 'all' 
          ? 'No RFQs match your current filters. Try adjusting your search criteria.'
          : 'There are no relevant RFQs available at the moment. Check back later for new opportunities.'
        }
      </p>
      {(search || statusFilter !== 'all' || typeFilter !== 'all') && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setTypeFilter('all');
            setPage(1);
            loadData(1, '', 'all', 'all');
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
      <p className="text-muted-foreground mb-4">
        {error || 'Unable to connect to the backend server. Please check your connection and try again.'}
      </p>
      <div className="space-y-2">
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Try Again
        </Button>
        <div className="text-xs text-muted-foreground">
          Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'https://api.vikareta.com/api'}
        </div>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Received RFQs</h1>
          <p className="text-muted-foreground">
            Browse and bid on relevant requests for quotes from buyers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {renderConnectionStatus()}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-sm text-muted-foreground">Total RFQs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{rfqs.filter(r => r.type === 'product').length}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wrench className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{rfqs.filter(r => r.type === 'service').length}</div>
                <div className="text-sm text-muted-foreground">Services</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{rfqs.reduce((sum, r) => sum + (r.quotesCount || 0), 0)}</div>
                <div className="text-sm text-muted-foreground">Total Quotes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search RFQs by title, description, or category..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
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
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="expired">Expired</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="product">Products</option>
                <option value="service">Services</option>
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading && rfqs.length === 0 ? (
        renderLoadingState()
      ) : error && rfqs.length === 0 ? (
        renderErrorState()
      ) : rfqs.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid gap-4">
          {rfqs.map(renderRFQCard)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} RFQs
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadData(np, search, statusFilter, typeFilter); 
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
                loadData(np, search, statusFilter, typeFilter); 
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