'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle,
  Eye, 
  Package,
  RefreshCw,
  Search,
  Filter,
  ShoppingCart,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Zap,
  Settings,
  Plus,
  ExternalLink
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

interface LowStockItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitPrice: number;
  currency: string;
  supplier?: {
    id: string;
    name: string;
    company: string;
    rating: number;
  };
  location: string;
  lastRestocked?: string;
  averageDailySales: number;
  daysUntilStockout: number;
  stockStatus: 'low' | 'critical' | 'out_of_stock';
  totalValue: number;
  leadTime: number; // in days
  minimumOrderQuantity: number;
  tags: string[];
  imageUrl?: string;
}

interface LowStockStats {
  totalLowStock: number;
  criticalStock: number;
  outOfStock: number;
  reorderNeeded: number;
  totalValue: number;
  affectedCategories: Array<{
    category: string;
    count: number;
    value: number;
  }>;
  averageStockoutRisk: number;
  totalReorderCost: number;
}

export default function LowStockPage() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [stats, setStats] = useState<LowStockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const loadLowStockItems = useCallback(async (p = 1, searchT = searchTerm, categoryF = categoryFilter, statusF = statusFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20 
      };
      
      if (searchT.trim()) params.search = searchT.trim();
      if (categoryF !== 'all' && categoryF) params.category = categoryF;
      if (statusF !== 'all' && statusF) params.status = statusF;

      const response = await apiClient.getLowStockItems(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setItems(data);
          setPages(1);
          setTotal(data.length);
        } else {
          setItems(data.items || data.data || []);
          setPages(data.pagination?.pages || 0);
          setTotal(data.pagination?.total || 0);
        }
      } else {
        setItems([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load low stock items:', err);
      setError(err?.message || 'Failed to load low stock items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getLowStockStats();
      
      if (response.success && response.data) {
        setStats(response.data as LowStockStats);
      } else {
        // Calculate stats from current items if API doesn't exist
        const criticalStock = items.filter(i => i.stockStatus === 'critical').length;
        const outOfStock = items.filter(i => i.stockStatus === 'out_of_stock').length;
        const reorderNeeded = items.filter(i => i.currentStock <= i.reorderLevel).length;
        const totalValue = items.reduce((sum, i) => sum + i.totalValue, 0);
        const totalReorderCost = items.reduce((sum, i) => sum + (i.reorderQuantity * i.unitPrice), 0);
        
        // Calculate affected categories
        const categoryStats: Record<string, { count: number; value: number }> = {};
        items.forEach(i => {
          if (!categoryStats[i.category]) {
            categoryStats[i.category] = { count: 0, value: 0 };
          }
          categoryStats[i.category].count++;
          categoryStats[i.category].value += i.totalValue;
        });
        const affectedCategories = Object.entries(categoryStats)
          .map(([category, stats]) => ({ category, ...stats }))
          .sort((a, b) => b.count - a.count);
        
        const averageStockoutRisk = items.length > 0
          ? items.reduce((sum, i) => sum + (i.daysUntilStockout > 0 ? 100 / i.daysUntilStockout : 100), 0) / items.length
          : 0;
        
        setStats({
          totalLowStock: items.length,
          criticalStock,
          outOfStock,
          reorderNeeded,
          totalValue,
          affectedCategories,
          averageStockoutRisk,
          totalReorderCost
        });
      }
    } catch (err) {
      console.error('Failed to load low stock stats:', err);
      // Use fallback stats
      setStats({
        totalLowStock: 0,
        criticalStock: 0,
        outOfStock: 0,
        reorderNeeded: 0,
        totalValue: 0,
        affectedCategories: [],
        averageStockoutRisk: 0,
        totalReorderCost: 0
      });
    }
  }, [items]);

  const handleCreateReorderRequest = async (productId: string, quantity: number, supplierId?: string) => {
    try {
      const response = await apiClient.createReorderRequest(productId, quantity, supplierId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Reorder request created successfully.',
        });
        loadLowStockItems();
        loadStats();
      } else {
        throw new Error(response.error?.message || 'Failed to create reorder request');
      }
    } catch (error: any) {
      console.error('Failed to create reorder request:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create reorder request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkReorder = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select items to create bulk reorder requests.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const requests = selectedItems.map(itemId => {
        const item = items.find(i => i.id === itemId);
        return {
          productId: item!.productId,
          quantity: item!.reorderQuantity,
          supplierId: item!.supplier?.id
        };
      });

      const response = await apiClient.createBulkReorderRequest(requests);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `${selectedItems.length} reorder requests created successfully.`,
        });
        setSelectedItems([]);
        loadLowStockItems();
        loadStats();
      } else {
        throw new Error(response.error?.message || 'Failed to create bulk reorder requests');
      }
    } catch (error: any) {
      console.error('Failed to create bulk reorder requests:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create bulk reorder requests. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadLowStockItems(1, searchTerm, categoryFilter, statusFilter);
  };

  const handleRefresh = () => {
    loadLowStockItems(page, searchTerm, categoryFilter, statusFilter);
    loadStats();
  };

  useEffect(() => {
    loadLowStockItems(1);
  }, [loadLowStockItems]);

  useEffect(() => {
    if (items.length > 0) {
      loadStats();
    }
  }, [items, loadStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <Zap className="h-4 w-4" />;
      case 'out_of_stock': return <Package className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (daysUntilStockout: number) => {
    if (daysUntilStockout <= 0) return 'text-red-600';
    if (daysUntilStockout <= 7) return 'text-orange-600';
    if (daysUntilStockout <= 14) return 'text-yellow-600';
    return 'text-green-600';
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
        <Package className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Low Stock Items</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
          ? 'No items match your current filters.'
          : 'Great! All your inventory levels are healthy.'
        }
      </p>
      {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setCategoryFilter('all');
            setStatusFilter('all');
            setPage(1);
            loadLowStockItems(1, '', 'all', 'all');
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
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Low Stock Items</h3>
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage inventory items that need restocking
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
          {selectedItems.length > 0 && (
            <Button onClick={handleBulkReorder}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Bulk Reorder ({selectedItems.length})
            </Button>
          )}
          <Link href="/dashboard/inventory">
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              All Inventory
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
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalLowStock}</div>
                  <div className="text-sm text-muted-foreground">Low Stock Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Zap className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.criticalStock}</div>
                  <div className="text-sm text-muted-foreground">Critical Stock</div>
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
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalReorderCost)}</div>
                  <div className="text-sm text-muted-foreground">Reorder Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Affected Categories */}
      {stats && stats.affectedCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Affected Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.affectedCategories.slice(0, 6).map((category) => (
                <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-muted-foreground">{category.count} items</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(category.value)}</div>
                  </div>
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
                  placeholder="Search by product name, SKU, or category..."
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
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && items.length === 0 ? (
            renderLoadingState()
          ) : error && items.length === 0 ? (
            renderErrorState()
          ) : items.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getStatusIcon(item.stockStatus)}
                        </div>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>SKU: {item.sku}</span>
                            <span>{item.category}</span>
                            <span>{item.location}</span>
                            <span className={getUrgencyColor(item.daysUntilStockout)}>
                              {item.daysUntilStockout > 0 
                                ? `${item.daysUntilStockout} days until stockout`
                                : 'Out of stock'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm mt-1">
                            <span>Current: {item.currentStock}</span>
                            <span>Reorder at: {item.reorderLevel}</span>
                            <span>Reorder qty: {item.reorderQuantity}</span>
                            <span>Value: {formatCurrency(item.totalValue)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(item.stockStatus)}>
                          {item.stockStatus.replace('_', ' ').toUpperCase()}
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
                              <Link href={`/dashboard/products/${item.productId}`} className="flex items-center w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Product
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/inventory/${item.id}`} className="flex items-center w-full">
                                <Package className="h-4 w-4 mr-2" />
                                View Inventory
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleCreateReorderRequest(item.productId, item.reorderQuantity, item.supplier?.id)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Create Reorder Request
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Update Reorder Levels
                            </DropdownMenuItem>
                            {item.supplier && (
                              <DropdownMenuItem>
                                <Link href={`/dashboard/suppliers/${item.supplier.id}`} className="flex items-center w-full">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Contact Supplier
                                </Link>
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} low stock items
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadLowStockItems(np, searchTerm, categoryFilter, statusFilter); 
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
                loadLowStockItems(np, searchTerm, categoryFilter, statusFilter); 
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