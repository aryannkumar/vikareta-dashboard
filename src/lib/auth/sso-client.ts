/**
 * Dashboard SSO Authentication Client
 * Handles cross-subdomain authentication for dashboard.vikareta.com
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
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: {
    code: string;
    message: string;
  };
}

export class DashboardSSOClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5001' 
      : 'https://api.vikareta.com';
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
        // Token should now be set in cookies
        console.log('Dashboard SSO: CSRF token obtained');
      }
    } catch (error) {
      console.warn('Dashboard SSO: Failed to get CSRF token:', error);
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
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // CRITICAL: Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

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
   * Check current session and get user profile
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
      console.error('Dashboard SSO: Session check error:', error);
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
   * Logout and clear all cookies across subdomains
   */
  async logout(): Promise<AuthResponse> {
    try {
      // Ensure we have a CSRF token before making the request
      await this.ensureCSRFToken();
      
      const response = await this.request<AuthResponse>('/api/auth/logout', {
        method: 'POST',
      });

      console.log('Dashboard SSO: Logout completed');
      // Cookies are automatically cleared by the server
      
      // Signal logout to other tabs/windows
      if (typeof window !== 'undefined') {
        localStorage.setItem('sso_logout', Date.now().toString());
        localStorage.removeItem('sso_logout');
      }
      
      return response;
    } catch (error) {
      console.error('Dashboard SSO: Logout error:', error);
      return {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error instanceof Error ? error.message : 'Logout failed'
        }
      };
    }
  }

  /**
   * Redirect to main site login
   */
  redirectToLogin(): void {
    const mainSiteUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://vikareta.com';
    
    const dashboardUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://dashboard.vikareta.com';
    
    const loginUrl = `${mainSiteUrl}/auth/login?redirect=${encodeURIComponent(dashboardUrl)}`;
    
    console.log('Dashboard SSO: Redirecting to login:', loginUrl);
    window.location.href = loginUrl;
  }
}

// Export singleton instance
export const dashboardSSO = new DashboardSSOClient();