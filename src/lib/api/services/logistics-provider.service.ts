import { apiClient } from '../client';

export interface LogisticsProvider {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  services: string[];
  coverage: string[];
  pricing: {
    baseRate: number;
    perKgRate: number;
    perKmRate: number;
    fuelSurcharge: number;
  };
  rating: number;
  totalShipments: number;
  onTimeDelivery: number;
  contractStartDate: string;
  contractEndDate?: string;
  apiKey?: string;
  webhookUrl?: string;
  documents: Array<{
    type: string;
    url: string;
    verified: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogisticsProviderData {
  name: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  services: string[];
  coverage: string[];
  pricing: {
    baseRate: number;
    perKgRate: number;
    perKmRate: number;
    fuelSurcharge: number;
  };
  contractStartDate: string;
  contractEndDate?: string;
  apiKey?: string;
  webhookUrl?: string;
}

export interface UpdateLogisticsProviderData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  services?: string[];
  coverage?: string[];
  pricing?: {
    baseRate?: number;
    perKgRate?: number;
    perKmRate?: number;
    fuelSurcharge?: number;
  };
  contractStartDate?: string;
  contractEndDate?: string;
  apiKey?: string;
  webhookUrl?: string;
}

export class LogisticsProviderService {
  // Get all logistics providers for a business
  static async getLogisticsProviders(businessId: string, filters?: {
    status?: string;
    service?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<{ providers: LogisticsProvider[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/logistics-providers', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch logistics providers');
    }
    return response.data as { providers: LogisticsProvider[]; total: number; page: number; totalPages: number; };
  }

  // Get logistics provider by ID
  static async getLogisticsProviderById(id: string): Promise<LogisticsProvider> {
    const response = await apiClient.get(`/logistics-providers/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch logistics provider');
    }
    return response.data as LogisticsProvider;
  }

  // Create logistics provider
  static async createLogisticsProvider(providerData: CreateLogisticsProviderData): Promise<LogisticsProvider> {
    const response = await apiClient.post('/logistics-providers', providerData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create logistics provider');
    }
    return response.data as LogisticsProvider;
  }

  // Update logistics provider
  static async updateLogisticsProvider(id: string, providerData: UpdateLogisticsProviderData): Promise<LogisticsProvider> {
    const response = await apiClient.put(`/logistics-providers/${id}`, providerData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update logistics provider');
    }
    return response.data as LogisticsProvider;
  }

  // Delete logistics provider
  static async deleteLogisticsProvider(id: string): Promise<void> {
    const response = await apiClient.delete(`/logistics-providers/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete logistics provider');
    }
  }

  // Get shipping rates from provider
  static async getShippingRates(providerId: string, shipmentData: { weight: number; distance: number; serviceType: string; }): Promise<{ rates: Array<{ service: string; cost: number; estimatedDays: number; }>; }> {
    const response = await apiClient.post(`/logistics-providers/${providerId}/rates`, shipmentData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get shipping rates');
    }
    return response.data as { rates: Array<{ service: string; cost: number; estimatedDays: number; }>; };
  }

  // Create shipment with provider
  static async createShipment(providerId: string, shipmentData: { orderId: string; weight: number; dimensions: { length: number; width: number; height: number; }; origin: string; destination: string; serviceType: string; }): Promise<{ trackingNumber: string; cost: number; estimatedDelivery: string; }> {
    const response = await apiClient.post(`/logistics-providers/${providerId}/shipments`, shipmentData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create shipment');
    }
    return response.data as { trackingNumber: string; cost: number; estimatedDelivery: string; };
  }

  // Track shipment
  static async trackShipment(providerId: string, trackingNumber: string): Promise<{ status: string; location?: string; estimatedDelivery?: string; events: Array<{ timestamp: string; status: string; location?: string; }>; }> {
    const response = await apiClient.get(`/logistics-providers/${providerId}/track/${trackingNumber}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to track shipment');
    }
    return response.data as { status: string; location?: string; estimatedDelivery?: string; events: Array<{ timestamp: string; status: string; location?: string; }>; };
  }

  // Get provider performance
  static async getProviderPerformance(id: string): Promise<{ rating: number; totalShipments: number; onTimeDelivery: number; averageCost: number; }> {
    const response = await apiClient.get(`/logistics-providers/${id}/performance`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch provider performance');
    }
    return response.data as { rating: number; totalShipments: number; onTimeDelivery: number; averageCost: number; };
  }

  // Bulk actions for logistics providers
  static async bulkProviderAction(actionData: { providerIds: string[]; action: 'activate' | 'suspend' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/logistics-providers/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export logistics providers
  static async exportLogisticsProviders(filters?: { businessId?: string; status?: string; service?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/logistics-providers/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export logistics providers');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}