'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Heart,
  Eye, 
  Star,
  Phone,
  Mail,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Package,
  MessageSquare,
  HeartOff,
  Building
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

interface FavoriteSupplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  category: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  rating: number;
  reviewCount: number;
  verified: boolean;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  lastOrderDate?: string;
  averageDeliveryTime: number; // in days
  onTimeDeliveryRate: number; // percentage
  responseTime: number; // in hours
  specialties: string[];
  paymentTerms: string[];
  shippingMethods: string[];
  addedToFavoritesAt: string;
  lastContactDate?: string;
  notes?: string;
  tags: string[];
}

interface FavoriteSupplierStats {
  totalFavorites: number;
  activeSuppliers: number;
  totalOrders: number;
  totalSpent: number;
  averageRating: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  averageResponseTime: number;
  onTimeDeliveryRate: number;
}

export default function FavoriteSuppliersPage() {
  const [suppliers, setSuppliers] = useState<FavoriteSupplier[]>([]);
  const [stats, setStats] = useState<FavoriteSupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadFavoriteSuppliers = useCallback(async (p = 1, searchT = searchTerm, categoryF = categoryFilter, locationF = locationFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20 
      };
      
      if (searchT.trim()) params.search = searchT.trim();
      if (categoryF !== 'all' && categoryF) params.category = categoryF;
      if (locationF !== 'all' && locationF) params.location = locationF;

      const response = await apiClient.getFavoriteSuppliers(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setSuppliers(data);
          setPages(1);
          setTotal(data.length);
        } else {
          setSuppliers(data.suppliers || data.data || []);
          setPages(data.pagination?.pages || 0);
          setTotal(data.pagination?.total || 0);
        }
      } else {
        setSuppliers([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load favorite suppliers:', err);
      setError(err?.message || 'Failed to load favorite suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, locationFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getFavoriteSupplierStats();
      
      if (response.success && response.data) {
        setStats(response.data as FavoriteSupplierStats);
      } else {
        // Calculate stats from current suppliers if API doesn't exist
        const totalSpent = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);
        const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0);
        const averageRating = suppliers.length > 0 
          ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length 
          : 0;
        const averageResponseTime = suppliers.length > 0
          ? suppliers.reduce((sum, s) => sum + s.responseTime, 0) / suppliers.length
          : 0;
        const onTimeDeliveryRate = suppliers.length > 0
          ? suppliers.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / suppliers.length
          : 0;
        
        // Calculate top categories
        const categoryCount: Record<string, number> = {};
        suppliers.forEach(s => {
          categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
        });
        const topCategories = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setStats({
          totalFavorites: suppliers.length,
          activeSuppliers: suppliers.filter(s => s.lastOrderDate && 
            new Date(s.lastOrderDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          ).length,
          totalOrders,
          totalSpent,
          averageRating,
          topCategories,
          averageResponseTime,
          onTimeDeliveryRate
        });
      }
    } catch (err) {
      console.error('Failed to load favorite supplier stats:', err);
      // Use fallback stats
      setStats({
        totalFavorites: 0,
        activeSuppliers: 0,
        totalOrders: 0,
        totalSpent: 0,
        averageRating: 0,
        topCategories: [],
        averageResponseTime: 0,
        onTimeDeliveryRate: 0
      });
    }
  }, [suppliers]);

  const handleRemoveFromFavorites = async (supplierId: string) => {
    try {
      const response = await apiClient.removeSupplierFromFavorites(supplierId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Supplier removed from favorites.',
        });
        loadFavoriteSuppliers();
        loadStats();
      } else {
        throw new Error(response.error?.message || 'Failed to remove supplier from favorites');
      }
    } catch (error: any) {
      console.error('Failed to remove supplier from favorites:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to remove supplier from favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkRemove = async (supplierIds: string[]) => {
    try {
      const response = await apiClient.bulkRemoveFromFavorites(supplierIds);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `${supplierIds.length} suppliers removed from favorites.`,
        });
        loadFavoriteSuppliers();
        loadStats();
      } else {
        throw new Error(response.error?.message || 'Failed to remove suppliers from favorites');
      }
    } catch (error: any) {
      console.error('Failed to bulk remove suppliers:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to remove suppliers from favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadFavoriteSuppliers(1, searchTerm, categoryFilter, locationFilter);
  };

  const handleRefresh = () => {
    loadFavoriteSuppliers(page, searchTerm, categoryFilter, locationFilter);
    loadStats();
  };

  useEffect(() => {
    loadFavoriteSuppliers(1);
  }, [loadFavoriteSuppliers]);

  useEffect(() => {
    if (suppliers.length > 0) {
      loadStats();
    }
  }, [suppliers, loadStats]);

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
      </div>
    );
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
        <Heart className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Favorite Suppliers</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm || categoryFilter !== 'all' || locationFilter !== 'all'
          ? 'No favorite suppliers match your current filters.'
          : 'You haven\'t added any suppliers to your favorites yet. Start by browsing suppliers and adding them to favorites.'
        }
      </p>
      {(searchTerm || categoryFilter !== 'all' || locationFilter !== 'all') ? (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setCategoryFilter('all');
            setLocationFilter('all');
            setPage(1);
            loadFavoriteSuppliers(1, '', 'all', 'all');
          }}
        >
          Clear Filters
        </Button>
      ) : (
        <Link href="/dashboard/suppliers">
          <Button>
            Browse Suppliers
          </Button>
        </Link>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Heart className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Favorite Suppliers</h3>
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Favorite Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your preferred suppliers and track performance
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
          <Link href="/dashboard/suppliers">
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              All Suppliers
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
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalFavorites}</div>
                  <div className="text-sm text-muted-foreground">Total Favorites</div>
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
                  <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
                  <div className="text-sm text-muted-foreground">Active Suppliers</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
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
        </div>
      )}

      {/* Top Categories */}
      {stats && stats.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stats.topCategories.map((category, index) => (
                <div key={category.category} className="text-center">
                  <div className="text-2xl font-bold text-primary">{category.count}</div>
                  <div className="text-sm text-muted-foreground">{category.category}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by supplier name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="textiles">Textiles</option>
                <option value="food">Food & Beverage</option>
                <option value="chemicals">Chemicals</option>
                <option value="automotive">Automotive</option>
                <option value="construction">Construction</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Locations</option>
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
                <option value="asia">Asia</option>
                <option value="europe">Europe</option>
                <option value="americas">Americas</option>
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Suppliers ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && suppliers.length === 0 ? (
            renderLoadingState()
          ) : error && suppliers.length === 0 ? (
            renderErrorState()
          ) : suppliers.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-red-600 fill-current" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{supplier.company}</h3>
                            {supplier.verified && (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{supplier.name}</span>
                            <span>{supplier.category}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {supplier.location.city}, {supplier.location.country}
                            </span>
                            <span>{supplier.totalOrders} orders</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            {renderStarRating(supplier.rating)}
                            <span className="text-sm text-muted-foreground">
                              Total spent: {formatCurrency(supplier.totalSpent)}
                            </span>
                            {supplier.lastOrderDate && (
                              <span className="text-sm text-muted-foreground">
                                Last order: {formatDate(supplier.lastOrderDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="font-medium">{supplier.onTimeDeliveryRate.toFixed(1)}% on-time</div>
                          <div className="text-muted-foreground">
                            {supplier.responseTime.toFixed(1)}h response time
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/dashboard/suppliers/${supplier.id}`} className="flex items-center w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/suppliers/${supplier.id}/orders`} className="flex items-center w-full">
                                <Package className="h-4 w-4 mr-2" />
                                View Orders
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              Call Supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Building className="h-4 w-4 mr-2" />
                              Create RFQ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemoveFromFavorites(supplier.id)}
                              className="text-red-600"
                            >
                              <HeartOff className="h-4 w-4 mr-2" />
                              Remove from Favorites
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} favorite suppliers
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadFavoriteSuppliers(np, searchTerm, categoryFilter, locationFilter); 
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
                loadFavoriteSuppliers(np, searchTerm, categoryFilter, locationFilter); 
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