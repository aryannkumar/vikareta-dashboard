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

export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vikareta.com/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get access token from localStorage
    const accessToken = typeof window !== 'undefined' 
      ? localStorage.getItem('vikareta_access_token')
      : null;

    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API: Making request to ${endpoint}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`API: Request successful to ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`API: Request failed to ${endpoint}:`, error);
      throw error;
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
    return this.request('/dashboard/metrics');
  }

  async getRecentOrders(limit: number = 10) {
    return this.request(`/orders?limit=${limit}&sort=createdAt:desc`);
  }

  async getRecentRFQs(limit: number = 5) {
    return this.request(`/rfqs?limit=${limit}&sort=createdAt:desc`);
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
    return this.request(`/rfqs?${query}`);
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

  // Deals endpoints
  async getDeals(params: any = {}): Promise<ApiResponse<{ data: any[]; pagination: any }>> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/deals?${query}`);
  }

  async createDeal(data: any) {
    return this.request('/deals', {
      method: 'POST',
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