import { apiClient } from '../client';

export interface Integration {
  id: string;
  businessId: string;
  type: 'minio' | 'elasticsearch' | 'redis' | 'kafka' | 'grafana' | 'jaeger' | 'custom';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  config: Record<string, any>;
  lastSync?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationData {
  type: 'minio' | 'elasticsearch' | 'redis' | 'kafka' | 'grafana' | 'jaeger' | 'custom';
  config: Record<string, any>;
}

export interface UpdateIntegrationData {
  config?: Record<string, any>;
  status?: 'connected' | 'disconnected' | 'pending' | 'error';
  errorMessage?: string;
}

export class IntegrationService {
  // Get all integrations for a business
  static async getIntegrations(businessId: string, filters?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ integrations: Integration[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/integrations', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch integrations');
    }
    return response.data as { integrations: Integration[]; total: number; page: number; totalPages: number; };
  }

  // Get integration by ID
  static async getIntegrationById(id: string): Promise<Integration> {
    const response = await apiClient.get(`/integrations/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch integration');
    }
    return response.data as Integration;
  }

  // Create integration
  static async createIntegration(integrationData: CreateIntegrationData): Promise<Integration> {
    const response = await apiClient.post('/integrations', integrationData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create integration');
    }
    return response.data as Integration;
  }

  // Update integration
  static async updateIntegration(id: string, integrationData: UpdateIntegrationData): Promise<Integration> {
    const response = await apiClient.put(`/integrations/${id}`, integrationData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update integration');
    }
    return response.data as Integration;
  }

  // Delete integration
  static async deleteIntegration(id: string): Promise<void> {
    const response = await apiClient.delete(`/integrations/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete integration');
    }
  }

  // Test integration connection
  static async testIntegration(id: string): Promise<{ success: boolean; message?: string; }> {
    const response = await apiClient.post(`/integrations/${id}/test`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to test integration');
    }
    return response.data as { success: boolean; message?: string; };
  }

  // Bulk actions for integrations
  static async bulkIntegrationAction(actionData: { integrationIds: string[]; action: 'connect' | 'disconnect' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/integrations/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export integrations
  static async exportIntegrations(filters?: { businessId?: string; type?: string; status?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/integrations/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export integrations');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}
