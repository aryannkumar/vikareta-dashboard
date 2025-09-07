import { apiClient } from '../client';

export interface Advertisement {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  type: 'banner' | 'sidebar' | 'popup' | 'native';
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  assignments?: string[];
  placements?: string[];
  analytics?: AdAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface AdAnalytics {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  costPerClick: number;
  costPerConversion: number;
  dailyStats: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  }>;
}

export interface CreateAdData {
  name: string;
  description?: string;
  type: 'banner' | 'sidebar' | 'popup' | 'native';
  startDate: string;
  endDate: string;
  budget: number;
  placements?: string[];
  assignments?: string[];
}

export interface UpdateAdData {
  name?: string;
  description?: string;
  type?: 'banner' | 'sidebar' | 'popup' | 'native';
  startDate?: string;
  endDate?: string;
  budget?: number;
  placements?: string[];
  assignments?: string[];
  status?: 'draft' | 'active' | 'paused' | 'completed';
}

export class AdsService {
  // Get all ads for a business
  static async getAds(businessId: string, filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ ads: Advertisement[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/ads', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch ads');
    }
    return response.data as { ads: Advertisement[]; total: number; page: number; totalPages: number; };
  }

  // Get ad by ID
  static async getAdById(id: string): Promise<Advertisement> {
    const response = await apiClient.get(`/ads/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch ad');
    }
    return response.data as Advertisement;
  }

  // Create ad
  static async createAd(adData: CreateAdData): Promise<Advertisement> {
    const response = await apiClient.post('/ads', adData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create ad');
    }
    return response.data as Advertisement;
  }

  // Update ad
  static async updateAd(id: string, adData: UpdateAdData): Promise<Advertisement> {
    const response = await apiClient.put(`/ads/${id}`, adData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update ad');
    }
    return response.data as Advertisement;
  }

  // Delete ad
  static async deleteAd(id: string): Promise<void> {
    const response = await apiClient.delete(`/ads/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete ad');
    }
  }

  // Get ad analytics
  static async getAdAnalytics(id: string): Promise<AdAnalytics> {
    const response = await apiClient.get(`/ads/${id}/analytics`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch ad analytics');
    }
    return response.data as AdAnalytics;
  }

  // Bulk actions for ads
  static async bulkAdAction(actionData: { adIds: string[]; action: 'activate' | 'pause' | 'complete' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/ads/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export ads
  static async exportAds(filters?: { businessId?: string; status?: string; type?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/ads/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export ads');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}
