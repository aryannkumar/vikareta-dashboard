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
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },

  async getRecentActivity(limit: number = 10) {
    return apiClient.get<RecentActivity[]>('/dashboard/activity', { limit });
  },

  async getQuickActions() {
    return apiClient.get<QuickAction[]>('/dashboard/quick-actions');
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
    }>('/dashboard/saved-items', params);
  },

  async removeSavedItem(itemId: string) {
    return apiClient.delete(`/dashboard/saved-items/${itemId}`);
  },

  async addSavedItem(itemId: string, type: 'product' | 'service') {
    return apiClient.post('/dashboard/saved-items', { itemId, type });
  }
};