import { apiClient } from '../client';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  gstin?: string;
  userType: string;
  role?: string;
  verificationTier: string;
  isVerified: boolean;
  isActive: boolean;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  gstin?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  verificationTier: string;
  isVerified: boolean;
}

export interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  gstin?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserDocument {
  id: string;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  verificationStatus: string;
  verifiedAt?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  location: {
    ip: string;
    city?: string;
    country?: string;
  };
  isCurrent: boolean;
  lastActivity: string;
  createdAt: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  activeRFQs: number;
  wishlistCount: number;
}

export class UserService {
  // Get current user profile
  static async getProfile(): Promise<UserProfile> {
    const response = await apiClient.getUserProfile();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch profile');
    }
    return response.data as UserProfile;
  }

  // Update user profile
  static async updateProfile(data: UpdateUserProfile): Promise<UserProfile> {
    const response = await apiClient.updateUserProfile(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update profile');
    }
    return response.data as UserProfile;
  }

  // Upload avatar
  static async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const response = await apiClient.uploadUserAvatar(file);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upload avatar');
    }
    return response.data as { avatar: string };
  }

  // Get user documents
  static async getDocuments(): Promise<UserDocument[]> {
    const response = await apiClient.getUserDocuments();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch documents');
    }
    return response.data as UserDocument[];
  }

  // Upload document
  static async uploadDocument(documentType: string, documentNumber: string, file: File): Promise<UserDocument> {
    const response = await apiClient.uploadUserDocument(documentType, documentNumber, file);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upload document');
    }
    return response.data as UserDocument;
  }

  // Get shipping addresses
  static async getShippingAddresses(): Promise<ShippingAddress[]> {
    const response = await apiClient.getUserShippingAddresses();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shipping addresses');
    }
    return response.data as ShippingAddress[];
  }

  // Add shipping address
  static async addShippingAddress(address: Omit<ShippingAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShippingAddress> {
    const response = await apiClient.addUserShippingAddress(address);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add shipping address');
    }
    return response.data as ShippingAddress;
  }

  // Update shipping address
  static async updateShippingAddress(id: string, address: Partial<ShippingAddress>): Promise<ShippingAddress> {
    const response = await apiClient.updateUserShippingAddress(id, address);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update shipping address');
    }
    return response.data as ShippingAddress;
  }

  // Delete shipping address
  static async deleteShippingAddress(id: string): Promise<void> {
    const response = await apiClient.deleteUserShippingAddress(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete shipping address');
    }
  }

  // Set default shipping address
  static async setDefaultShippingAddress(id: string): Promise<void> {
    const response = await apiClient.setDefaultUserShippingAddress(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to set default shipping address');
    }
  }

  // Get user statistics
  static async getStats(): Promise<UserStats> {
    const response = await apiClient.getUserStats();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch user stats');
    }
    return response.data as UserStats;
  }

  // Change password
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const response = await apiClient.changePassword(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to change password');
    }
  }

    // Send email verification
  static async sendEmailVerification(): Promise<void> {
    const response = await apiClient.sendEmailVerification();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send verification email');
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.verifyEmail(token);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify email');
    }
  }

  // Get user sessions
  static async getSessions(): Promise<UserSession[]> {
    const response = await apiClient.getUserSessions();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch sessions');
    }
    return response.data as UserSession[];
  }

  // Revoke session
  static async revokeSession(sessionId: string): Promise<void> {
    const response = await apiClient.revokeUserSession(sessionId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to revoke session');
    }
  }

  // Revoke all sessions
  static async revokeAllSessions(): Promise<void> {
    const response = await apiClient.revokeAllUserSessions();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to revoke all sessions');
    }
  }

  // Get business settings
  static async getBusinessSettings(): Promise<any> {
    const response = await apiClient.getSettingsBusiness();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch business settings');
    }
    return response.data;
  }

  // Update business settings
  static async updateBusinessSettings(data: any): Promise<any> {
    const response = await apiClient.updateSettingsBusiness(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update business settings');
    }
    return response.data;
  }

  // Get security settings
  static async getSecuritySettings(): Promise<any> {
    const response = await apiClient.getSettingsSecurity();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch security settings');
    }
    return response.data;
  }

  // Update security settings
  static async updateSecuritySettings(data: any): Promise<any> {
    const response = await apiClient.updateSettingsSecurity(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update security settings');
    }
    return response.data;
  }

  // Get notification settings
  static async getNotificationSettings(): Promise<any> {
    const response = await apiClient.getSettingsNotifications();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch notification settings');
    }
    return response.data;
  }

  // Update notification settings
  static async updateNotificationSettings(data: any): Promise<any> {
    const response = await apiClient.updateSettingsNotifications(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update notification settings');
    }
    return response.data;
  }
}