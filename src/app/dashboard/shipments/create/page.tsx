'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  Weight,
  Ruler,
  ArrowLeft,
  Save,
  AlertCircle,
  Info,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    weight?: number;
  }>;
}

interface ShipmentFormData {
  orderId: string;
  courierPartner: string;
  shippingMethod: 'standard' | 'express' | 'overnight' | 'same_day';
  trackingNumber: string;
  packageDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    packageType: string;
    fragile: boolean;
    description: string;
  };
  pickupAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  estimatedPickupDate: string;
  estimatedDeliveryDate: string;
  specialInstructions: string;
}

export default function CreateShipmentPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ShipmentFormData>({
    orderId: '',
    courierPartner: '',
    shippingMethod: 'standard',
    trackingNumber: '',
    packageDetails: {
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      packageType: 'box',
      fragile: false,
      description: '',
    },
    pickupAddress: {
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    estimatedPickupDate: new Date().toISOString().split('T')[0],
    estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    specialInstructions: '',
  });

  useEffect(() => {
    loadReadyToShipOrders();
  }, []);

  const loadReadyToShipOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReadyToShipOrders();
      
      if (response.success && response.data) {
        const data = response.data as any;
        const ordersList = Array.isArray(data) ? data : data.orders || data.data || [];
        setOrders(ordersList);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders ready for shipment.',
        variant: 'destructive',
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setFormData(prev => ({
        ...prev,
        orderId: order.id,
        packageDetails: {
          ...prev.packageDetails,
          weight: order.items.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0),
          description: order.items.map(item => `${item.productName} (${item.quantity})`).join(', '),
        },
      }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0] as keyof ShipmentFormData] as any),
          [keys[1]]: value,
        },
      }));
    } else if (keys.length === 3) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0] as keyof ShipmentFormData] as any),
          [keys[1]]: {
            ...((prev[keys[0] as keyof ShipmentFormData] as any)[keys[1]] as any),
            [keys[2]]: value,
          },
        },
      }));
    }
  };

  const calculateEstimatedDelivery = (pickupDate: string, shippingMethod: string) => {
    const pickup = new Date(pickupDate);
    let deliveryDays = 3; // default
    
    switch (shippingMethod) {
      case 'same_day':
        deliveryDays = 0;
        break;
      case 'overnight':
        deliveryDays = 1;
        break;
      case 'express':
        deliveryDays = 2;
        break;
      case 'standard':
        deliveryDays = 3;
        break;
    }
    
    const delivery = new Date(pickup.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    return delivery.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.orderId || !formData.courierPartner || !formData.trackingNumber) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }

      const response = await apiClient.createShipment(formData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Shipment created successfully.',
        });
        
        // Redirect to shipments list
        router.push('/dashboard/shipments');
      } else {
        throw new Error('Failed to create shipment');
      }
    } catch (error) {
      console.error('Failed to create shipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shipment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const volumetricWeight = (formData.packageDetails.dimensions.length * 
    formData.packageDetails.dimensions.width * 
    formData.packageDetails.dimensions.height) / 5000;

  const chargeableWeight = Math.max(formData.packageDetails.weight, volumetricWeight);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Create Shipment</h1>
            <p className="text-muted-foreground">Create a new shipment for an order</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order *</Label>
                <Select value={formData.orderId} onValueChange={handleOrderSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an order to ship" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{order.orderNumber}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {order.buyerName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {orders.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No orders ready for shipment. Orders must be confirmed and paid.
                  </p>
                )}
              </div>

              {selectedOrder && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Order Details</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p><strong>Customer:</strong> {selectedOrder.buyerName}</p>
                    <p><strong>Phone:</strong> {selectedOrder.buyerPhone}</p>
                    <p><strong>Items:</strong> {selectedOrder.items.length} items</p>
                    <p><strong>Delivery Address:</strong> {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Courier Details */}
          <Card>
            <CardHeader>
              <CardTitle>Courier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="courierPartner">Courier Partner *</Label>
                  <Select value={formData.courierPartner} onValueChange={(value) => handleInputChange('courierPartner', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select courier partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delhivery">Delhivery</SelectItem>
                      <SelectItem value="bluedart">Blue Dart</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="dtdc">DTDC</SelectItem>
                      <SelectItem value="ecom">Ecom Express</SelectItem>
                      <SelectItem value="indiapost">India Post</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Tracking Number *</Label>
                  <Input
                    id="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Shipping Method *</Label>
                <RadioGroup
                  value={formData.shippingMethod}
                  onValueChange={(value) => {
                    handleInputChange('shippingMethod', value);
                    const newDeliveryDate = calculateEstimatedDelivery(formData.estimatedPickupDate, value);
                    handleInputChange('estimatedDeliveryDate', newDeliveryDate);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard (3-5 days)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express">Express (1-2 days)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overnight" id="overnight" />
                    <Label htmlFor="overnight">Overnight (Next day)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same_day" id="same_day" />
                    <Label htmlFor="same_day">Same Day</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.packageDetails.weight}
                      onChange={(e) => handleInputChange('packageDetails.weight', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packageType">Package Type</Label>
                  <Select value={formData.packageDetails.packageType} onValueChange={(value) => handleInputChange('packageDetails.packageType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="envelope">Envelope</SelectItem>
                      <SelectItem value="tube">Tube</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dimensions (cm)</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      value={formData.packageDetails.dimensions.length}
                      onChange={(e) => handleInputChange('packageDetails.dimensions.length', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      placeholder="Length"
                    />
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={formData.packageDetails.dimensions.width}
                    onChange={(e) => handleInputChange('packageDetails.dimensions.width', parseFloat(e.target.value) || 0)}
                    placeholder="Width"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={formData.packageDetails.dimensions.height}
                    onChange={(e) => handleInputChange('packageDetails.dimensions.height', parseFloat(e.target.value) || 0)}
                    placeholder="Height"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fragile"
                  checked={formData.packageDetails.fragile}
                  onCheckedChange={(checked) => handleInputChange('packageDetails.fragile', checked)}
                />
                <Label htmlFor="fragile">Fragile item - Handle with care</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Package Description</Label>
                <Textarea
                  id="description"
                  value={formData.packageDetails.description}
                  onChange={(e) => handleInputChange('packageDetails.description', e.target.value)}
                  placeholder="Describe the package contents..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pickup Address */}
          <Card>
            <CardHeader>
              <CardTitle>Pickup Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pickupName">Contact Name *</Label>
                  <Input
                    id="pickupName"
                    value={formData.pickupAddress.name}
                    onChange={(e) => handleInputChange('pickupAddress.name', e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupPhone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="pickupPhone"
                      value={formData.pickupAddress.phone}
                      onChange={(e) => handleInputChange('pickupAddress.phone', e.target.value)}
                      className="pl-10"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Address *</Label>
                <Textarea
                  id="pickupAddress"
                  value={formData.pickupAddress.address}
                  onChange={(e) => handleInputChange('pickupAddress.address', e.target.value)}
                  placeholder="Complete pickup address"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="pickupCity">City *</Label>
                  <Input
                    id="pickupCity"
                    value={formData.pickupAddress.city}
                    onChange={(e) => handleInputChange('pickupAddress.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupState">State *</Label>
                  <Input
                    id="pickupState"
                    value={formData.pickupAddress.state}
                    onChange={(e) => handleInputChange('pickupAddress.state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupPincode">Pincode *</Label>
                  <Input
                    id="pickupPincode"
                    value={formData.pickupAddress.pincode}
                    onChange={(e) => handleInputChange('pickupAddress.pincode', e.target.value)}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Estimated Pickup Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.estimatedPickupDate}
                      onChange={(e) => {
                        handleInputChange('estimatedPickupDate', e.target.value);
                        const newDeliveryDate = calculateEstimatedDelivery(e.target.value, formData.shippingMethod);
                        handleInputChange('estimatedDeliveryDate', newDeliveryDate);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Estimated Delivery Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.estimatedDeliveryDate}
                      onChange={(e) => handleInputChange('estimatedDeliveryDate', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any special handling instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Weight Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Actual Weight:</span>
                <span>{formData.packageDetails.weight} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volumetric Weight:</span>
                <span>{volumetricWeight.toFixed(2)} kg</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Chargeable Weight:</span>
                  <span>{chargeableWeight.toFixed(2)} kg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Summary */}
          {selectedOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                  <p className="text-muted-foreground">{selectedOrder.shippingAddress.phone}</p>
                  <p className="text-muted-foreground">
                    {selectedOrder.shippingAddress.address}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button 
                  onClick={handleSubmit} 
                  disabled={saving || !formData.orderId || !formData.courierPartner || !formData.trackingNumber}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Creating...' : 'Create Shipment'}
                </Button>
                <Button variant="outline" onClick={() => router.back()} className="w-full">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Important Notes</p>
                  <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-300">
                    <li>• Ensure all package details are accurate</li>
                    <li>• Double-check pickup address</li>
                    <li>• Keep tracking number handy</li>
                    <li>• Fragile items need special handling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}