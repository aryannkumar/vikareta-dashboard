import { apiClient } from '../client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'business_owner' | 'business_user' | 'customer';
  businessId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  businessName?: string;
  role?: 'admin' | 'business_owner' | 'business_user' | 'customer';
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerificationData {
  token: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerify {
  token: string;
  rememberDevice?: boolean;
}

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens; requiresTwoFactor?: boolean; }> {
    const response = await apiClient.post('/auth/login', credentials);
    if (!response.success) {
      throw new Error(response.error?.message || 'Login failed');
    }
    return response.data as { user: User; tokens: AuthTokens; requiresTwoFactor?: boolean; };
  }

  // Register new user
  static async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens; requiresEmailVerification?: boolean; }> {
    const response = await apiClient.post('/auth/register', userData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Registration failed');
    }
    return response.data as { user: User; tokens: AuthTokens; requiresEmailVerification?: boolean; };
  }

  // Logout user
  static async logout(refreshToken?: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    if (!response.success) {
      throw new Error(response.error?.message || 'Logout failed');
    }
    return response.data as { success: boolean; };
  }

  // Logout from all devices
  static async logoutAll(): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/logout-all', {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Logout from all devices failed');
    }
    return response.data as { success: boolean; };
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    if (!response.success) {
      throw new Error(response.error?.message || 'Token refresh failed');
    }
    return response.data as AuthTokens;
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch current user');
    }
    return response.data as User;
  }

  // Update user profile
  static async updateProfile(userData: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatar' | 'metadata'>>): Promise<User> {
    const response = await apiClient.put('/auth/profile', userData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update profile');
    }
    return response.data as User;
  }

  // Change password
  static async changePassword(passwordData: ChangePasswordData): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/change-password', passwordData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to change password');
    }
    return response.data as { success: boolean; };
  }

  // Request password reset
  static async requestPasswordReset(resetData: PasswordResetData): Promise<{ success: boolean; message?: string; }> {
    const response = await apiClient.post('/auth/forgot-password', resetData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to request password reset');
    }
    return response.data as { success: boolean; message?: string; };
  }

  // Reset password with token
  static async resetPassword(resetData: PasswordResetConfirmData): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/reset-password', resetData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reset password');
    }
    return response.data as { success: boolean; };
  }

  // Verify email
  static async verifyEmail(verificationData: EmailVerificationData): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/verify-email', verificationData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify email');
    }
    return response.data as { success: boolean; };
  }

  // Resend email verification
  static async resendEmailVerification(): Promise<{ success: boolean; message?: string; }> {
    const response = await apiClient.post('/auth/resend-verification', {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to resend email verification');
    }
    return response.data as { success: boolean; message?: string; };
  }

  // Setup two-factor authentication
  static async setupTwoFactor(): Promise<TwoFactorSetup> {
    const response = await apiClient.post('/auth/2fa/setup', {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to setup two-factor authentication');
    }
    return response.data as TwoFactorSetup;
  }

  // Verify two-factor authentication
  static async verifyTwoFactor(verificationData: TwoFactorVerify): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/2fa/verify', verificationData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify two-factor authentication');
    }
    return response.data as { success: boolean; };
  }

  // Disable two-factor authentication
  static async disableTwoFactor(password: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/2fa/disable', { password });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to disable two-factor authentication');
    }
    return response.data as { success: boolean; };
  }

  // Get backup codes
  static async getBackupCodes(): Promise<{ backupCodes: string[]; }> {
    const response = await apiClient.get('/auth/2fa/backup-codes');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch backup codes');
    }
    return response.data as { backupCodes: string[]; };
  }

  // Regenerate backup codes
  static async regenerateBackupCodes(): Promise<{ backupCodes: string[]; }> {
    const response = await apiClient.post('/auth/2fa/regenerate-codes', {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to regenerate backup codes');
    }
    return response.data as { backupCodes: string[]; };
  }

  // Get active sessions
  static async getActiveSessions(): Promise<Array<{
    id: string;
    device: string;
    browser: string;
    ipAddress: string;
    location?: string;
    lastActivity: string;
    current: boolean;
  }>> {
    const response = await apiClient.get('/auth/sessions');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch active sessions');
    }
    return response.data as Array<{
      id: string;
      device: string;
      browser: string;
      ipAddress: string;
      location?: string;
      lastActivity: string;
      current: boolean;
    }>;
  }

  // Revoke session
  static async revokeSession(sessionId: string): Promise<{ success: boolean; }> {
    const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to revoke session');
    }
    return response.data as { success: boolean; };
  }

  // Get login history
  static async getLoginHistory(limit: number = 50): Promise<Array<{
    id: string;
    timestamp: string;
    ipAddress: string;
    location?: string;
    device: string;
    browser: string;
    success: boolean;
    failureReason?: string;
  }>> {
    const response = await apiClient.get('/auth/login-history', { limit });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch login history');
    }
    return response.data as Array<{
      id: string;
      timestamp: string;
      ipAddress: string;
      location?: string;
      device: string;
      browser: string;
      success: boolean;
      failureReason?: string;
    }>;
  }

  // Check authentication status
  static async checkAuth(): Promise<{ authenticated: boolean; user?: User; }> {
    const response = await apiClient.get('/auth/check');
    if (!response.success) {
      return { authenticated: false };
    }
    return response.data as { authenticated: boolean; user?: User; };
  }

  // Social login (OAuth)
  static async socialLogin(provider: 'google' | 'linkedin' | 'facebook', code: string, state?: string): Promise<{ user: User; tokens: AuthTokens; }> {
    const response = await apiClient.post('/auth/social-login', { provider, code, state });
    if (!response.success) {
      throw new Error(response.error?.message || 'Social login failed');
    }
    return response.data as { user: User; tokens: AuthTokens; };
  }

  // Get social login URL
  static async getSocialLoginUrl(provider: 'google' | 'linkedin' | 'facebook', redirectUrl?: string): Promise<{ url: string; state: string; }> {
    const response = await apiClient.get('/auth/social-url', { provider, redirectUrl });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get social login URL');
    }
    return response.data as { url: string; state: string; };
  }

  // Link social account
  static async linkSocialAccount(provider: 'google' | 'linkedin' | 'facebook', code: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/link-social', { provider, code });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to link social account');
    }
    return response.data as { success: boolean; };
  }

  // Unlink social account
  static async unlinkSocialAccount(provider: 'google' | 'linkedin' | 'facebook'): Promise<{ success: boolean; }> {
    const response = await apiClient.post('/auth/unlink-social', { provider });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to unlink social account');
    }
    return response.data as { success: boolean; };
  }

  // Get connected social accounts
  static async getConnectedSocialAccounts(): Promise<Array<{
    provider: string;
    connected: boolean;
    email?: string;
    name?: string;
    connectedAt?: string;
  }>> {
    const response = await apiClient.get('/auth/social-accounts');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch connected social accounts');
    }
    return response.data as Array<{
      provider: string;
      connected: boolean;
      email?: string;
      name?: string;
      connectedAt?: string;
    }>;
  }

  // Validate password strength
  static async validatePasswordStrength(password: string): Promise<{
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
    isValid: boolean;
  }> {
    const response = await apiClient.post('/auth/validate-password', { password });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate password strength');
    }
    return response.data as {
      score: number;
      strength: 'weak' | 'fair' | 'good' | 'strong';
      feedback: string[];
      isValid: boolean;
    };
  }

  // Get user permissions
  static async getUserPermissions(): Promise<{ permissions: string[]; roles: string[]; }> {
    const response = await apiClient.get('/auth/permissions');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch user permissions');
    }
    return response.data as { permissions: string[]; roles: string[]; };
  }

  // Check permission
  static async checkPermission(permission: string, resource?: string): Promise<{ hasPermission: boolean; }> {
    const response = await apiClient.get('/auth/check-permission', { permission, resource });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to check permission');
    }
    return response.data as { hasPermission: boolean; };
  }
}