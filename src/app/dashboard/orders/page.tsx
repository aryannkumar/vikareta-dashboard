/**
 * Enhanced Orders Management Page
 * Complete order management with amber theme, animations, and seller-focused features
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { useOrders } from '@/lib/hooks/use-orders';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Package,
  CheckCircle,
  RefreshCw,
  ArrowUpDown,
  Truck,
  DollarSign,
  MoreHorizontal,
  Printer,
  Send,
  XCircle,
  Settings,
  ShoppingBag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

// Types
interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  orderType?: string;
  dateRange?: string;
  minAmount?: number;
  maxAmount?: number;
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

export default function OrdersPageEnhanced() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const {
    orders,
    loading,
    error,
    pagination,
    loadOrders,
    updateOrderStatus,
    refresh,
    setPage
  } = useOrders({
    autoLoad: true,
    search: searchTerm,
    ...filters
  });

  const handleSearch = () => {
    setPage(1);
    loadOrders({ search: searchTerm, ...filters });
  };

  const handleSort = (field: string) => {
    loadOrders({ sortBy: field });
  };

  const handleExport = async () => {
    toast({
      title: 'Export Started',
      description: 'Your order export is being prepared. You\'ll receive a download link shortly.',
    });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) return;
    
    try {
      // Execute bulk action via API
      const response = await apiClient.bulkOrderAction(selectedOrders, action);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Bulk action failed');
      }
      
      toast({
        title: 'Bulk Action Completed',
        description: `${action} applied to ${selectedOrders.length} orders successfully.`,
      });
      
      setSelectedOrders([]);
      refresh();
    } catch (err) {
      console.error('Bulk action error:', err);
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast({
        title: 'Status Updated',
        description: 'Order status has been updated successfully.',
      });
    } catch (err) {
      console.error('Status update error:', err);
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading && !orders.length) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p 
            className="text-gray-600 dark:text-gray-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading orders...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          <Package className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Error Loading Orders</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={refresh} className="bg-amber-500 hover:bg-amber-600 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      processing: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
      shipped: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
      delivered: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      paid: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      failed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const productOrders = orders.filter(o => o.orderType === 'product').length;
  const serviceOrders = orders.filter(o => o.orderType === 'service').length;

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
            Order Management
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Track, manage, and fulfill your customer orders efficiently.
          </motion.p>
          {error && (
            <motion.p 
              className="text-red-600 dark:text-red-400 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {error}
            </motion.p>
          )}
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
              onClick={handleExport}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={refresh}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {[
          {
            title: "Total Orders",
            value: pagination?.total || orders.length,
            description: `${pendingOrders} pending`,
            icon: Package,
            color: "blue",
            trend: "up"
          },
          {
            title: "Product Orders",
            value: productOrders,
            description: `${((productOrders / (orders.length || 1)) * 100).toFixed(1)}% of total`,
            icon: ShoppingBag,
            color: "amber",
            trend: "up"
          },
          {
            title: "Service Orders",
            value: serviceOrders,
            description: `${((serviceOrders / (orders.length || 1)) * 100).toFixed(1)}% of total`,
            icon: Settings,
            color: "purple",
            trend: "up"
          },
          {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            description: "From all orders",
            icon: DollarSign,
            color: "green",
            trend: "up"
          },
          {
            title: "Order Fulfillment",
            value: `${deliveredOrders}/${orders.length}`,
            description: `${((deliveredOrders / (orders.length || 1)) * 100).toFixed(1)}% success rate`,
            icon: CheckCircle,
            color: "emerald",
            trend: deliveredOrders > shippedOrders ? "up" : "stable"
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

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                  <Input
                    placeholder="Search orders by order number, buyer, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={filters.orderType || ''}
                  onValueChange={(value) => setFilters({ ...filters, orderType: value })}
                >
                  <SelectTrigger className="w-40 border-amber-200">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="product">Product Orders</SelectItem>
                    <SelectItem value="service">Service Orders</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="w-40 border-amber-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.paymentStatus || ''}
                  onValueChange={(value) => setFilters({ ...filters, paymentStatus: value })}
                >
                  <SelectTrigger className="w-40 border-amber-200">
                    <SelectValue placeholder="All Payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handleSearch}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {selectedOrders.length} orders selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrders([])}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('confirm')}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('ship')}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Ship
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('cancel')}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Orders ({pagination?.total || orders.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Package className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No orders found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  {searchTerm || Object.keys(filters).length > 0 
                    ? 'Try adjusting your search or filters.' 
                    : 'Orders will appear here when customers place them.'}
                </p>
                {(searchTerm || Object.keys(filters).length > 0) && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({});
                        setPage(1);
                      }}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      Clear Filters
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-200/50 dark:border-amber-800/30">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders(orders.map(o => o.id));
                            } else {
                              setSelectedOrders([]);
                            }
                          }}
                          className="rounded border-amber-300"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Order</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('totalAmount')}
                          className="flex items-center space-x-1 hover:text-amber-600 text-gray-700 dark:text-gray-300"
                        >
                          <span>Amount</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Payment</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Items</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center space-x-1 hover:text-amber-600 text-gray-700 dark:text-gray-300"
                        >
                          <span>Created</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <motion.tr 
                        key={order.id} 
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders([...selectedOrders, order.id]);
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                              }
                            }}
                            className="rounded border-amber-300"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                              order.orderType === 'service' 
                                ? 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900'
                                : 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900'
                            }`}>
                              {order.orderType === 'service' ? (
                                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                              ) : (
                                <ShoppingBag className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                              )}
                            </div>
                            <div>
                              <Link 
                                href={`/dashboard/orders/${order.id}`}
                                className="font-medium hover:text-amber-600 text-gray-900 dark:text-gray-100"
                              >
                                Order #{order.orderNumber}
                              </Link>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-500">Buyer ID: {order.buyerId}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    order.orderType === 'service' 
                                      ? 'border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:bg-purple-900/20'
                                      : 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:bg-amber-900/20'
                                  }`}
                                >
                                  {order.orderType === 'service' ? 'Service' : 'Product'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {order.items.length} items
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-gray-100">{formatDate(order.createdAt)}</div>
                            <div className="text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" size="sm" className="hover:bg-amber-50 dark:hover:bg-amber-900/30">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-amber-200 dark:border-amber-800">
                              <DropdownMenuItem>
                                <Link href={`/dashboard/orders/${order.id}`} className="flex items-center w-full">
                                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'confirmed')}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Confirm Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                                <Truck className="h-4 w-4 mr-2 text-blue-600" />
                                Mark as Shipped
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2 text-gray-600" />
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2 text-purple-600" />
                                Send Message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination && pagination.total > pagination.pageSize && (
                  <motion.div 
                    className="flex items-center justify-between mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((pagination.current - 1) * pagination.pageSize) + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} orders
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(pagination.current - 1)}
                          disabled={pagination.current === 1}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          Previous
                        </Button>
                      </motion.div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination.current} of {pagination.totalPages}
                      </span>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(pagination.current + 1)}
                          disabled={pagination.current >= pagination.totalPages}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          Next
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}