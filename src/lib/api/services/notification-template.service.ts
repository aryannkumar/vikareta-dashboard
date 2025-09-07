import { apiClient } from '../client';

export interface NotificationTemplate {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
  category: string;
  subject?: string;
  content: string;
  variables: string[];
  isDefault: boolean;
  isActive: boolean;
  language: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationTemplateData {
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
  category: string;
  subject?: string;
  content: string;
  variables?: string[];
  isDefault?: boolean;
  language?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationTemplateData {
  name?: string;
  description?: string;
  subject?: string;
  content?: string;
  variables?: string[];
  isDefault?: boolean;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationTemplateFilter {
  businessId?: string;
  type?: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
  category?: string;
  isDefault?: boolean;
  isActive?: boolean;
  language?: string;
  limit?: number;
  offset?: number;
}

export interface TemplatePreviewData {
  templateId: string;
  variables: Record<string, any>;
  recipientId?: string;
}

export class NotificationTemplateService {
  // Get notification templates with filtering
  static async getNotificationTemplates(filters: NotificationTemplateFilter = {}): Promise<{ templates: NotificationTemplate[]; total: number; }> {
    const response = await apiClient.get('/notification-templates', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification templates');
    }
    return response.data as { templates: NotificationTemplate[]; total: number; };
  }

  // Get notification template by ID
  static async getNotificationTemplateById(id: string): Promise<NotificationTemplate> {
    const response = await apiClient.get(`/notification-templates/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification template');
    }
    return response.data as NotificationTemplate;
  }

  // Get notification templates for a business
  static async getBusinessNotificationTemplates(businessId: string, filters: Omit<NotificationTemplateFilter, 'businessId'> = {}): Promise<{ templates: NotificationTemplate[]; total: number; }> {
    const response = await apiClient.get(`/notification-templates/business/${businessId}`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch business notification templates');
    }
    return response.data as { templates: NotificationTemplate[]; total: number; };
  }

  // Create notification template
  static async createNotificationTemplate(templateData: CreateNotificationTemplateData): Promise<NotificationTemplate> {
    const response = await apiClient.post('/notification-templates', templateData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create notification template');
    }
    return response.data as NotificationTemplate;
  }

  // Update notification template
  static async updateNotificationTemplate(id: string, templateData: UpdateNotificationTemplateData): Promise<NotificationTemplate> {
    const response = await apiClient.put(`/notification-templates/${id}`, templateData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update notification template');
    }
    return response.data as NotificationTemplate;
  }

  // Delete notification template
  static async deleteNotificationTemplate(id: string): Promise<void> {
    const response = await apiClient.delete(`/notification-templates/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete notification template');
    }
  }

  // Duplicate notification template
  static async duplicateNotificationTemplate(id: string, name?: string): Promise<NotificationTemplate> {
    const response = await apiClient.post(`/notification-templates/${id}/duplicate`, { name });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to duplicate notification template');
    }
    return response.data as NotificationTemplate;
  }

  // Preview notification template
  static async previewNotificationTemplate(previewData: TemplatePreviewData): Promise<{ subject?: string; content: string; renderedContent: string; }> {
    const response = await apiClient.post('/notification-templates/preview', previewData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to preview notification template');
    }
    return response.data as { subject?: string; content: string; renderedContent: string; };
  }

  // Test notification template
  static async testNotificationTemplate(id: string, testData: { recipientId: string; variables?: Record<string, any>; }): Promise<{ success: boolean; message?: string; error?: string; }> {
    const response = await apiClient.post(`/notification-templates/${id}/test`, testData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to test notification template');
    }
    return response.data as { success: boolean; message?: string; error?: string; };
  }

  // Get notification template categories
  static async getNotificationTemplateCategories(): Promise<Array<{ category: string; name: string; description: string; types: string[]; }>> {
    const response = await apiClient.get('/notification-templates/categories');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification template categories');
    }
    return response.data as Array<{ category: string; name: string; description: string; types: string[]; }>;
  }

  // Get notification template variables
  static async getNotificationTemplateVariables(type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app', category?: string): Promise<Array<{ variable: string; description: string; type: string; example?: string; }>> {
    const response = await apiClient.get('/notification-templates/variables', { type, category });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification template variables');
    }
    return response.data as Array<{ variable: string; description: string; type: string; example?: string; }>;
  }

  // Set default notification template
  static async setDefaultNotificationTemplate(id: string, category: string, type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app'): Promise<NotificationTemplate> {
    const response = await apiClient.post(`/notification-templates/${id}/set-default`, { category, type });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to set default notification template');
    }
    return response.data as NotificationTemplate;
  }

  // Get default notification template
  static async getDefaultNotificationTemplate(category: string, type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app', businessId?: string): Promise<NotificationTemplate> {
    const response = await apiClient.get('/notification-templates/default', { category, type, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch default notification template');
    }
    return response.data as NotificationTemplate;
  }

  // Export notification templates
  static async exportNotificationTemplates(filters: NotificationTemplateFilter = {}, format: 'json' | 'zip' = 'json'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/notification-templates/export', { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export notification templates');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Import notification templates
  static async importNotificationTemplates(file: File, businessId?: string): Promise<{ imported: number; failed: number; errors?: string[]; }> {
    const formData = new FormData();
    formData.append('file', file);
    if (businessId) {
      formData.append('businessId', businessId);
    }

    const response = await apiClient.post('/notification-templates/import', formData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to import notification templates');
    }
    return response.data as { imported: number; failed: number; errors?: string[]; };
  }

  // Get notification template usage statistics
  static async getNotificationTemplateStats(templateId?: string, businessId?: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    failureRate: number;
    usageByDate: Array<{ date: string; sent: number; delivered: number; failed: number; }>;
    topTemplates?: Array<{ templateId: string; name: string; sent: number; rate: number; }>;
  }> {
    const response = await apiClient.get('/notification-templates/stats', { templateId, businessId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification template statistics');
    }
    return response.data as {
      totalSent: number;
      totalDelivered: number;
      totalFailed: number;
      deliveryRate: number;
      failureRate: number;
      usageByDate: Array<{ date: string; sent: number; delivered: number; failed: number; }>;
      topTemplates?: Array<{ templateId: string; name: string; sent: number; rate: number; }>;
    };
  }

  // Validate notification template
  static async validateNotificationTemplate(templateData: { type: string; content: string; subject?: string; variables?: string[]; }): Promise<{ valid: boolean; errors?: string[]; warnings?: string[]; }> {
    const response = await apiClient.post('/notification-templates/validate', templateData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate notification template');
    }
    return response.data as { valid: boolean; errors?: string[]; warnings?: string[]; };
  }

  // Bulk update notification templates
  static async bulkUpdateNotificationTemplates(updates: Array<{ id: string; data: UpdateNotificationTemplateData; }>): Promise<{ updated: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.put('/notification-templates/bulk', { updates });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk update notification templates');
    }
    return response.data as { updated: number; failed: number; errors?: string[]; };
  }
}