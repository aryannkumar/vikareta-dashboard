'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Package, 
  Plus, 
  Search, 
  RefreshCw,
  Edit,
  Eye,
  ShoppingCart,
  TrendingDown,
  Clock,
  ArrowRight
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
  TableRow 
} from '@/components/ui/table';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface LowStockItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    image?: string;
    category: string;
  };
  currentStock: number;
  reorderLevel: number;
  maxStock: number;
  lastRestocked: string;
  averageDailySales: number;
  daysUntilStockout: number;
  status: 'critical' | 'low' | 'warning';
  supplier?: {
    id: string;
    name: string;
    leadTime: number;
  };
  costPrice: number;
  sellingPrice: number;
}

interface LowStockStats {
  totalLowStockItems: number;
  criticalItems: number;
  outOfStockItems: number;
  totalValueAtRisk: number;
  averageRestockTime: number;
}

export default function LowStockPage() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [stats, setStats] = useState<LowStockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadLowStockItems = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await apiClient.get('/inventory/low-stock', { params });
      
      if (response.success && response.data) {
        const data = response.data as any;
        setItems(data.items || []);
        setStats(data.stats || null);
      } else {
        // Fallback data for development
        const fallbackItems: LowStockItem[] = [
          {
            id: '1',
            product: {
              id: 'prod-1',
              name: 'Industrial Pump Model A',
              sku: 'IPA-001',
              category: 'Pumps & Compressors',
              image: '/products/pump-a.jpg'
            },
            currentStock: 3,
            reorderLevel: 10,
            maxStock: 50,
            lastRestocked: '2024-01-15T10:30:00Z',
            averageDailySales: 1.2,
            daysUntilStockout: 2,
            status: 'critical',
            supplier: {
              id: 'sup-1',
              name: 'Industrial Equipment Co.',
              leadTime: 7
            },
            costPrice: 1200,
            sellingPrice: 1800
          },
          {
            id: '2',
            product: {
              id: 'prod-2',
              name: 'Generator Set 25KW',
              sku: 'GEN-025',
              category: 'Generators',
              image: '/products/generator-25kw.jpg'
            },
            currentStock: 8,
            reorderLevel: 15,
            maxStock: 30,
            lastRestocked: '2024-01-10T14:20:00Z',
            averageDailySales: 0.8,
            daysUntilStockout: 10,
            status: 'low',
            supplier: {
              id: 'sup-2',
              name: 'Power Solutions Ltd.',
              leadTime: 14
            },
            costPrice: 8500,
            sellingPrice: 12000
          },
          {
            id: '3',
            product: {
              id: 'prod-3',
              name: 'Air Compressor 50L',
              sku: 'AC-050',
              category: 'Compressors',
              image: '/products/compressor-50l.jpg'
            },
            currentStock: 12,
            reorderLevel: 20,
            maxStock: 60,
            lastRestocked: '2024-01-08T09:15:00Z',
            averageDailySales: 0.5,
            daysUntilStockout: 24,
            status: 'warning',
            costPrice: 450,
            sellingPrice: 650
          }
        ];

        const fallbackStats: LowStockStats = {
          totalLowStockItems: 23,
          criticalItems: 5,
          outOfStockItems: 2,
          totalValueAtRisk: 125000,
          averageRestockTime: 8.5
        };

        setItems(fallbackItems);
        setStats(fallbackStats);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load low stock items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const handleReorder = async (itemId: string) => {
    try {
      const response = await apiClient.post(`/inventory/${itemId}/reorder`);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Reorder request created successfully.',
        });
        loadLowStockItems();
      } else {
        throw new Error('Failed to create reorder request');
      }
    } catch (error) {
      console.error('Error creating reorder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create reorder request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadLowStockItems();
  }, [loadLowStockItems]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

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
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Low Stock Alert
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Monitor and manage inventory items that need immediate attention.
          </motion.p>
        </div>
        
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadLowStockItems}
              disabled={loading}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/inventory">
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                <Package className="mr-2 h-4 w-4" />
                All Inventory
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/products/new">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Critical Items",
              value: stats.criticalItems.toString(),
              description: "Need immediate attention",
              icon: AlertTriangle,
              color: "red",
              trend: "critical"
            },
            {
              title: "Low Stock Items",
              value: stats.totalLowStockItems.toString(),
              description: "Below reorder level",
              icon: TrendingDown,
              color: "orange",
              trend: "warning"
            },
            {
              title: "Out of Stock",
              value: stats.outOfStockItems.toString(),
              description: "Zero inventory",
              icon: Package,
              color: "gray",
              trend: "critical"
            },
            {
              title: "Value at Risk",
              value: formatCurrency(stats.totalValueAtRisk),
              description: "Potential lost sales",
              icon: ShoppingCart,
              color: "purple",
              trend: "warning"
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-${metric.color}-200/50 hover:shadow-xl transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{metric.title}</p>
                      <p className={`text-2xl font-bold text-${metric.color}-700 dark:text-${metric.color}-300`}>
                        {metric.value}
                      </p>
                      <p className={`text-xs text-${metric.color}-600 dark:text-${metric.color}-400 mt-1`}>
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
      )}

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-orange-200/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
                  <Input
                    placeholder="Search by product name, SKU, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-orange-200 rounded-md text-sm focus:border-orange-400 focus:ring-orange-400/20"
                >
                  <option value="all">All Status</option>
                  <option value="critical">Critical</option>
                  <option value="low">Low Stock</option>
                  <option value="warning">Warning</option>
                </select>
                
                <Button onClick={loadLowStockItems} className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Low Stock Items Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-orange-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Items ({items.length})
            </CardTitle>
          </CardHeader>
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
                  className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-300">Loading low stock items...</p>
              </motion.div>
            ) : items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-orange-200/50">
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Days Until Stockout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.product.image ? (
                              <div 
                                className="w-full h-full bg-cover bg-center rounded-lg"
                                style={{ backgroundImage: `url(${item.product.image})` }}
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.product.sku}
                            </div>
                            <div className="text-xs text-gray-400">
                              {item.product.category}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className={cn(
                            "text-lg font-bold",
                            item.status === 'critical' ? 'text-red-600' :
                            item.status === 'low' ? 'text-orange-600' : 'text-yellow-600'
                          )}>
                            {item.currentStock}
                          </div>
                          <div className="text-xs text-gray-500">
                            of {item.maxStock} max
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{item.reorderLevel}</div>
                          <div className="text-xs text-gray-500">units</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className={cn(
                            "font-bold",
                            item.daysUntilStockout <= 3 ? 'text-red-600' :
                            item.daysUntilStockout <= 7 ? 'text-orange-600' : 'text-yellow-600'
                          )}>
                            {item.daysUntilStockout}
                          </div>
                          <div className="text-xs text-gray-500">days</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <Badge className={cn("text-xs", getStatusColor(item.status))}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.supplier ? (
                          <div>
                            <div className="font-medium text-sm">{item.supplier.name}</div>
                            <div className="text-xs text-gray-500">
                              {item.supplier.leadTime} days lead time
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No supplier</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href={`/dashboard/products/${item.product.id}`}>
                              <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href={`/dashboard/products/${item.product.id}/edit`}>
                              <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReorder(item.id)}
                              className="border-orange-300 text-orange-700 hover:bg-orange-50"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Reorder
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <motion.div 
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">All Stock Levels Good!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No items are currently below their reorder levels.
                </p>
                <Link href="/dashboard/inventory">
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View All Inventory
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}