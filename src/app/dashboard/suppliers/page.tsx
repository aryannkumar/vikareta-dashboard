'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  Heart,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  website?: string;
  category: string;
  rating: number;
  reviewsCount: number;
  totalOrders: number;
  totalSpent: number;
  paymentTerms: string;
  verified: boolean;
  favorite: boolean;
  status: 'active' | 'inactive' | 'blocked';
  productsCount: number;
  description?: string;
  createdAt: string;
}

interface SupplierStats {
  totalSuppliers: number;
  verifiedSuppliers: number;
  favoriteSuppliers: number;
  averageRating: number;
  totalSpent: number;
  activeOrders: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadSuppliers = useCallback(async (p = 1, searchTerm = search, statusF = statusFilter, categoryF = categoryFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20 
      };
      
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusF !== 'all') params.status = statusF;
      if (categoryF !== 'all') params.category = categoryF;

      const response = await apiClient.getSuppliers(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        setSuppliers(data.suppliers || []);
        setPages(data.pagination?.pages || 0);
        setTotal(data.pagination?.total || 0);
      } else {
        setSuppliers([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load suppliers:', err);
      setError(err?.message || 'Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getSupplierStats();
      
      if (response.success && response.data) {
        setStats(response.data as SupplierStats);
      } else {
        setStats({
          totalSuppliers: 0,
          verifiedSuppliers: 0,
          favoriteSuppliers: 0,
          averageRating: 0,
          totalSpent: 0,
          activeOrders: 0
        });
      }
    } catch (err) {
      console.error('Failed to load supplier stats:', err);
      setStats({
        totalSuppliers: 0,
        verifiedSuppliers: 0,
        favoriteSuppliers: 0,
        averageRating: 0,
        totalSpent: 0,
        activeOrders: 0
      });
    }
  }, []);

  const toggleFavorite = async (supplierId: string) => {
    try {
      const response = await apiClient.toggleSupplierFavorite(supplierId);
      
      if (response.success) {
        // Update local state
        setSuppliers(prev => prev.map(supplier => 
          supplier.id === supplierId 
            ? { ...supplier, favorite: !supplier.favorite }
            : supplier
        ));
        
        // Reload stats to update favorite count
        loadStats();
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadSuppliers(1, search, statusFilter, categoryFilter);
  };

  const handleRefresh = () => {
    loadSuppliers(page, search, statusFilter, categoryFilter);
    loadStats();
  };

  useEffect(() => {
    loadSuppliers(1);
    loadStats();
  }, [loadSuppliers, loadStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const renderLoadingState = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Suppliers Found</h3>
      <p className="text-muted-foreground mb-4">
        {search || statusFilter !== 'all' || categoryFilter !== 'all'
          ? 'No suppliers match your current filters. Try adjusting your search criteria.'
          : 'You haven\'t added any suppliers yet. Start by adding your first supplier.'
        }
      </p>
      {(search || statusFilter !== 'all' || categoryFilter !== 'all') ? (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setCategoryFilter('all');
            setPage(1);
            loadSuppliers(1, '', 'all', 'all');
          }}
        >
          Clear Filters
        </Button>
      ) : (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Suppliers</h3>
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier relationships and discover new partners
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
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
                  <div className="text-2xl font-bold">{stats.verifiedSuppliers}</div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.favoriteSuppliers}</div>
                  <div className="text-sm text-muted-foreground">Favorites</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
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
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.activeOrders}</div>
                  <div className="text-sm text-muted-foreground">Active Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search suppliers by name, email, or category..." 
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
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="machinery">Machinery</option>
                <option value="healthcare">Healthcare</option>
                <option value="packaging">Packaging</option>
                <option value="textiles">Textiles</option>
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
      <Card>
        <CardHeader>
          <CardTitle>All Suppliers ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && suppliers.length === 0 ? (
            renderLoadingState()
          ) : error && suppliers.length === 0 ? (
            renderErrorState()
          ) : suppliers.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{supplier.name}</h3>
                          <p className="text-sm text-muted-foreground">{supplier.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {supplier.verified && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={supplier.favorite ? 'text-red-500' : ''}
                          onClick={() => toggleFavorite(supplier.id)}
                        >
                          <Heart className={`h-4 w-4 ${supplier.favorite ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {supplier.description && (
                      <p className="text-muted-foreground text-sm mb-4">{supplier.description}</p>
                    )}

                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(supplier.rating)}
                        <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({supplier.reviewsCount} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {[
                            supplier.address.city,
                            supplier.address.state,
                            supplier.address.country
                          ].filter(Boolean).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{supplier.productsCount} products</span>
                        <span>{supplier.totalOrders} orders</span>
                        <Badge className={getStatusColor(supplier.status)}>
                          {supplier.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm">
                          Contact
                        </Button>
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} suppliers
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadSuppliers(np, search, statusFilter, categoryFilter); 
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
                loadSuppliers(np, search, statusFilter, categoryFilter); 
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