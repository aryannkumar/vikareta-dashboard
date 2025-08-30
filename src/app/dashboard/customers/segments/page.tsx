'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Target,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    totalSpent?: {
      min?: number;
      max?: number;
    };
    orderCount?: {
      min?: number;
      max?: number;
    };
    lastOrderDays?: number;
    registrationDays?: number;
    location?: string[];
    tags?: string[];
  };
  customersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  status: 'active' | 'inactive';
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface SegmentStats {
  totalSegments: number;
  activeSegments: number;
  totalCustomers: number;
  segmentedCustomers: number;
  unsegmentedCustomers: number;
}

export default function CustomerSegmentsPage() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [stats, setStats] = useState<SegmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'customersCount' | 'totalRevenue' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    criteria: {
      totalSpent: { min: 0, max: 0 },
      orderCount: { min: 0, max: 0 },
      lastOrderDays: 0,
      registrationDays: 0
    },
    status: 'active',
    color: '#3B82F6'
  });
  const { toast } = useToast();

  const loadSegments = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const params: any = {
        sortBy,
        sortOrder
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const [segmentsResponse, statsResponse] = await Promise.all([
        apiClient.getCustomerSegments(params),
        apiClient.getCustomerSegmentStats?.() || Promise.resolve({ success: false })
      ]);

      if (segmentsResponse.success && segmentsResponse.data) {
        let segmentsData = segmentsResponse.data as CustomerSegment[];
        
        // Client-side sorting if not handled by API
        segmentsData = segmentsData.sort((a, b) => {
          let aValue: any = a[sortBy];
          let bValue: any = b[sortBy];
          
          if (sortBy === 'name') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        setSegments(segmentsData);
      } else {
        // Fallback data for development
        const fallbackSegments: CustomerSegment[] = [
          {
            id: '1',
            name: 'VIP Customers',
            description: 'High-value customers with significant purchase history',
            criteria: {
              totalSpent: { min: 10000 },
              orderCount: { min: 5 }
            },
            customersCount: 45,
            totalRevenue: 485000,
            averageOrderValue: 2150.50,
            status: 'active',
            color: '#10B981',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            name: 'Regular Customers',
            description: 'Customers with moderate purchase activity',
            criteria: {
              totalSpent: { min: 1000, max: 9999 },
              orderCount: { min: 2, max: 4 }
            },
            customersCount: 234,
            totalRevenue: 325000,
            averageOrderValue: 685.25,
            status: 'active',
            color: '#3B82F6',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-12T14:20:00Z'
          },
          {
            id: '3',
            name: 'New Customers',
            description: 'Recently registered customers with limited purchase history',
            criteria: {
              registrationDays: 30,
              orderCount: { max: 1 }
            },
            customersCount: 156,
            totalRevenue: 85000,
            averageOrderValue: 285.75,
            status: 'active',
            color: '#F59E0B',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-10T09:15:00Z'
          },
          {
            id: '4',
            name: 'Inactive Customers',
            description: 'Customers who haven\'t made purchases recently',
            criteria: {
              lastOrderDays: 90
            },
            customersCount: 89,
            totalRevenue: 125000,
            averageOrderValue: 450.25,
            status: 'active',
            color: '#EF4444',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-08T16:45:00Z'
          }
        ];
        setSegments(fallbackSegments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer segments');
      setSegments([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      // In production, this would be a real API call
      // const response = await apiClient.getCustomerSegmentStats();
      
      // Fallback stats for development
      const fallbackStats: SegmentStats = {
        totalSegments: 8,
        activeSegments: 6,
        totalCustomers: 1247,
        segmentedCustomers: 924,
        unsegmentedCustomers: 323
      };
      setStats(fallbackStats);
    } catch (err) {
      console.error('Failed to load segment stats:', err);
    }
  }, []);

  const createSegment = async () => {
    if (!newSegment.name || !newSegment.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setError(null);
      const response = await apiClient.createCustomerSegment(newSegment);
      
      if (response.success) {
        toast({
          title: "Segment Created",
          description: `Customer segment "${newSegment.name}" has been created successfully`
        });
        setShowCreateDialog(false);
        setNewSegment({
          name: '',
          description: '',
          criteria: {
            totalSpent: { min: 0, max: 0 },
            orderCount: { min: 0, max: 0 },
            lastOrderDays: 0,
            registrationDays: 0
          },
          status: 'active',
          color: '#3B82F6'
        });
        // Refresh segments to show the new segment
        await loadSegments(false);
      } else {
        toast({
          title: "Creation Failed",
          description: response.error?.message || 'Failed to create segment',
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Creation Failed",
        description: err instanceof Error ? err.message : 'Failed to create segment',
        variant: "destructive"
      });
      console.error('Failed to create segment:', err);
    }
  };

  const duplicateSegment = async (segment: CustomerSegment) => {
    const duplicatedSegment = {
      ...newSegment,
      name: `${segment.name} (Copy)`,
      description: segment.description,
      criteria: {
        totalSpent: { 
          min: segment.criteria?.totalSpent?.min || 0, 
          max: segment.criteria?.totalSpent?.max || 0 
        },
        orderCount: { 
          min: segment.criteria?.orderCount?.min || 0, 
          max: segment.criteria?.orderCount?.max || 0 
        },
        lastOrderDays: segment.criteria?.lastOrderDays || 0,
        registrationDays: segment.criteria?.registrationDays || 0
      },
      status: segment.status as 'active' | 'inactive',
      color: segment.color
    };
    
    setNewSegment(duplicatedSegment);
    setShowCreateDialog(true);
  };

  const toggleSegmentStatus = async (segmentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await apiClient.updateCustomerSegment(segmentId, { status: newStatus });
      
      if (response.success) {
        toast({
          title: "Status Updated",
          description: `Segment ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
        });
        await loadSegments(false);
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update segment status",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Failed to update segment status",
        variant: "destructive"
      });
    }
  };

  const refreshSegments = async () => {
    setIsRefreshing(true);
    try {
      await loadSegments(false);
      toast({
        title: "Segments Refreshed",
        description: "Latest segment data loaded"
      });
    } catch (err) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh segments",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateSegment = async () => {
    if (!selectedSegment) return;
    
    try {
      const response = await apiClient.updateCustomerSegment(selectedSegment.id, newSegment);
      
      if (response.success) {
        setShowEditDialog(false);
        setSelectedSegment(null);
        loadSegments();
      }
    } catch (err) {
      console.error('Failed to update segment:', err);
    }
  };

  const deleteSegment = async (segmentId: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      const response = await apiClient.deleteCustomerSegment(segmentId);
      
      if (response.success) {
        loadSegments();
      }
    } catch (err) {
      console.error('Failed to delete segment:', err);
    }
  };

  const formatCriteria = (criteria: CustomerSegment['criteria']) => {
    const parts = [];
    
    if (criteria.totalSpent?.min || criteria.totalSpent?.max) {
      const min = criteria.totalSpent.min ? formatCurrency(criteria.totalSpent.min) : '0';
      const max = criteria.totalSpent.max ? formatCurrency(criteria.totalSpent.max) : '∞';
      parts.push(`Spent: ${min} - ${max}`);
    }
    
    if (criteria.orderCount?.min || criteria.orderCount?.max) {
      const min = criteria.orderCount.min || 0;
      const max = criteria.orderCount.max || '∞';
      parts.push(`Orders: ${min} - ${max}`);
    }
    
    if (criteria.lastOrderDays) {
      parts.push(`Last order: ${criteria.lastOrderDays}+ days ago`);
    }
    
    if (criteria.registrationDays) {
      parts.push(`Registered: within ${criteria.registrationDays} days`);
    }
    
    return parts.join(' • ') || 'No criteria set';
  };

  useEffect(() => {
    loadSegments();
    loadStats();
  }, [loadSegments, loadStats]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Segments</h1>
          <p className="text-gray-600">Organize customers into targeted groups for better marketing</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Segment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Customer Segment</DialogTitle>
              <DialogDescription>
                Define criteria to automatically group customers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Segment Name</label>
                <Input
                  value={newSegment.name}
                  onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                  placeholder="Enter segment name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                  placeholder="Describe this customer segment"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Total Spent</label>
                  <Input
                    type="number"
                    value={newSegment.criteria.totalSpent?.min || ''}
                    onChange={(e) => setNewSegment({
                      ...newSegment,
                      criteria: {
                        ...newSegment.criteria,
                        totalSpent: {
                          ...newSegment.criteria.totalSpent,
                          min: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Total Spent</label>
                  <Input
                    type="number"
                    value={newSegment.criteria.totalSpent?.max || ''}
                    onChange={(e) => setNewSegment({
                      ...newSegment,
                      criteria: {
                        ...newSegment.criteria,
                        totalSpent: {
                          ...newSegment.criteria.totalSpent,
                          max: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="No limit"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Orders</label>
                  <Input
                    type="number"
                    value={newSegment.criteria.orderCount?.min || ''}
                    onChange={(e) => setNewSegment({
                      ...newSegment,
                      criteria: {
                        ...newSegment.criteria,
                        orderCount: {
                          ...newSegment.criteria.orderCount,
                          min: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Orders</label>
                  <Input
                    type="number"
                    value={newSegment.criteria.orderCount?.max || ''}
                    onChange={(e) => setNewSegment({
                      ...newSegment,
                      criteria: {
                        ...newSegment.criteria,
                        orderCount: {
                          ...newSegment.criteria.orderCount,
                          max: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="No limit"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Segment Color</label>
                <Input
                  type="color"
                  value={newSegment.color}
                  onChange={(e) => setNewSegment({ ...newSegment, color: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createSegment}>
                  Create Segment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSegments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeSegments} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalCustomers)}</div>
              <p className="text-xs text-muted-foreground">
                All customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Segmented</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.segmentedCustomers)}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.segmentedCustomers / stats.totalCustomers) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unsegmented</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.unsegmentedCustomers)}</div>
              <p className="text-xs text-muted-foreground">
                Need segmentation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((stats.segmentedCustomers / stats.totalCustomers) * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Segmentation rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search segments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => loadSegments()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => loadSegments()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : segments.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Target className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No customer segments found</p>
                <p className="text-sm text-gray-400">Create your first segment to organize customers</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          segments.map((segment) => (
            <Card key={segment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                  </div>
                  <Badge className={segment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {segment.status}
                  </Badge>
                </div>
                <CardDescription>{segment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formatNumber(segment.customersCount)}</div>
                      <div className="text-xs text-gray-600">Customers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(segment.totalRevenue)}</div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold">{formatCurrency(segment.averageOrderValue)}</div>
                    <div className="text-xs text-gray-600">Avg Order Value</div>
                  </div>
                  
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Criteria:</strong> {formatCriteria(segment.criteria)}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      Updated {formatDate(segment.updatedAt)}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedSegment(segment);
                          setNewSegment({
                            name: segment.name,
                            description: segment.description,
                            criteria: {
                              totalSpent: { 
                                min: segment.criteria.totalSpent?.min || 0, 
                                max: segment.criteria.totalSpent?.max || 0 
                              },
                              orderCount: { 
                                min: segment.criteria.orderCount?.min || 0, 
                                max: segment.criteria.orderCount?.max || 0 
                              },
                              lastOrderDays: segment.criteria.lastOrderDays || 0,
                              registrationDays: segment.criteria.registrationDays || 0
                            },
                            status: segment.status,
                            color: segment.color
                          });
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSegment(segment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer Segment</DialogTitle>
            <DialogDescription>
              Update segment criteria and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Segment Name</label>
              <Input
                value={newSegment.name}
                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                placeholder="Enter segment name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newSegment.description}
                onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                placeholder="Describe this customer segment"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={newSegment.status} onValueChange={(value) => setNewSegment({ ...newSegment, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateSegment}>
                Update Segment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}