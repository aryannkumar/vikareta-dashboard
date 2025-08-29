'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Edit,
  ArrowUpDown,
  Calendar,
  DollarSign
} from 'lucide-react';

interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  totalValue: number;
  lastUpdated: string;
  location?: string;
  supplier?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

interface InventoryStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  totalMovements: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadInventory = useCallback(async (p = 1, searchTerm = search, statusF = statusFilter, categoryF = categoryFilter) => {
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

      const response = await apiClient.getInventory(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        setInventory(data.items || []);
        setPages(data.pagination?.pages || 0);
        setTotal(data.pagination?.total || 0);
      } else {
        setInventory([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      setError(err?.message || 'Failed to load inventory');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getInventoryStats();
      
      if (response.success && response.data) {
        setStats(response.data as InventoryStats);
      } else {
        setStats({
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          totalMovements: 0
        });
      }
    } catch (err) {
      console.error('Failed to load inventory stats:', err);
      setStats({
        totalProducts: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
        totalMovements: 0
      });
    }
  }, []);

  const loadRecentMovements = useCallback(async () => {
    try {
      const response = await apiClient.getInventoryMovements({ limit: 10 });
      
      if (response.success && response.data) {
        setMovements(response.data as StockMovement[]);
      } else {
        setMovements([]);
      }
    } catch (err) {
      console.error('Failed to load stock movements:', err);
      setMovements([]);
    }
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadInventory(1, search, statusFilter, categoryFilter);
  };

  const handleRefresh = () => {
    loadInventory(page, search, statusFilter, categoryFilter);
    loadStats();
    loadRecentMovements();
  };

  useEffect(() => {
    loadInventory(1);
    loadStats();
    loadRecentMovements();
  }, [loadInventory, loadStats, loadRecentMovements]);

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
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-orange-100 text-orange-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800';
      case 'out': return 'bg-red-100 text-red-800';
      case 'adjustment': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
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
        <Package className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Inventory Items Found</h3>
      <p className="text-muted-foreground mb-4">
        {search || statusFilter !== 'all' || categoryFilter !== 'all'
          ? 'No inventory items match your current filters. Try adjusting your search criteria.'
          : 'You haven\'t added any inventory items yet. Start by adding your first product.'
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
            loadInventory(1, '', 'all', 'all');
          }}
        >
          Clear Filters
        </Button>
      ) : (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory
        </Button>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Inventory</h3>
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track your stock levels and manage inventory efficiently
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
            Add Stock
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
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <div className="text-sm text-muted-foreground">Total Products</div>
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
                  <div className="text-2xl font-bold">{stats.inStock}</div>
                  <div className="text-sm text-muted-foreground">In Stock</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
                  <div className="text-sm text-muted-foreground">Low Stock</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                  <div className="text-sm text-muted-foreground">Out of Stock</div>
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
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ArrowUpDown className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalMovements}</div>
                  <div className="text-sm text-muted-foreground">Movements</div>
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
                  placeholder="Search inventory by name, SKU, or category..." 
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
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              
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
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Inventory List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && inventory.length === 0 ? (
                renderLoadingState()
              ) : error && inventory.length === 0 ? (
                renderErrorState()
              ) : inventory.length === 0 ? (
                renderEmptyState()
              ) : (
                <div className="space-y-4">
                  {inventory.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">{item.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>SKU: {item.sku}</span>
                                <span>Category: {item.category}</span>
                                {item.location && <span>Location: {item.location}</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="text-center">
                              <p className="font-medium">{item.currentStock}</p>
                              <p className="text-muted-foreground">Current</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{item.availableStock}</p>
                              <p className="text-muted-foreground">Available</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatCurrency(item.totalValue)}</p>
                              <p className="text-muted-foreground">Value</p>
                            </div>
                            <div className="text-center">
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Adjust
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {item.currentStock <= item.reorderLevel && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-sm text-orange-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>
                                Stock below reorder level ({item.reorderLevel} units). Consider reordering {item.reorderQuantity} units.
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} items
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={page <= 1 || loading} 
                  onClick={() => { 
                    const np = page - 1; 
                    setPage(np); 
                    loadInventory(np, search, statusFilter, categoryFilter); 
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
                    loadInventory(np, search, statusFilter, categoryFilter); 
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Recent Movements */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Recent Stock Movements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent movements</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {movements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{movement.productName}</p>
                        <p className="text-xs text-muted-foreground">{movement.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getMovementColor(movement.type)}>
                          {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All items well stocked</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inventory
                    .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.currentStock} units remaining
                          </p>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}