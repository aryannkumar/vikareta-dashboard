import { apiClient } from '../client';

export interface SecurityEvent {
  id: string;
  businessId: string;
  userId?: string;
  eventType: 'login' | 'logout' | 'password_change' | 'failed_login' | 'suspicious_activity' | 'api_access' | 'data_export' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: { lat: number; lng: number; };
  };
  metadata: Record<string, any>;
  timestamp: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SecurityAlert {
  id: string;
  businessId: string;
  alertType: 'brute_force' | 'unusual_login' | 'suspicious_ip' | 'data_breach' | 'api_abuse' | 'account_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'dismissed';
  affectedUsers: string[];
  triggeredAt: string;
  resolvedAt?: string;
  actions: Array<{
    action: string;
    timestamp: string;
    performedBy: string;
    result?: string;
  }>;
}

export interface SecuritySettings {
  id: string;
  businessId: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventReuse: number;
    expiryDays: number;
  };
  loginPolicy: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    requireMfa: boolean;
    allowRememberMe: boolean;
    sessionTimeout: number;
  };
  apiPolicy: {
    rateLimitRequests: number;
    rateLimitWindow: number;
    requireApiKey: boolean;
    allowedOrigins: string[];
  };
  dataPolicy: {
    encryptionEnabled: boolean;
    auditLogging: boolean;
    dataRetentionDays: number;
  };
  updatedAt: string;
}

export interface SecurityReport {
  period: string;
  totalEvents: number;
  criticalEvents: number;
  activeAlerts: number;
  failedLogins: number;
  suspiciousActivities: number;
  topThreats: Array<{ type: string; count: number; }>;
  eventsBySeverity: Record<string, number>;
  eventsByType: Record<string, number>;
  geographicDistribution: Array<{ country: string; count: number; }>;
}

export class SecurityService {
  // Get security events
  static async getSecurityEvents(businessId?: string, filters: {
    eventType?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    startDate?: string;
    endDate?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ events: SecurityEvent[]; total: number; }> {
    const response = await apiClient.get('/security/events', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security events');
    }
    return response.data as { events: SecurityEvent[]; total: number; };
  }

  // Get security event by ID
  static async getSecurityEventById(id: string): Promise<SecurityEvent> {
    const response = await apiClient.get(`/security/events/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security event');
    }
    return response.data as SecurityEvent;
  }

  // Log security event
  static async logSecurityEvent(eventData: {
    eventType: 'login' | 'logout' | 'password_change' | 'failed_login' | 'suspicious_activity' | 'api_access' | 'data_export' | 'admin_action';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    metadata?: Record<string, any>;
  }): Promise<SecurityEvent> {
    const response = await apiClient.post('/security/events', eventData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to log security event');
    }
    return response.data as SecurityEvent;
  }

  // Get security alerts
  static async getSecurityAlerts(businessId?: string, filters: {
    alertType?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'active' | 'resolved' | 'dismissed';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ alerts: SecurityAlert[]; total: number; }> {
    const response = await apiClient.get('/security/alerts', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security alerts');
    }
    return response.data as { alerts: SecurityAlert[]; total: number; };
  }

  // Get security alert by ID
  static async getSecurityAlertById(id: string): Promise<SecurityAlert> {
    const response = await apiClient.get(`/security/alerts/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security alert');
    }
    return response.data as SecurityAlert;
  }

  // Resolve security alert
  static async resolveSecurityAlert(id: string, resolution: { action: string; notes?: string; }): Promise<SecurityAlert> {
    const response = await apiClient.post(`/security/alerts/${id}/resolve`, resolution);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to resolve security alert');
    }
    return response.data as SecurityAlert;
  }

  // Dismiss security alert
  static async dismissSecurityAlert(id: string, reason?: string): Promise<SecurityAlert> {
    const response = await apiClient.post(`/security/alerts/${id}/dismiss`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to dismiss security alert');
    }
    return response.data as SecurityAlert;
  }

  // Get security settings
  static async getSecuritySettings(businessId: string): Promise<SecuritySettings> {
    const response = await apiClient.get(`/security/settings/${businessId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security settings');
    }
    return response.data as SecuritySettings;
  }

  // Update security settings
  static async updateSecuritySettings(businessId: string, settings: Partial<Omit<SecuritySettings, 'id' | 'businessId' | 'updatedAt'>>): Promise<SecuritySettings> {
    const response = await apiClient.put(`/security/settings/${businessId}`, settings);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update security settings');
    }
    return response.data as SecuritySettings;
  }

  // Get security report
  static async getSecurityReport(businessId?: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SecurityReport> {
    const response = await apiClient.get('/security/report', { businessId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security report');
    }
    return response.data as SecurityReport;
  }

  // Check password strength
  static async checkPasswordStrength(password: string): Promise<{
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
    isValid: boolean;
  }> {
    const response = await apiClient.post('/security/check-password', { password });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to check password strength');
    }
    return response.data as {
      score: number;
      strength: 'weak' | 'fair' | 'good' | 'strong';
      feedback: string[];
      isValid: boolean;
    };
  }

  // Generate security audit
  static async generateSecurityAudit(businessId?: string, auditType: 'full' | 'quick' | 'compliance' = 'full'): Promise<{ auditId: string; status: 'pending' | 'running' | 'completed'; reportUrl?: string; }> {
    const response = await apiClient.post('/security/audit', { businessId, auditType });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to generate security audit');
    }
    return response.data as { auditId: string; status: 'pending' | 'running' | 'completed'; reportUrl?: string; };
  }

  // Get security audit status
  static async getSecurityAuditStatus(auditId: string): Promise<{ status: 'pending' | 'running' | 'completed' | 'failed'; progress?: number; reportUrl?: string; error?: string; }> {
    const response = await apiClient.get(`/security/audit/${auditId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get security audit status');
    }
    return response.data as { status: 'pending' | 'running' | 'completed' | 'failed'; progress?: number; reportUrl?: string; error?: string; };
  }

  // Block IP address
  static async blockIPAddress(ipAddress: string, reason: string, duration?: number): Promise<{ success: boolean; blockedUntil?: string; }> {
    const response = await apiClient.post('/security/block-ip', { ipAddress, reason, duration });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to block IP address');
    }
    return response.data as { success: boolean; blockedUntil?: string; };
  }

  // Unblock IP address
  static async unblockIPAddress(ipAddress: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/security/unblock-ip', { ipAddress });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to unblock IP address');
    }
    return response.data as { success: boolean; };
  }

  // Get blocked IPs
  static async getBlockedIPs(businessId?: string): Promise<Array<{ ipAddress: string; blockedAt: string; blockedUntil?: string; reason: string; blockedBy: string; }>> {
    const response = await apiClient.get('/security/blocked-ips', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch blocked IPs');
    }
    return response.data as Array<{ ipAddress: string; blockedAt: string; blockedUntil?: string; reason: string; blockedBy: string; }>;
  }

  // Force password reset
  static async forcePasswordReset(userId: string, reason?: string): Promise<{ success: boolean; resetToken?: string; }> {
    const response = await apiClient.post('/security/force-password-reset', { userId, reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to force password reset');
    }
    return response.data as { success: boolean; resetToken?: string; };
  }

  // Enable/disable two-factor authentication
  static async toggleTwoFactorAuth(userId: string, enabled: boolean): Promise<{ success: boolean; qrCodeUrl?: string; secret?: string; }> {
    const response = await apiClient.post('/security/toggle-2fa', { userId, enabled });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to toggle two-factor authentication');
    }
    return response.data as { success: boolean; qrCodeUrl?: string; secret?: string; };
  }

  // Verify two-factor authentication
  static async verifyTwoFactorAuth(userId: string, token: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/security/verify-2fa', { userId, token });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify two-factor authentication');
    }
    return response.data as { success: boolean; };
  }

  // Get security recommendations
  static async getSecurityRecommendations(businessId?: string): Promise<Array<{
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    actionable: boolean;
    implemented: boolean;
  }>> {
    const response = await apiClient.get('/security/recommendations', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security recommendations');
    }
    return response.data as Array<{
      id: string;
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      actionable: boolean;
      implemented: boolean;
    }>;
  }

  // Export security events
  static async exportSecurityEvents(filters: any = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/security/export-events', { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export security events');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Get security dashboard data
  static async getSecurityDashboard(businessId?: string): Promise<{
    eventsToday: number;
    activeAlerts: number;
    blockedIPs: number;
    failedLogins: number;
    recentEvents: SecurityEvent[];
    topAlerts: SecurityAlert[];
    securityScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const response = await apiClient.get('/security/dashboard', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security dashboard data');
    }
    return response.data as {
      eventsToday: number;
      activeAlerts: number;
      blockedIPs: number;
      failedLogins: number;
      recentEvents: SecurityEvent[];
      topAlerts: SecurityAlert[];
      securityScore: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
  }
}