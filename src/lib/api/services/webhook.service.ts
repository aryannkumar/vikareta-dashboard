import { apiClient } from '../client';

export interface Webhook {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  lastTriggered?: string;
  failureCount: number;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryInterval: number;
    backoffMultiplier: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WebhookAttempt {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  response?: any;
  status: 'success' | 'failed' | 'retrying';
  statusCode?: number;
  errorMessage?: string;
  attemptNumber: number;
  nextRetryAt?: string;
  createdAt: string;
}

export interface CreateWebhookData {
  name: string;
  description?: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries?: number;
    retryInterval?: number;
    backoffMultiplier?: number;
  };
}

export interface UpdateWebhookData {
  name?: string;
  description?: string;
  url?: string;
  events?: string[];
  status?: 'active' | 'inactive' | 'failed';
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries?: number;
    retryInterval?: number;
    backoffMultiplier?: number;
  };
}

export class WebhookService {
  // Get all webhooks for a business
  static async getWebhooks(businessId: string, filters?: {
    status?: string;
    event?: string;
    page?: number;
    limit?: number;
  }): Promise<{ webhooks: Webhook[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/webhooks', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch webhooks');
    }
    return response.data as { webhooks: Webhook[]; total: number; page: number; totalPages: number; };
  }

  // Get webhook by ID
  static async getWebhookById(id: string): Promise<Webhook> {
    const response = await apiClient.get(`/webhooks/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch webhook');
    }
    return response.data as Webhook;
  }

  // Create webhook
  static async createWebhook(webhookData: CreateWebhookData): Promise<Webhook> {
    const response = await apiClient.post('/webhooks', webhookData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create webhook');
    }
    return response.data as Webhook;
  }

  // Update webhook
  static async updateWebhook(id: string, webhookData: UpdateWebhookData): Promise<Webhook> {
    const response = await apiClient.put(`/webhooks/${id}`, webhookData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update webhook');
    }
    return response.data as Webhook;
  }

  // Delete webhook
  static async deleteWebhook(id: string): Promise<void> {
    const response = await apiClient.delete(`/webhooks/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete webhook');
    }
  }

  // Test webhook
  static async testWebhook(id: string, testPayload?: any): Promise<{ success: boolean; response?: any; error?: string; }> {
    const response = await apiClient.post(`/webhooks/${id}/test`, { payload: testPayload });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to test webhook');
    }
    return response.data as { success: boolean; response?: any; error?: string; };
  }

  // Get webhook attempts
  static async getWebhookAttempts(webhookId: string, filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ attempts: WebhookAttempt[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get(`/webhooks/${webhookId}/attempts`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch webhook attempts');
    }
    return response.data as { attempts: WebhookAttempt[]; total: number; page: number; totalPages: number; };
  }

  // Get available webhook events
  static async getAvailableEvents(): Promise<{ event: string; description: string; }[]> {
    const response = await apiClient.get('/webhooks/events');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch available events');
    }
    return response.data as { event: string; description: string; }[];
  }

  // Regenerate webhook secret
  static async regenerateSecret(id: string): Promise<{ secret: string; }> {
    const response = await apiClient.post(`/webhooks/${id}/regenerate-secret`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to regenerate webhook secret');
    }
    return response.data as { secret: string; };
  }

  // Bulk actions for webhooks
  static async bulkWebhookAction(actionData: { webhookIds: string[]; action: 'activate' | 'deactivate' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/webhooks/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export webhooks
  static async exportWebhooks(filters?: { businessId?: string; status?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/webhooks/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export webhooks');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}