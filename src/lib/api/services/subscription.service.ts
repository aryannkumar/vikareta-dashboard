import { apiClient } from '../client';

export interface Subscription {
  id: string;
  businessId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  features: string[];
  usage: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: Record<string, number>;
  popular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionData {
  planId: string;
  paymentMethod?: string;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
}

export interface UpdateSubscriptionData {
  status?: 'active' | 'inactive' | 'cancelled' | 'expired';
  autoRenew?: boolean;
  paymentMethod?: string;
}

export class SubscriptionService {
  // Get all subscriptions for a business
  static async getSubscriptions(businessId: string, filters?: {
    status?: string;
    planId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ subscriptions: Subscription[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/subscriptions', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch subscriptions');
    }
    return response.data as { subscriptions: Subscription[]; total: number; page: number; totalPages: number; };
  }

  // Get subscription by ID
  static async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await apiClient.get(`/subscriptions/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch subscription');
    }
    return response.data as Subscription;
  }

  // Create subscription
  static async createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
    const response = await apiClient.post('/subscriptions', subscriptionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create subscription');
    }
    return response.data as Subscription;
  }

  // Update subscription
  static async updateSubscription(id: string, subscriptionData: UpdateSubscriptionData): Promise<Subscription> {
    const response = await apiClient.put(`/subscriptions/${id}`, subscriptionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update subscription');
    }
    return response.data as Subscription;
  }

  // Cancel subscription
  static async cancelSubscription(id: string): Promise<void> {
    const response = await apiClient.put(`/subscriptions/${id}/cancel`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel subscription');
    }
  }

  // Get subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get('/subscriptions/plans');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch subscription plans');
    }
    return response.data as SubscriptionPlan[];
  }

  // Get subscription usage
  static async getSubscriptionUsage(id: string): Promise<Record<string, number>> {
    const response = await apiClient.get(`/subscriptions/${id}/usage`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch subscription usage');
    }
    return response.data as Record<string, number>;
  }

  // Bulk actions for subscriptions
  static async bulkSubscriptionAction(actionData: { subscriptionIds: string[]; action: 'activate' | 'cancel' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/subscriptions/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export subscriptions
  static async exportSubscriptions(filters?: { businessId?: string; status?: string; planId?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/subscriptions/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export subscriptions');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}