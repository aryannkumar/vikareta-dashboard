import { apiClient } from '../client';

export interface Delivery {
  id: string;
  businessId: string;
  orderId: string;
  provider: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  estimatedDelivery: string;
  deliveredAt?: string;
  cancelledAt?: string;
  address: DeliveryAddress;
  events: DeliveryEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface DeliveryEvent {
  timestamp: string;
  status: string;
  location?: string;
  details?: string;
}

export interface CreateDeliveryData {
  orderId: string;
  provider: string;
  trackingNumber: string;
  estimatedDelivery: string;
  address: DeliveryAddress;
}

export interface UpdateDeliveryData {
  status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  deliveredAt?: string;
  cancelledAt?: string;
  events?: DeliveryEvent[];
}

export class DeliveryService {
  // Get all deliveries for a business
  static async getDeliveries(businessId: string, filters?: {
    status?: string;
    provider?: string;
    page?: number;
    limit?: number;
  }): Promise<{ deliveries: Delivery[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/deliveries', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch deliveries');
    }
    return response.data as { deliveries: Delivery[]; total: number; page: number; totalPages: number; };
  }

  // Get delivery by ID
  static async getDeliveryById(id: string): Promise<Delivery> {
    const response = await apiClient.get(`/deliveries/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch delivery');
    }
    return response.data as Delivery;
  }

  // Create delivery
  static async createDelivery(deliveryData: CreateDeliveryData): Promise<Delivery> {
    const response = await apiClient.post('/deliveries', deliveryData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create delivery');
    }
    return response.data as Delivery;
  }

  // Update delivery
  static async updateDelivery(id: string, deliveryData: UpdateDeliveryData): Promise<Delivery> {
    const response = await apiClient.put(`/deliveries/${id}`, deliveryData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update delivery');
    }
    return response.data as Delivery;
  }

  // Delete delivery
  static async deleteDelivery(id: string): Promise<void> {
    const response = await apiClient.delete(`/deliveries/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete delivery');
    }
  }

  // Track delivery
  static async trackDelivery(id: string): Promise<DeliveryEvent[]> {
    const response = await apiClient.get(`/deliveries/${id}/track`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to track delivery');
    }
    return response.data as DeliveryEvent[];
  }

  // Bulk actions for deliveries
  static async bulkDeliveryAction(actionData: { deliveryIds: string[]; action: 'mark_delivered' | 'cancel' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/deliveries/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export deliveries
  static async exportDeliveries(filters?: { businessId?: string; status?: string; provider?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/deliveries/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export deliveries');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}
