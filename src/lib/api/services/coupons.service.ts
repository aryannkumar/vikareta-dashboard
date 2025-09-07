import { apiClient } from '../client';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  applicableServices?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
  };
  lastUsedAt?: string;
}

export interface CreateCouponData {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  applicableServices?: string[];
}

export interface UpdateCouponData {
  name?: string;
  description?: string;
  type?: 'percentage' | 'fixed' | 'free_shipping';
  value?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  applicableServices?: string[];
}

export interface CouponFilters {
  search?: string;
  type?: 'percentage' | 'fixed' | 'free_shipping';
  isActive?: boolean;
  status?: 'active' | 'expired' | 'exhausted' | 'scheduled';
  sortBy?: 'createdAt' | 'expiresAt' | 'usedCount' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  exhaustedCoupons: number;
  totalDiscountGiven: number;
  averageDiscount: number;
  totalUsage: number;
  topPerformingCoupons: Array<{
    id: string;
    code: string;
    name: string;
    usageCount: number;
    totalDiscount: number;
  }>;
  usageTrends: Array<{
    date: string;
    usageCount: number;
    discountAmount: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    usageCount: number;
    discountAmount: number;
  }>;
}

export interface BulkCouponAction {
  couponIds: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'extend_expiry';
  extendDays?: number;
}

export class CouponService {
  // Get all coupons with optional filters
  static async getCoupons(filters?: CouponFilters): Promise<{
    coupons: Coupon[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/coupons', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch coupons');
    }
    return response.data as {
      coupons: Coupon[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Get a specific coupon by ID
  static async getCouponById(id: string): Promise<Coupon> {
    const response = await apiClient.get(`/coupons/id/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch coupon');
    }
    return response.data as Coupon;
  }

  // Get a specific coupon by code
  static async getCouponByCode(code: string): Promise<Coupon> {
    const response = await apiClient.get(`/coupons/code/${code}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch coupon');
    }
    return response.data as Coupon;
  }

  // Create a new coupon
  static async createCoupon(couponData: CreateCouponData): Promise<Coupon> {
    const response = await apiClient.post('/coupons', couponData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create coupon');
    }
    return response.data as Coupon;
  }

  // Update an existing coupon
  static async updateCoupon(id: string, couponData: UpdateCouponData): Promise<Coupon> {
    const response = await apiClient.put(`/coupons/${id}`, couponData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update coupon');
    }
    return response.data as Coupon;
  }

  // Delete a coupon (soft delete)
  static async deleteCoupon(id: string): Promise<void> {
    const response = await apiClient.delete(`/coupons/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete coupon');
    }
  }

  // Validate a coupon code
  static async validateCoupon(code: string, orderValue?: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount?: number;
    message?: string;
  }> {
    const response = await apiClient.get('/coupons/validate', { code, orderValue });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate coupon');
    }
    return response.data as {
      valid: boolean;
      coupon?: Coupon;
      discount?: number;
      message?: string;
    };
  }

  // Apply a coupon to cart/order
  static async applyCoupon(code: string, cartId?: string, orderId?: string): Promise<{
    success: boolean;
    discount: number;
    finalTotal: number;
    message?: string;
  }> {
    const response = await apiClient.post('/coupons/apply', { code, cartId, orderId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to apply coupon');
    }
    return response.data as {
      success: boolean;
      discount: number;
      finalTotal: number;
      message?: string;
    };
  }

  // Remove a coupon from cart/order
  static async removeCoupon(cartId?: string, orderId?: string): Promise<{
    success: boolean;
    originalTotal: number;
    message?: string;
  }> {
    const response = await apiClient.post('/coupons/remove', { cartId, orderId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove coupon');
    }
    return response.data as {
      success: boolean;
      originalTotal: number;
      message?: string;
    };
  }

  // Get coupon usage statistics
  static async getCouponStats(id: string): Promise<{
    totalUsed: number;
    totalDiscount: number;
    averageDiscount: number;
    usageByDate: Array<{
      date: string;
      count: number;
      discount: number;
    }>;
  }> {
    const response = await apiClient.get(`/coupons/${id}/stats`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch coupon stats');
    }
    return response.data as {
      totalUsed: number;
      totalDiscount: number;
      averageDiscount: number;
      usageByDate: Array<{
        date: string;
        count: number;
        discount: number;
      }>;
    };
  }

  // Get dashboard coupon analytics
  static async getDashboardCouponAnalytics(filters?: {
    dateRange?: { start: string; end: string };
    businessId?: string;
  }): Promise<CouponStats> {
    const response = await apiClient.get('/coupons/dashboard/analytics', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch coupon analytics');
    }
    return response.data as CouponStats;
  }

  // Bulk create coupons
  static async bulkCreateCoupons(couponsData: CreateCouponData[]): Promise<{
    success: boolean;
    created: Coupon[];
    failed: Array<{
      data: CreateCouponData;
      error: string;
    }>;
  }> {
    const response = await apiClient.post('/coupons/bulk', { coupons: couponsData });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk create coupons');
    }
    return response.data as {
      success: boolean;
      created: Coupon[];
      failed: Array<{
        data: CreateCouponData;
        error: string;
      }>;
    };
  }

  // Bulk update coupons
  static async bulkUpdateCoupons(updates: Array<{ id: string; data: UpdateCouponData }>): Promise<{
    success: boolean;
    updated: Coupon[];
    failed: Array<{
      id: string;
      error: string;
    }>;
  }> {
    const response = await apiClient.put('/coupons/bulk', { updates });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk update coupons');
    }
    return response.data as {
      success: boolean;
      updated: Coupon[];
      failed: Array<{
        id: string;
        error: string;
      }>;
    };
  }

  // Bulk delete coupons
  static async bulkDeleteCoupons(ids: string[]): Promise<{
    success: boolean;
    deleted: string[];
    failed: Array<{
      id: string;
      error: string;
    }>;
  }> {
    const response = await apiClient.post('/coupons/bulk-delete', { ids });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk delete coupons');
    }
    return response.data as {
      success: boolean;
      deleted: string[];
      failed: Array<{
        id: string;
        error: string;
      }>;
    };
  }

  // Bulk actions for coupons
  static async bulkCouponAction(actionData: BulkCouponAction): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors?: string[];
  }> {
    const response = await apiClient.post('/coupons/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as {
      success: boolean;
      processed: number;
      failed: number;
      errors?: string[];
    };
  }

  // Generate unique coupon codes
  static async generateCouponCodes(count: number, prefix?: string, length?: number): Promise<{
    codes: string[];
  }> {
    const response = await apiClient.post('/coupons/generate-codes', { count, prefix, length });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to generate coupon codes');
    }
    return response.data as {
      codes: string[];
    };
  }

  // Duplicate a coupon
  static async duplicateCoupon(id: string, modifications?: Partial<CreateCouponData>): Promise<Coupon> {
    const response = await apiClient.post(`/coupons/${id}/duplicate`, modifications);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to duplicate coupon');
    }
    return response.data as Coupon;
  }

  // Get coupon usage history
  static async getCouponUsageHistory(couponId: string, filters?: {
    page?: number;
    limit?: number;
    dateRange?: { start: string; end: string };
  }): Promise<{
    usage: Array<{
      id: string;
      orderId: string;
      userId: string;
      discountAmount: number;
      usedAt: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
      order: {
        id: string;
        total: number;
        status: string;
      };
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(`/coupons/${couponId}/usage-history`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch coupon usage history');
    }
    return response.data as {
      usage: Array<{
        id: string;
        orderId: string;
        userId: string;
        discountAmount: number;
        usedAt: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
        order: {
          id: string;
          total: number;
          status: string;
        };
      }>;
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Export coupons
  static async exportCoupons(filters?: CouponFilters): Promise<{
    url: string;
    expiresAt: string;
  }> {
    const response = await apiClient.post('/coupons/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export coupons');
    }
    return response.data as {
      url: string;
      expiresAt: string;
    };
  }

  // Import coupons
  static async importCoupons(file: File): Promise<{
    success: boolean;
    imported: number;
    failed: number;
    errors?: Array<{
      row: number;
      error: string;
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/coupons/import', formData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to import coupons');
    }
    return response.data as {
      success: boolean;
      imported: number;
      failed: number;
      errors?: Array<{
        row: number;
        error: string;
      }>;
    };
  }
}