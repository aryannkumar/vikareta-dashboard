import { apiClient } from '../client';

export interface Announcement {
  id: string;
  businessId: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'promotion' | 'maintenance' | 'update';
  status: 'draft' | 'published' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'customers' | 'partners' | 'internal';
  publishDate: string;
  expiryDate?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'promotion' | 'maintenance' | 'update';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'customers' | 'partners' | 'internal';
  publishDate: string;
  expiryDate?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  type?: 'info' | 'warning' | 'success' | 'promotion' | 'maintenance' | 'update';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience?: 'all' | 'customers' | 'partners' | 'internal';
  publishDate?: string;
  expiryDate?: string;
  status?: 'draft' | 'published' | 'archived';
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export class AnnouncementService {
  // Get all announcements for a business
  static async getAnnouncements(businessId: string, filters?: {
    status?: string;
    type?: string;
    targetAudience?: string;
    page?: number;
    limit?: number;
  }): Promise<{ announcements: Announcement[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/announcements', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch announcements');
    }
    return response.data as { announcements: Announcement[]; total: number; page: number; totalPages: number; };
  }

  // Get announcement by ID
  static async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await apiClient.get(`/announcements/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch announcement');
    }
    return response.data as Announcement;
  }

  // Create announcement
  static async createAnnouncement(announcementData: CreateAnnouncementData): Promise<Announcement> {
    const response = await apiClient.post('/announcements', announcementData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create announcement');
    }
    return response.data as Announcement;
  }

  // Update announcement
  static async updateAnnouncement(id: string, announcementData: UpdateAnnouncementData): Promise<Announcement> {
    const response = await apiClient.put(`/announcements/${id}`, announcementData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update announcement');
    }
    return response.data as Announcement;
  }

  // Delete announcement
  static async deleteAnnouncement(id: string): Promise<void> {
    const response = await apiClient.delete(`/announcements/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete announcement');
    }
  }

  // Publish announcement
  static async publishAnnouncement(id: string): Promise<Announcement> {
    const response = await apiClient.post(`/announcements/${id}/publish`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to publish announcement');
    }
    return response.data as Announcement;
  }

  // Archive announcement
  static async archiveAnnouncement(id: string): Promise<Announcement> {
    const response = await apiClient.post(`/announcements/${id}/archive`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to archive announcement');
    }
    return response.data as Announcement;
  }

  // Get announcement analytics
  static async getAnnouncementAnalytics(id: string): Promise<{ views: number; clicks: number; engagement: number; }> {
    const response = await apiClient.get(`/announcements/${id}/analytics`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch announcement analytics');
    }
    return response.data as { views: number; clicks: number; engagement: number; };
  }

  // Bulk actions for announcements
  static async bulkAnnouncementAction(actionData: { announcementIds: string[]; action: 'publish' | 'archive' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/announcements/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export announcements
  static async exportAnnouncements(filters?: { businessId?: string; status?: string; type?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/announcements/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export announcements');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}