import { apiClient } from '../client';

export interface Deal {
  id: string;
  businessId: string;
  title: string;
  description?: string;
  type: 'discount' | 'bundle' | 'flash' | 'exclusive';
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxUsage?: number;
  usageCount: number;
  assignedProducts?: string[];
  assignedCategories?: string[];
  analytics?: DealAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface DealAnalytics {
  usageCount: number;
  totalDiscountGiven: number;
  orders: number;
  revenueImpact: number;
  dailyStats: Array<{
    date: string;
    usageCount: number;
    discountGiven: number;
    orders: number;
    revenueImpact: number;
  }>;
}

export interface CreateDealData {
  title: string;
  description?: string;
  type: 'discount' | 'bundle' | 'flash' | 'exclusive';
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxUsage?: number;
  assignedProducts?: string[];
  assignedCategories?: string[];
}

export interface UpdateDealData {
  title?: string;
  description?: string;
  type?: 'discount' | 'bundle' | 'flash' | 'exclusive';
  startDate?: string;
  endDate?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  minOrderValue?: number;
  maxUsage?: number;
  assignedProducts?: string[];
  assignedCategories?: string[];
  status?: 'draft' | 'active' | 'expired' | 'cancelled';
}

export class DealsService {
  // Get all deals for a business
  static async getDeals(businessId: string, filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ deals: Deal[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/deals', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch deals');
    }
    return response.data as { deals: Deal[]; total: number; page: number; totalPages: number; };
  }

  // Get deal by ID
  static async getDealById(id: string): Promise<Deal> {
    const response = await apiClient.get(`/deals/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch deal');
    }
    return response.data as Deal;
  }

  // Create deal
  static async createDeal(dealData: CreateDealData): Promise<Deal> {
    const response = await apiClient.post('/deals', dealData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create deal');
    }
    return response.data as Deal;
  }

  // Update deal
  static async updateDeal(id: string, dealData: UpdateDealData): Promise<Deal> {
    const response = await apiClient.put(`/deals/${id}`, dealData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update deal');
    }
    return response.data as Deal;
  }

  // Delete deal
  static async deleteDeal(id: string): Promise<void> {
    const response = await apiClient.delete(`/deals/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete deal');
    }
  }

  // Get deal analytics
  static async getDealAnalytics(id: string): Promise<DealAnalytics> {
    const response = await apiClient.get(`/deals/${id}/analytics`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch deal analytics');
    }
    return response.data as DealAnalytics;
  }

  // Bulk actions for deals
  static async bulkDealAction(actionData: { dealIds: string[]; action: 'activate' | 'expire' | 'cancel' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/deals/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export deals
  static async exportDeals(filters?: { businessId?: string; status?: string; type?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/deals/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export deals');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}
