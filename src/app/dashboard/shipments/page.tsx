'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MapPin, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Download,
  Phone,
  Navigation
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
  TableRow,
} from '@/components/ui/table';
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
import { apiClient } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface Shipment {
  id: string;
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  courierPartner: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled';
  shippingMethod: 'standard' | 'express' | 'overnight' | 'same_day';
  packageDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    packageType: string;
    fragile: boolean;
  };
  addresses: {
    pickup: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    delivery: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  timeline: {
    estimatedPickup: string;
    actualPickup?: string;
    estimatedDelivery: string;
    actualDelivery?: string;
  };
  tracking: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');

  const loadShipments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getShipments({
        search: searchTerm,
        status: statusFilter,
        courier: courierFilter,
        limit: 50
      });

      if (response.success && response.data) {
        const data = response.data as any;
        const shipmentsList = Array.isArray(data) ? data : data.shipments || data.data || [];
        setShipments(shipmentsList);
      } else {
        setShipments([]);
      }
    } catch (error) {
      console.error('Failed to load shipments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipments. Please try again.',
        variant: 'destructive',
      });
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateShipmentStatus(shipmentId, newStatus);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Shipment status updated successfully.',
        });
        loadShipments();
      } else {
        throw new Error('Failed to update shipment status');
      }
    } catch (error) {
      console.error('Failed to update shipment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update shipment status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    loadShipments();
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'picked_up': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_transit': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'returned': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'out_for_delivery': return <Navigation className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'returned': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const pendingShipments = shipments.filter(s => s.status === 'pending').length;
  const inTransitShipments = shipments.filter(s => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length;
  const deliveredShipments = shipments.filter(s => s.status === 'delivered').length;
  const delayedShipments = shipments.filter(s => {
    const estimatedDelivery = new Date(s.timeline.estimatedDelivery);
    const now = new Date();
    return now > estimatedDelivery && !['delivered', 'cancelled', 'returned'].includes(s.status);
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">Manage order shipments and tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadShipments} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/shipments/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Pickup</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingShipments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">{inTransitShipments}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{deliveredShipments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold text-red-600">{delayedShipments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, tracking number, or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={courierFilter} onValueChange={setCourierFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Couriers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Couriers</SelectItem>
                  <SelectItem value="delhivery">Delhivery</SelectItem>
                  <SelectItem value="bluedart">Blue Dart</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="dtdc">DTDC</SelectItem>
                  <SelectItem value="ecom">Ecom Express</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments ({shipments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2 text-muted-foreground">Loading shipments...</p>
            </div>
          ) : shipments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order & Tracking</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => {
                  const isDelayed = new Date(shipment.timeline.estimatedDelivery) < new Date() && 
                    !['delivered', 'cancelled', 'returned'].includes(shipment.status);
                  
                  return (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{shipment.orderNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {shipment.trackingNumber || 'No tracking number'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{shipment.addresses.delivery.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {shipment.addresses.delivery.phone}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {shipment.addresses.delivery.city}, {shipment.addresses.delivery.state}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium capitalize">{shipment.courierPartner}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {shipment.shippingMethod.replace('_', ' ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(shipment.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(shipment.status)}
                              <span>{shipment.status.replace('_', ' ').toUpperCase()}</span>
                            </div>
                          </Badge>
                          {isDelayed && (
                            <Badge variant="destructive" className="text-xs">
                              DELAYED
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(shipment.timeline.estimatedPickup)}
                          </div>
                          {shipment.timeline.actualPickup && (
                            <div className="text-muted-foreground">
                              Actual: {formatDate(shipment.timeline.actualPickup)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(shipment.timeline.estimatedDelivery)}
                          </div>
                          {shipment.timeline.actualDelivery && (
                            <div className="text-green-600">
                              Delivered: {formatDate(shipment.timeline.actualDelivery)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {shipment.tracking.length > 0 ? (
                            <div>
                              <div className="font-medium">{shipment.tracking[0].location}</div>
                              <div className="text-muted-foreground">
                                {formatDate(shipment.tracking[0].timestamp)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No updates</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/dashboard/shipments/${shipment.id}`} className="flex items-center w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/shipments/${shipment.id}/track`} className="flex items-center w-full">
                                <Navigation className="h-4 w-4 mr-2" />
                                Track Shipment
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/orders/${shipment.orderId}`} className="flex items-center w-full">
                                <Package className="h-4 w-4 mr-2" />
                                View Order
                              </Link>
                            </DropdownMenuItem>
                            {shipment.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(shipment.id, 'picked_up')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Picked Up
                                </DropdownMenuItem>
                              </>
                            )}
                            {shipment.status === 'picked_up' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(shipment.id, 'in_transit')}
                              >
                                <Truck className="h-4 w-4 mr-2" />
                                Mark in Transit
                              </DropdownMenuItem>
                            )}
                            {shipment.status === 'in_transit' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(shipment.id, 'out_for_delivery')}
                              >
                                <Navigation className="h-4 w-4 mr-2" />
                                Out for Delivery
                              </DropdownMenuItem>
                            )}
                            {shipment.status === 'out_for_delivery' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(shipment.id, 'delivered')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Link href={`/dashboard/shipments/${shipment.id}/edit`} className="flex items-center w-full">
                                <Edit className="h-4 w-4 mr-2" />
                                Update Details
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shipments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter || courierFilter
                  ? 'Try adjusting your search or filters.'
                  : 'Shipments will appear here when orders are ready to ship.'
                }
              </p>
              {searchTerm || statusFilter || courierFilter ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setCourierFilter('');
                    loadShipments();
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href="/dashboard/orders">
                  <Button>
                    <Package className="h-4 w-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}