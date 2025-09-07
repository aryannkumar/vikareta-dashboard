import { apiClient } from '../client';

export interface ApiKey {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  key: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  rateLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyData {
  name: string;
  description?: string;
  permissions: string[];
  expiresAt?: string;
  rateLimit?: number;
}

export interface UpdateApiKeyData {
  name?: string;
  description?: string;
  permissions?: string[];
  status?: 'active' | 'inactive' | 'expired' | 'revoked';
  expiresAt?: string;
  rateLimit?: number;
}

export class ApiKeyService {
  // Get all API keys for a business
  static async getApiKeys(businessId: string, filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ apiKeys: ApiKey[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/api-keys', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch API keys');
    }
    return response.data as { apiKeys: ApiKey[]; total: number; page: number; totalPages: number; };
  }

  // Get API key by ID
  static async getApiKeyById(id: string): Promise<ApiKey> {
    const response = await apiClient.get(`/api-keys/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch API key');
    }
    return response.data as ApiKey;
  }

  // Create API key
  static async createApiKey(apiKeyData: CreateApiKeyData): Promise<ApiKey> {
    const response = await apiClient.post('/api-keys', apiKeyData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create API key');
    }
    return response.data as ApiKey;
  }

  // Update API key
  static async updateApiKey(id: string, apiKeyData: UpdateApiKeyData): Promise<ApiKey> {
    const response = await apiClient.put(`/api-keys/${id}`, apiKeyData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update API key');
    }
    return response.data as ApiKey;
  }

  // Delete API key
  static async deleteApiKey(id: string): Promise<void> {
    const response = await apiClient.delete(`/api-keys/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete API key');
    }
  }

  // Revoke API key
  static async revokeApiKey(id: string): Promise<ApiKey> {
    const response = await apiClient.post(`/api-keys/${id}/revoke`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to revoke API key');
    }
    return response.data as ApiKey;
  }

  // Regenerate API key
  static async regenerateApiKey(id: string): Promise<ApiKey> {
    const response = await apiClient.post(`/api-keys/${id}/regenerate`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to regenerate API key');
    }
    return response.data as ApiKey;
  }

  // Get API key usage
  static async getApiKeyUsage(id: string): Promise<{ usageCount: number; lastUsed?: string; rateLimit?: number; }> {
    const response = await apiClient.get(`/api-keys/${id}/usage`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch API key usage');
    }
    return response.data as { usageCount: number; lastUsed?: string; rateLimit?: number; };
  }

  // Bulk actions for API keys
  static async bulkApiKeyAction(actionData: { apiKeyIds: string[]; action: 'activate' | 'revoke' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/api-keys/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export API keys
  static async exportApiKeys(filters?: { businessId?: string; status?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/api-keys/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export API keys');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}