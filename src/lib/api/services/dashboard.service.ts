import { apiClient, DashboardMetrics, ChartData } from '../client';

export class DashboardService {
  // Dashboard metrics
  static async getMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.getDashboardMetrics();
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch dashboard metrics');
    }
    return response.data;
  }

  // Chart data
  static async getRevenueChart(period: string = '30d'): Promise<ChartData> {
    const response = await apiClient.getRevenueChart(period);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch revenue chart');
    }
    return response.data;
  }

  static async getOrdersChart(period: string = '30d'): Promise<ChartData> {
    const response = await apiClient.getOrdersChart(period);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch orders chart');
    }
    return response.data;
  }

  // Top performing items
  static async getTopProducts(limit: number = 10): Promise<unknown[]> {
    const response = await apiClient.getTopProducts(limit);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch top products');
    }
    return response.data;
  }

  static async getRecentOrders(limit: number = 10): Promise<unknown[]> {
    const response = await apiClient.getRecentOrders(limit);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch recent orders');
    }
    return response.data;
  }

  // Analytics
  static async getAnalytics(params?: { 
    period?: string; 
    metrics?: string[] 
  }): Promise<unknown> {
    const response = await apiClient.getAnalytics(params);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch analytics');
    }
    return response.data;
  }
}