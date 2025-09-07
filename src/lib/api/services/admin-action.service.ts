import { apiClient } from '../client';

export interface AdminAction {
  id: string;
  businessId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface AdminActionFilter {
  businessId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  status?: 'success' | 'failed' | 'pending';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AdminActionSummary {
  totalActions: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  recentActions: AdminAction[];
}

export class AdminActionService {
  // Get admin actions with filtering
  static async getAdminActions(filters: AdminActionFilter = {}): Promise<{ actions: AdminAction[]; total: number; }> {
    const response = await apiClient.get('/admin-actions', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch admin actions');
    }
    return response.data as { actions: AdminAction[]; total: number; };
  }

  // Get admin action by ID
  static async getAdminActionById(id: string): Promise<AdminAction> {
    const response = await apiClient.get(`/admin-actions/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch admin action');
    }
    return response.data as AdminAction;
  }

  // Get admin actions for a specific business
  static async getBusinessAdminActions(businessId: string, filters: Omit<AdminActionFilter, 'businessId'> = {}): Promise<{ actions: AdminAction[]; total: number; }> {
    const response = await apiClient.get(`/admin-actions/business/${businessId}`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch business admin actions');
    }
    return response.data as { actions: AdminAction[]; total: number; };
  }

  // Get admin actions for a specific user
  static async getUserAdminActions(userId: string, filters: Omit<AdminActionFilter, 'userId'> = {}): Promise<{ actions: AdminAction[]; total: number; }> {
    const response = await apiClient.get(`/admin-actions/user/${userId}`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch user admin actions');
    }
    return response.data as { actions: AdminAction[]; total: number; };
  }

  // Log admin action
  static async logAdminAction(actionData: {
    action: string;
    resource: string;
    resourceId?: string;
    details: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<AdminAction> {
    const response = await apiClient.post('/admin-actions/log', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to log admin action');
    }
    return response.data as AdminAction;
  }

  // Get admin action summary
  static async getAdminActionSummary(businessId?: string, startDate?: string, endDate?: string): Promise<AdminActionSummary> {
    const response = await apiClient.get('/admin-actions/summary', { businessId, startDate, endDate });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch admin action summary');
    }
    return response.data as AdminActionSummary;
  }

  // Get admin action statistics
  static async getAdminActionStats(businessId?: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalActions: number;
    successRate: number;
    failureRate: number;
    topActions: Array<{ action: string; count: number; }>;
    topResources: Array<{ resource: string; count: number; }>;
    timeline: Array<{ date: string; count: number; success: number; failed: number; }>;
  }> {
    const response = await apiClient.get('/admin-actions/stats', { businessId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch admin action statistics');
    }
    return response.data as {
      totalActions: number;
      successRate: number;
      failureRate: number;
      topActions: Array<{ action: string; count: number; }>;
      topResources: Array<{ resource: string; count: number; }>;
      timeline: Array<{ date: string; count: number; success: number; failed: number; }>;
    };
  }

  // Export admin actions
  static async exportAdminActions(filters: AdminActionFilter = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/admin-actions/export', { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export admin actions');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Bulk delete admin actions
  static async bulkDeleteAdminActions(actionIds: string[]): Promise<{ deleted: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/admin-actions/bulk-delete', { actionIds });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk delete admin actions');
    }
    return response.data as { deleted: number; failed: number; errors?: string[]; };
  }

  // Get admin action types
  static async getAdminActionTypes(): Promise<Array<{ action: string; description: string; category: string; }>> {
    const response = await apiClient.get('/admin-actions/types');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch admin action types');
    }
    return response.data as Array<{ action: string; description: string; category: string; }>;
  }

  // Get admin action resources
  static async getAdminActionResources(): Promise<Array<{ resource: string; description: string; category: string; }>> {
    const response = await apiClient.get('/admin-actions/resources');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch admin action resources');
    }
    return response.data as Array<{ resource: string; description: string; category: string; }>;
  }

  // Archive old admin actions
  static async archiveAdminActions(olderThanDays: number, businessId?: string): Promise<{ archived: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/admin-actions/archive', { olderThanDays, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to archive admin actions');
    }
    return response.data as { archived: number; failed: number; errors?: string[]; };
  }

  // Get admin action audit trail
  static async getAuditTrail(resource: string, resourceId: string): Promise<AdminAction[]> {
    const response = await apiClient.get('/admin-actions/audit-trail', { resource, resourceId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch audit trail');
    }
    return response.data as AdminAction[];
  }
}