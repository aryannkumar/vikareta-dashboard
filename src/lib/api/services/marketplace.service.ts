import { apiClient } from '../client';

export interface Marketplace {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  categories: string[];
  products: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketplaceData {
  name: string;
  description?: string;
  categories?: string[];
  products?: string[];
}

export interface UpdateMarketplaceData {
  name?: string;
  description?: string;
  categories?: string[];
  products?: string[];
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
}

export class MarketplaceService {
  // Get all marketplaces for a business
  static async getMarketplaces(businessId: string, filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ marketplaces: Marketplace[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/marketplaces', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch marketplaces');
    }
    return response.data as { marketplaces: Marketplace[]; total: number; page: number; totalPages: number; };
  }

  // Get marketplace by ID
  static async getMarketplaceById(id: string): Promise<Marketplace> {
    const response = await apiClient.get(`/marketplaces/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch marketplace');
    }
    return response.data as Marketplace;
  }

  // Create marketplace
  static async createMarketplace(marketplaceData: CreateMarketplaceData): Promise<Marketplace> {
    const response = await apiClient.post('/marketplaces', marketplaceData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create marketplace');
    }
    return response.data as Marketplace;
  }

  // Update marketplace
  static async updateMarketplace(id: string, marketplaceData: UpdateMarketplaceData): Promise<Marketplace> {
    const response = await apiClient.put(`/marketplaces/${id}`, marketplaceData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update marketplace');
    }
    return response.data as Marketplace;
  }

  // Delete marketplace
  static async deleteMarketplace(id: string): Promise<void> {
    const response = await apiClient.delete(`/marketplaces/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete marketplace');
    }
  }

  // Bulk actions for marketplaces
  static async bulkMarketplaceAction(actionData: { marketplaceIds: string[]; action: 'activate' | 'suspend' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/marketplaces/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export marketplaces
  static async exportMarketplaces(filters?: { businessId?: string; status?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/marketplaces/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export marketplaces');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}
