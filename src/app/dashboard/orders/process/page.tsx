'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  RefreshCw,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Zap,
  Settings
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  deliveryAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface FulfillmentOption {
  partnerId: string;
  partnerName: string;
  isPreferred: boolean;
  serviceTypes: Array<{
    type: string;
    estimatedDays: string;
    estimatedCost: number;
    description: string;
  }>;
}

interface ProcessingResult {
  orderId: string;
  success: boolean;
  shipment?: {
    id: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    shippingCost: number;
  };
  error?: string;
}

export default function OrderProcessingPage() {
  const router = useRouter();
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [fulfillmentOptions, setFulfillmentOptions] = useState<Record<string, FulfillmentOption[]>>({});
  const [processing, setProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReadyOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/orders/ready-to-ship');
      
      if (response.success && response.data) {
        setReadyOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading ready orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders ready for processing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFulfillmentOptions = useCallback(async (orderId: string) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}/fulfillment-options`);
      
      if (response.success && response.data) {
        setFulfillmentOptions(prev => ({
          ...prev,
          [orderId]: response.data.fulfillmentOptions
        }));
      }
    } catch (error) {
      console.error('Error loading fulfillment options:', error);
    }
  }, []);

  const processOrder = async (orderId: string) => {
    try {
      setProcessing(true);
      const response = await apiClient.post(`/orders/${orderId}/process`);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Order processed and shipment created successfully",
        });
        
        setProcessingResults(prev => [...prev, {
          orderId,
          success: true,
          shipment: response.data
        }]);
        
        // Remove processed order from ready orders
        setReadyOrders(prev => prev.filter(order => order.id !== orderId));
        setSelectedOrders(prev => prev.filter(id => id !== orderId));
      } else {
        throw new Error(response.error?.message || 'Processing failed');
      }
    } catch (error: any) {
      console.error('Error processing order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process order",
        variant: "destructive"
      });
      
      setProcessingResults(prev => [...prev, {
        orderId,
        success: false,
        error: error.message || 'Processing failed'
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const processBulkOrders = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to process",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await apiClient.post('/orders/bulk-process', {
        orderIds: selectedOrders
      });
      
      if (response.success) {
        const { results, summary } = response.data;
        
        toast({
          title: "Bulk Processing Complete",
          description: `${summary.successful} orders processed successfully, ${summary.failed} failed`,
        });
        
        setProcessingResults(prev => [...prev, ...results]);
        
        // Remove successfully processed orders
        const successfulOrderIds = results.filter((r: any) => r.success).map((r: any) => r.orderId);
        setReadyOrders(prev => prev.filter(order => !successfulOrderIds.includes(order.id)));
        setSelectedOrders([]);
      }
    } catch (error: any) {
      console.error('Error bulk processing orders:', error);
      toast({
        title: "Error",
        description: "Failed to process orders in bulk",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(readyOrders.map(order => order.id));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  useEffect(() => {
    loadReadyOrders();
  }, [loadReadyOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Order Processing</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold">Order Processing Center</h1>
          <p className="text-gray-600 mt-1">
            Streamlined order fulfillment with automated shipment creation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={loadReadyOrders}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/dashboard/orders')}>
            View All Orders
          </Button>
        </div>
      </div>

      {/* Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{readyOrders.length}</div>
                <div className="text-sm text-muted-foreground">Ready to Ship</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{processingResults.filter(r => r.success).length}</div>
                <div className="text-sm text-muted-foreground">Processed Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{selectedOrders.length}</div>
                <div className="text-sm text-muted-foreground">Selected</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">Auto</div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {readyOrders.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === readyOrders.length}
                    onChange={() => selectedOrders.length === readyOrders.length ? clearSelection() : selectAllOrders()}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">
                    {selectedOrders.length > 0 ? `${selectedOrders.length} selected` : 'Select all'}
                  </span>
                </div>
                
                {selectedOrders.length > 0 && (
                  <Button 
                    onClick={clearSelection}
                    variant="outline" 
                    size="sm"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
              
              {selectedOrders.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={processBulkOrders}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Process {selectedOrders.length} Orders
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Ready for Processing */}
      {readyOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Orders Ready for Processing</h3>
            <p className="text-muted-foreground mb-4">
              All confirmed orders have been processed or there are no confirmed orders at the moment.
            </p>
            <Button onClick={() => router.push('/dashboard/orders')}>
              View All Orders
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {readyOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="rounded"
                    />
                    <div>
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Ready to Ship
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {order.customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.customer.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">
                      {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}, 
                      {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Value</p>
                    <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="font-medium">{order.items.length} products</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    onClick={() => processOrder(order.id)}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Process Order
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => loadFulfillmentOptions(order.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {/* Fulfillment Options */}
                {fulfillmentOptions[order.id] && (
                  <div className="mt-4 p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Delivery Options</h4>
                    <div className="space-y-2">
                      {fulfillmentOptions[order.id].map((option) => (
                        <div key={option.partnerId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.partnerName}</span>
                            {option.isPreferred && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Preferred</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{option.serviceTypes[0]?.estimatedCost}</p>
                            <p className="text-muted-foreground">{option.serviceTypes[0]?.estimatedDays} days</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Processing Results */}
      {processingResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processingResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">Order {result.orderId.slice(0, 8)}</p>
                      {result.success && result.shipment ? (
                        <p className="text-sm text-muted-foreground">
                          Tracking: {result.shipment.trackingNumber} • {result.shipment.carrier}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {result.success && result.shipment && (
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(result.shipment.shippingCost)}</p>
                      <p className="text-sm text-muted-foreground">
                        Est: {new Date(result.shipment.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}