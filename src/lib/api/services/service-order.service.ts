import { apiClient } from '../client';

export interface ServiceOrder {
  id: string;
  buyerId: string;
  sellerId: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  serviceType: 'one_time' | 'recurring' | 'subscription';
  requirements?: string;
  attachments?: string[];
  scheduledDate?: string;
  completionDate?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceOrderData {
  serviceId: string;
  quantity: number;
  requirements?: string;
  attachments?: string[];
  scheduledDate?: string;
  notes?: string;
}

export interface UpdateServiceOrderData {
  status?: 'pending' | 'confirmed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requirements?: string;
  attachments?: string[];
  scheduledDate?: string;
  completionDate?: string;
  notes?: string;
}

export class ServiceOrderService {
  // Get all service orders for a business
  static async getServiceOrders(businessId: string, filters?: {
    status?: string;
    serviceType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: ServiceOrder[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/service-orders', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch service orders');
    }
    return response.data as { orders: ServiceOrder[]; total: number; page: number; totalPages: number; };
  }

  // Get service order by ID
  static async getServiceOrderById(id: string): Promise<ServiceOrder> {
    const response = await apiClient.get(`/service-orders/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch service order');
    }
    return response.data as ServiceOrder;
  }

  // Create service order
  static async createServiceOrder(orderData: CreateServiceOrderData): Promise<ServiceOrder> {
    const response = await apiClient.post('/service-orders', orderData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create service order');
    }
    return response.data as ServiceOrder;
  }

  // Update service order
  static async updateServiceOrder(id: string, orderData: UpdateServiceOrderData): Promise<ServiceOrder> {
    const response = await apiClient.put(`/service-orders/${id}`, orderData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update service order');
    }
    return response.data as ServiceOrder;
  }

  // Cancel service order
  static async cancelServiceOrder(id: string, reason?: string): Promise<ServiceOrder> {
    const response = await apiClient.post(`/service-orders/${id}/cancel`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel service order');
    }
    return response.data as ServiceOrder;
  }

  // Confirm service order
  static async confirmServiceOrder(id: string): Promise<ServiceOrder> {
    const response = await apiClient.post(`/service-orders/${id}/confirm`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to confirm service order');
    }
    return response.data as ServiceOrder;
  }

  // Mark service order as completed
  static async completeServiceOrder(id: string, completionNotes?: string): Promise<ServiceOrder> {
    const response = await apiClient.post(`/service-orders/${id}/complete`, { completionNotes });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to complete service order');
    }
    return response.data as ServiceOrder;
  }

  // Get service order analytics
  static async getServiceOrderAnalytics(businessId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalOrders: number;
    totalRevenue: number;
    completedOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
    topServices: Array<{ id: string; name: string; orders: number; revenue: number; }>;
  }> {
    const response = await apiClient.get('/service-orders/analytics', { businessId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch service order analytics');
    }
    return response.data as {
      totalOrders: number;
      totalRevenue: number;
      completedOrders: number;
      pendingOrders: number;
      averageOrderValue: number;
      topServices: Array<{ id: string; name: string; orders: number; revenue: number; }>;
    };
  }

  // Bulk actions for service orders
  static async bulkServiceOrderAction(actionData: { orderIds: string[]; action: 'confirm' | 'cancel' | 'complete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/service-orders/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export service orders
  static async exportServiceOrders(filters?: { businessId?: string; status?: string; serviceType?: string; dateFrom?: string; dateTo?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/service-orders/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export service orders');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}