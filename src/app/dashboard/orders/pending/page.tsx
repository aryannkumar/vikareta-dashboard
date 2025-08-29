'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Clock,
  Eye, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Package,
  User,
  Calendar,
  DollarSign,
  ArrowRight
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

interface PendingOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
    sku: string;
  }>;
  totalAmount: number;
  currency: string;
  status: 'pending_confirmation' | 'pending_payment' | 'pending_stock' | 'pending_approval';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'failed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  expectedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  pendingSince: string;
  actionRequired: string;
}

interface PendingOrderStats {
  totalPending: number;
  pendingConfirmation: number;
  pendingPayment: number;
  pendingStock: number;
  pendingApproval: number;
  totalValue: number;
  averageAge: number;
  urgentOrders: number;
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [stats, setStats] = useState<PendingOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadPendingOrders = useCallback(async (p = 1, searchT = searchTerm, statusF = statusFilter, priorityF = priorityFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20,
        status: 'pending' // Base filter for pending orders
      };
      
      if (searchT.trim()) params.search = searchT.trim();
      if (statusF !== 'all' && statusF) params.pendingType = statusF;
      if (priorityF !== 'all' && priorityF) params.priority = priorityF;

      const response = await apiClient.getOrders(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setOrders(data);
          setPages(1);
          setTotal(data.length);
        } else {
          setOrders(data.orders || data.data || []);
          setPages(data.pagination?.pages || 0);
          setTotal(data.pagination?.total || 0);
        }
      } else {
        setOrders([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load pending orders:', err);
      setError(err?.message || 'Failed to load pending orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getPendingOrderStats();
      
      if (response.success && response.data) {
        setStats(response.data as PendingOrderStats);
      } else {
        // Calculate stats from current orders if API doesn't exist
        const pendingConfirmation = orders.filter(o => o.status === 'pending_confirmation').length;
        const pendingPayment = orders.filter(o => o.status === 'pending_payment').length;
        const pendingStock = orders.filter(o => o.status === 'pending_stock').length;
        const pendingApproval = orders.filter(o => o.status === 'pending_approval').length;
        const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const urgentOrders = orders.filter(o => o.priority === 'urgent').length;
        
        setStats({
          totalPending: orders.length,
          pendingConfirmation,
          pendingPayment,
          pendingStock,
          pendingApproval,
          totalValue,
          averageAge: 2.5, // Default value in days
          urgentOrders
        });
      }
    } catch (err) {
      console.error('Failed to load pending order stats:', err);
      // Use fallback stats
      setStats({
        totalPending: 0,
        pendingConfirmation: 0,
        pendingPayment: 0,
        pendingStock: 0,
        pendingApproval: 0,
        totalValue: 0,
        averageAge: 0,
        urgentOrders: 0
      });
    }
  }, [orders]);

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      const response = await apiClient.updateOrderStatus(orderId, action);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Order ${action} successfully.`,
        });
        loadPendingOrders();
        loadStats();
      } else {
        throw new Error(response.error?.message || `Failed to ${action} order`);
      }
    } catch (error: any) {
      console.error(`Failed to ${action} order:`, error);
      toast({
        title: 'Error',
        description: error?.message || `Failed to ${action} order. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadPendingOrders(1, searchTerm, statusFilter, priorityFilter);
  };

  const handleRefresh = () => {
    loadPendingOrders(page, searchTerm, statusFilter, priorityFilter);
    loadStats();
  };

  useEffect(() => {
    loadPendingOrders(1);
  }, [loadPendingOrders]);

  useEffect(() => {
    if (orders.length > 0) {
      loadStats();
    }
  }, [orders, loadStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_confirmation': return 'bg-yellow-100 text-yellow-800';
      case 'pending_payment': return 'bg-red-100 text-red-800';
      case 'pending_stock': return 'bg-orange-100 text-orange-800';
      case 'pending_approval': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_confirmation': return <Clock className="h-4 w-4" />;
      case 'pending_payment': return <DollarSign className="h-4 w-4" />;
      case 'pending_stock': return <Package className="h-4 w-4" />;
      case 'pending_approval': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_confirmation': return 'Pending Confirmation';
      case 'pending_payment': return 'Pending Payment';
      case 'pending_stock': return 'Pending Stock';
      case 'pending_approval': return 'Pending Approval';
      default: return status;
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
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Pending Orders</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
          ? 'No pending orders match your current filters.'
          : 'Great! You have no pending orders at the moment.'
        }
      </p>
      {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setPriorityFilter('all');
            setPage(1);
            loadPendingOrders(1, '', 'all', 'all');
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
        <XCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Pending Orders</h3>
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Pending Orders</h1>
          <p className="text-muted-foreground">
            Manage orders that require your attention
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
          <Link href="/dashboard/orders">
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              All Orders
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
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalPending}</div>
                  <div className="text-sm text-muted-foreground">Total Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.urgentOrders}</div>
                  <div className="text-sm text-muted-foreground">Urgent Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.averageAge.toFixed(1)}d</div>
                  <div className="text-sm text-muted-foreground">Avg Age</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="pending_confirmation">Pending Confirmation</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="pending_stock">Pending Stock</option>
                <option value="pending_approval">Pending Approval</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Orders ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && orders.length === 0 ? (
            renderLoadingState()
          ) : error && orders.length === 0 ? (
            renderErrorState()
          ) : orders.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="font-medium">#{order.orderNumber}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{order.customer.name}</span>
                            <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                            <span>Pending since {formatDate(order.pendingSince)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Action required: {order.actionRequired}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
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
                              <Link href={`/dashboard/orders/${order.id}`} className="flex items-center w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === 'pending_confirmation' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleOrderAction(order.id, 'confirmed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Order
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOrderAction(order.id, 'cancelled')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </>
                            )}
                            {order.status === 'pending_approval' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleOrderAction(order.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Order
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOrderAction(order.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Order
                                </DropdownMenuItem>
                              </>
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} pending orders
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadPendingOrders(np, searchTerm, statusFilter, priorityFilter); 
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
                loadPendingOrders(np, searchTerm, statusFilter, priorityFilter); 
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