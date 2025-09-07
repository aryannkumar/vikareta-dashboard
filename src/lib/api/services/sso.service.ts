import { apiClient } from '../client';

export interface SSOConfig {
  id: string;
  businessId: string;
  provider: 'google' | 'linkedin' | 'digilocker' | 'saml' | 'oauth2';
  name: string;
  description?: string;
  isEnabled: boolean;
  config: {
    clientId?: string;
    clientSecret?: string;
    redirectUrl?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    scope?: string[];
    metadataUrl?: string;
    entityId?: string;
    acsUrl?: string;
    certificate?: string;
  };
  mappings: {
    email?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSSOConfigData {
  provider: 'google' | 'linkedin' | 'digilocker' | 'saml' | 'oauth2';
  name: string;
  description?: string;
  config: {
    clientId?: string;
    clientSecret?: string;
    redirectUrl?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    scope?: string[];
    metadataUrl?: string;
    entityId?: string;
    acsUrl?: string;
    certificate?: string;
  };
  mappings?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    role?: string;
  };
}

export interface UpdateSSOConfigData {
  name?: string;
  description?: string;
  isEnabled?: boolean;
  config?: {
    clientId?: string;
    clientSecret?: string;
    redirectUrl?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    scope?: string[];
    metadataUrl?: string;
    entityId?: string;
    acsUrl?: string;
    certificate?: string;
  };
  mappings?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    role?: string;
  };
}

export class SSOService {
  // Get all SSO configurations for a business
  static async getSSOConfigs(businessId: string): Promise<SSOConfig[]> {
    const response = await apiClient.get('/sso/configs', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch SSO configurations');
    }
    return response.data as SSOConfig[];
  }

  // Get SSO configuration by ID
  static async getSSOConfigById(id: string): Promise<SSOConfig> {
    const response = await apiClient.get(`/sso/configs/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch SSO configuration');
    }
    return response.data as SSOConfig;
  }

  // Create SSO configuration
  static async createSSOConfig(configData: CreateSSOConfigData): Promise<SSOConfig> {
    const response = await apiClient.post('/sso/configs', configData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create SSO configuration');
    }
    return response.data as SSOConfig;
  }

  // Update SSO configuration
  static async updateSSOConfig(id: string, configData: UpdateSSOConfigData): Promise<SSOConfig> {
    const response = await apiClient.put(`/sso/configs/${id}`, configData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update SSO configuration');
    }
    return response.data as SSOConfig;
  }

  // Delete SSO configuration
  static async deleteSSOConfig(id: string): Promise<void> {
    const response = await apiClient.delete(`/sso/configs/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete SSO configuration');
    }
  }

  // Test SSO configuration
  static async testSSOConfig(id: string): Promise<{ success: boolean; message?: string; error?: string; }> {
    const response = await apiClient.post(`/sso/configs/${id}/test`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to test SSO configuration');
    }
    return response.data as { success: boolean; message?: string; error?: string; };
  }

  // Get SSO login URL
  static async getSSOLoginUrl(provider: string, businessId: string): Promise<{ url: string; state: string; }> {
    const response = await apiClient.get('/sso/login-url', { provider, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get SSO login URL');
    }
    return response.data as { url: string; state: string; };
  }

  // Handle SSO callback
  static async handleSSOCallback(provider: string, code: string, state: string): Promise<{ user: any; tokens: { accessToken: string; refreshToken: string; }; }> {
    const response = await apiClient.post('/sso/callback', { provider, code, state });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to handle SSO callback');
    }
    return response.data as { user: any; tokens: { accessToken: string; refreshToken: string; }; };
  }

  // Get available SSO providers
  static async getAvailableProviders(): Promise<Array<{ provider: string; name: string; description: string; icon?: string; }>> {
    const response = await apiClient.get('/sso/providers');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch available SSO providers');
    }
    return response.data as Array<{ provider: string; name: string; description: string; icon?: string; }>;
  }

  // Get SSO user attributes
  static async getSSOUserAttributes(provider: string, businessId: string): Promise<Record<string, any>> {
    const response = await apiClient.get('/sso/user-attributes', { provider, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch SSO user attributes');
    }
    return response.data as Record<string, any>;
  }

  // Sync SSO users
  static async syncSSOUsers(businessId: string, provider?: string): Promise<{ success: boolean; synced: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/sso/sync-users', { businessId, provider });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to sync SSO users');
    }
    return response.data as { success: boolean; synced: number; failed: number; errors?: string[]; };
  }

  // Export SSO configurations
  static async exportSSOConfigs(businessId: string): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/sso/export', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export SSO configurations');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}