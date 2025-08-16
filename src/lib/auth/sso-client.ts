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

  // Rate limiting and retry logic
  private refreshInProgress = false;
  private refreshPromise: Promise<AuthResponse> | null = null;
  private lastRefreshAttempt = 0;
  private refreshRetryCount = 0;
  private readonly MAX_REFRESH_RETRIES = 3;
  private readonly REFRESH_COOLDOWN = 5000; // 5 seconds
  private readonly RATE_LIMIT_COOLDOWN = 60000; // 1 minute
  private rateLimitedUntil = 0;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.vikareta.com';
  }

  /**
   * LocalStorage helpers for token management
   */
  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      // Also store in legacy locations for compatibility
      localStorage.setItem('dashboard_token', token);
      localStorage.setItem('auth_token', token);
      
      // Also set as cookie for cross-domain support
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = isProduction 
        ? '; domain=.vikareta.com; secure; samesite=none' 
        : '';
      document.cookie = `vikareta_access_token=${token}; path=/; max-age=3600${cookieOptions}`;
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
      
      // Also set as cookie for cross-domain support
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = isProduction 
        ? '; domain=.vikareta.com; secure; samesite=none' 
        : '';
      document.cookie = `vikareta_refresh_token=${token}; path=/; max-age=604800${cookieOptions}`;
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  /**
   * Get access token from cookies (for cross-domain auth)
   */
  private getTokenFromCookie(): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('vikareta_access_token=')
    );
    
    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.split('=')[1]);
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

    // Reset refresh state
    this.refreshInProgress = false;
    this.refreshPromise = null;
    this.refreshRetryCount = 0;
  }

  /**
   * Check if we're currently rate limited
   */
  private isRateLimited(): boolean {
    return Date.now() < this.rateLimitedUntil;
  }

  /**
   * Set rate limit cooldown
   */
  private setRateLimited(): void {
    this.rateLimitedUntil = Date.now() + this.RATE_LIMIT_COOLDOWN;
    console.warn('SSO: Rate limited, cooling down for 1 minute');
  }

  /**
   * Check if we should attempt refresh (with cooldown)
   */
  private shouldAttemptRefresh(): boolean {
    const now = Date.now();
    const timeSinceLastAttempt = now - this.lastRefreshAttempt;

    return (
      !this.refreshInProgress &&
      !this.isRateLimited() &&
      this.refreshRetryCount < this.MAX_REFRESH_RETRIES &&
      timeSinceLastAttempt > this.REFRESH_COOLDOWN
    );
  }

  /**
   * Exponential backoff delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
          document.cookie = `XSRF-TOKEN=${data.data.csrfToken}; path=/; max-age=3600${process.env.NODE_ENV === 'production' ? '; domain=.vikareta.com; secure; samesite=none' : ''
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
    options: RequestInit = {},
    skipRefresh = false
  ): Promise<T> {
    // Check if we're rate limited
    if (this.isRateLimited()) {
      throw new Error('Rate limited - please wait before making more requests');
    }

    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      credentials: 'include', // Still include for CSRF cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add access token from localStorage (primary method)
    let accessToken = this.getAccessToken();
    
    // Fallback to cookie token for cross-domain auth
    if (!accessToken) {
      accessToken = this.getTokenFromCookie();
      // If we found a token in cookies, also store it in localStorage for future use
      if (accessToken) {
        this.setAccessToken(accessToken);
      }
    }
    
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
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          this.setRateLimited();
          throw new Error('Too many requests - please wait before trying again');
        }

        // If 401 and we have a token, try to refresh (but avoid infinite loops)
        if (response.status === 401 && accessToken && !skipRefresh && this.shouldAttemptRefresh()) {
          console.log('SSO: Attempting token refresh due to 401');
          const refreshed = await this.tryRefreshToken();
          if (refreshed) {
            // Retry the original request with new token, but skip refresh on retry
            return this.request(endpoint, options, true);
          } else {
            // Refresh failed, clear tokens and throw error
            this.clearTokens();
            throw new Error('Authentication failed - please log in again');
          }
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Reset retry count on successful request
      this.refreshRetryCount = 0;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`SSO: Request failed to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Try to refresh access token using refresh token with proper error handling
   */
  private async tryRefreshToken(): Promise<boolean> {
    // If refresh is already in progress, wait for it
    if (this.refreshInProgress && this.refreshPromise) {
      try {
        const result = await this.refreshPromise;
        return result.success;
      } catch {
        return false;
      }
    }

    // Check if we should attempt refresh
    if (!this.shouldAttemptRefresh()) {
      console.warn('SSO: Skipping refresh attempt due to cooldown or retry limit');
      return false;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('SSO: No refresh token available');
      this.clearTokens();
      return false;
    }

    // Mark refresh as in progress
    this.refreshInProgress = true;
    this.lastRefreshAttempt = Date.now();
    this.refreshRetryCount++;

    try {
      console.log(`SSO: Attempting token refresh (attempt ${this.refreshRetryCount}/${this.MAX_REFRESH_RETRIES})`);

      // Add exponential backoff delay
      if (this.refreshRetryCount > 1) {
        const delay = Math.min(1000 * Math.pow(2, this.refreshRetryCount - 1), 10000);
        console.log(`SSO: Waiting ${delay}ms before refresh attempt`);
        await this.delay(delay);
      }

      this.refreshPromise = this.refreshToken();
      const response = await this.refreshPromise;

      if (response.success) {
        console.log('SSO: Token refresh successful');
        this.refreshRetryCount = 0; // Reset on success
        return true;
      } else {
        console.warn('SSO: Token refresh failed:', response.error?.message);

        // If we've exhausted retries, clear tokens
        if (this.refreshRetryCount >= this.MAX_REFRESH_RETRIES) {
          console.error('SSO: Max refresh retries exceeded, clearing tokens');
          this.clearTokens();
        }

        return false;
      }
    } catch (error) {
      console.error('SSO: Token refresh error:', error);

      // If we've exhausted retries, clear tokens
      if (this.refreshRetryCount >= this.MAX_REFRESH_RETRIES) {
        console.error('SSO: Max refresh retries exceeded, clearing tokens');
        this.clearTokens();
      }

      return false;
    } finally {
      this.refreshInProgress = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Login with username/password and store tokens in localStorage
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Check if we're rate limited
      if (this.isRateLimited()) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please wait before trying again.'
          }
        };
      }

      // Clear any existing tokens before login
      this.clearTokens();

      // Ensure we have a CSRF token before making the request
      await this.ensureCSRFToken();

      const response = await this.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }, true); // Skip refresh on login

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

        // Reset rate limiting on successful login
        this.rateLimitedUntil = 0;
        this.refreshRetryCount = 0;
      }

      return response;
    } catch (error) {
      // Handle rate limiting specifically
      if (error instanceof Error && error.message.includes('Too many requests')) {
        this.setRateLimited();
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please wait 1 minute before trying again.'
          }
        };
      }

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

        // Store tokens if provided (for cross-domain compatibility)
        if (response.accessToken) {
          this.setAccessToken(response.accessToken);
        }
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }

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
        // Store user data and tokens if provided
        if (response.user) {
          this.setUser(response.user);
        }
        if (response.accessToken) {
          this.setAccessToken(response.accessToken);
        }
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }

        return response;
      } else {
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

      // Make refresh request without retry logic to avoid infinite loops
      const url = `${this.baseURL}/api/auth/refresh`;
      const config: RequestInit = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Add CSRF token
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        config.headers = {
          ...config.headers,
          'X-XSRF-TOKEN': csrfToken,
        };
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 429) {
          this.setRateLimited();
          throw new Error('Too many refresh attempts');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update stored tokens
        if (data.accessToken) {
          this.setAccessToken(data.accessToken);
        }
        if (data.refreshToken) {
          this.setRefreshToken(data.refreshToken);
        }
        if (data.user) {
          this.setUser(data.user);
        }

        return data;
      } else {
        return data;
      }
    } catch (error) {
      console.error('SSO: Token refresh error:', error);
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

    // Add dashboard URL as redirect parameter so user can choose to go to dashboard after login
    const dashboardUrl = window.location.origin + '/dashboard';
    const redirectUrl = `${mainAppUrl}?redirect_to=dashboard&dashboard_url=${encodeURIComponent(dashboardUrl)}`;

    window.location.href = redirectUrl;
  }
}