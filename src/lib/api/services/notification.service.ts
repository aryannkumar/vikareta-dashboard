import { apiClient } from '../client';

export interface Notification {
  id: string;
  businessId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'payment' | 'inventory' | 'support';
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  businessId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  orderNotifications: boolean;
  paymentNotifications: boolean;
  inventoryNotifications: boolean;
  supportNotifications: boolean;
  marketingNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'payment' | 'inventory' | 'support';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface UpdateNotificationSettingsData {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  orderNotifications?: boolean;
  paymentNotifications?: boolean;
  inventoryNotifications?: boolean;
  supportNotifications?: boolean;
  marketingNotifications?: boolean;
}

export class NotificationService {
  // Get all notifications for a business
  static async getNotifications(businessId: string, filters?: {
    status?: string;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/notifications', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notifications');
    }
    return response.data as { notifications: Notification[]; total: number; page: number; totalPages: number; };
  }

  // Get notification by ID
  static async getNotificationById(id: string): Promise<Notification> {
    const response = await apiClient.get(`/notifications/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification');
    }
    return response.data as Notification;
  }

  // Create notification
  static async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    const response = await apiClient.post('/notifications', notificationData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create notification');
    }
    return response.data as Notification;
  }

  // Mark notification as read
  static async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.put(`/notifications/${id}/read`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to mark notification as read');
    }
    return response.data as Notification;
  }

  // Archive notification
  static async archiveNotification(id: string): Promise<Notification> {
    const response = await apiClient.put(`/notifications/${id}/archive`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to archive notification');
    }
    return response.data as Notification;
  }

  // Delete notification
  static async deleteNotification(id: string): Promise<void> {
    const response = await apiClient.delete(`/notifications/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete notification');
    }
  }

  // Get notification settings
  static async getNotificationSettings(businessId: string): Promise<NotificationSettings> {
    const response = await apiClient.get('/notifications/settings', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification settings');
    }
    return response.data as NotificationSettings;
  }

  // Update notification settings
  static async updateNotificationSettings(businessId: string, settings: UpdateNotificationSettingsData): Promise<NotificationSettings> {
    const response = await apiClient.put('/notifications/settings', { businessId, ...settings });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update notification settings');
    }
    return response.data as NotificationSettings;
  }

  // Mark all notifications as read
  static async markAllAsRead(businessId: string): Promise<{ success: boolean; processed: number; }> {
    const response = await apiClient.post('/notifications/mark-all-read', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to mark all notifications as read');
    }
    return response.data as { success: boolean; processed: number; };
  }

  // Bulk actions for notifications
  static async bulkNotificationAction(actionData: { notificationIds: string[]; action: 'read' | 'archive' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/notifications/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export notifications
  static async exportNotifications(filters?: { businessId?: string; status?: string; type?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/notifications/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export notifications');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}