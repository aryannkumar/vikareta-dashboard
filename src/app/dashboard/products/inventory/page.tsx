'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Eye,
  Download,
  Upload,
  BarChart3,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

interface InventoryItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    image?: string;
    category: string;
    brand?: string;
  };
  warehouse: {
    id: string;
    name: string;
    location: string;
  };
  stock: {
    available: number;
    reserved: number;
    total: number;
    reorderLevel: number;
    maxStock: number;
  };
  pricing: {
    costPrice: number;
    sellingPrice: number;
    margin: number;
  };
  movement: {
    lastUpdated: string;
    lastMovement: 'in' | 'out';
    lastQuantity: number;
    velocity: number; // items per day
  };
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  alerts: string[];
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockedItems: number;
  averageTurnover: number;
  warehouseCount: number;
}

interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  productName: string;
  sku: string;
  quantity: number;
  warehouse: string;
  reason: string;
  reference?: string;
  timestamp: string;
  user: string;
}

export default function ProductInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showMovements, setShowMovements] = useState(false);

  const { toast } = useToast();

  const loadInventoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [inventoryResponse, movementsResponse, statsResponse] = await Promise.all([
        vikaretaApiClient.get('/inventory/products', {
          params: {
            search: searchQuery,
            warehouse: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            sortBy,
            sortOrder
          }
        }),
        vikaretaApiClient.get('/inventory/movements', {
          params: { limit: 20 }
        }),
        vikaretaApiClient.get('/inventory/stats')
      ]);

      setInventory((inventoryResponse.data as any)?.items || []);
      setMovements((movementsResponse.data as any)?.movements || []);
      setStats((statsResponse.data as any) || {});
    } catch (error) {
      console.error('Failed to load inventory data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedWarehouse, selectedStatus, selectedCategory, sortBy, sortOrder, toast]);

  useEffect(() => {
    loadInventoryData();
  }, [loadInventoryData]);

  const handleStockAdjustment = async (itemId: string, adjustment: number, reason: string) => {
    try {
      await vikaretaApiClient.post(`/inventory/products/${itemId}/adjust`, {
        adjustment,
        reason
      });
      
      toast({
        title: "Success",
        description: "Stock adjusted successfully",
      });
      
      loadInventoryData();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdate = async (updates: Array<{ id: string; stock: number }>) => {
    try {
      await vikaretaApiClient.post('/inventory/bulk-update', { updates });
      
      toast({
        title: "Success",
        description: "Bulk update completed successfully",
      });
      
      loadInventoryData();
    } catch (error) {
      console.error('Failed to bulk update:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk update",
        variant: "destructive",
      });
    }
  };

  const handleExportInventory = async () => {
    try {
      const response = await vikaretaApiClient.get('/inventory/export', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Inventory exported successfully",
      });
    } catch (error) {
      console.error('Failed to export inventory:', error);
      toast({
        title: "Error",
        description: "Failed to export inventory",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'in-stock': 'bg-green-100 text-green-800',
      'low-stock': 'bg-yellow-100 text-yellow-800',
      'out-of-stock': 'bg-red-100 text-red-800',
      'overstocked': 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'transfer': return <Truck className="h-4 w-4 text-purple-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStockLevelColor = (item: InventoryItem) => {
    const { available, reorderLevel, maxStock } = item.stock;
    
    if (available === 0) return 'bg-red-500';
    if (available <= reorderLevel) return 'bg-yellow-500';
    if (available >= maxStock * 0.9) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStockLevelPercentage = (item: InventoryItem) => {
    const { available, maxStock } = item.stock;
    return Math.min((available / maxStock) * 100, 100);
  };

  if (isLoading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your product inventory across warehouses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportInventory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowMovements(!showMovements)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {showMovements ? 'Hide' : 'Show'} Movements
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.outOfStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Warehouses</option>
              <option value="main">Main Warehouse</option>
              <option value="secondary">Secondary Warehouse</option>
              <option value="retail">Retail Store</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="overstocked">Overstocked</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="books">Books</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <div className="space-y-4">
        {inventory.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.product.name}
                      </h3>
                      <Badge variant="outline">{item.product.sku}</Badge>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <span>{item.product.category}</span>
                      {item.product.brand && (
                        <>
                          <span>•</span>
                          <span>{item.product.brand}</span>
                        </>
                      )}
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.warehouse.name}
                      </div>
                    </div>

                    {/* Stock Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{item.stock.available}</p>
                        <p className="text-xs text-gray-600">Available</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{item.stock.reserved}</p>
                        <p className="text-xs text-gray-600">Reserved</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{item.stock.reorderLevel}</p>
                        <p className="text-xs text-gray-600">Reorder Level</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{item.movement.velocity.toFixed(1)}</p>
                        <p className="text-xs text-gray-600">Velocity/Day</p>
                      </div>
                    </div>

                    {/* Stock Level Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Stock Level</span>
                        <span className="text-xs font-medium text-gray-700">
                          {item.stock.available} / {item.stock.maxStock}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStockLevelColor(item)}`}
                          style={{ width: `${getStockLevelPercentage(item)}%` }}
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>Cost: {formatCurrency(item.pricing.costPrice)}</span>
                      <span>Price: {formatCurrency(item.pricing.sellingPrice)}</span>
                      <span>Margin: {item.pricing.margin.toFixed(1)}%</span>
                      <span>Last Updated: {formatDate(item.movement.lastUpdated)}</span>
                    </div>

                    {/* Alerts */}
                    {item.alerts.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        {item.alerts.map((alert, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {alert}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStockAdjustment(item.id, 10, 'Manual adjustment')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Stock
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStockAdjustment(item.id, -10, 'Manual adjustment')}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Remove Stock
                  </Button>
                  
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stock Movements */}
      {showMovements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Stock Movements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {getMovementIcon(movement.type)}
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        {movement.productName} ({movement.sku})
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{movement.reason}</span>
                        <span>•</span>
                        <span>{movement.warehouse}</span>
                        <span>•</span>
                        <span>{formatDate(movement.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold ${
                      movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-sm text-gray-600">{movement.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Inventory Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Attention Needed</h4>
              <p className="text-sm text-gray-600 mb-2">
                {stats ? stats.lowStockItems + stats.outOfStockItems : 0} items need restocking
              </p>
              <Badge variant="destructive">
                Action Required
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Turnover Rate</h4>
              <p className="text-sm text-gray-600 mb-2">
                {stats ? stats.averageTurnover.toFixed(1) : 0} times per month
              </p>
              <Badge className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Warehouses</h4>
              <p className="text-sm text-gray-600 mb-2">
                {stats ? stats.warehouseCount : 0} active locations
              </p>
              <Badge className="bg-blue-100 text-blue-800">
                Multi-location
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}