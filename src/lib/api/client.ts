/**
 * API Client for Dashboard
 * Handles all API calls with authentication and error handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

import { vikaretaSSOClient } from '@/lib/auth/vikareta';

export class ApiClient {
  private baseURL: string;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  private csrfToken: string | null = null;
  private csrfTokenExpiry: number = 0;
  private websocket: WebSocket | null = null;
  private wsReconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private wsEventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vikareta.com/api';
  }

  // Basic WebSocket event system (placeholder until real WS implemented)
  onWebSocketEvent(event: string, handler: (data: any) => void) {
    if (!this.wsEventListeners.has(event)) {
      this.wsEventListeners.set(event, new Set());
    }
    this.wsEventListeners.get(event)!.add(handler);
    return () => this.offWebSocketEvent(event, handler);
  }

  offWebSocketEvent(event: string, handler: (data: any) => void) {
    const set = this.wsEventListeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) this.wsEventListeners.delete(event);
    }
  }

  // Internal helper to dispatch mock events (can be removed later)
  private dispatchWebSocketEvent(event: string, data: any) {
    const listeners = this.wsEventListeners.get(event);
    if (listeners) {
      listeners.forEach(l => {
        try { l(data); } catch (err) { console.error('WS listener error', err); }
      });
    }
  }

  private async getCSRFToken(): Promise<string | null> {
    // Check if we have a valid cached token
    if (this.csrfToken && Date.now() < this.csrfTokenExpiry) {
      return this.csrfToken;
    }

    try {
      const response = await fetch('https://api.vikareta.com/csrf-token', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.data?.csrfToken || null;
        // Set expiry to 50 minutes (tokens expire in 1 hour)
        this.csrfTokenExpiry = Date.now() + (50 * 60 * 1000);
        console.log('CSRF token fetched successfully');
        return this.csrfToken;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }

    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = this.requestCache.get(endpoint);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    const url = `${this.baseURL}${endpoint}`;

    // Get access token from unified SSO client
    let accessToken: string | null = null;
    if (typeof window !== 'undefined') {
      accessToken = vikaretaSSOClient?.getAccessToken?.() || null;
    }

    // Get CSRF token for state-changing requests
    let csrfToken: string | null = null;
    const method = options.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      csrfToken = await this.getCSRFToken();
    }

    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API: Making request to ${endpoint}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API: Request failed to ${endpoint}:`, errorData);

        // Return error in ApiResponse format instead of throwing
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || `HTTP ${response.status}`,
            details: errorData
          }
        };
      }

      const data = await response.json();
      console.log(`API: Request successful to ${endpoint}`);

      // Cache successful GET requests
      if (!options.method || options.method === 'GET') {
        this.requestCache.set(endpoint, { data, timestamp: Date.now() });
      }

      // Ensure we return the data in the expected format
      if (data.success !== undefined) {
        return data; // Backend already returns ApiResponse format
      } else {
        // Wrap raw data in ApiResponse format
        return {
          success: true,
          data,
          message: 'Request successful'
        };
      }
    } catch (error) {
      console.error(`API: Request failed to ${endpoint}:`, error);

      // Return network errors in ApiResponse format instead of throwing
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed'
        }
      };
    }
  }

  // Analytics endpoints
  async getRevenueAnalytics(period: string = '30d') {
    return this.request(`/analytics/revenue?period=${period}`);
  }

  async getProductPerformance(limit: number = 5) {
    return this.request(`/analytics/products/performance?limit=${limit}`);
  }

  async getProductAnalytics(params: { dateRange?: string; categoryId?: string; includeInventory?: boolean } = {}) {
    const query = new URLSearchParams();
    if (params.dateRange) query.append('dateRange', params.dateRange);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.includeInventory) query.append('includeInventory', 'true');
    return this.request(`/analytics/products${query.toString() ? `?${query.toString()}` : ''}`);
  }

  async getSalesAnalytics(params: { dateRange?: string; includeComparisons?: boolean; includeBreakdowns?: boolean } = {}) {
    const query = new URLSearchParams();
    if (params.dateRange) query.append('dateRange', params.dateRange);
    if (params.includeComparisons) query.append('includeComparisons', 'true');
    if (params.includeBreakdowns) query.append('includeBreakdowns', 'true');
    return this.request(`/analytics/sales${query.toString() ? `?${query.toString()}` : ''}`);
  }

  async getAdvertisementAnalytics(params: { period?: string; limit?: number } = {}) {
    const { period = '30d', limit = 3 } = params;
    return this.request(`/ads/analytics?period=${period}&limit=${limit}`);
  }

  async getOrderAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/analytics/orders${query ? `?${query}` : ''}`);
  }

  async getRFQAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/analytics/rfqs${query ? `?${query}` : ''}`);
  }

  async getWalletAnalyticsDetailed(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/analytics/wallet${query ? `?${query}` : ''}`);
  }

  async getUserAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/analytics/users${query ? `?${query}` : ''}`);
  }

  // Customer analytics (used by analytics/customers page)
  async getCustomerAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    // Prefer dedicated customers analytics endpoint; fallback to users
    const primary = await this.request(`/analytics/customers${query ? `?${query}` : ''}`);
    if (primary.success) return primary;
    return this.request(`/analytics/users${query ? `?${query}` : ''}`);
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    return this.request('/dashboard/stats');
  }

  async getRecentOrders(limit: number = 10) {
    return this.request(`/orders?limit=${limit}&sort=createdAt:desc`);
  }

  async getRecentRFQs(limit: number = 5) {
    return this.request(`/rfqs/my?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
  }

  // Products endpoints
  async getProducts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products?${query}`);
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async getOrders(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: string, data: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string, notes?: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getOrderHistory(id: string) {
    return this.request(`/orders/${id}/history`);
  }

  async getOrderTracking(id: string) {
    return this.request(`/orders/${id}/tracking`);
  }





  // RFQs endpoints
  async getRFQs(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/rfqs/my?${query}`);
  }



  async createRFQ(data: any) {
    return this.request('/rfqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRFQ(id: string, data: any) {
    return this.request(`/rfqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRFQ(id: string) {
    return this.request(`/rfqs/${id}`, {
      method: 'DELETE',
    });
  }

  async expireRFQ(id: string) {
    return this.request(`/rfqs/${id}/expire`, {
      method: 'POST',
    });
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request('/wallet/balance');
  }

  async getWalletTransactions(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/wallet/transactions?${query}`);
  }

  async getRecentWalletTransactions(limit: number = 5) {
    return this.request(`/wallet/transactions/recent?limit=${limit}`);
  }

  async getWalletAnalytics() {
    try {
      return await this.request('/wallet/analytics');
    } catch {
      // If wallet analytics endpoint doesn't exist, return empty analytics
      console.warn('Wallet analytics endpoint not available, returning empty analytics');
      return {
        success: true,
        data: {
          totalBalance: 0,
          totalIncome: 0,
          totalExpenses: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          recentTransactions: []
        },
        message: 'Wallet analytics feature not yet available'
      };
    }
  }

  async getBankAccounts() {
    return this.request('/wallet/bank-accounts');
  }

  async addBankAccount(data: any) {
    return this.request('/wallet/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWithdrawals() {
    return this.request('/wallet/withdrawals');
  }

  async createWithdrawal(data: any) {
    return this.request('/wallet/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addMoneyToWallet(amount: number, paymentMethod: string) {
    return this.request('/wallet/add-money', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
    });
  }

  async getWalletLimits() {
    return this.request('/wallet/limits');
  }

  async updateWalletLimits(data: any) {
    return this.request('/wallet/limits', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getWalletHistory(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/wallet/history${query ? `?${query}` : ''}`);
  }

  async getLockedAmounts() {
    return this.request('/wallet/locked-amounts');
  }

  // Advertisements endpoints
  async getAdvertisements(params: any = {}) {
    // Clean up empty parameters to avoid validation errors
    const cleanParams: any = {};

    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }
    if (params.type && params.type !== 'all' && params.type.trim()) {
      cleanParams.type = params.type.trim();
    }
    if (params.limit) {
      cleanParams.limit = params.limit;
    }
    if (params.page) {
      cleanParams.page = params.page;
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/ads${query ? `?${query}` : ''}`);
  }

  async createAdvertisement(data: any) {
    return this.request('/ads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdvertisement(id: string, data: any) {
    return this.request(`/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdvertisement(id: string) {
    return this.request(`/ads/${id}`, {
      method: 'DELETE',
    });
  }

  // Advertisement Campaigns endpoints
  async getAdvertisementCampaigns(params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/ads/campaigns${query ? `?${query}` : ''}`);
  }

  async createAdvertisementCampaign(data: any) {
    return this.request('/ads/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdvertisementCampaign(id: string, data: any) {
    return this.request(`/ads/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdvertisementCampaign(id: string) {
    return this.request(`/ads/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints

  async getPendingOrderStats() {
    return this.request('/orders/pending/stats');
  }

  async getCompletedOrderStats() {
    return this.request('/orders/completed/stats');
  }

  async downloadInvoice(invoiceId: string) {
    return this.request(`/invoices/${invoiceId}/download`);
  }

  async processOrder(orderId: string) {
    return this.request(`/orders/${orderId}/process`, {
      method: 'POST',
    });
  }

  async bulkProcessOrders(orderIds: string[]) {
    return this.request('/orders/bulk-process', {
      method: 'POST',
      body: JSON.stringify({ orderIds }),
    });
  }

  async getFulfillmentOptions(orderId: string) {
    return this.request(`/orders/${orderId}/fulfillment-options`);
  }

  // Generic GET method for backward compatibility
  async get(endpoint: string, options: any = {}) {
    const { params, ...requestOptions } = options;
    let url = endpoint;

    if (params) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    return this.request(url, {
      method: 'GET',
      ...requestOptions,
    });
  }

  // Generic POST method
  async post(endpoint: string, data: any = {}, options: any = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // Generic PUT method
  async put(endpoint: string, data: any = {}, options: any = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // Generic DELETE method
  async delete(endpoint: string, options: any = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // Communications endpoints
  async getCommunicationsAnnouncements(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/communications/announcements?${query}`);
  }

  async getCommunicationsAnnouncementsStats() {
    return this.request('/communications/announcements/stats');
  }

  async createCommunicationsAnnouncement(data: any) {
    return this.request('/communications/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCommunicationsAnnouncement(id: string, data: any) {
    return this.request(`/communications/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCommunicationsAnnouncement(id: string) {
    return this.request(`/communications/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  async publishCommunicationsAnnouncement(id: string) {
    return this.request(`/communications/announcements/${id}/publish`, {
      method: 'POST',
    });
  }

  // Settings endpoints
  async getSettingsBusiness() {
    return this.request('/settings/business');
  }

  async updateSettingsBusiness(data: any) {
    return this.request('/settings/business', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSettingsSecurity() {
    return this.request('/settings/security');
  }

  async updateSettingsSecurity(data: any) {
    return this.request('/settings/security', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSettingsNotifications() {
    return this.request('/settings/notifications');
  }

  async updateSettingsNotifications(data: any) {
    return this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request('/settings/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setup2FA() {
    return this.request('/settings/2fa/setup', {
      method: 'POST',
    });
  }

  async verify2FA(data: { code: string }) {
    return this.request('/settings/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async disable2FA() {
    return this.request('/settings/2fa/disable', {
      method: 'POST',
    });
  }

  // Integrations endpoints
  async getIntegrations() {
    return this.request('/integrations');
  }

  async connectIntegration(id: string, config: any = {}) {
    return this.request(`/integrations/${id}/connect`, {
      method: 'POST',
      body: JSON.stringify({ config }),
    });
  }

  async disconnectIntegration(id: string) {
    return this.request(`/integrations/${id}/disconnect`, {
      method: 'POST',
    });
  }

  async updateIntegration(id: string, data: any) {
    return this.request(`/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getIntegrationsWebhooks() {
    return this.request('/integrations/webhooks');
  }

  async createIntegrationsWebhook(data: any) {
    return this.request('/integrations/webhooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteIntegrationsWebhook(id: string) {
    return this.request(`/integrations/webhooks/${id}`, {
      method: 'DELETE',
    });
  }

  async getIntegrationsApiKeys() {
    return this.request('/integrations/api-keys');
  }

  async createIntegrationsApiKey(data: any) {
    return this.request('/integrations/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteIntegrationsApiKey(id: string) {
    return this.request(`/integrations/api-keys/${id}`, {
      method: 'DELETE',
    });
  }



  // Inventory endpoints

  async getInventoryStats() {
    return this.request('/inventory/stats');
  }

  async getInventoryMovements(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/inventory/movements?${query}`);
  }

  async adjustInventoryProduct(id: string, data: { adjustment: number; reason: string }) {
    return this.request(`/inventory/products/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWarehouses(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/inventory/warehouses${query ? `?${query}` : ''}`);
  }

  async createWarehouse(data: any) {
    return this.request('/inventory/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWarehouse(id: string) {
    return this.request(`/inventory/warehouses/${id}`);
  }

  async updateWarehouse(id: string, data: any) {
    return this.request(`/inventory/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWarehouse(id: string) {
    return this.request(`/inventory/warehouses/${id}`, {
      method: 'DELETE',
    });
  }

  async getInventoryAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/inventory/analytics${query ? `?${query}` : ''}`);
  }

  async bulkUpdateInventory(data: { updates: Array<{ id: string; stock: number }> }) {
    return this.request('/inventory/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInventoryAlerts() {
    return this.request('/inventory/alerts');
  }

  async exportInventory() {
    return this.request('/inventory/export');
  }

  async getInventoryMovementStats() {
    return this.request('/inventory/movements/stats');
  }

  // Services endpoints
  async getServices(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/services?${query}`);
  }

  async getService(id: string): Promise<ApiResponse<any>> {
    return this.request(`/services/${id}`);
  }

  async createService(data: any) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: any) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string) {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories endpoints
  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async getCategories(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/categories${query ? `?${query}` : ''}`);
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Subcategories endpoints - aligned with backend nested structure
  async getSubcategoriesByCategory(categoryId: string) {
    return this.request(`/categories/${categoryId}/subcategories`);
  }

  // Note: Top-level subcategory CRUD not supported by backend yet
  // Removed: getSubcategories, getSubcategory, createSubcategory, updateSubcategory, deleteSubcategory
  // Use nested /categories/:id/subcategories for category-specific operations

  // Subscription endpoints
  async getSubscription() {
    return this.request('/subscriptions/current');
  }

  async getSubscriptionPlans() {
    return this.request('/subscriptions/plans');
  }

  async updateSubscription(planId: string) {
    return this.request('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async getSubscriptionUsage() {
    return this.request('/subscriptions/usage');
  }

  // Shipments endpoints
  async getShipments(params: any = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      return await this.request(`/shipments?${query}`);
    } catch {
      // If shipments endpoint doesn't exist, return empty result
      console.warn('Shipments endpoint not available, returning empty result');
      return {
        success: true,
        data: [],
        message: 'Shipments feature not yet available'
      };
    }
  }

  async getShipment(id: string) {
    try {
      return await this.request(`/shipments/${id}`);
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Shipment details not available' }
      };
    }
  }

  async createShipment(data: any) {
    try {
      return await this.request('/shipments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Shipment creation not yet available' }
      };
    }
  }

  async updateShipmentStatus(id: string, status: string) {
    try {
      return await this.request(`/shipments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, timestamp: new Date().toISOString() }),
      });
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Shipment status update not yet available' }
      };
    }
  }

  async getShipmentStats() {
    try {
      return await this.request('/shipments/stats');
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Shipment stats not available' }
      };
    }
  }

  async getReadyToShipOrders() {
    try {
      return await this.request('/orders/ready-to-ship');
    } catch {
      // Fallback to regular orders with shipped status filter
      console.warn('Ready-to-ship endpoint not available, using fallback');
      try {
        return await this.getOrders({ status: 'confirmed', limit: 50 });
      } catch {
        return {
          success: true,
          data: [],
          message: 'No orders ready for shipment'
        };
      }
    }
  }

  // Quotes endpoints (for received RFQ quotes)
  async getReceivedQuotes(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/quotes?${query}`);
  }

  async getReceivedQuoteStats() {
    // Attempt to fetch stats for received quotes; endpoint may not yet exist
    try {
      return await this.request('/quotes/stats?type=received');
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Received quote stats not available' }
      };
    }
  }

  async getQuote(id: string) {
    return this.request(`/quotes/${id}`);
  }

  async createQuote(data: any) {
    return this.request('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuote(id: string, data: any) {
    return this.request(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async acceptQuote(id: string) {
    return this.request(`/quotes/${id}/accept`, {
      method: 'POST',
    });
  }

  async rejectQuote(id: string, reason?: string) {
    return this.request(`/quotes/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // RFQ endpoints
  async getRelevantRFQs(params: any = {}) {
    // Clean up empty parameters to avoid validation errors
    const cleanParams: any = {};

    if (params.page) {
      cleanParams.page = params.page;
    }
    if (params.limit) {
      cleanParams.limit = params.limit;
    }
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }
    if (params.type && params.type !== 'all' && params.type.trim()) {
      cleanParams.type = params.type.trim();
    }
    if (params.categoryId && params.categoryId.trim()) {
      cleanParams.categoryId = params.categoryId.trim();
    }
    if (params.subcategoryId && params.subcategoryId.trim()) {
      cleanParams.subcategoryId = params.subcategoryId.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/rfqs/relevant${query ? `?${query}` : ''}`);
  }

  async getRFQ(rfqId: string) {
    return this.request(`/rfqs/${rfqId}`);
  }

  async getRFQQuotes(rfqId: string) {
    return this.request(`/rfqs/${rfqId}/quotes`);
  }

  // Bidding endpoints
  async getRFQBids(rfqId: string) {
    return this.request(`/rfqs/${rfqId}/bids`);
  }

  async submitBid(rfqId: string, bidData: {
    price: number;
    deliveryTime: number;
    deliveryTimeUnit: 'days' | 'weeks' | 'months';
    description: string;
  }) {
    return this.request(`/rfqs/${rfqId}/bids`, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  async updateBid(bidId: string, bidData: {
    price?: number;
    deliveryTime?: number;
    deliveryTimeUnit?: 'days' | 'weeks' | 'months';
    description?: string;
  }) {
    return this.request(`/bids/${bidId}`, {
      method: 'PUT',
      body: JSON.stringify(bidData),
    });
  }

  async withdrawBid(bidId: string) {
    return this.request(`/bids/${bidId}`, {
      method: 'DELETE',
    });
  }

  // Negotiation endpoints
  async getRFQNegotiations(rfqId: string) {
    return this.request(`/rfqs/${rfqId}/negotiations`);
  }

  async getBidNegotiations(bidId: string) {
    return this.request(`/bids/${bidId}/negotiations`);
  }

  async sendNegotiation(bidId: string, negotiationData: {
    message: string;
    proposedPrice?: number;
    proposedDeliveryTime?: number;
  }) {
    return this.request(`/bids/${bidId}/negotiations`, {
      method: 'POST',
      body: JSON.stringify(negotiationData),
    });
  }

  // Order conversion endpoints (when bid is accepted)
  async acceptBid(bidId: string) {
    return this.request(`/bids/${bidId}/accept`, {
      method: 'POST',
    });
  }

  async rejectBid(bidId: string, reason?: string) {
    return this.request(`/bids/${bidId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Convert accepted bid to order
  async convertBidToOrder(bidId: string, orderData?: {
    shippingAddress?: string;
    specialInstructions?: string;
    paymentMethod?: string;
  }) {
    return this.request(`/bids/${bidId}/convert-to-order`, {
      method: 'POST',
      body: JSON.stringify(orderData || {}),
    });
  }

  // Reports (purchase & financial) helpers used in pages
  async getPurchaseReport(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/purchase${query ? `?${query}` : ''}`);
  }

  async exportPurchaseReport(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/purchase/export${query ? `?${query}` : ''}`);
  }

  async getFinancialReport(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/financial${query ? `?${query}` : ''}`);
  }

  async exportFinancialReport(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/financial/export${query ? `?${query}` : ''}`);
  }

  async getSalesReports(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/sales${query ? `?${query}` : ''}`);
  }

  async exportSalesReport(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/sales/export${query ? `?${query}` : ''}`);
  }

  async getReportTemplates() {
    try {
      return await this.request('/reports/templates');
    } catch {
      return {
        success: true,
        data: [],
        message: 'Report templates endpoint not available'
      };
    }
  }

  async generateSalesReport(data: {
    templateId: string;
    name: string;
    description?: string;
    period: string;
    customDateRange?: { start: string; end: string } | null;
    format?: string;
    schedule?: any;
  }) {
    try {
      return await this.request('/reports/sales/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Sales report generation not available' }
      };
    }
  }

  // Customers endpoints
  async getCustomers(params: any = {}) {
    // Clean up empty parameters to avoid validation errors
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/customers${query ? `?${query}` : ''}`);
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async getCustomerStats() {
    try {
      return await this.request('/customers/stats');
    } catch {
      // If customer stats endpoint doesn't exist, return empty stats
      console.warn('Customer stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalCustomers: 0,
          activeCustomers: 0,
          newThisMonth: 0,
          averageOrderValue: 0,
          totalRevenue: 0
        },
        message: 'Customer stats feature not yet available'
      };
    }
  }

  async getCustomerOrders(customerId: string, params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/customers/${customerId}/orders${query ? `?${query}` : ''}`);
  }

  // Inventory endpoints
  async getInventory(params: any = {}) {
    // Clean up empty parameters to avoid validation errors
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }
    if (params.category && params.category !== 'all' && params.category.trim()) {
      cleanParams.category = params.category.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/inventory${query ? `?${query}` : ''}`);
  }

  async getInventoryItem(id: string) {
    return this.request(`/inventory/${id}`);
  }

  async adjustInventory(data: {
    productId: string;
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    reason: string;
    reference?: string;
  }) {
    return this.request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Support tickets endpoints
  async getSupportTickets(params: any = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      // Backend route: GET /api/v1/support
      return await this.request(`/support${query ? `?${query}` : ''}`);
    } catch {
      return {
        success: true,
        data: { tickets: [], total: 0, page: 1, totalPages: 0 },
        message: 'Support tickets feature not available'
      };
    }
  }

  async getSupportTicket(id: string) {
    return this.request(`/support/${id}`);
  }

  async getSupportTicketStats() {
    try {
      return await this.request('/support/stats');
    } catch {
      return {
        success: true,
        data: { totalTickets: 0, openTickets: 0, inProgressTickets: 0, closedTickets: 0, categoryBreakdown: [] },
        message: 'Ticket stats not available'
      };
    }
  }

  async createSupportTicket(data: any) {
    try {
      // Backend route: POST /api/v1/support
      return await this.request('/support', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Create support ticket not available' }
      };
    }
  }

  async updateSupportTicket(id: string, data: any) {
    try {
      return await this.request(`/support/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Update support ticket not available' }
      };
    }
  }

  async addSupportTicketMessage(id: string, message: string) {
    try {
      return await this.request(`/support/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Add support ticket message not available' }
      };
    }
  }

  async closeSupportTicket(id: string, reason?: string) {
    try {
      return await this.request(`/support/${id}/close`, {
        method: 'POST',
        body: JSON.stringify(reason ? { reason } : {}),
      });
    } catch {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Close support ticket not available' }
      };
    }
  }

  // User profile endpoints
  async getUserProfile() {
    return this.request('/auth/me');
  }

  async updateUserProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadUserAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.request('/users/avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async getUserDocuments() {
    return this.request('/users/documents');
  }

  async uploadUserDocument(documentType: string, documentNumber: string, file: File) {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('documentNumber', documentNumber);
    formData.append('document', file);
    return this.request('/users/documents', {
      method: 'POST',
      body: formData,
    });
  }

  async getUserShippingAddresses() {
    return this.request('/users/shipping-addresses');
  }

  async addUserShippingAddress(address: any) {
    return this.request('/users/shipping-addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async updateUserShippingAddress(id: string, address: any) {
    return this.request(`/users/shipping-addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  }

  async deleteUserShippingAddress(id: string) {
    return this.request(`/users/shipping-addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultUserShippingAddress(id: string) {
    return this.request(`/users/shipping-addresses/${id}/default`, {
      method: 'PATCH',
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  async sendEmailVerification() {
    return this.request('/auth/send-verification-email', {
      method: 'POST',
    });
  }

  async verifyEmail(token: string) {
    return this.request(`/auth/verify-email/${token}`);
  }

  async getUserSessions() {
    return this.request('/auth/sessions');
  }

  async revokeUserSession(sessionId: string) {
    return this.request(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async revokeAllUserSessions() {
    return this.request('/auth/sessions', {
      method: 'DELETE',
    });
  }

  // Cart endpoints
  async getCart() {
    return this.request('/cart');
  }

  async addCartItem(data: any) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(itemId: string, data: any) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeCartItem(itemId: string) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  }

  async getCartSummary() {
    return this.request('/cart/summary');
  }

  async checkCartAvailability(productId: string, quantity: number, variantId?: string) {
    const params = new URLSearchParams({
      productId,
      quantity: quantity.toString(),
    });
    if (variantId) params.append('variantId', variantId);
    return this.request(`/cart/availability?${params.toString()}`);
  }

  async applyCartCoupon(code: string) {
    return this.request('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async removeCartCoupon() {
    return this.request('/cart/coupon', {
      method: 'DELETE',
    });
  }

  async bulkUpdateCart(updates: any) {
    return this.request('/cart/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async moveCartItemToWishlist(itemId: string) {
    return this.request(`/cart/items/${itemId}/wishlist`, {
      method: 'POST',
    });
  }

  async getCartRecommendations() {
    return this.request('/cart/recommendations');
  }

  async getCartStats() {
    return this.request('/cart/stats');
  }

  async getAbandonedCarts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/cart/abandoned?${query}`);
  }

  async sendAbandonedCartReminder(cartId: string) {
    return this.request(`/cart/${cartId}/reminder`, {
      method: 'POST',
    });
  }

  async bulkSendCartReminders(cartIds: string[]) {
    return this.request('/cart/reminders/bulk', {
      method: 'POST',
      body: JSON.stringify({ cartIds }),
    });
  }

  // Payment endpoints
  async getPaymentMethods() {
    return this.request('/payments/methods');
  }

  async addPaymentMethod(data: any) {
    return this.request('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(id: string, data: any) {
    return this.request(`/payments/methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(id: string) {
    return this.request(`/payments/methods/${id}`, {
      method: 'DELETE',
    });
  }

  async createPaymentIntent(data: any) {
    return this.request('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentIntent(id: string) {
    return this.request(`/payments/intent/${id}`);
  }

  async confirmPayment(intentId: string, data?: any) {
    return this.request(`/payments/intent/${intentId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getPaymentTransactions(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payments/transactions?${query}`);
  }

  async getPaymentTransaction(id: string) {
    return this.request(`/payments/transactions/${id}`);
  }

  async processPaymentRefund(transactionId: string, data: any) {
    return this.request(`/payments/transactions/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentGateways() {
    return this.request('/payments/gateways');
  }

  async getPaymentStats(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payments/stats?${query}`);
  }

  async validatePaymentMethod(methodId: string, amount: number) {
    return this.request(`/payments/methods/${methodId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getPaymentReceipt(transactionId: string) {
    return this.request(`/payments/transactions/${transactionId}/receipt`);
  }

  async getPaymentAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payments/analytics?${query}`);
  }

  async bulkProcessPaymentRefunds(refunds: any[]) {
    return this.request('/payments/refunds/bulk', {
      method: 'POST',
      body: JSON.stringify({ refunds }),
    });
  }

  async getFailedPayments(params: any = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params.dateTo) query.append('dateTo', params.dateTo);
    return this.request(`/payments/failed?${query.toString()}`);
  }

  async retryPayment(paymentId: string, paymentMethodId?: string) {
    return this.request(`/payments/${paymentId}/retry`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId }),
    });
  }

  async getPaymentGatewayConfig(gatewayId: string) {
    return this.request(`/payments/gateways/${gatewayId}/config`);
  }

  async updatePaymentGatewayConfig(gatewayId: string, config: any) {
    return this.request(`/payments/gateways/${gatewayId}/config`, {
      method: 'PUT',
      body: JSON.stringify({ config }),
    });
  }

  // Reviews endpoints
  async getReviews(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reviews${query ? `?${query}` : ''}`);
  }

  async getReview(id: string) {
    return this.request(`/reviews/${id}`);
  }

  async createReview(data: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReview(id: string, data: any) {
    return this.request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(id: string) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  async markReviewHelpful(reviewId: string) {
    return this.request(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  async getReviewStats(targetId: string, targetType: string) {
    const query = new URLSearchParams({ targetId, targetType }).toString();
    return this.request(`/reviews/stats?${query}`);
  }

  async getDashboardReviewAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reviews/dashboard/analytics${query ? `?${query}` : ''}`);
  }

  async bulkReviewAction(data: any) {
    return this.request('/reviews/bulk-action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveReview(reviewId: string) {
    return this.request(`/reviews/${reviewId}/approve`, {
      method: 'POST',
    });
  }

  async rejectReview(reviewId: string, reason?: string) {
    return this.request(`/reviews/${reviewId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async markReviewVerified(reviewId: string) {
    return this.request(`/reviews/${reviewId}/verify`, {
      method: 'POST',
    });
  }

  async getPendingReviews(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reviews/pending${query ? `?${query}` : ''}`);
  }

  async getReviewResponseTemplates() {
    return this.request('/reviews/response-templates');
  }

  async respondToReview(reviewId: string, response: string) {
    return this.request(`/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // Coupons endpoints
  async getCoupons(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/coupons${query ? `?${query}` : ''}`);
  }

  async getCoupon(id: string) {
    return this.request(`/coupons/id/${id}`);
  }

  async getCouponByCode(code: string) {
    return this.request(`/coupons/code/${code}`);
  }

  async createCoupon(data: any) {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCoupon(id: string, data: any) {
    return this.request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCoupon(id: string) {
    return this.request(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(code: string, orderValue?: number) {
    const query = new URLSearchParams();
    if (orderValue !== undefined) query.append('orderValue', orderValue.toString());
    return this.request(`/coupons/validate?code=${encodeURIComponent(code)}&${query.toString()}`);
  }

  async applyCoupon(data: any) {
    return this.request('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeCoupon(data: any) {
    return this.request('/coupons/remove', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCouponStats(couponId: string) {
    return this.request(`/coupons/${couponId}/stats`);
  }

  async getDashboardCouponAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/coupons/dashboard/analytics${query ? `?${query}` : ''}`);
  }

  async bulkCreateCoupons(data: any) {
    return this.request('/coupons/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateCoupons(data: any) {
    return this.request('/coupons/bulk', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async bulkDeleteCoupons(data: any) {
    return this.request('/coupons/bulk-delete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkCouponAction(data: any) {
    return this.request('/coupons/bulk-action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCouponCodes(data: any) {
    return this.request('/coupons/generate-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async duplicateCoupon(couponId: string, modifications?: any) {
    return this.request(`/coupons/${couponId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(modifications || {}),
    });
  }

  async getCouponUsageHistory(couponId: string, params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/coupons/${couponId}/usage-history${query ? `?${query}` : ''}`);
  }

  async exportCoupons(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/coupons/export${query ? `?${query}` : ''}`, {
      method: 'POST',
    });
  }

  async importCoupons(formData: FormData) {
    return this.request('/coupons/import', {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();
export const vikaretaApiClient = apiClient; // backward compatibility alias
export default apiClient;