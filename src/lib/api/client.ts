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

  async getAdvertisementAnalytics(limit: number = 3) {
    return this.request(`/advertisements/analytics?limit=${limit}`);
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
    return this.request(`/orders?${query}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // RFQs endpoints
  async getRFQs(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/rfqs/my?${query}`);
  }

  async getRFQ(id: string) {
    return this.request(`/rfqs/${id}`);
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

  async addMoneyToWallet(amount: number, paymentMethod: string) {
    return this.request('/wallet/add-money', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
    });
  }

  // Advertisements endpoints
  async getAdvertisements(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/ads?${query}`);
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
}

// Export singleton instance
export const apiClient = new ApiClient();