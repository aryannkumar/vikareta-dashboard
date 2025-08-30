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

  async getAdvertisementAnalytics(params: { period?: string; limit?: number } = {}) {
    const { period = '30d', limit = 3 } = params;
    return this.request(`/ads/analytics?period=${period}&limit=${limit}`);
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

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
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
    } catch (error) {
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

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
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

  // Subcategories endpoints
  async getSubcategories(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/subcategories?${query}`);
  }

  async getSubcategoriesByCategory(categoryId: string) {
    return this.request(`/subcategories/category/${categoryId}`);
  }

  async getSubcategory(id: string) {
    return this.request(`/subcategories/${id}`);
  }

  async createSubcategory(data: any) {
    return this.request('/subcategories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubcategory(id: string, data: any) {
    return this.request(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubcategory(id: string) {
    return this.request(`/subcategories/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscription endpoints
  async getSubscription() {
    return this.request('/subscription/current');
  }

  async getSubscriptionPlans() {
    return this.request('/subscription/plans');
  }

  async updateSubscription(planId: string) {
    return this.request('/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async getSubscriptionUsage() {
    return this.request('/subscription/usage');
  }

  // Shipments endpoints
  async getShipments(params: any = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      return await this.request(`/shipments?${query}`);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Shipment status update not yet available' }
      };
    }
  }

  async getReadyToShipOrders() {
    try {
      return await this.request('/orders/ready-to-ship');
    } catch (error) {
      // Fallback to regular orders with shipped status filter
      console.warn('Ready-to-ship endpoint not available, using fallback');
      try {
        return await this.getOrders({ status: 'confirmed', limit: 50 });
      } catch (fallbackError) {
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
    } catch (error) {
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

  async bulkAdjustInventory(adjustments: Array<{
    productId: string;
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    reason: string;
    reference?: string;
  }>) {
    return this.request('/inventory/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({ adjustments }),
    });
  }

  // Removed duplicate getInventoryStats function

  // Removed duplicate getInventoryMovements function

  async getInventoryMovementStats() {
    try {
      return await this.request('/inventory/movements/stats');
    } catch (error) {
      // If movement stats endpoint doesn't exist, return empty stats
      console.warn('Inventory movement stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalMovements: 0,
          movementsToday: 0,
          inboundMovements: 0,
          outboundMovements: 0,
          adjustments: 0,
          transfers: 0,
          totalValueIn: 0,
          totalValueOut: 0,
          netValue: 0,
          topProducts: []
        },
        message: 'Inventory movement stats feature not yet available'
      };
    }
  }

  // Removed duplicate getInventoryAlerts function

  // Suppliers endpoints
  async getSuppliers(params: any = {}) {
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
    return this.request(`/suppliers${query ? `?${query}` : ''}`);
  }

  async getSupplier(id: string) {
    return this.request(`/suppliers/${id}`);
  }

  async createSupplier(data: any) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplier(id: string, data: any) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  async getSupplierStats() {
    try {
      return await this.request('/suppliers/stats');
    } catch (error) {
      // If supplier stats endpoint doesn't exist, return empty stats
      console.warn('Supplier stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalSuppliers: 0,
          verifiedSuppliers: 0,
          favoriteSuppliers: 0,
          averageRating: 0,
          totalSpent: 0,
          activeOrders: 0
        },
        message: 'Supplier stats feature not yet available'
      };
    }
  }

  async toggleSupplierFavorite(supplierId: string) {
    return this.request(`/suppliers/${supplierId}/favorite`, {
      method: 'POST',
    });
  }

  async getSupplierOrders(supplierId: string, params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/suppliers/${supplierId}/orders${query ? `?${query}` : ''}`);
  }

  async getSupplierPerformance(supplierId: string) {
    return this.request(`/suppliers/${supplierId}/performance`);
  }

  // Communications endpoints
  async getMessages(params: any = {}) {
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
    if (params.type && params.type !== 'all' && params.type.trim()) {
      cleanParams.type = params.type.trim();
    }
    if (params.priority && params.priority !== 'all' && params.priority.trim()) {
      cleanParams.priority = params.priority.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/messages${query ? `?${query}` : ''}`);
  }

  async getMessage(id: string) {
    return this.request(`/messages/${id}`);
  }

  async sendMessage(data: {
    to: string;
    subject: string;
    content: string;
    type?: 'email' | 'sms' | 'notification';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    relatedTo?: {
      type: 'order' | 'rfq' | 'customer' | 'supplier';
      id: string;
    };
  }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async replyToMessage(messageId: string, data: {
    content: string;
  }) {
    return this.request(`/messages/${messageId}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'POST',
    });
  }

  async archiveMessage(messageId: string) {
    return this.request(`/messages/${messageId}/archive`, {
      method: 'POST',
    });
  }

  async bulkMarkAsRead(messageIds: string[]) {
    return this.request('/messages/bulk/mark-read', {
      method: 'POST',
      body: JSON.stringify({ messageIds }),
    });
  }

  async bulkArchiveMessages(messageIds: string[]) {
    return this.request('/messages/bulk/archive', {
      method: 'POST',
      body: JSON.stringify({ messageIds }),
    });
  }

  async searchMessages(query: string, filters?: any) {
    const params: any = { q: query };
    if (filters) {
      Object.assign(params, filters);
    }
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/messages/search?${queryString}`);
  }

  async getMessageThread(messageId: string) {
    return this.request(`/messages/${messageId}/thread`);
  }

  async forwardMessage(messageId: string, data: { to: string; message?: string }) {
    return this.request(`/messages/${messageId}/forward`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async starMessage(messageId: string) {
    return this.request(`/messages/${messageId}/star`, {
      method: 'POST',
    });
  }

  async unstarMessage(messageId: string) {
    return this.request(`/messages/${messageId}/unstar`, {
      method: 'POST',
    });
  }

  async getCommunicationStats() {
    return this.request('/messages/stats');
  }

  // Duplicate function removed - using the first implementation

  async getNotifications(params: any = {}) {
    const cleanParams: any = {};

    if (params.limit) cleanParams.limit = params.limit;
    if (params.unreadOnly) cleanParams.unreadOnly = params.unreadOnly;

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  // Reports endpoints
  async getReports(params: any = {}) {
    // Clean up empty parameters to avoid validation errors
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.type && params.type !== 'all' && params.type.trim()) {
      cleanParams.type = params.type.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/reports${query ? `?${query}` : ''}`);
  }

  async getReport(id: string) {
    return this.request(`/reports/${id}`);
  }



  async generateReport(data: {
    templateId: string;
    parameters: Record<string, any>;
    format: 'pdf' | 'excel' | 'csv';
    scheduledFor?: string;
  }) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async downloadReport(reportId: string) {
    return this.request(`/reports/${reportId}/download`);
  }

  async deleteReport(reportId: string) {
    return this.request(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  async getReportStats() {
    try {
      return await this.request('/reports/stats');
    } catch (error) {
      // If report stats endpoint doesn't exist, return empty stats
      console.warn('Report stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalReports: 0,
          reportsThisMonth: 0,
          scheduledReports: 0,
          averageGenerationTime: 0,
          mostUsedType: 'sales',
          totalDownloads: 0
        },
        message: 'Report stats feature not yet available'
      };
    }
  }

  async scheduleReport(data: {
    templateId: string;
    parameters: Record<string, any>;
    format: 'pdf' | 'excel' | 'csv';
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      recipients: string[];
    };
  }) {
    return this.request('/reports/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Enhanced Services endpoints
  async getServiceStats() {
    try {
      return await this.request('/services/stats');
    } catch (error) {
      // If service stats endpoint doesn't exist, return empty stats
      console.warn('Service stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalServices: 0,
          activeServices: 0,
          totalOrders: 0,
          averageRating: 0,
          totalRevenue: 0,
          popularCategories: [],
          recentOrders: []
        },
        message: 'Service stats feature not yet available'
      };
    }
  }

  async getServiceOrders(serviceId: string, params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.status && params.status !== 'all') {
      cleanParams.status = params.status.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/services/${serviceId}/orders${query ? `?${query}` : ''}`);
  }

  async getServiceReviews(serviceId: string, params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/services/${serviceId}/reviews${query ? `?${query}` : ''}`);
  }

  async updateServiceStatus(serviceId: string, status: 'active' | 'inactive' | 'draft') {
    return this.request(`/services/${serviceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getServiceCategories() {
    try {
      return await this.request('/services/categories');
    } catch (error) {
      // If service categories endpoint doesn't exist, return default categories
      console.warn('Service categories endpoint not available, returning default categories');
      return {
        success: true,
        data: [
          {
            id: 'technology',
            name: 'Technology',
            subcategories: ['Software Development', 'IT Support', 'Web Design', 'Mobile Apps', 'Data Analysis']
          },
          {
            id: 'business',
            name: 'Business',
            subcategories: ['Consulting', 'Marketing', 'Accounting', 'Legal', 'Project Management']
          },
          {
            id: 'creative',
            name: 'Creative',
            subcategories: ['Graphic Design', 'Content Writing', 'Photography', 'Video Production', 'Branding']
          },
          {
            id: 'maintenance',
            name: 'Maintenance',
            subcategories: ['Equipment Repair', 'Facility Management', 'Cleaning', 'Security', 'Landscaping']
          },
          {
            id: 'training',
            name: 'Training',
            subcategories: ['Professional Development', 'Technical Training', 'Certification', 'Workshops', 'Coaching']
          }
        ],
        message: 'Using default service categories'
      };
    }
  }

  async bookService(serviceId: string, data: {
    scheduledDate: string;
    location?: string;
    requirements?: string;
    notes?: string;
    contactInfo: {
      name: string;
      email: string;
      phone: string;
    };
  }) {
    return this.request(`/services/${serviceId}/book`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Enhanced Shipments endpoints
  async getShipmentStats() {
    try {
      return await this.request('/shipments/stats');
    } catch (error) {
      // If shipment stats endpoint doesn't exist, return empty stats
      console.warn('Shipment stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalShipments: 0,
          pendingShipments: 0,
          inTransitShipments: 0,
          deliveredShipments: 0,
          failedShipments: 0,
          totalShippingCost: 0,
          averageDeliveryTime: 0,
          onTimeDeliveryRate: 0
        },
        message: 'Shipment stats feature not yet available'
      };
    }
  }

  async getShipmentTracking(trackingNumber: string) {
    try {
      return await this.request(`/shipments/tracking/${trackingNumber}`);
    } catch (error) {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Shipment tracking not available' }
      };
    }
  }

  async getShipmentHistory(shipmentId: string) {
    try {
      return await this.request(`/shipments/${shipmentId}/history`);
    } catch (error) {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Shipment history not available' }
      };
    }
  }

  async bulkUpdateShipmentStatus(shipmentIds: string[], status: string) {
    try {
      return await this.request('/shipments/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ shipmentIds, status, timestamp: new Date().toISOString() }),
      });
    } catch (error) {
      return {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Bulk shipment update not yet available' }
      };
    }
  }

  async getCarriers() {
    try {
      return await this.request('/shipments/carriers');
    } catch (error) {
      // If carriers endpoint doesn't exist, return default carriers
      console.warn('Carriers endpoint not available, returning default carriers');
      return {
        success: true,
        data: [
          { id: 'fedex', name: 'FedEx', services: ['Ground', 'Express', 'Overnight'] },
          { id: 'ups', name: 'UPS', services: ['Ground', 'Next Day Air', '2nd Day Air'] },
          { id: 'dhl', name: 'DHL', services: ['Express', 'Ground', 'International'] },
          { id: 'usps', name: 'USPS', services: ['Priority Mail', 'Express Mail', 'Ground Advantage'] },
          { id: 'other', name: 'Other', services: ['Standard', 'Express'] }
        ],
        message: 'Using default carriers'
      };
    }
  }

  // Support & Help Desk endpoints (removed duplicate - see below)


  // Knowledge Base endpoints
  async getKnowledgeBase(params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.category && params.category !== 'all' && params.category.trim()) {
      cleanParams.category = params.category.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();

    try {
      return await this.request(`/support/knowledge-base${query ? `?${query}` : ''}`);
    } catch (error) {
      // If knowledge base endpoint doesn't exist, return default articles
      console.warn('Knowledge base endpoint not available, returning default articles');
      return {
        success: true,
        data: [
          {
            id: '1',
            title: 'How to create your first product listing',
            content: 'Step-by-step guide to creating product listings...',
            category: 'Getting Started',
            tags: ['products', 'listing', 'beginner'],
            views: 1250,
            helpful: 45,
            notHelpful: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Understanding payment processing',
            content: 'Learn about payment methods and processing...',
            category: 'Payments',
            tags: ['payments', 'billing', 'processing'],
            views: 890,
            helpful: 32,
            notHelpful: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Managing your inventory effectively',
            content: 'Best practices for inventory management...',
            category: 'Inventory',
            tags: ['inventory', 'stock', 'management'],
            views: 675,
            helpful: 28,
            notHelpful: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        message: 'Using default knowledge base articles'
      };
    }
  }

  async getKnowledgeBaseArticle(id: string) {
    return this.request(`/support/knowledge-base/${id}`);
  }

  async rateKnowledgeBaseArticle(articleId: string, helpful: boolean) {
    return this.request(`/support/knowledge-base/${articleId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  }

  async searchKnowledgeBase(query: string) {
    return this.request(`/support/knowledge-base/search?q=${encodeURIComponent(query)}`);
  }

  // FAQ endpoints
  async getFAQs(params: any = {}) {
    const cleanParams: any = {};

    if (params.category && params.category !== 'all') {
      cleanParams.category = params.category.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();

    try {
      return await this.request(`/support/faqs${query ? `?${query}` : ''}`);
    } catch (error) {
      // If FAQs endpoint doesn't exist, return default FAQs
      console.warn('FAQs endpoint not available, returning default FAQs');
      return {
        success: true,
        data: [
          {
            id: '1',
            question: 'How do I reset my password?',
            answer: 'You can reset your password by clicking the "Forgot Password" link on the login page.',
            category: 'Account',
            helpful: 156,
            notHelpful: 8
          },
          {
            id: '2',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards, PayPal, and bank transfers.',
            category: 'Billing',
            helpful: 134,
            notHelpful: 5
          },
          {
            id: '3',
            question: 'How do I contact customer support?',
            answer: 'You can contact us through live chat, email, or by creating a support ticket.',
            category: 'Support',
            helpful: 98,
            notHelpful: 2
          }
        ],
        message: 'Using default FAQ entries'
      };
    }
  }

  // Enhanced Orders endpoints for pending and completed orders
  async getEnhancedPendingOrderStats() {
    try {
      return await this.request('/orders/stats/pending');
    } catch (error) {
      // If pending order stats endpoint doesn't exist, return empty stats
      console.warn('Pending order stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalPending: 0,
          pendingConfirmation: 0,
          pendingPayment: 0,
          pendingStock: 0,
          pendingApproval: 0,
          totalValue: 0,
          averageAge: 0,
          urgentOrders: 0
        },
        message: 'Pending order stats feature not yet available'
      };
    }
  }

  async getEnhancedCompletedOrderStats() {
    try {
      return await this.request('/orders/stats/completed');
    } catch (error) {
      // If completed order stats endpoint doesn't exist, return empty stats
      console.warn('Completed order stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalCompleted: 0,
          completedThisMonth: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          averageRating: 0,
          averageProcessingTime: 0,
          repeatCustomers: 0,
          onTimeDeliveryRate: 0
        },
        message: 'Completed order stats feature not yet available'
      };
    }
  }

  // Duplicate function removed - using the first implementation

  // Customer Leads endpoints
  async getCustomerLeads(params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }
    if (params.source && params.source !== 'all' && params.source.trim()) {
      cleanParams.source = params.source.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/customers/leads${query ? `?${query}` : ''}`);
  }

  async convertLeadToCustomer(leadId: string, customerData: any) {
    return this.request(`/customers/leads/${leadId}/convert`, {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateLeadStatus(leadId: string, status: string) {
    return this.request(`/customers/leads/${leadId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }



  // Supplier Favorites endpoints
  async getFavoriteSuppliers(params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/suppliers/favorites${query ? `?${query}` : ''}`);
  }

  async addSupplierToFavorites(supplierId: string) {
    return this.request(`/suppliers/${supplierId}/favorite`, {
      method: 'POST',
    });
  }

  async removeSupplierFromFavorites(supplierId: string) {
    return this.request(`/suppliers/${supplierId}/favorite`, {
      method: 'DELETE',
    });
  }

  // Inventory Low Stock endpoints
  async getLowStockItems(params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.threshold) cleanParams.threshold = params.threshold;

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/inventory/low-stock${query ? `?${query}` : ''}`);
  }

  async updateReorderLevel(productId: string, reorderLevel: number, reorderQuantity: number) {
    return this.request(`/inventory/${productId}/reorder-level`, {
      method: 'PUT',
      body: JSON.stringify({ reorderLevel, reorderQuantity }),
    });
  }

  async createReorderRequest(productId: string, quantity: number, supplierId?: string) {
    return this.request('/inventory/reorder-requests', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, supplierId }),
    });
  }

  // Enhanced Quotes endpoints for received quotes
  async getReceivedQuoteStats() {
    try {
      return await this.request('/quotes/stats/received');
    } catch (error) {
      // If received quote stats endpoint doesn't exist, return empty stats
      console.warn('Received quote stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalReceived: 0,
          pendingReview: 0,
          accepted: 0,
          rejected: 0,
          expired: 0,
          averageQuoteValue: 0,
          responseRate: 0,
          averageResponseTime: 0
        },
        message: 'Received quote stats feature not yet available'
      };
    }
  }

  // Lead Management endpoints
  async getLeadStats() {
    try {
      return await this.request('/customers/leads/stats');
    } catch (error) {
      // If lead stats endpoint doesn't exist, return empty stats
      console.warn('Lead stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalLeads: 0,
          newLeads: 0,
          qualifiedLeads: 0,
          convertedLeads: 0,
          lostLeads: 0,
          conversionRate: 0,
          averageLeadScore: 0,
          totalEstimatedValue: 0,
          averageTimeToConversion: 0
        },
        message: 'Lead stats feature not yet available'
      };
    }
  }

  async createLead(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    source: string;
    estimatedValue?: number;
    interests?: string[];
    notes?: string;
  }) {
    return this.request('/customers/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLead(leadId: string, data: any) {
    return this.request(`/customers/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLead(leadId: string) {
    return this.request(`/customers/leads/${leadId}`, {
      method: 'DELETE',
    });
  }

  async addLeadActivity(leadId: string, activity: {
    type: 'email' | 'call' | 'meeting' | 'note';
    description: string;
  }) {
    return this.request(`/customers/leads/${leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  async scheduleLeadFollowUp(leadId: string, followUpDate: string, notes?: string) {
    return this.request(`/customers/leads/${leadId}/follow-up`, {
      method: 'POST',
      body: JSON.stringify({ followUpDate, notes }),
    });
  }

  // Favorite Suppliers Management
  async getFavoriteSupplierStats() {
    try {
      return await this.request('/suppliers/favorites/stats');
    } catch (error) {
      // If favorite supplier stats endpoint doesn't exist, return empty stats
      console.warn('Favorite supplier stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalFavorites: 0,
          activeSuppliers: 0,
          totalOrders: 0,
          totalSpent: 0,
          averageRating: 0,
          topCategories: []
        },
        message: 'Favorite supplier stats feature not yet available'
      };
    }
  }

  async bulkAddToFavorites(supplierIds: string[]) {
    return this.request('/suppliers/favorites/bulk', {
      method: 'POST',
      body: JSON.stringify({ supplierIds }),
    });
  }

  async bulkRemoveFromFavorites(supplierIds: string[]) {
    return this.request('/suppliers/favorites/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ supplierIds }),
    });
  }

  // Low Stock Management
  async getLowStockStats() {
    try {
      return await this.request('/inventory/low-stock/stats');
    } catch (error) {
      // If low stock stats endpoint doesn't exist, return empty stats
      console.warn('Low stock stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalLowStock: 0,
          criticalStock: 0,
          outOfStock: 0,
          reorderNeeded: 0,
          totalValue: 0,
          affectedCategories: []
        },
        message: 'Low stock stats feature not yet available'
      };
    }
  }

  async bulkUpdateReorderLevels(updates: Array<{
    productId: string;
    reorderLevel: number;
    reorderQuantity: number;
  }>) {
    return this.request('/inventory/reorder-levels/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async createBulkReorderRequest(requests: Array<{
    productId: string;
    quantity: number;
    supplierId?: string;
  }>) {
    return this.request('/inventory/reorder-requests/bulk', {
      method: 'POST',
      body: JSON.stringify({ requests }),
    });
  }
  // Analytics endpoints
  async getSalesAnalytics(params: any = {}) {
    const cleanParams: any = {};

    if (params.dateRange && params.dateRange.trim()) {
      cleanParams.dateRange = params.dateRange.trim();
    }
    if (params.includeComparisons) {
      cleanParams.includeComparisons = params.includeComparisons;
    }
    if (params.includeBreakdowns) {
      cleanParams.includeBreakdowns = params.includeBreakdowns;
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/analytics/sales${query ? `?${query}` : ''}`);
  }

  async getProductAnalytics(params: any = {}) {
    const cleanParams: any = {};

    if (params.dateRange && params.dateRange.trim()) {
      cleanParams.dateRange = params.dateRange.trim();
    }
    if (params.categoryId && params.categoryId.trim()) {
      cleanParams.categoryId = params.categoryId.trim();
    }
    if (params.includeInventory) {
      cleanParams.includeInventory = params.includeInventory;
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/analytics/products${query ? `?${query}` : ''}`);
  }

  async getCustomerAnalytics(params: any = {}) {
    const cleanParams: any = {};

    if (params.dateRange && params.dateRange.trim()) {
      cleanParams.dateRange = params.dateRange.trim();
    }
    if (params.segmentId && params.segmentId.trim()) {
      cleanParams.segmentId = params.segmentId.trim();
    }
    if (params.includeSegmentation) {
      cleanParams.includeSegmentation = params.includeSegmentation;
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/analytics/customers${query ? `?${query}` : ''}`);
  }

  // Support Tickets endpoints
  async getSupportTickets(params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }
    if (params.priority && params.priority !== 'all' && params.priority.trim()) {
      cleanParams.priority = params.priority.trim();
    }
    if (params.category && params.category !== 'all' && params.category.trim()) {
      cleanParams.category = params.category.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/support/tickets${query ? `?${query}` : ''}`);
  }

  async getSupportTicket(id: string) {
    return this.request(`/support/tickets/${id}`);
  }

  async createSupportTicket(data: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    customerId?: string;
  }) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupportTicket(id: string, data: {
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
  }) {
    return this.request(`/support/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSupportTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed') {
    return this.request(`/support/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async addTicketMessage(ticketId: string, data: {
    content: string;
    attachments?: Array<{
      name: string;
      url: string;
      size: number;
    }>;
  }) {
    return this.request(`/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSupportStats() {
    try {
      return await this.request('/support/stats');
    } catch (error) {
      // If support stats endpoint doesn't exist, return empty stats
      console.warn('Support stats endpoint not available, returning empty stats');
      return {
        success: true,
        data: {
          totalTickets: 0,
          openTickets: 0,
          inProgressTickets: 0,
          resolvedTickets: 0,
          averageResponseTime: 0,
          customerSatisfaction: 0
        },
        message: 'Support stats feature not yet available'
      };
    }
  }

  // Sales Reports endpoints
  async getSalesReports(params: any = {}) {
    const cleanParams: any = {};

    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params.type && params.type !== 'all' && params.type.trim()) {
      cleanParams.type = params.type.trim();
    }
    if (params.status && params.status !== 'all' && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/reports/sales${query ? `?${query}` : ''}`);
  }

  async generateSalesReport(data: {
    templateId: string;
    name: string;
    description: string;
    period: string;
    customDateRange?: any;
  }) {
    return this.request('/reports/sales/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSalesReport(id: string) {
    return this.request(`/reports/sales/${id}`);
  }

  async downloadSalesReport(id: string) {
    return this.request(`/reports/sales/${id}/download`);
  }

  // Removed duplicate scheduleReport function

  async getScheduledReports() {
    return this.request('/reports/scheduled');
  }

  async cancelScheduledReport(scheduleId: string) {
    return this.request(`/reports/scheduled/${scheduleId}`, {
      method: 'DELETE',
    });
  }

  async getReportProgress(reportId: string) {
    return this.request(`/reports/sales/${reportId}/progress`);
  }

  async shareReport(reportId: string, data: { emails: string[]; message?: string }) {
    return this.request(`/reports/sales/${reportId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async duplicateReport(reportId: string, newName: string) {
    return this.request(`/reports/sales/${reportId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    });
  }

  async getReportAnalytics() {
    return this.request('/reports/analytics');
  }

  // Enhanced Categories endpoints (already exist but need parameter support)
  async getCategories(params: any = {}) {
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
    return this.request(`/categories${query ? `?${query}` : ''}`);
  }

  async createCategory(data: {
    name: string;
    description: string;
    parentId?: string;
    status: string;
  }) {
    return this.request('/products/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/products/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/products/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategoryStats() {
    return this.request('/products/categories/stats');
  }

  async getCategoryProducts(categoryId: string, params: any = {}) {
    const cleanParams: any = {};
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/products/categories/${categoryId}/products${query ? `?${query}` : ''}`);
  }

  async moveCategoryToParent(categoryId: string, newParentId: string | null) {
    return this.request(`/products/categories/${categoryId}/move`, {
      method: 'PUT',
      body: JSON.stringify({ parentId: newParentId }),
    });
  }

  async reorderCategories(categoryIds: string[]) {
    return this.request('/products/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ categoryIds }),
    });
  }

  async duplicateCategory(categoryId: string, newName: string) {
    return this.request(`/products/categories/${categoryId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    });
  }

  async exportCategories(format: 'csv' | 'excel' = 'csv') {
    return this.request(`/products/categories/export?format=${format}`);
  }

  async importCategories(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/products/categories/import', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
    });
  }

  // Customer Segments endpoints
  async getCustomerSegments(params: any = {}) {
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
    return this.request(`/customers/segments${query ? `?${query}` : ''}`);
  }

  async createCustomerSegment(data: any) {
    return this.request('/customers/segments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomerSegment(id: string, data: any) {
    return this.request(`/customers/segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomerSegment(id: string) {
    return this.request(`/customers/segments/${id}`, {
      method: 'DELETE',
    });
  }

  async getCustomerSegmentStats() {
    return this.request('/customers/segments/stats');
  }

  async getSegmentCustomers(segmentId: string, params: any = {}) {
    const cleanParams: any = {};
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/customers/segments/${segmentId}/customers${query ? `?${query}` : ''}`);
  }

  async exportSegmentCustomers(segmentId: string, format: 'csv' | 'excel' = 'csv') {
    return this.request(`/customers/segments/${segmentId}/export?format=${format}`);
  }

  async previewSegment(criteria: any) {
    return this.request('/customers/segments/preview', {
      method: 'POST',
      body: JSON.stringify({ criteria }),
    });
  }

  async duplicateCustomerSegment(segmentId: string, newName: string) {
    return this.request(`/customers/segments/${segmentId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    });
  }

  // Enhanced Notifications endpoints
  async getNotificationSettings() {
    return this.request('/notifications/settings');
  }

  async updateNotificationSettings(settings: any) {
    return this.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async dismissNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}/dismiss`, {
      method: 'POST',
    });
  }

  async bulkDismissNotifications(notificationIds: string[]) {
    return this.request('/notifications/bulk/dismiss', {
      method: 'POST',
      body: JSON.stringify({ notificationIds }),
    });
  }

  async snoozeNotification(notificationId: string, snoozeUntil: string) {
    return this.request(`/notifications/${notificationId}/snooze`, {
      method: 'POST',
      body: JSON.stringify({ snoozeUntil }),
    });
  }

  async getNotificationStats() {
    return this.request('/notifications/stats');
  }

  async createNotificationRule(rule: {
    name: string;
    conditions: any;
    actions: any;
    enabled: boolean;
  }) {
    return this.request('/notifications/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async getNotificationRules() {
    return this.request('/notifications/rules');
  }

  async updateNotificationRule(ruleId: string, rule: any) {
    return this.request(`/notifications/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
  }

  async deleteNotificationRule(ruleId: string) {
    return this.request(`/notifications/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async testNotification(type: string, data: any) {
    return this.request('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    });
  }

  // Report Templates endpoints
  async getReportTemplates() {
    return this.request('/reports/templates');
  }

  async getReportTemplate(id: string) {
    return this.request(`/reports/templates/${id}`);
  }

  // Removed duplicate getInventory function

  // Removed duplicate getInventoryStats function

  async updateInventoryItem(id: string, data: any) {
    try {
      const response = await this.put(`/inventory/${id}`, data);
      return response;
    } catch (error) {
      console.error('Update inventory item error:', error);
      throw error;
    }
  }

  async bulkAdjustStock(data: { itemIds: string[], adjustment: number, reason: string }) {
    try {
      const response = await this.post('/inventory/bulk-adjust', data);
      return response;
    } catch (error) {
      console.error('Bulk adjust stock error:', error);
      throw error;
    }
  }

  // Removed duplicate exportInventory function

  async generateReorderReport() {
    try {
      const response = await this.post('/inventory/reorder-report');
      return response;
    } catch (error) {
      console.error('Generate reorder report error:', error);
      throw error;
    }
  }

  // Orders Management
  async getOrders(params?: any) {
    try {
      const response = await this.get('/orders', { params });
      return response;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  async getOrderStats() {
    try {
      const response = await this.get('/orders/stats');
      return response;
    } catch (error) {
      console.error('Get order stats error:', error);
      throw error;
    }
  }

  async updateOrderStatusEnhanced(id: string, status: string) {
    try {
      const response = await this.put(`/orders/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  async bulkOrderAction(orderIds: string[], action: string) {
    try {
      const response = await this.post('/orders/bulk-action', { orderIds, action });
      return response;
    } catch (error) {
      console.error('Bulk order action error:', error);
      throw error;
    }
  }

  async exportOrders(params?: any) {
    try {
      const response = await this.get('/orders/export', { params, responseType: 'blob' });
      return response;
    } catch (error) {
      console.error('Export orders error:', error);
      throw error;
    }
  }

  async printOrder(id: string) {
    try {
      const response = await this.get(`/orders/${id}/print`, { responseType: 'blob' });
      return response;
    } catch (error) {
      console.error('Print order error:', error);
      throw error;
    }
  }

  async sendOrderConfirmation(id: string) {
    try {
      const response = await this.post(`/orders/${id}/send-confirmation`);
      return response;
    } catch (error) {
      console.error('Send order confirmation error:', error);
      throw error;
    }
  }

  // Removed duplicate getSuppliers function

  // Removed duplicate getSupplierStats function

  // Removed duplicate createSupplier function

  // Removed duplicate updateSupplier function

  async updateSupplierStatus(id: string, status: string) {
    try {
      const response = await this.put(`/suppliers/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Update supplier status error:', error);
      throw error;
    }
  }

  // Removed duplicate toggleSupplierFavorite function

  async bulkSupplierAction(supplierIds: string[], action: string) {
    try {
      const response = await this.post('/suppliers/bulk-action', { supplierIds, action });
      return response;
    } catch (error) {
      console.error('Bulk supplier action error:', error);
      throw error;
    }
  }

  async exportSuppliers(params?: any) {
    try {
      const response = await this.get('/suppliers/export', { params, responseType: 'blob' });
      return response;
    } catch (error) {
      console.error('Export suppliers error:', error);
      throw error;
    }
  }

  async sendSupplierEmail(id: string, subject: string, message: string) {
    try {
      const response = await this.post(`/suppliers/${id}/send-email`, { subject, message });
      return response;
    } catch (error) {
      console.error('Send supplier email error:', error);
      throw error;
    }
  }

  async generateSupplierReport(id: string) {
    try {
      const response = await this.post(`/suppliers/${id}/generate-report`);
      return response;
    } catch (error) {
      console.error('Generate supplier report error:', error);
      throw error;
    }
  }

  // Removed duplicate deleteSupplier function

  // Analytics Management
  async getAnalyticsDashboard(params?: any) {
    try {
      const response = await this.get('/analytics/dashboard', { params });
      return response;
    } catch (error) {
      console.error('Get analytics dashboard error:', error);
      throw error;
    }
  }

  async getRealtimeMetrics() {
    try {
      const response = await this.get('/analytics/realtime');
      return response;
    } catch (error) {
      console.error('Get realtime metrics error:', error);
      throw error;
    }
  }

  async exportAnalytics(params?: any) {
    try {
      const response = await this.get('/analytics/export', { params, responseType: 'blob' });
      return response;
    } catch (error) {
      console.error('Export analytics error:', error);
      throw error;
    }
  }

  async generateAnalyticsReport(data: { period: string, sections: string[] }) {
    try {
      const response = await this.post('/analytics/generate-report', data);
      return response;
    } catch (error) {
      console.error('Generate analytics report error:', error);
      throw error;
    }
  }

  // Removed duplicate getProductAnalytics function

  // Removed duplicate getCustomerAnalytics function

  // Removed duplicate getSalesAnalytics function

  // WebSocket methods for real-time updates
  connectWebSocket() {
    if (typeof window === 'undefined') return; // Server-side check

    const wsUrl = this.baseURL.replace('http', 'ws') + '/ws';

    try {
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.wsReconnectAttempts = 0;

        // Send authentication if available
        const token = vikaretaSSOClient?.getAccessToken?.();
        if (token) {
          this.websocket?.send(JSON.stringify({
            type: 'auth',
            token
          }));
        }
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }
  }

  private handleWebSocketMessage(data: any) {
    const { type, payload } = data;

    // Emit to registered listeners
    const listeners = this.wsEventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (err) {
          console.error('WebSocket listener error:', err);
        }
      });
    }
  }

  private attemptReconnect() {
    if (this.wsReconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.wsReconnectAttempts++;
      const delay = Math.pow(2, this.wsReconnectAttempts) * 1000; // Exponential backoff

      setTimeout(() => {
        console.log(`Attempting WebSocket reconnection (${this.wsReconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
        this.connectWebSocket();
      }, delay);
    }
  }

  onWebSocketEvent(eventType: string, listener: (data: any) => void) {
    if (!this.wsEventListeners.has(eventType)) {
      this.wsEventListeners.set(eventType, new Set());
    }
    this.wsEventListeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.wsEventListeners.get(eventType);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  disconnectWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  // Support & Communications endpoints
  async getAnnouncements(params?: any) {
    return this.get('/communications/announcements', { params });
  }

  async createAnnouncement(data: any) {
    return this.post('/communications/announcements', data);
  }

  async updateAnnouncement(id: string, data: any) {
    return this.put(`/communications/announcements/${id}`, data);
  }

  async deleteAnnouncement(id: string) {
    return this.delete(`/communications/announcements/${id}`);
  }

  async publishAnnouncement(id: string) {
    return this.post(`/communications/announcements/${id}/publish`);
  }

  // Removed duplicate getFAQs function

  async createFAQ(data: any) {
    return this.post('/support/faqs', data);
  }

  async updateFAQ(id: string, data: any) {
    return this.put(`/support/faqs/${id}`, data);
  }

  async deleteFAQ(id: string) {
    return this.delete(`/support/faqs/${id}`);
  }

  async getFAQCategories() {
    return this.get('/support/faq-categories');
  }

  async getContactMethods() {
    return this.get('/support/contact-methods');
  }

  async getSupportHours() {
    return this.get('/support/hours');
  }

  // Removed duplicate getSupportStats function

  async submitContactForm(data: any) {
    return this.post('/support/contact', data);
  }

  // Settings endpoints
  async getSettingsOverview() {
    return this.get('/settings/overview');
  }

  async getAccountProfile() {
    return this.get('/account/profile');
  }

  async updateAccountProfile(data: any) {
    return this.put('/account/profile', data);
  }

  async uploadAvatar(formData: FormData) {
    return this.post('/account/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async verifyEmail() {
    return this.post('/account/verify-email');
  }

  async verifyPhone() {
    return this.post('/account/verify-phone');
  }

  async getActivityLog(params?: any) {
    return this.get('/account/activity-log', { params });
  }

  // Removed duplicate getSupplierPerformance functions

  async exportSupplierPerformance(params?: any) {
    return this.get('/suppliers/performance/export', { params, responseType: 'blob' });
  }

  // Reports endpoints
  async getPurchaseReport(params?: any) {
    return this.get('/reports/purchase', { params });
  }

  async exportPurchaseReport(params?: any) {
    return this.get('/reports/purchase/export', { params, responseType: 'blob' });
  }

  async getFinancialReport(params?: any) {
    return this.get('/reports/financial', { params });
  }

  async exportFinancialReport(params?: any) {
    return this.get('/reports/financial/export', { params, responseType: 'blob' });
  }

  async getPurchaseOrders(params?: any) {
    return this.get('/orders/purchase', { params });
  }

  async getTransactions(params?: any) {
    return this.get('/transactions', { params });
  }

  // Inventory endpoints
  async getInventoryProducts(params?: any) {
    return this.get('/inventory/products', { params });
  }



  // Removed duplicate getInventoryMovements function

  async adjustStock(itemId: string, data: any) {
    return this.post(`/inventory/products/${itemId}/adjust`, data);
  }

  // Removed duplicate bulkUpdateInventory function

  // Removed duplicate exportInventory function
}

export const apiClient = new ApiClient();
export const vikaretaApiClient = apiClient;
export default apiClient;