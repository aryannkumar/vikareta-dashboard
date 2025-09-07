import { apiClient } from '../client';

export interface SecuritySettings {
  id: string;
  businessId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'app' | 'sms' | 'email';
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number;
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    requireReauthForSensitive: boolean;
  };
  ipWhitelist: string[];
  ipBlacklist: string[];
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  apiRateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    burstLimit: number;
  };
  encryptionEnabled: boolean;
  auditLogEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSecuritySettingsData {
  twoFactorEnabled?: boolean;
  twoFactorMethod?: 'app' | 'sms' | 'email';
  passwordPolicy?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    preventReuse?: number;
  };
  sessionPolicy?: {
    maxConcurrentSessions?: number;
    sessionTimeout?: number;
    requireReauthForSensitive?: boolean;
  };
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  loginNotifications?: boolean;
  suspiciousActivityAlerts?: boolean;
  apiRateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    burstLimit?: number;
  };
  encryptionEnabled?: boolean;
  auditLogEnabled?: boolean;
}

export class SecuritySettingsService {
  // Get security settings for a business
  static async getSecuritySettings(businessId: string): Promise<SecuritySettings> {
    const response = await apiClient.get('/security-settings', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security settings');
    }
    return response.data as SecuritySettings;
  }

  // Update security settings
  static async updateSecuritySettings(businessId: string, settings: UpdateSecuritySettingsData): Promise<SecuritySettings> {
    const response = await apiClient.put('/security-settings', { businessId, ...settings });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update security settings');
    }
    return response.data as SecuritySettings;
  }

  // Enable 2FA
  static async enableTwoFactor(businessId: string, method: 'app' | 'sms' | 'email'): Promise<{ secret?: string; qrCode?: string; backupCodes?: string[]; }> {
    const response = await apiClient.post('/security-settings/enable-2fa', { businessId, method });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to enable 2FA');
    }
    return response.data as { secret?: string; qrCode?: string; backupCodes?: string[]; };
  }

  // Disable 2FA
  static async disableTwoFactor(businessId: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/security-settings/disable-2fa', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to disable 2FA');
    }
    return response.data as { success: boolean; };
  }

  // Verify 2FA setup
  static async verifyTwoFactorSetup(businessId: string, code: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/security-settings/verify-2fa', { businessId, code });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify 2FA setup');
    }
    return response.data as { success: boolean; };
  }

  // Generate backup codes
  static async generateBackupCodes(businessId: string): Promise<{ backupCodes: string[]; }> {
    const response = await apiClient.post('/security-settings/generate-backup-codes', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to generate backup codes');
    }
    return response.data as { backupCodes: string[]; };
  }

  // Test IP whitelist/blacklist
  static async testIPAccess(businessId: string, ipAddress: string): Promise<{ allowed: boolean; reason?: string; }> {
    const response = await apiClient.post('/security-settings/test-ip', { businessId, ipAddress });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to test IP access');
    }
    return response.data as { allowed: boolean; reason?: string; };
  }

  // Get security audit log
  static async getSecurityAuditLog(businessId: string, filters?: {
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: Array<{ id: string; action: string; details: any; ipAddress: string; userAgent: string; timestamp: string; }>; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/security-settings/audit-log', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security audit log');
    }
    return response.data as { logs: Array<{ id: string; action: string; details: any; ipAddress: string; userAgent: string; timestamp: string; }>; total: number; page: number; totalPages: number; };
  }

  // Get active sessions
  static async getActiveSessions(businessId: string): Promise<Array<{ id: string; device: string; ipAddress: string; location: string; lastActivity: string; createdAt: string; }>> {
    const response = await apiClient.get('/security-settings/active-sessions', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch active sessions');
    }
    return response.data as Array<{ id: string; device: string; ipAddress: string; location: string; lastActivity: string; createdAt: string; }>;
  }

  // Terminate session
  static async terminateSession(businessId: string, sessionId: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/security-settings/terminate-session', { businessId, sessionId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to terminate session');
    }
    return response.data as { success: boolean; };
  }

  // Bulk terminate sessions
  static async bulkTerminateSessions(businessId: string, sessionIds: string[]): Promise<{ success: boolean; processed: number; failed: number; }> {
    const response = await apiClient.post('/security-settings/bulk-terminate-sessions', { businessId, sessionIds });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk terminate sessions');
    }
    return response.data as { success: boolean; processed: number; failed: number; };
  }

  // Export security audit log
  static async exportSecurityAuditLog(businessId: string, filters?: { action?: string; dateFrom?: string; dateTo?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/security-settings/export-audit-log', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export security audit log');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}