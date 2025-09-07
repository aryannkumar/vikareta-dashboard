import { apiClient } from '../client';

export interface NotificationBatch {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
  templateId?: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationBatchRecipient {
  id: string;
  batchId: string;
  recipientId: string;
  recipientType: 'user' | 'business' | 'contact';
  contactInfo: {
    email?: string;
    phone?: string;
    deviceToken?: string;
    webhookUrl?: string;
  };
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  retryCount: number;
  metadata?: Record<string, any>;
}

export interface CreateNotificationBatchData {
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  templateId?: string;
  recipients: Array<{
    recipientId: string;
    recipientType: 'user' | 'business' | 'contact';
    contactInfo: {
      email?: string;
      phone?: string;
      deviceToken?: string;
      webhookUrl?: string;
    };
    metadata?: Record<string, any>;
  }>;
  scheduledAt?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationBatchData {
  name?: string;
  description?: string;
  templateId?: string;
  scheduledAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationBatchFilter {
  businessId?: string;
  type?: 'email' | 'sms' | 'push' | 'webhook';
  status?: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class NotificationBatchService {
  // Get notification batches with filtering
  static async getNotificationBatches(filters: NotificationBatchFilter = {}): Promise<{ batches: NotificationBatch[]; total: number; }> {
    const response = await apiClient.get('/notification-batches', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification batches');
    }
    return response.data as { batches: NotificationBatch[]; total: number; };
  }

  // Get notification batch by ID
  static async getNotificationBatchById(id: string): Promise<NotificationBatch> {
    const response = await apiClient.get(`/notification-batches/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification batch');
    }
    return response.data as NotificationBatch;
  }

  // Create notification batch
  static async createNotificationBatch(batchData: CreateNotificationBatchData): Promise<NotificationBatch> {
    const response = await apiClient.post('/notification-batches', batchData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create notification batch');
    }
    return response.data as NotificationBatch;
  }

  // Update notification batch
  static async updateNotificationBatch(id: string, batchData: UpdateNotificationBatchData): Promise<NotificationBatch> {
    const response = await apiClient.put(`/notification-batches/${id}`, batchData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update notification batch');
    }
    return response.data as NotificationBatch;
  }

  // Delete notification batch
  static async deleteNotificationBatch(id: string): Promise<void> {
    const response = await apiClient.delete(`/notification-batches/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete notification batch');
    }
  }

  // Schedule notification batch
  static async scheduleNotificationBatch(id: string, scheduledAt: string): Promise<NotificationBatch> {
    const response = await apiClient.post(`/notification-batches/${id}/schedule`, { scheduledAt });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to schedule notification batch');
    }
    return response.data as NotificationBatch;
  }

  // Cancel notification batch
  static async cancelNotificationBatch(id: string): Promise<NotificationBatch> {
    const response = await apiClient.post(`/notification-batches/${id}/cancel`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel notification batch');
    }
    return response.data as NotificationBatch;
  }

  // Process notification batch
  static async processNotificationBatch(id: string): Promise<NotificationBatch> {
    const response = await apiClient.post(`/notification-batches/${id}/process`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to process notification batch');
    }
    return response.data as NotificationBatch;
  }

  // Get notification batch recipients
  static async getNotificationBatchRecipients(batchId: string, filters: { status?: string; limit?: number; offset?: number; } = {}): Promise<{ recipients: NotificationBatchRecipient[]; total: number; }> {
    const response = await apiClient.get(`/notification-batches/${batchId}/recipients`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification batch recipients');
    }
    return response.data as { recipients: NotificationBatchRecipient[]; total: number; };
  }

  // Get notification batch statistics
  static async getNotificationBatchStats(batchId: string): Promise<{
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    bouncedCount: number;
    pendingCount: number;
    deliveryRate: number;
    failureRate: number;
    averageDeliveryTime?: number;
  }> {
    const response = await apiClient.get(`/notification-batches/${batchId}/stats`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification batch statistics');
    }
    return response.data as {
      totalRecipients: number;
      sentCount: number;
      deliveredCount: number;
      failedCount: number;
      bouncedCount: number;
      pendingCount: number;
      deliveryRate: number;
      failureRate: number;
      averageDeliveryTime?: number;
    };
  }

  // Retry failed notifications in batch
  static async retryFailedNotifications(batchId: string): Promise<{ retried: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post(`/notification-batches/${batchId}/retry`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to retry failed notifications');
    }
    return response.data as { retried: number; failed: number; errors?: string[]; };
  }

  // Export notification batch results
  static async exportNotificationBatchResults(batchId: string, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post(`/notification-batches/${batchId}/export`, { format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export notification batch results');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Bulk create notification batches
  static async bulkCreateNotificationBatches(batches: CreateNotificationBatchData[]): Promise<{ created: NotificationBatch[]; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/notification-batches/bulk', { batches });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk create notification batches');
    }
    return response.data as { created: NotificationBatch[]; failed: number; errors?: string[]; };
  }

  // Get notification batch templates
  static async getNotificationBatchTemplates(type?: 'email' | 'sms' | 'push' | 'webhook'): Promise<Array<{ id: string; name: string; description?: string; type: string; variables: string[]; }>> {
    const response = await apiClient.get('/notification-batches/templates', { type });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification batch templates');
    }
    return response.data as Array<{ id: string; name: string; description?: string; type: string; variables: string[]; }>;
  }

  // Duplicate notification batch
  static async duplicateNotificationBatch(id: string, name?: string): Promise<NotificationBatch> {
    const response = await apiClient.post(`/notification-batches/${id}/duplicate`, { name });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to duplicate notification batch');
    }
    return response.data as NotificationBatch;
  }
}