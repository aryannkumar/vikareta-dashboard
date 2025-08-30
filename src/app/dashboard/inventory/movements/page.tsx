'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowUpDown,
  Eye, 
  Package,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ArrowRight,
  User,
  FileText,
  Truck,
  ShoppingCart,
  Settings
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

interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitPrice: number;
  totalValue: number;
  currency: string;
  reason: string;
  reference?: string;
  location: {
    from?: string;
    to?: string;
  };
  user: {
    id: string;
    name: string;
  };
  relatedTo?: {
    type: 'order' | 'purchase' | 'return' | 'adjustment' | 'transfer';
    id: string;
    reference: string;
  };
  notes?: string;
  timestamp: string;
  batchNumber?: string;
  expiryDate?: string;
}

interface MovementStats {
  totalMovements: number;
  movementsToday: number;
  inboundMovements: number;
  outboundMovements: number;
  adjustments: number;
  transfers: number;
  totalValueIn: number;
  totalValueOut: number;
  netValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    movements: number;
    totalQuantity: number;
  }>;
}

export default function InventoryMovementsPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [stats, setStats] = useState<MovementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadMovements = useCallback(async (p = 1, searchT = searchTerm, typeF = typeFilter, dateF = dateFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20 
      };
      
      if (searchT.trim()) params.search = searchT.trim();
      if (typeF !== 'all' && typeF) params.type = typeF;
      if (dateF !== 'all' && dateF) params.dateRange = dateF;

      const response = await apiClient.getInventoryMovements(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setMovements(data);
          setPages(1);
          setTotal(data.length);
        } else {
          setMovements(data.movements || data.data || []);
          setPages(data.pagination?.pages || 0);
          setTotal(data.pagination?.total || 0);
        }
      } else {
        setMovements([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load inventory movements:', err);
      setError(err?.message || 'Failed to load inventory movements');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, dateFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getInventoryMovementStats();
      
      if (response.success && response.data) {
        setStats(response.data as MovementStats);
      } else {
        // Calculate stats from current movements if API doesn't exist
        const inboundMovements = movements.filter(m => m.type === 'in').length;
        const outboundMovements = movements.filter(m => m.type === 'out').length;
        const adjustments = movements.filter(m => m.type === 'adjustment').length;
        const transfers = movements.filter(m => m.type === 'transfer').length;
        
        const totalValueIn = movements
          .filter(m => m.type === 'in')
          .reduce((sum, m) => sum + m.totalValue, 0);
        const totalValueOut = movements
          .filter(m => m.type === 'out')
          .reduce((sum, m) => sum + m.totalValue, 0);
        
        const today = new Date().toDateString();
        const movementsToday = movements.filter(m => 
          new Date(m.timestamp).toDateString() === today
        ).length;
        
        // Calculate top products
        const productStats: Record<string, { name: string; movements: number; totalQuantity: number }> = {};
        movements.forEach(m => {
          if (!productStats[m.productId]) {
            productStats[m.productId] = { name: m.productName, movements: 0, totalQuantity: 0 };
          }
          productStats[m.productId].movements++;
          productStats[m.productId].totalQuantity += Math.abs(m.quantity);
        });
        
        const topProducts = Object.entries(productStats)
          .map(([productId, stats]) => ({ 
            productId, 
            productName: stats.name, 
            movements: stats.movements, 
            totalQuantity: stats.totalQuantity 
          }))
          .sort((a, b) => b.movements - a.movements)
          .slice(0, 5);
        
        setStats({
          totalMovements: movements.length,
          movementsToday,
          inboundMovements,
          outboundMovements,
          adjustments,
          transfers,
          totalValueIn,
          totalValueOut,
          netValue: totalValueIn - totalValueOut,
          topProducts
        });
      }
    } catch (err) {
      console.error('Failed to load movement stats:', err);
      // Use fallback stats
      setStats({
        totalMovements: 0,
        movementsToday: 0,
        inboundMovements: 0,
        outboundMovements: 0,
        adjustments: 0,
        transfers: 0,
        totalValueIn: 0,
        totalValueOut: 0,
        netValue: 0,
        topProducts: []
      });
    }
  }, [movements]);

  const handleSearch = () => {
    setPage(1);
    loadMovements(1, searchTerm, typeFilter, dateFilter);
  };

  const handleRefresh = () => {
    loadMovements(page, searchTerm, typeFilter, dateFilter);
    loadStats();
  };

  useEffect(() => {
    loadMovements(1);
  }, [loadMovements]);

  useEffect(() => {
    if (movements.length > 0) {
      loadStats();
    }
  }, [movements, loadStats]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800';
      case 'out': return 'bg-red-100 text-red-800';
      case 'adjustment': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="h-4 w-4" />;
      case 'out': return <TrendingDown className="h-4 w-4" />;
      case 'adjustment': return <Settings className="h-4 w-4" />;
      case 'transfer': return <ArrowUpDown className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getRelatedIcon = (type?: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'purchase': return <Package className="h-4 w-4" />;
      case 'return': return <ArrowUpDown className="h-4 w-4" />;
      case 'transfer': return <Truck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
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
        <ArrowUpDown className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Inventory Movements</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm || typeFilter !== 'all' || dateFilter !== 'all'
          ? 'No movements match your current filters.'
          : 'No inventory movements have been recorded yet.'
        }
      </p>
      {(searchTerm || typeFilter !== 'all' || dateFilter !== 'all') && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setTypeFilter('all');
            setDateFilter('all');
            setPage(1);
            loadMovements(1, '', 'all', 'all');
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
        <ArrowUpDown className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Inventory Movements</h3>
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Inventory Movements</h1>
          <p className="text-muted-foreground">
            Track all inventory changes and stock movements
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ArrowUpDown className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalMovements}</div>
                  <div className="text-sm text-muted-foreground">Total Movements</div>
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
                  <div className="text-2xl font-bold">{stats.inboundMovements}</div>
                  <div className="text-sm text-muted-foreground">Inbound</div>
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
                  <div className="text-2xl font-bold">{stats.outboundMovements}</div>
                  <div className="text-sm text-muted-foreground">Outbound</div>
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
                  <div className="text-2xl font-bold">{formatCurrency(Math.abs(stats.netValue))}</div>
                  <div className="text-sm text-muted-foreground">
                    Net Value {stats.netValue >= 0 ? '↑' : '↓'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Products */}
      {stats && stats.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-muted-foreground">{product.movements} movements</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{product.totalQuantity} units</div>
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
                  placeholder="Search by product name, SKU, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="in">Inbound</option>
                <option value="out">Outbound</option>
                <option value="adjustment">Adjustment</option>
                <option value="transfer">Transfer</option>
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Movements ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && movements.length === 0 ? (
            renderLoadingState()
          ) : error && movements.length === 0 ? (
            renderErrorState()
          ) : movements.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {movements.map((movement) => (
                <Card key={movement.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getTypeIcon(movement.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{movement.productName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>SKU: {movement.sku}</span>
                            <span>{movement.category}</span>
                            <span>By: {movement.user.name}</span>
                            <span>{formatDate(movement.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm mt-1">
                            <span>Qty: {movement.quantity > 0 ? '+' : ''}{movement.quantity}</span>
                            <span>Stock: {movement.previousStock} → {movement.newStock}</span>
                            <span>Value: {formatCurrency(movement.totalValue)}</span>
                            <span>Reason: {movement.reason}</span>
                          </div>
                          {movement.relatedTo && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              {getRelatedIcon(movement.relatedTo.type)}
                              <span>Related to {movement.relatedTo.type}: {movement.relatedTo.reference}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={getTypeColor(movement.type)}>
                          {movement.type.toUpperCase()}
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
                              <Link href={`/dashboard/products/${movement.productId}`} className="flex items-center w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Product
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/inventory/${movement.productId}`} className="flex items-center w-full">
                                <Package className="h-4 w-4 mr-2" />
                                View Inventory
                              </Link>
                            </DropdownMenuItem>
                            {movement.relatedTo && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Link 
                                    href={`/dashboard/${movement.relatedTo.type}s/${movement.relatedTo.id}`} 
                                    className="flex items-center w-full"
                                  >
                                    {getRelatedIcon(movement.relatedTo.type)}
                                    <span className="ml-2">View {movement.relatedTo.type}</span>
                                  </Link>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <User className="h-4 w-4 mr-2" />
                              Contact User
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} movements
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadMovements(np, searchTerm, typeFilter, dateFilter); 
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
                loadMovements(np, searchTerm, typeFilter, dateFilter); 
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