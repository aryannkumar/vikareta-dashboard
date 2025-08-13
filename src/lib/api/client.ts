import axios from 'axios';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard-specific response types
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

// Retry configuration
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: any) => boolean;
}

// Request queue for offline support
interface QueuedRequest {
  id: string;
  config: any;
  timestamp: number;
  retryCount: number;
}

// API Client class
class ApiClient {
  private client: ReturnType<typeof axios.create>;
  private baseURL: string;
  private retryConfig: RetryConfig;
  private requestQueue: QueuedRequest[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vikareta.com/api';

    this.retryConfig = {
      retries: 3,
      retryDelay: 1000,
      retryCondition: (error: any) => {
        return !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED';
      },
    };

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListeners();
  }

  private setupInterceptors() {
    // Request interceptor for authentication and CSRF
    this.client.interceptors.request.use(
      async (config: any) => {
        // Get token from localStorage or your auth store
        const token = this.getAuthToken();


        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing requests
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
          const csrfToken = await this.getCSRFToken();
          if (csrfToken && config.headers) {
            config.headers['X-CSRF-Token'] = csrfToken;
          }
        }

        // Add request ID for tracking
        if (config.headers) {
          config.headers['X-Request-ID'] = this.generateRequestId();
        }

        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => {
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config as any & { _retry?: boolean; _csrfRetry?: boolean };

        // Handle 403 CSRF token errors
        if (error.response?.status === 403 && !originalRequest._csrfRetry) {
          const errorData = error.response?.data;
          const message = errorData?.error?.message || errorData?.message || '';

          if (message.includes('CSRF') || message.includes('csrf')) {
            console.log('CSRF token expired, clearing and retrying...');
            originalRequest._csrfRetry = true;
            this.clearCSRFToken();

            // Get fresh CSRF token and retry
            const csrfToken = await this.getCSRFToken();
            if (csrfToken && originalRequest.headers) {
              originalRequest.headers['X-CSRF-Token'] = csrfToken;
            }

            return this.client(originalRequest);
          }
        }

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = this.getAuthToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // First try to get from Zustand store format (primary source)
      try {
        const authStore = localStorage.getItem('dashboard-auth-storage');
        if (authStore) {
          const parsed = JSON.parse(authStore);
          const token = parsed.state?.token;
          if (token) return token;
        }
      } catch {
        // Ignore parsing errors
      }

      // Fallback to direct storage key
      const token = localStorage.getItem('auth_token');
      if (token) return token;
    }
    return null;
  }

  private async refreshToken(): Promise<void> {
    let refreshToken = null;

    if (typeof window !== 'undefined') {
      // First try Zustand store format
      try {
        const authStore = localStorage.getItem('dashboard-auth-storage');
        if (authStore) {
          const parsed = JSON.parse(authStore);
          refreshToken = parsed.state?.refreshToken || null;
        }
      } catch {
        // Ignore parsing errors
      }

      // Fallback to direct storage key
      if (!refreshToken) {
        refreshToken = localStorage.getItem('refresh_token');
      }
    }

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = (response.data as any).data;

      if (typeof window !== 'undefined') {
        // Set in cookie for middleware (primary method)
        document.cookie = `auth-token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;

        // Also set in localStorage as backup
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
      }
    } catch {
      throw new Error('Failed to refresh token');
    }
  }

  private handleAuthError(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');

      // Clear auth token cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // Let the auth store handle the redirect to prevent conflicts
      // The middleware will catch the missing token and redirect appropriately
    }
  }

  private handleApiError(error: any): Error {
    const response = error.response;

    if (response?.data) {
      const apiError = response.data as ApiResponse;
      return new Error(apiError.error?.message || 'An error occurred');
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }

    if (!error.response) {
      return new Error('Network error. Please check your connection.');
    }

    return new Error('An unexpected error occurred');
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // CSRF Token Management
  private csrfToken: string | null = null;
  private csrfTokenExpiry: number = 0;

  private async getCSRFToken(): Promise<string | null> {
    // Check if token is still valid (valid for 30 minutes)
    if (this.csrfToken && Date.now() < this.csrfTokenExpiry) {
      return this.csrfToken;
    }

    try {
      // Use the correct base URL for CSRF token endpoint (without /api prefix)
      const baseUrl = this.baseURL.replace('/api', '');
      const response = await axios.get<ApiResponse<{ csrfToken: string }>>(`${baseUrl}/csrf-token`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.data?.success && response.data?.data?.csrfToken) {
        this.csrfToken = response.data.data.csrfToken;
        this.csrfTokenExpiry = Date.now() + (30 * 60 * 1000); // 30 minutes
        return this.csrfToken;
      } else {
        console.error('CSRF token fetch failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }

    return null;
  }

  private clearCSRFToken(): void {
    this.csrfToken = null;
    this.csrfTokenExpiry = 0;
  }

  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processQueuedRequests();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      this.isOnline = navigator.onLine;
    }
  }

  private async retryRequest(config: any, retryCount = 0): Promise<any> {
    try {
      return await this.client(config);
    } catch (error) {
      const axiosError = error as any;

      if (retryCount < this.retryConfig.retries && this.retryConfig.retryCondition(axiosError)) {
        await this.delay(this.retryConfig.retryDelay * Math.pow(2, retryCount));
        return this.retryRequest(config, retryCount + 1);
      }

      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private queueRequest(config: any): void {
    const queuedRequest: QueuedRequest = {
      id: this.generateRequestId(),
      config,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.requestQueue.push(queuedRequest);

    // Limit queue size
    if (this.requestQueue.length > 50) {
      this.requestQueue = this.requestQueue.slice(-50);
    }
  }

  private async processQueuedRequests(): Promise<void> {
    const requests = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of requests) {
      try {
        await this.retryRequest(request.config);
      } catch {
        // Re-queue failed requests with exponential backoff
        if (request.retryCount < 3) {
          request.retryCount++;
          this.requestQueue.push(request);
        }
      }
    }
  }

  // Generic HTTP methods with retry and offline support
  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const requestConfig = { ...config, method: 'GET', url };

    if (!this.isOnline) {
      this.queueRequest(requestConfig);
      throw new Error('You are offline. Request has been queued.');
    }

    const response = await this.retryRequest(requestConfig);
    return response.data as ApiResponse<T>;
  }

  async post<T>(url: string, data?: unknown, config?: any): Promise<ApiResponse<T>> {
    const requestConfig = { ...config, method: 'POST', url, data };

    if (!this.isOnline) {
      this.queueRequest(requestConfig);
      throw new Error('You are offline. Request has been queued.');
    }

    const response = await this.retryRequest(requestConfig);
    return response.data as ApiResponse<T>;
  }

  async put<T>(url: string, data?: unknown, config?: any): Promise<ApiResponse<T>> {
    const requestConfig = { ...config, method: 'PUT', url, data };

    if (!this.isOnline) {
      this.queueRequest(requestConfig);
      throw new Error('You are offline. Request has been queued.');
    }

    const response = await this.retryRequest(requestConfig);
    return response.data as ApiResponse<T>;
  }

  async patch<T>(url: string, data?: unknown, config?: any): Promise<ApiResponse<T>> {
    const requestConfig = { ...config, method: 'PATCH', url, data };

    if (!this.isOnline) {
      this.queueRequest(requestConfig);
      throw new Error('You are offline. Request has been queued.');
    }

    const response = await this.retryRequest(requestConfig);
    return response.data as ApiResponse<T>;
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const requestConfig = { ...config, method: 'DELETE', url };

    if (!this.isOnline) {
      this.queueRequest(requestConfig);
      throw new Error('You are offline. Request has been queued.');
    }

    const response = await this.retryRequest(requestConfig);
    return response.data as ApiResponse<T>;
  }

  // File upload method with progress tracking
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const config: any = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post(url, formData, config);
    return response.data as ApiResponse<T>;
  }

  // Dashboard-specific methods
  async getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return this.get<DashboardMetrics>('/dashboard/metrics');
  }

  async getRevenueChart(period: string = '30d'): Promise<ApiResponse<ChartData>> {
    return this.get<ChartData>(`/dashboard/charts/revenue?period=${period}`);
  }

  async getOrdersChart(period: string = '30d'): Promise<ApiResponse<ChartData>> {
    return this.get<ChartData>(`/dashboard/charts/orders?period=${period}`);
  }

  async getTopProducts(limit: number = 10): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/dashboard/products/top?limit=${limit}`);
  }

  async getRecentOrders(limit: number = 10): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/dashboard/orders/recent?limit=${limit}`);
  }

  // Product Management
  async getProducts(params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);

    return this.get<PaginatedResponse<any>>(`/products?${searchParams.toString()}`);
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/products/${id}`);
  }

  async createProduct(data: any): Promise<ApiResponse<any>> {
    return this.post<any>('/products', data);
  }

  async updateProduct(id: string, data: any): Promise<ApiResponse<any>> {
    return this.put<any>(`/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/products/${id}`);
  }

  // Order Management
  async getOrders(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    return this.get<PaginatedResponse<any>>(`/orders?${searchParams.toString()}`);
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return this.put<any>(`/orders/${id}/status`, { status });
  }

  // RFQ Management
  async getRFQs(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    return this.get<PaginatedResponse<any>>(`/rfqs?${searchParams.toString()}`);
  }

  async getRFQ(id: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/rfqs/${id}`);
  }

  async createRFQ(data: any): Promise<ApiResponse<any>> {
    return this.post<any>('/rfqs', data);
  }

  async getRFQQuotes(id: string): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/rfqs/${id}/quotes`);
  }

  // Quote Management
  async getQuotes(params?: { page?: number; limit?: number; status?: string; rfqId?: string }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.rfqId) searchParams.set('rfqId', params.rfqId);

    return this.get<PaginatedResponse<any>>(`/quotes?${searchParams.toString()}`);
  }

  async getQuote(id: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/quotes/${id}`);
  }

  async createQuote(data: any): Promise<ApiResponse<any>> {
    return this.post<any>('/quotes', data);
  }

  async acceptQuote(id: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/quotes/${id}/accept`);
  }

  async negotiateQuote(id: string, data: any): Promise<ApiResponse<any>> {
    return this.post<any>(`/quotes/${id}/negotiate`, data);
  }

  // Deal Management
  async getDeals(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    return this.get<PaginatedResponse<any>>(`/deals?${searchParams.toString()}`);
  }

  async getDeal(id: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/deals/${id}`);
  }

  async getDealMessages(id: string): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/deals/${id}/messages`);
  }

  async sendDealMessage(id: string, message: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/deals/${id}/messages`, { message });
  }

  // Wallet Management
  async getWalletBalance(): Promise<ApiResponse<any>> {
    return this.get<any>('/wallet/balance');
  }

  async getWalletTransactions(params?: { page?: number; limit?: number; type?: string }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);

    return this.get<PaginatedResponse<any>>(`/wallet/transactions?${searchParams.toString()}`);
  }

  async addMoneyToWallet(amount: number): Promise<ApiResponse<any>> {
    return this.post<any>('/wallet/add-money', { amount });
  }

  async withdrawFromWallet(amount: number, bankDetails: any): Promise<ApiResponse<any>> {
    return this.post<any>('/wallet/withdraw', { amount, bankDetails });
  }

  async lockWalletAmount(amount: number, reason: string, referenceId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/wallet/lock-amount', { amount, reason, referenceId });
  }

  // Following System
  async getFollowing(params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.get<PaginatedResponse<any>>(`/users/following?${searchParams.toString()}`);
  }

  async getFollowers(params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.get<PaginatedResponse<any>>(`/users/followers?${searchParams.toString()}`);
  }

  async followUser(userId: string): Promise<ApiResponse<void>> {
    return this.post<void>(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/users/${userId}/follow`);
  }

  // Analytics
  async getAnalytics(params?: { period?: string; metrics?: string[] }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.set('period', params.period);
    if (params?.metrics) searchParams.set('metrics', params.metrics.join(','));

    return this.get<any>(`/analytics?${searchParams.toString()}`);
  }

  // Set auth token manually
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Set in cookie for middleware (primary method)
      document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;

      // Also set in localStorage as backup (the Zustand store will handle the main storage)
      localStorage.setItem('auth_token', token);
    }
  }

  // Clear auth token
  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      // Clear auth token cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Get network status
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  // Get queued requests count
  getQueuedRequestsCount(): number {
    return this.requestQueue.length;
  }

  // Clear request queue
  clearRequestQueue(): void {
    this.requestQueue = [];
  }

  // Configure retry settings
  configureRetry(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  // Batch requests
  async batch<T>(requests: Array<() => Promise<ApiResponse<T>>>): Promise<Array<ApiResponse<T> | Error>> {
    return Promise.allSettled(requests.map(request => request())).then(results =>
      results.map(result =>
        result.status === 'fulfilled' ? result.value : result.reason
      )
    );
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;