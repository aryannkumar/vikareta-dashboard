import { apiClient } from '../client';

export interface ShippingProvider {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  services: ShippingService[];
  settings: Record<string, any>;
  apiKey?: string;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingServiceData {
  id: string;
  name: string;
  code: string;
  description?: string;
  estimatedDelivery: string;
  cost: number;
  isActive: boolean;
  providerId: string;
}

export interface ShippingAddress {
  id: string;
  userId: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingCalculationRequest {
  origin: {
    postalCode: string;
    country: string;
  };
  destination: {
    postalCode: string;
    country: string;
  };
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  items: Array<{
    weight: number;
    quantity: number;
    value?: number;
  }>;
}

export interface ShippingRate {
  provider: string;
  service: string;
  cost: number;
  currency: string;
  estimatedDelivery: string;
  trackingAvailable: boolean;
  providerId: string;
  serviceId: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  provider: string;
  service: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  cost: number;
  weight: number;
  origin: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  destination: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  events: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  order?: {
    id: string;
    total: number;
    status: string;
  };
}

export interface ShipmentEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  carrierStatus?: string;
}

export interface CreateShipmentData {
  orderId: string;
  provider: string;
  service: string;
  originAddress: ShippingAddress;
  destinationAddress: ShippingAddress;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  items: Array<{
    name: string;
    weight: number;
    quantity: number;
    value?: number;
  }>;
}

export interface CreateShippingAddressData {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UpdateShippingAddressData {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ShippingStats {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  failedShipments: number;
  totalShippingCost: number;
  averageShippingCost: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  providerPerformance: Array<{
    provider: string;
    totalShipments: number;
    onTimeDeliveries: number;
    averageCost: number;
    averageDeliveryTime: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    shipments: number;
    cost: number;
    deliveryRate: number;
  }>;
}

export interface BulkShipmentAction {
  shipmentIds: string[];
  action: 'cancel' | 'mark_delivered' | 'update_status';
  status?: string;
  notes?: string;
}

export class ShippingService {
  // Get all shipping providers
  static async getProviders(filters?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    providers: ShippingProvider[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/shipping/providers', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shipping providers');
    }
    return response.data as {
      providers: ShippingProvider[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Get shipping provider by ID
  static async getProviderById(id: string): Promise<ShippingProvider> {
    const response = await apiClient.get(`/shipping/providers/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shipping provider');
    }
    return response.data as ShippingProvider;
  }

  // Create shipping provider
  static async createProvider(providerData: {
    name: string;
    code: string;
    description?: string;
    services: Array<{
      name: string;
      code: string;
      description?: string;
      estimatedDelivery: string;
      cost: number;
    }>;
    settings?: Record<string, any>;
  }): Promise<ShippingProvider> {
    const response = await apiClient.post('/shipping/providers', providerData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create shipping provider');
    }
    return response.data as ShippingProvider;
  }

  // Update shipping provider
  static async updateProvider(id: string, providerData: {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
    services?: Array<{
      id?: string;
      name: string;
      code: string;
      description?: string;
      estimatedDelivery: string;
      cost: number;
      isActive?: boolean;
    }>;
    settings?: Record<string, any>;
  }): Promise<ShippingProvider> {
    const response = await apiClient.put(`/shipping/providers/${id}`, providerData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update shipping provider');
    }
    return response.data as ShippingProvider;
  }

  // Delete shipping provider
  static async deleteProvider(id: string): Promise<void> {
    const response = await apiClient.delete(`/shipping/providers/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete shipping provider');
    }
  }

  // Calculate shipping cost
  static async calculateShipping(request: ShippingCalculationRequest): Promise<{
    rates: ShippingRate[];
    recommended?: ShippingRate;
  }> {
    const response = await apiClient.post('/shipping/calculate', request);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to calculate shipping');
    }
    return response.data as {
      rates: ShippingRate[];
      recommended?: ShippingRate;
    };
  }

  // Create a shipment
  static async createShipment(shipmentData: CreateShipmentData): Promise<Shipment> {
    const response = await apiClient.post('/shipping/create-shipment', shipmentData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create shipment');
    }
    return response.data as Shipment;
  }

  // Track a shipment
  static async trackShipment(trackingNumber: string): Promise<{
    shipment: Shipment;
    events: ShipmentEvent[];
  }> {
    const response = await apiClient.get(`/shipping/track/${trackingNumber}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to track shipment');
    }
    return response.data as {
      shipment: Shipment;
      events: ShipmentEvent[];
    };
  }

  // Get shipping addresses
  static async getAddresses(filters?: {
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    addresses: ShippingAddress[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/shipping/addresses', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shipping addresses');
    }
    return response.data as {
      addresses: ShippingAddress[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Create shipping address
  static async createAddress(addressData: CreateShippingAddressData): Promise<ShippingAddress> {
    const response = await apiClient.post('/shipping/addresses', addressData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create shipping address');
    }
    return response.data as ShippingAddress;
  }

  // Update shipping address
  static async updateAddress(id: string, addressData: UpdateShippingAddressData): Promise<ShippingAddress> {
    const response = await apiClient.put(`/shipping/addresses/${id}`, addressData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update shipping address');
    }
    return response.data as ShippingAddress;
  }

  // Delete shipping address
  static async deleteAddress(id: string): Promise<void> {
    const response = await apiClient.delete(`/shipping/addresses/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete shipping address');
    }
  }

  // Set default shipping address
  static async setDefaultAddress(id: string): Promise<void> {
    const response = await apiClient.post(`/shipping/addresses/${id}/default`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to set default address');
    }
  }

  // Get shipment by ID
  static async getShipment(id: string): Promise<Shipment> {
    const response = await apiClient.get(`/shipping/shipments/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shipment');
    }
    return response.data as Shipment;
  }

  // Get shipments with filters
  static async getShipments(filters?: {
    orderId?: string;
    status?: string;
    provider?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'estimatedDelivery' | 'cost';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    shipments: Shipment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/shipping/shipments', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shipments');
    }
    return response.data as {
      shipments: Shipment[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Update shipment status
  static async updateShipmentStatus(id: string, status: string, notes?: string): Promise<Shipment> {
    const response = await apiClient.put(`/shipping/shipments/${id}/status`, { status, notes });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update shipment status');
    }
    return response.data as Shipment;
  }

  // Cancel shipment
  static async cancelShipment(id: string, reason?: string): Promise<Shipment> {
    const response = await apiClient.post(`/shipping/shipments/${id}/cancel`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel shipment');
    }
    return response.data as Shipment;
  }

  // Add tracking event (for providers/webhooks)
  static async addTrackingEvent(eventData: {
    shipmentId: string;
    status: string;
    description: string;
    location?: string;
    timestamp?: string;
  }): Promise<ShipmentEvent> {
    const response = await apiClient.post('/shipping/tracking/events', eventData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add tracking event');
    }
    return response.data as ShipmentEvent;
  }

  // Get tracking events
  static async getTrackingEvents(shipmentId?: string): Promise<ShipmentEvent[]> {
    const response = await apiClient.get('/shipping/tracking/events', shipmentId ? { shipmentId } : undefined);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch tracking events');
    }
    return response.data as ShipmentEvent[];
  }

  // Get shipping analytics
  static async getShippingAnalytics(filters?: {
    dateRange?: { start: string; end: string };
    provider?: string;
    status?: string;
  }): Promise<ShippingStats> {
    const response = await apiClient.get('/shipping/analytics', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shipping analytics');
    }
    return response.data as ShippingStats;
  }

  // Bulk shipment actions
  static async bulkShipmentAction(actionData: BulkShipmentAction): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors?: string[];
  }> {
    const response = await apiClient.post('/shipping/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as {
      success: boolean;
      processed: number;
      failed: number;
      errors?: string[];
    };
  }

  // Test shipping webhook (for development/testing)
  static async testShippingWebhook(): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post('/shipping/webhooks/test');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to test shipping webhook');
    }
    return response.data as {
      success: boolean;
      message: string;
    };
  }

  // Get shipping rates for cart/order
  static async getShippingRates(orderData: {
    items: Array<{
      weight: number;
      dimensions?: {
        length: number;
        width: number;
        height: number;
      };
      quantity: number;
    }>;
    destinationAddress: ShippingAddress;
  }): Promise<ShippingRate[]> {
    const response = await apiClient.post('/shipping/rates', orderData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get shipping rates');
    }
    return response.data as ShippingRate[];
  }

  // Validate shipping address
  static async validateAddress(address: CreateShippingAddressData): Promise<{
    valid: boolean;
    suggestions?: ShippingAddress[];
    errors?: string[];
  }> {
    const response = await apiClient.post('/shipping/validate-address', address);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate address');
    }
    return response.data as {
      valid: boolean;
      suggestions?: ShippingAddress[];
      errors?: string[];
    };
  }

  // Export shipments
  static async exportShipments(filters?: {
    dateRange?: { start: string; end: string };
    status?: string;
    provider?: string;
    format?: 'csv' | 'excel';
  }): Promise<{
    url: string;
    expiresAt: string;
  }> {
    const response = await apiClient.post('/shipping/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export shipments');
    }
    return response.data as {
      url: string;
      expiresAt: string;
    };
  }

  // Get shipping zones
  static async getShippingZones(): Promise<Array<{
    id: string;
    name: string;
    countries: string[];
    states?: string[];
    baseRate: number;
    additionalPerKg: number;
    estimatedDays: number;
  }>> {
    const response = await apiClient.get('/shipping/zones');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shipping zones');
    }
    return response.data as Array<{
      id: string;
      name: string;
      countries: string[];
      states?: string[];
      baseRate: number;
      additionalPerKg: number;
      estimatedDays: number;
    }>;
  }

  // Update shipping zone
  static async updateShippingZone(id: string, zoneData: {
    name?: string;
    countries?: string[];
    states?: string[];
    baseRate?: number;
    additionalPerKg?: number;
    estimatedDays?: number;
  }): Promise<{
    id: string;
    name: string;
    countries: string[];
    states?: string[];
    baseRate: number;
    additionalPerKg: number;
    estimatedDays: number;
  }> {
    const response = await apiClient.put(`/shipping/zones/${id}`, zoneData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update shipping zone');
    }
    return response.data as {
      id: string;
      name: string;
      countries: string[];
      states?: string[];
      baseRate: number;
      additionalPerKg: number;
      estimatedDays: number;
    };
  }

  // Get shipping labels
  static async generateShippingLabel(shipmentId: string, format?: 'pdf' | 'png'): Promise<{
    url: string;
    expiresAt: string;
  }> {
    const response = await apiClient.post(`/shipping/shipments/${shipmentId}/label`, { format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to generate shipping label');
    }
    return response.data as {
      url: string;
      expiresAt: string;
    };
  }

  // Bulk generate shipping labels
  static async bulkGenerateLabels(shipmentIds: string[], format?: 'pdf' | 'png'): Promise<{
    success: boolean;
    labels: Array<{
      shipmentId: string;
      url: string;
      expiresAt: string;
    }>;
    failed: Array<{
      shipmentId: string;
      error: string;
    }>;
  }> {
    const response = await apiClient.post('/shipping/labels/bulk', { shipmentIds, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to generate shipping labels');
    }
    return response.data as {
      success: boolean;
      labels: Array<{
        shipmentId: string;
        url: string;
        expiresAt: string;
      }>;
      failed: Array<{
        shipmentId: string;
        error: string;
      }>;
    };
  }
}