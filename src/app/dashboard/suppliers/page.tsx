'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  Heart,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  DollarSign,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Globe,
  Calendar,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  website?: string;
  category: string;
  rating: number;
  reviewsCount: number;
  totalOrders: number;
  totalSpent: number;
  paymentTerms: string;
  verified: boolean;
  favorite: boolean;
  status: 'active' | 'inactive' | 'blocked';
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  products?: SupplierProduct[];
  performance?: SupplierPerformance;
}

interface SupplierProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  leadTime: number;
}

interface SupplierPerformance {
  onTimeDelivery: number;
  qualityRating: number;
  responseTime: number;
  defectRate: number;
}

interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  verifiedSuppliers: number;
  favoriteSuppliers: number;
  totalSpent: number;
  averageRating: number;
  topCategories: Array<{
    category: string;
    count: number;
    totalSpent: number;
  }>;
}

interface SupplierFilters {
  search: string;
  category: string;
  status: string;
  verified: string;
  favorite: string;
  rating: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<SupplierFilters>({
    search: '',
    category: '',
    status: '',
    verified: '',
    favorite: '',
    rating: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0
  });
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Load suppliers with real-time updates
  const loadSuppliers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        category: filters.category,
        status: filters.status,
        verified: filters.verified,
        favorite: filters.favorite,
        rating: filters.rating,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const [suppliersResponse, statsResponse] = await Promise.all([
        apiClient.get(`/suppliers?${params}`),
        apiClient.get('/suppliers/stats')
      ]);

      if (suppliersResponse.success && statsResponse.success) {
        setSuppliers((suppliersResponse.data as any).suppliers);
        setPagination(prev => ({
          ...prev,
          total: (suppliersResponse.data as any).total
        }));
        setStats(statsResponse.data as any);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/suppliers/categories');
      if (response.success) {
        setCategories(response.data as string[]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  // Real-time WebSocket updates
  useEffect(() => {
    const handleSupplierUpdate = (data: any) => {
      if (data.type === 'supplier_updated') {
        setSuppliers(prev => prev.map(supplier => 
          supplier.id === data.supplier.id ? { ...supplier, ...data.supplier } : supplier
        ));
      } else if (data.type === 'new_supplier') {
        setSuppliers(prev => [data.supplier, ...prev]);
        setStats(prev => prev ? { ...prev, totalSuppliers: prev.totalSuppliers + 1 } : null);
      }
    };

    apiClient.onWebSocketEvent('supplier_update', handleSupplierUpdate);
    
    return () => {
      // Cleanup WebSocket listeners
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadSuppliers();
    loadCategories();
  }, [loadSuppliers, loadCategories]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSuppliers();
  }, [loadSuppliers]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof SupplierFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Handle sorting
  const handleSort = useCallback((sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Toggle favorite
  const handleToggleFavorite = useCallback(async (supplierId: string) => {
    try {
      const response = await apiClient.post(`/suppliers/${supplierId}/toggle-favorite`);

      if (response.success) {
        setSuppliers(prev => prev.map(supplier => 
          supplier.id === supplierId ? { ...supplier, favorite: !supplier.favorite } : supplier
        ));
        toast({
          title: "Success",
          description: "Supplier favorite status updated"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      });
    }
  }, []);

  // Update supplier status
  const handleUpdateStatus = useCallback(async (supplierId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/suppliers/${supplierId}/status`, {
        status: newStatus
      });

      if (response.success) {
        setSuppliers(prev => prev.map(supplier => 
          supplier.id === supplierId ? { ...supplier, status: newStatus as any } : supplier
        ));
        toast({
          title: "Success",
          description: "Supplier status updated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update supplier status",
        variant: "destructive"
      });
    }
  }, []);

  // Bulk actions
  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedSuppliers.length === 0) return;

    try {
      const response = await apiClient.post('/suppliers/bulk-action', {
        supplierIds: selectedSuppliers,
        action
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${action} applied to ${selectedSuppliers.length} suppliers`
        });
        setSelectedSuppliers([]);
        await loadSuppliers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive"
      });
    }
  }, [selectedSuppliers, loadSuppliers]);

  // Export suppliers
  const handleExport = useCallback(async (format: 'csv' | 'xlsx') => {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });

      const response = await apiClient.get(`/suppliers/export?${params}`, {
        responseType: 'blob'
      });

      if (response.success) {
        const blob = new Blob([response.data as BlobPart]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `suppliers-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Suppliers exported successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export suppliers",
        variant: "destructive"
      });
    }
  }, [filters]);

  // Send email to supplier
  const handleSendEmail = useCallback(async (supplierId: string, subject: string, message: string) => {
    try {
      const response = await apiClient.post(`/suppliers/${supplierId}/send-email`, {
        subject,
        message
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Email sent to supplier successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      });
    }
  }, []);

  // Generate supplier report
  const handleGenerateReport = useCallback(async (supplierId: string) => {
    try {
      const response = await apiClient.post(`/suppliers/${supplierId}/generate-report`);

      if (response.success) {
        toast({
          title: "Success",
          description: "Supplier report generated and sent to your email"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Suppliers Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suppliers Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your suppliers, track performance, and maintain relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('xlsx')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold">{stats.totalSuppliers.toLocaleString()}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeSuppliers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search suppliers by name, email, or category..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Verified</label>
                <Select
                  value={filters.verified}
                  onValueChange={(value) => handleFilterChange('verified', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Suppliers</SelectItem>
                    <SelectItem value="true">Verified Only</SelectItem>
                    <SelectItem value="false">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Rating</label>
                <Select
                  value={filters.rating}
                  onValueChange={(value) => handleFilterChange('rating', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Suppliers</span>
            {selectedSuppliers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedSuppliers.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate Selected
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.length === suppliers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSuppliers(suppliers.map(supplier => supplier.id));
                        } else {
                          setSelectedSuppliers([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Supplier
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left p-2">Contact</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('rating')}>
                    <div className="flex items-center gap-1">
                      Rating
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('totalSpent')}>
                    <div className="flex items-center gap-1">
                      Total Spent
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSuppliers(prev => [...prev, supplier.id]);
                          } else {
                            setSelectedSuppliers(prev => prev.filter(id => id !== supplier.id));
                          }
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{supplier.name}</span>
                            {supplier.verified && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            <button
                              onClick={() => handleToggleFavorite(supplier.id)}
                              className={`${supplier.favorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                            >
                              <Heart className={`h-4 w-4 ${supplier.favorite ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">{supplier.contactPerson}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{supplier.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{supplier.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{supplier.category}</Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {getRatingStars(supplier.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({supplier.reviewsCount})
                        </span>
                      </div>
                    </td>
                    <td className="p-2 font-medium">${supplier.totalSpent.toLocaleString()}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(supplier.status)}>
                        {supplier.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Supplier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(supplier.id, 'Subject', 'Message')}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateReport(supplier.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Generate Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(supplier.id, 'active')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(supplier.id, 'blocked')}>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Block Supplier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} suppliers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
