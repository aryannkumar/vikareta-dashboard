import { apiClient } from '../client';

export interface NotificationPreference {
  id: string;
  businessId: string;
  userId?: string;
  category: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
  enabled: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
  quietHours?: {
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
  filters?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationPreferenceData {
  category: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
  enabled: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
  filters?: Record<string, any>;
}

export interface UpdateNotificationPreferenceData {
  enabled?: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
  filters?: Record<string, any>;
}

export interface NotificationPreferenceFilter {
  businessId?: string;
  userId?: string;
  category?: string;
  type?: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
  enabled?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationPreferenceSummary {
  totalPreferences: number;
  enabledCount: number;
  disabledCount: number;
  preferencesByCategory: Record<string, number>;
  preferencesByType: Record<string, number>;
  preferencesByFrequency: Record<string, number>;
}

export class NotificationPreferenceService {
  // Get notification preferences with filtering
  static async getNotificationPreferences(filters: NotificationPreferenceFilter = {}): Promise<{ preferences: NotificationPreference[]; total: number; }> {
    const response = await apiClient.get('/notification-preferences', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification preferences');
    }
    return response.data as { preferences: NotificationPreference[]; total: number; };
  }

  // Get notification preference by ID
  static async getNotificationPreferenceById(id: string): Promise<NotificationPreference> {
    const response = await apiClient.get(`/notification-preferences/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification preference');
    }
    return response.data as NotificationPreference;
  }

  // Get notification preferences for a business
  static async getBusinessNotificationPreferences(businessId: string, filters: Omit<NotificationPreferenceFilter, 'businessId'> = {}): Promise<{ preferences: NotificationPreference[]; total: number; }> {
    const response = await apiClient.get(`/notification-preferences/business/${businessId}`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch business notification preferences');
    }
    return response.data as { preferences: NotificationPreference[]; total: number; };
  }

  // Get notification preferences for a user
  static async getUserNotificationPreferences(userId: string, filters: Omit<NotificationPreferenceFilter, 'userId'> = {}): Promise<{ preferences: NotificationPreference[]; total: number; }> {
    const response = await apiClient.get(`/notification-preferences/user/${userId}`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch user notification preferences');
    }
    return response.data as { preferences: NotificationPreference[]; total: number; };
  }

  // Create notification preference
  static async createNotificationPreference(preferenceData: CreateNotificationPreferenceData): Promise<NotificationPreference> {
    const response = await apiClient.post('/notification-preferences', preferenceData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create notification preference');
    }
    return response.data as NotificationPreference;
  }

  // Update notification preference
  static async updateNotificationPreference(id: string, preferenceData: UpdateNotificationPreferenceData): Promise<NotificationPreference> {
    const response = await apiClient.put(`/notification-preferences/${id}`, preferenceData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update notification preference');
    }
    return response.data as NotificationPreference;
  }

  // Delete notification preference
  static async deleteNotificationPreference(id: string): Promise<void> {
    const response = await apiClient.delete(`/notification-preferences/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete notification preference');
    }
  }

  // Bulk update notification preferences
  static async bulkUpdateNotificationPreferences(updates: Array<{ id: string; data: UpdateNotificationPreferenceData; }>): Promise<{ updated: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.put('/notification-preferences/bulk', { updates });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk update notification preferences');
    }
    return response.data as { updated: number; failed: number; errors?: string[]; };
  }

  // Enable/disable notification preference
  static async toggleNotificationPreference(id: string, enabled: boolean): Promise<NotificationPreference> {
    const response = await apiClient.put(`/notification-preferences/${id}/toggle`, { enabled });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to toggle notification preference');
    }
    return response.data as NotificationPreference;
  }

  // Get notification preference categories
  static async getNotificationPreferenceCategories(): Promise<Array<{ category: string; name: string; description: string; types: string[]; }>> {
    const response = await apiClient.get('/notification-preferences/categories');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification preference categories');
    }
    return response.data as Array<{ category: string; name: string; description: string; types: string[]; }>;
  }

  // Get notification preference summary
  static async getNotificationPreferenceSummary(businessId?: string, userId?: string): Promise<NotificationPreferenceSummary> {
    const response = await apiClient.get('/notification-preferences/summary', { businessId, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification preference summary');
    }
    return response.data as NotificationPreferenceSummary;
  }

  // Reset notification preferences to defaults
  static async resetNotificationPreferences(businessId?: string, userId?: string): Promise<{ reset: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/notification-preferences/reset', { businessId, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reset notification preferences');
    }
    return response.data as { reset: number; failed: number; errors?: string[]; };
  }

  // Export notification preferences
  static async exportNotificationPreferences(filters: NotificationPreferenceFilter = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/notification-preferences/export', { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export notification preferences');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Get notification preference template
  static async getNotificationPreferenceTemplate(category: string): Promise<{
    category: string;
    name: string;
    description: string;
    defaultPreferences: Array<{
      type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
      enabled: boolean;
      frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
      filters?: Record<string, any>;
    }>;
  }> {
    const response = await apiClient.get('/notification-preferences/template', { category });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification preference template');
    }
    return response.data as {
      category: string;
      name: string;
      description: string;
      defaultPreferences: Array<{
        type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
        enabled: boolean;
        frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
        filters?: Record<string, any>;
      }>;
    };
  }

  // Apply notification preference template
  static async applyNotificationPreferenceTemplate(category: string, businessId?: string, userId?: string): Promise<{ applied: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/notification-preferences/apply-template', { category, businessId, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to apply notification preference template');
    }
    return response.data as { applied: number; failed: number; errors?: string[]; };
  }

  // Get notification delivery statistics
  static async getNotificationDeliveryStats(businessId?: string, userId?: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    failureRate: number;
    statsByType: Record<string, { sent: number; delivered: number; failed: number; rate: number; }>;
    statsByCategory: Record<string, { sent: number; delivered: number; failed: number; rate: number; }>;
  }> {
    const response = await apiClient.get('/notification-preferences/delivery-stats', { businessId, userId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification delivery statistics');
    }
    return response.data as {
      totalSent: number;
      totalDelivered: number;
      totalFailed: number;
      deliveryRate: number;
      failureRate: number;
      statsByType: Record<string, { sent: number; delivered: number; failed: number; rate: number; }>;
      statsByCategory: Record<string, { sent: number; delivered: number; failed: number; rate: number; }>;
    };
  }
}