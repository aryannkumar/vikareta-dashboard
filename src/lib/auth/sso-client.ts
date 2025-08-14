/**
 * Unified SSO Authentication Client for Dashboard
 * Handles JWT + Refresh Token authentication with localStorage
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin' | 'both';
  verified: boolean;
  avatar?: string;
  createdAt: string;
  businessName?: string;
  userType?: string;
  verificationTier?: string;
  isVerified?: boolean;
  phone?: string;
  gstin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: {
    code: string;
    message: string;
  };
}

export class SSOAuthClient {
  private baseURL: string;
  private csrfToken: string | null = null;
  private readonly ACCESS_TOKEN_KEY = 'vikareta_access_token';
  private readonly REFRESH_TOKEN_KEY = 'vikareta_refresh_token';
  private readonly USER_KEY = 'vikareta_user';

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.vikareta.com';
  }

  /**
   * LocalStorage helpers for token management
   */
  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      // Also clear legacy dashboard tokens
      localStorage.removeItem('dashboard_token');
      localStorage.removeItem('dashboard_refresh_token');
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get CSRF token from backend
   */
  private async ensureCSRFToken(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Check if we already have a token in cookies
    const existingToken = this.getCSRFToken();
    if (existingToken) {
      return;
    }

    try {
      const response = await fetch(`${this.baseURL}/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Wait for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // If cookie wasn't set but we got token in response, store it manually
        const token = this.getCSRFToken();
        if (!token && data.data?.csrfToken) {
          document.cookie = `XSRF-TOKEN=${data.data.csrfToken}; path=/; max-age=3600${
            process.env.NODE_ENV === 'production' ? '; domain=.vikareta.com; secure; samesite=none' : ''
          }`;
        }
      }
    } catch (error) {
      console.error('Dashboard SSO: Failed to get CSRF token:', error);
    }
  }

  /**
   * Get CSRF token from cookie for state-changing requests
   */
  private getCSRFToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith('XSRF-TOKEN=')
    );
    
    if (csrfCookie) {
      return decodeURIComponent(csrfCookie.split('=')[1]);
    }
    
    return null;
  }

  /**
   * Make authenticated API request with localStorage tokens
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // Still include for CSRF cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add access token from localStorage
    const accessToken = this.getAccessToken();
    if (accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${accessToken}`,
      };
    }

    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      const csrfToken = this.getCSRFToken();
      
      if (csrfToken) {
        config.headers = {
          ...config.headers,
          'X-XSRF-TOKEN': csrfToken,
        };
      }
    }

    try {
      console.log(`Dashboard SSO: Making request to ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // If 401, try to refresh token
        if (response.status === 401 && accessToken) {
          const refreshed = await this.tryRefreshToken();
          if (refreshed) {
            // Retry the original request with new token
            return this.request(endpoint, options);
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`Dashboard SSO: Request successful to ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`Dashboard SSO: Request failed to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Try to refresh access token using refresh token
   */
  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return false;
    }

    try {
      const response = await this.refreshToken();
      return response.success;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  /**
   * Login with username/password and store tokens in localStorage
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Ensure we have a CSRF token before making the request
      await this.ensureCSRFToken();
      
      const response = await this.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Store tokens and user data in localStorage
      if (response.success && response.user) {
        // Extract tokens from response (backend should return them)
        if (response.accessToken) {
          this.setAccessToken(response.accessToken);
        }
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
        this.setUser(response.user);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: error instanceof Error ? error.message : 'Login failed'
        }
      };
    }
  }

  /**
   * Get current user profile (returns User object or null)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Always try to get current user from API (handles both localStorage and cookie auth)
      const response = await this.request<AuthResponse>('/api/auth/me', {
        method: 'GET',
      });
      
      if (response.success && response.user) {
        // Store user data in localStorage for future use
        this.setUser(response.user);
        return response.user;
      }
      
      return null;
    } catch {
      // If API call fails, clear any stored tokens and return null
      this.clearTokens();
      return null;
    }
  }

  /**
   * Check current session and get user profile (returns full AuthResponse)
   */
  async checkSession(): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/api/auth/me', {
        method: 'GET',
      });

      if (response.success) {
        console.log('Dashboard SSO: Session valid');
        return response;
      } else {
        console.log('Dashboard SSO: Session invalid');
        return response;
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Session check failed'
        }
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      // Ensure we have a CSRF token before making the request
      await this.ensureCSRFToken();
      
      const response = await this.request<AuthResponse>('/api/auth/refresh', {
        method: 'POST',
      });

      if (response.success) {
        console.log('Dashboard SSO: Token refreshed successfully');
        
        // Update stored tokens
        if (response.accessToken) {
          this.setAccessToken(response.accessToken);
        }
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
        if (response.user) {
          this.setUser(response.user);
        }
        
        return response;
      } else {
        console.log('Dashboard SSO: Token refresh failed');
        return response;
      }
    } catch (error) {
      console.error('Dashboard SSO: Token refresh error:', error);
      return {
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: error instanceof Error ? error.message : 'Token refresh failed'
        }
      };
    }
  }

  /**
   * Logout and clear all tokens
   */
  async logout(): Promise<AuthResponse> {
    try {
      // Clear localStorage first
      this.clearTokens();
      
      // Ensure we have a CSRF token before making the request
      await this.ensureCSRFToken();
      
      const response = await this.request<AuthResponse>('/api/auth/logout', {
        method: 'POST',
      });

      console.log('Dashboard SSO: Logout completed');
      return response;
    } catch (error) {
      // Even if API call fails, we've cleared local tokens
      console.error('Dashboard SSO: Logout error:', error);
      return {
        success: true, // Consider it successful since we cleared local data
        error: {
          code: 'LOGOUT_ERROR',
          message: error instanceof Error ? error.message : 'Logout failed'
        }
      };
    }
  }

  /**
   * Check if user is authenticated (quick check using localStorage)
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Get stored user without API call
   */
  getUser(): User | null {
    return this.getStoredUser();
  }

  /**
   * Redirect to main site login
   */
  redirectToLogin(): void {
    const mainAppUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/auth/login' 
      : 'https://vikareta.com/auth/login';
    
    // Add current URL as redirect parameter
    const currentUrl = window.location.href;
    const redirectUrl = `${mainAppUrl}?redirect=${encodeURIComponent(currentUrl)}`;
    
    window.location.href = redirectUrl;
  }
}