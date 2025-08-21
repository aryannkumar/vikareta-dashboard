/**
 * Products Management Page
 * Enhanced product listing with amber theme, animations, and seller-focused features
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Package,
  Download,
  Upload,
  Grid3X3,
  List,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  ShoppingCart,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate, formatNumber, cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  stockQuantity: number;
  category: { name: string };
  status: 'active' | 'inactive' | 'draft';
  media: Array<{ url: string; alt: string }>;
  createdAt: string;
  updatedAt: string;
  // Enhanced seller metrics
  views?: number;
  orders?: number;
  revenue?: number;
  rating?: number;
  reviewCount?: number;
  profit?: number;
  margin?: number;
  trending?: boolean;
  featured?: boolean;
  isLowStock?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts({
        search: searchTerm,
        status: statusFilter,
        limit: 50,
        sortBy,
        sortOrder
      });

      if (response.success && response.data) {
        const data = response.data as any;
        const productList = Array.isArray(data) ? data : data.products || data.data || [];
        
        // Add mock seller metrics for demonstration
        const enhancedProducts = productList.map((product: Product) => ({
          ...product,
          views: Math.floor(Math.random() * 1000) + 100,
          orders: Math.floor(Math.random() * 50) + 1,
          revenue: (Math.floor(Math.random() * 50) + 1) * product.price,
          rating: 4 + Math.random(),
          reviewCount: Math.floor(Math.random() * 50) + 1,
          profit: product.price * 0.3,
          margin: 25 + Math.random() * 10,
          trending: Math.random() > 0.7,
          featured: Math.random() > 0.8,
          isLowStock: product.stockQuantity < 10
        }));
        
        setProducts(enhancedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateProduct(productId, { status: newStatus });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Product status updated successfully.',
        });
        loadProducts();
      } else {
        throw new Error('Failed to update product status');
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await apiClient.deleteProduct(productId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully.',
        });
        loadProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return { label: 'Out of Stock', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' };
    } else if (product.isLowStock) {
      return { label: 'Low Stock', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    } else {
      return { label: 'In Stock', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    }
  };

  // Calculate overview metrics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const lowStockCount = products.filter(p => p.isLowStock || p.stockQuantity === 0).length;
  const averageMargin = products.length > 0 ? products.reduce((sum, p) => sum + (p.margin || 0), 0) / products.length : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Product Catalog
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Manage your product catalog, inventory, and performance analytics.
          </motion.p>
        </div>
        
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadProducts}
              disabled={loading}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/products/new">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Products",
            value: formatNumber(totalProducts),
            description: `${activeProducts} active`,
            icon: Package,
            color: "blue",
            trend: activeProducts > 0 ? "up" : "stable"
          },
          {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            description: "From product sales",
            icon: DollarSign,
            color: "green",
            trend: "up"
          },
          {
            title: "Stock Alerts",
            value: lowStockCount.toString(),
            description: "Need attention",
            icon: AlertTriangle,
            color: lowStockCount > 0 ? "red" : "gray",
            trend: lowStockCount > 0 ? "down" : "stable"
          },
          {
            title: "Avg Margin",
            value: `${averageMargin.toFixed(1)}%`,
            description: "Profit margin",
            icon: Percent,
            color: "purple",
            trend: averageMargin > 25 ? "up" : "stable"
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-${metric.color}-200/50 dark:border-${metric.color}-800/30 hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{metric.title}</p>
                    <p className={`text-2xl font-bold text-${metric.color}-700 dark:text-${metric.color}-300`}>
                      {metric.value}
                    </p>
                    <p className={`text-xs text-${metric.color}-600 dark:text-${metric.color}-400 mt-1 flex items-center`}>
                      {metric.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                      {metric.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                      {metric.description}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className={`w-12 h-12 bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <metric.icon className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                  <Input
                    placeholder="Search products by name, SKU, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-amber-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}>
                  <SelectTrigger className="w-48 border-amber-200">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Recently Added</SelectItem>
                    <SelectItem value="title-asc">Name A-Z</SelectItem>
                    <SelectItem value="title-desc">Name Z-A</SelectItem>
                    <SelectItem value="price-desc">Price High-Low</SelectItem>
                    <SelectItem value="price-asc">Price Low-High</SelectItem>
                    <SelectItem value="stockQuantity-asc">Stock Low-High</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-amber-200 rounded-md">
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-l-md transition-colors',
                      viewMode === 'grid' 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-white text-gray-600 hover:bg-amber-50'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode('table')}
                    className={cn(
                      'p-2 rounded-r-md transition-colors',
                      viewMode === 'table' 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-white text-gray-600 hover:bg-amber-50'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <List className="h-4 w-4" />
                  </motion.button>
                </div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleSearch} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Display */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
          <CardContent className="p-0">
            {loading ? (
              <motion.div 
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
              </motion.div>
            ) : products.length > 0 ? (
              <AnimatePresence mode="wait">
                {viewMode === 'table' ? (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-amber-200/50 dark:border-amber-800/30">
                          <TableHead className="text-gray-700 dark:text-gray-300">Product</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Price</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Stock</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Performance</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Created</TableHead>
                          <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product, index) => {
                          const stockStatus = getStockStatus(product);
                          return (
                            <motion.tr
                              key={product.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                                    {product.media && product.media.length > 0 ? (
                                      <div 
                                        className="w-full h-full bg-cover bg-center rounded-lg"
                                        style={{ 
                                          backgroundImage: `url(${product.media[0].url})` 
                                        }}
                                        title={product.title}
                                      />
                                    ) : (
                                      <Package className="h-6 w-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                      {product.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {product.category?.name || 'Uncategorized'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      ID: {product.id.slice(0, 8)}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(product.price)}
                                  </p>
                                  {product.margin && (
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                      {product.margin.toFixed(1)}% margin
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", stockStatus.bgColor, stockStatus.color)}>
                                  {product.stockQuantity} units
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {stockStatus.label}
                                </p>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1 text-yellow-600">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="text-sm">{product.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {product.orders || 0} orders • {formatCurrency(product.revenue || 0)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {product.views || 0} views
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge className={cn("text-xs w-fit", getStatusColor(product.status))}>
                                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                  </Badge>
                                  {product.trending && (
                                    <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs w-fit">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Trending
                                    </Badge>
                                  )}
                                  {product.featured && (
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs w-fit">
                                      <Star className="h-3 w-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400">
                                {formatDate(product.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button variant="ghost" size="sm" className="hover:bg-amber-50 dark:hover:bg-amber-900/30">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-amber-200 dark:border-amber-800">
                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                                      <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
                                      <Edit className="h-4 w-4 mr-2 text-amber-600" />
                                      Edit Product
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/analytics/products/${product.id}`)}>
                                      <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                                      View Analytics
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(
                                        product.id, 
                                        product.status === 'active' ? 'inactive' : 'active'
                                      )}
                                    >
                                      {product.status === 'active' ? (
                                        <>
                                          <EyeOff className="h-4 w-4 mr-2 text-yellow-600" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="h-4 w-4 mr-2 text-green-600" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(product.id)}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Product
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {products.map((product, index) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                        >
                          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                            <div className="relative">
                              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                                {product.media && product.media.length > 0 ? (
                                  <div 
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ 
                                      backgroundImage: `url(${product.media[0].url})` 
                                    }}
                                    title={product.title}
                                  />
                                ) : (
                                  <Package className="h-12 w-12 text-gray-400" />
                                )}
                              </div>
                              
                              {/* Status Badges */}
                              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                <Badge className={cn("text-xs", getStatusColor(product.status))}>
                                  {product.status.toUpperCase()}
                                </Badge>
                                {product.trending && (
                                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Trending
                                  </Badge>
                                )}
                                {product.featured && (
                                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>

                              {/* Quick Actions */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.push(`/dashboard/products/${product.id}`)}
                                    className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md"
                                  >
                                    <Eye className="h-3 w-3 text-gray-600" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                                    className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md"
                                  >
                                    <Edit className="h-3 w-3 text-gray-600" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>

                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm">
                                    {product.title}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {product.category?.name || 'Uncategorized'}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                      {formatCurrency(product.price)}
                                    </p>
                                    {product.margin && (
                                      <p className="text-xs text-green-600">
                                        {product.margin.toFixed(1)}% margin
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className={cn("text-xs font-medium", stockStatus.color)}>
                                      {product.stockQuantity} units
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {stockStatus.label}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-1 text-yellow-600">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span>{product.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="text-gray-500">({product.reviewCount || 0})</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-gray-500">
                                    <ShoppingCart className="h-3 w-3" />
                                    <span>{product.orders || 0} orders</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Revenue</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(product.revenue || 0)}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <motion.div 
                className="p-12 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Package className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Get started by adding your first product to the catalog.'
                  }
                </p>
                {!searchTerm && !statusFilter && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/dashboard/products/new">
                      <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}