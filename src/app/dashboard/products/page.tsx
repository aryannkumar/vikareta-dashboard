'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useProducts } from '@/lib/hooks/use-products';
import { formatDate } from '@/lib/utils';
import type { Product } from '@/types';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Package,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Types

interface ProductFilters {
  status?: string;
  category?: string;
  visibility?: string;
  stockStatus?: string;
  priceRange?: string;
  dateRange?: string;
  vendor?: string;
}



export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const {
    products,
    loading,
    error,
    pagination,
    loadProducts,
    deleteProduct,
    refresh,
    setPage,
    setPageSize
  } = useProducts({
    autoLoad: true,
    search: searchTerm,
    ...filters
  });

  const handleSearch = () => {
    setPage(1);
    loadProducts({ search: searchTerm, ...filters });
  };

  const handleSort = (field: string) => {
    loadProducts({ sortBy: field });
  };

  const handleExport = async () => {
    // Export functionality would be implemented here
    console.log('Export products');
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) return;
    
    // Bulk actions would be implemented here
    console.log(`Bulk ${action}:`, selectedProducts);
    setSelectedProducts([]);
    refresh();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    const success = await deleteProduct(productId);
    if (success) {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Products</h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getStockStatus = (product: Product) => {
    if (product.isService) return { status: 'service', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', text: 'Service' };
    if (product.stockQuantity === 0) return { status: 'out', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Out of Stock' };
    if (product.stockQuantity <= 10) return { status: 'low', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: 'Low Stock' };
    return { status: 'good', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'In Stock' };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Button 
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{pagination.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Published & visible</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {products.filter(p => !p.isService && p.stockQuantity <= 10).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Need restocking</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by title, SKU, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </Select>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="textiles">Textiles</option>
                  <option value="machinery">Machinery</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="automotive">Automotive</option>
                </Select>
                <Select
                  value={filters.stockStatus || ''}
                  onValueChange={(value) => setFilters({ ...filters, stockStatus: value })}
                >
                  <option value="">All Stock</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </Select>
                <Button variant="outline" onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Products ({pagination?.total || 0})</CardTitle>
              {selectedProducts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedProducts.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                  >
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('deactivate')}
                  >
                    Deactivate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-8">
                  {searchTerm || Object.keys(filters).length > 0 
                    ? 'Try adjusting your search or filters.' 
                    : 'Add your first product to start selling.'}
                </p>
                {searchTerm || Object.keys(filters).length > 0 ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({});
                      setPage(1);
                      loadProducts();
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/dashboard/products/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(products.map(p => p.id));
                            } else {
                              setSelectedProducts([]);
                            }
                          }}
                          className="rounded border-border"
                        />
                      </th>
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('price')}
                          className="flex items-center space-x-1 hover:text-primary"
                        >
                          <span>Price</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">Stock</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center space-x-1 hover:text-primary"
                        >
                          <span>Created</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProducts([...selectedProducts, product.id]);
                                } else {
                                  setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                }
                              }}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                {product.media.length > 0 ? (
                                  <Image
                                    src={product.media[0].url}
                                    alt={product.media[0].altText || product.title}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <Link 
                                  href={`/dashboard/products/${product.id}`}
                                  className="font-medium hover:text-primary"
                                >
                                  {product.title}
                                </Link>
                                <div className="text-sm text-muted-foreground">ID: {product.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{product.currency} {product.price.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={stockStatus.color}>
                              {stockStatus.text}
                            </Badge>
                            {!product.isService && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {product.stockQuantity} units
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(product.status)}>
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{product.categoryId}</div>
                              <div className="text-sm text-muted-foreground">{product.subcategoryId}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div>{formatDate(product.createdAt)}</div>
                              <div className="text-muted-foreground">
                                {new Date(product.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Link href={`/dashboard/products/${product.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/dashboard/products/${product.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination && pagination.total > pagination.pageSize && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.current - 1) * pagination.pageSize) + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} products
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.current - 1)}
                        disabled={pagination.current === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {pagination.current} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.current + 1)}
                        disabled={pagination.current >= pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}