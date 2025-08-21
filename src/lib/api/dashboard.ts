import { apiClient } from '@/lib/api/client';
import type { 
  DashboardMetrics, 
  RecentOrder, 
  TopProduct, 
  WalletBalance, 
  RevenueData,
  ActivitySummary,
  NotificationCount,
  BusinessKPI
} from '@/types/dashboard';

export class DashboardAPI {
  private static baseUrl = '/dashboard';

  // Get dashboard overview metrics
  static async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/metrics`);
      return response.data as DashboardMetrics;
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw new Error('Unable to load dashboard metrics');
    }
  }

  // Get recent orders
  static async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/orders/recent`, {
        params: { limit }
      });
      return response.data as RecentOrder[];
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      throw new Error('Unable to load recent orders');
    }
  }

  // Get top performing products
  static async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/products/top`, {
        params: { limit }
      });
      return response.data as TopProduct[];
    } catch (error) {
      console.error('Failed to fetch top products:', error);
      throw new Error('Unable to load top products');
    }
  }

  // Get wallet balance
  static async getWalletBalance(): Promise<WalletBalance> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/wallet/balance`);
      return response.data as WalletBalance;
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      throw new Error('Unable to load wallet balance');
    }
  }

  // Get revenue chart data
  static async getRevenueData(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<RevenueData[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/revenue`, {
        params: { period }
      });
      return response.data as RevenueData[];
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      throw new Error('Unable to load revenue data');
    }
  }

  // Get activity summary
  static async getActivitySummary(): Promise<ActivitySummary> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/activity/summary`);
      return response.data as ActivitySummary;
    } catch (error) {
      console.error('Failed to fetch activity summary:', error);
      throw new Error('Unable to load activity summary');
    }
  }

  // Get notification count
  static async getNotificationCount(): Promise<NotificationCount> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/notifications/count`);
      return response.data as NotificationCount;
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      return { 
        unread: 0, 
        total: 0,
        categories: {
          orders: 0,
          rfqs: 0,
          messages: 0,
          inventory: 0,
          payments: 0,
          reviews: 0,
          system: 0
        }
      };
    }
  }

  // Get business KPIs
  static async getBusinessKPIs(): Promise<BusinessKPI[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/kpis`);
      return response.data as BusinessKPI[];
    } catch (error) {
      console.error('Failed to fetch business KPIs:', error);
      throw new Error('Unable to load business KPIs');
    }
  }

  // Get seller analytics
  static async getSellerAnalytics(timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics/seller`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch seller analytics:', error);
      throw new Error('Unable to load seller analytics');
    }
  }

  // Get product performance analytics
  static async getProductAnalytics(productId?: string) {
    try {
      const url = productId 
        ? `${this.baseUrl}/analytics/products/${productId}`
        : `${this.baseUrl}/analytics/products`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product analytics:', error);
      throw new Error('Unable to load product analytics');
    }
  }

  // Get order analytics
  static async getOrderAnalytics(status?: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics/orders`, {
        params: status ? { status } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order analytics:', error);
      throw new Error('Unable to load order analytics');
    }
  }

  // Get RFQ analytics
  static async getRFQAnalytics() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics/rfqs`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch RFQ analytics:', error);
      throw new Error('Unable to load RFQ analytics');
    }
  }

  // Get customer insights
  static async getCustomerInsights() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/insights/customers`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer insights:', error);
      throw new Error('Unable to load customer insights');
    }
  }

  // Get inventory insights
  static async getInventoryInsights() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/insights/inventory`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch inventory insights:', error);
      throw new Error('Unable to load inventory insights');
    }
  }

  // Get financial insights
  static async getFinancialInsights() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/insights/financial`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch financial insights:', error);
      throw new Error('Unable to load financial insights');
    }
  }

  // Refresh all dashboard data
  static async refreshDashboard() {
    try {
      const response = await apiClient.post(`${this.baseUrl}/refresh`);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      throw new Error('Unable to refresh dashboard data');
    }
  }

  // Export dashboard data
  static async exportDashboardData(format: 'csv' | 'excel' | 'pdf' = 'csv') {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      throw new Error('Unable to export dashboard data');
    }
  }

  // Get real-time updates
  static async getRealtimeUpdates() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/realtime`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch realtime updates:', error);
      return null;
    }
  }

  // Subscribe to dashboard updates via WebSocket
  static subscribeToUpdates(callback: (data: any) => void) {
    const wsUrl = process.env.NODE_ENV === 'development' 
      ? 'ws://localhost:5001/ws/dashboard'
      : `wss://${window.location.hostname}/ws/dashboard`;

    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Dashboard WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Dashboard WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('Dashboard WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.subscribeToUpdates(callback);
        }, 5000);
      };
      
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return () => {};
    }
  }
}

export default DashboardAPI;