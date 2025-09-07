import { apiClient } from '../client';

export interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
  settings?: BusinessSettings;
}

export interface BusinessSettings {
  adsEnabled: boolean;
  couponsEnabled: boolean;
  shippingEnabled: boolean;
  invoicingEnabled: boolean;
  deliveryEnabled: boolean;
  integrations: {
    minio?: boolean;
    elasticsearch?: boolean;
    redis?: boolean;
    kafka?: boolean;
    grafana?: boolean;
    jaeger?: boolean;
  };
}

export interface CreateBusinessData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
}

export interface UpdateBusinessData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  settings?: BusinessSettings;
}

export class BusinessService {
  // Get all businesses
  static async getBusinesses(filters?: {
    status?: string;
    industry?: string;
    page?: number;
    limit?: number;
  }): Promise<{ businesses: Business[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/businesses', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch businesses');
    }
    return response.data as { businesses: Business[]; total: number; page: number; totalPages: number; };
  }

  // Get business by ID
  static async getBusinessById(id: string): Promise<Business> {
    const response = await apiClient.get(`/businesses/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch business');
    }
    return response.data as Business;
  }

  // Create business
  static async createBusiness(businessData: CreateBusinessData): Promise<Business> {
    const response = await apiClient.post('/businesses', businessData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create business');
    }
    return response.data as Business;
  }

  // Update business
  static async updateBusiness(id: string, businessData: UpdateBusinessData): Promise<Business> {
    const response = await apiClient.put(`/businesses/${id}`, businessData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update business');
    }
    return response.data as Business;
  }

  // Delete business
  static async deleteBusiness(id: string): Promise<void> {
    const response = await apiClient.delete(`/businesses/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete business');
    }
  }

  // Update business settings
  static async updateBusinessSettings(id: string, settings: BusinessSettings): Promise<Business> {
    const response = await apiClient.put(`/businesses/${id}/settings`, settings);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update business settings');
    }
    return response.data as Business;
  }

  // Bulk actions for businesses
  static async bulkBusinessAction(actionData: { businessIds: string[]; action: 'activate' | 'suspend' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/businesses/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export businesses
  static async exportBusinesses(filters?: { status?: string; industry?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/businesses/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export businesses');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}
