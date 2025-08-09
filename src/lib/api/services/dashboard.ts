import { apiClient } from '../client';

export interface SavedItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  provider: string;
  providerId: string;
  category: string;
  available: boolean;
  savedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalSpent: number;
  savedItems: number;
  activeRFQs: number;
  activeCustomers: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'rfq' | 'message' | 'review';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export const dashboardApi = {
  async getDashboardStats() {
    return apiClient.get<DashboardStats>('/api/dashboard/stats');
  },

  async getRecentActivity(limit: number = 10) {
    return apiClient.get<RecentActivity[]>('/api/dashboard/activity', { limit });
  },

  async getQuickActions() {
    return apiClient.get<QuickAction[]>('/api/dashboard/quick-actions');
  },

  async getSavedItems(params?: {
    type?: 'product' | 'service';
    category?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get<{
      items: SavedItem[];
      total: number;
      page: number;
      totalPages: number;
    }>('/api/dashboard/saved-items', params);
  },

  async removeSavedItem(itemId: string) {
    return apiClient.delete(`/api/dashboard/saved-items/${itemId}`);
  },

  async addSavedItem(itemId: string, type: 'product' | 'service') {
    return apiClient.post('/api/dashboard/saved-items', { itemId, type });
  }
};