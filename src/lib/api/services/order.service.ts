import { apiClient } from '../client';
import type { 
  Order, 
  OrderFilters, 
  PaginatedResponse, 
  ApiResponse 
} from '@/types';

export class OrderService {
  private static readonly BASE_PATH = '/orders';

  // Get all orders with filtering and pagination
  static async getOrders(
    filters: OrderFilters = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>),
    });

    const response = await apiClient.get<PaginatedResponse<Order>>(
      `${this.BASE_PATH}?${params}`
    );
    return response.data as PaginatedResponse<Order>;
  }

  // Get single order by ID
  static async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(
      `${this.BASE_PATH}/${id}`
    );
    return (response.data as ApiResponse<Order>).data!;
  }

  // Update order status
  static async updateOrderStatus(
    id: string, 
    status: Order['status']
  ): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(
      `${this.BASE_PATH}/${id}/status`,
      { status }
    );
    return (response.data as ApiResponse<Order>).data!;
  }

  // Cancel order
  static async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(
      `${this.BASE_PATH}/${id}/cancel`,
      { reason }
    );
    return (response.data as ApiResponse<Order>).data!;
  }

  // Process return/refund
  static async processReturn(
    id: string, 
    returnData: {
      reason: string;
      items: Array<{
        orderItemId: string;
        quantity: number;
        reason: string;
      }>;
    }
  ): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(
      `${this.BASE_PATH}/${id}/return`,
      returnData
    );
    return (response.data as ApiResponse<Order>).data!;
  }

  // Get order analytics
  static async getOrderAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
    topProducts: Array<{ productId: string; productName: string; quantity: number; revenue: number }>;
  }> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await apiClient.get<ApiResponse<any>>(
      `${this.BASE_PATH}/analytics?${params}`
    );
    return (response.data as ApiResponse<any>).data!;
  }

  // Schedule service appointment
  static async scheduleService(
    orderId: string,
    appointmentData: {
      scheduledDate: string;
      scheduledTime: string;
      durationMinutes: number;
      location: string;
      notes?: string;
    }
  ): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(
      `${this.BASE_PATH}/${orderId}/schedule-service`,
      appointmentData
    );
    return (response.data as ApiResponse<Order>).data!;
  }

  // Complete service
  static async completeService(
    orderId: string,
    completionData: {
      completionNotes: string;
      rating?: number;
      images?: string[];
    }
  ): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(
      `${this.BASE_PATH}/${orderId}/service-completion`,
      completionData
    );
    return (response.data as ApiResponse<Order>).data!;
  }

  // Get order tracking information
  static async getOrderTracking(orderId: string): Promise<{
    trackingNumber?: string;
    carrier?: string;
    status: string;
    estimatedDelivery?: string;
    trackingHistory: Array<{
      status: string;
      location: string;
      timestamp: string;
      description: string;
    }>;
  }> {
    const response = await apiClient.get<ApiResponse<any>>(
      `${this.BASE_PATH}/${orderId}/tracking`
    );
    return (response.data as ApiResponse<any>).data!;
  }

  // Export orders to CSV/Excel
  static async exportOrders(
    filters: OrderFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>),
    });

    const response = await apiClient.get(
      `${this.BASE_PATH}/export?${params}`,
      { responseType: 'blob' }
    );
    return response.data as Blob;
  }
}

// Create an instance for easier usage
export const orderService = {
  getOrders: (filters: OrderFilters = {}) => OrderService.getOrders(filters),
  getOrder: (id: string) => OrderService.getOrder(id),
  updateOrderStatus: (id: string, status: Order['status']) => OrderService.updateOrderStatus(id, status),
  cancelOrder: (id: string, reason?: string) => OrderService.cancelOrder(id, reason),
  processReturn: (id: string, returnData: any) => OrderService.processReturn(id, returnData),
  getOrderAnalytics: (dateFrom?: string, dateTo?: string) => OrderService.getOrderAnalytics(dateFrom, dateTo),
  scheduleService: (orderId: string, appointmentData: any) => OrderService.scheduleService(orderId, appointmentData),
  completeService: (orderId: string, completionData: any) => OrderService.completeService(orderId, completionData),
  getOrderTracking: (orderId: string) => OrderService.getOrderTracking(orderId),
  exportOrders: (filters: OrderFilters = {}, format: 'csv' | 'excel' = 'csv') => OrderService.exportOrders(filters, format),
};