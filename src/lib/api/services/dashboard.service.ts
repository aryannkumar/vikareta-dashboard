import { apiClient } from '../client';

// Define types locally for now
interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export class DashboardService {
  // Dashboard metrics
  static async getMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.getDashboardMetrics();
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch dashboard metrics');
    }
    return response.data as DashboardMetrics;
  }

  // Chart data
  static async getRevenueChart(period: string = '30d'): Promise<ChartData> {
    const response = await apiClient.getRevenueAnalytics(period);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch revenue chart');
    }
    return response.data as ChartData;
  }

  static async getOrdersChart(period: string = '30d'): Promise<ChartData> {
    const response = await apiClient.getRecentOrders();
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch orders chart');
    }
    return response.data as ChartData;
  }

  // Top performing items
  static async getTopProducts(limit: number = 10): Promise<unknown[]> {
    const response = await apiClient.getProductPerformance(limit);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch top products');
    }
    return response.data as unknown[];
  }

  static async getRecentOrders(limit: number = 10): Promise<unknown[]> {
    const response = await apiClient.getRecentOrders(limit);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch recent orders');
    }
    return response.data as unknown[];
  }

  // Analytics
  static async getAnalytics(params?: { 
    period?: string; 
    metrics?: string[] 
  }): Promise<unknown> {
    const period = params?.period || '30d';
    const response = await apiClient.getRevenueAnalytics(period);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch analytics');
    }
    return response.data;
  }
}