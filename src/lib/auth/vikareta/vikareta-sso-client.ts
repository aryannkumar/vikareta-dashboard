/**
 * Vikareta Platform - Unified SSO Client
 * Secure, consistent SSO implementation across all Vikareta modules  
 * Security: JWT validation, token refresh, CSRF protection
 */

import { 
  VikaretaAuthData, 
  VikaretaAuthState, 
  VikaretaUser,
  VIKARETA_AUTH_CONSTANTS,
  isVikaretaAuthData,
  isVikaretaUser 
} from './vikareta-auth-types';
import { vikaretaCrossDomainAuth } from './vikareta-cross-domain';

export class VikaretaSSOClient {
  private refreshInProgress = false;
  private refreshPromise: Promise<boolean> | null = null;
  private readonly cookieNames = VIKARETA_AUTH_CONSTANTS.COOKIE_NAMES;
  private readonly storageKeys = VIKARETA_AUTH_CONSTANTS.STORAGE_KEYS;

  /**
   * Initialize SSO client with security checks
   */
  async initialize(): Promise<VikaretaAuthState> {
    try {
      console.log('SSO Client: Initializing authentication state...');
      
      // Get stored auth state
      const storedState = vikaretaCrossDomainAuth.getStoredAuthData();
      console.log('SSO Client: Stored auth state:', { 
        isAuthenticated: storedState.isAuthenticated, 
        hasUser: !!storedState.user 
      });
      
      if (storedState.isAuthenticated && storedState.user) {
        // Validate stored user data
        if (!isVikaretaUser(storedState.user)) {
          console.warn('SSO Client: Invalid stored user data, clearing auth state');
          vikaretaCrossDomainAuth.clearAuthData();
          return { user: null, isAuthenticated: false, isLoading: false, error: null, sessionId: null };
        }

        // Try to validate session with backend
        console.log('SSO Client: Validating session with backend...');
        const isValid = await this.validateSession();
        console.log('SSO Client: Session validation result:', isValid);
        
        if (!isValid) {
          console.warn('SSO Client: Session validation failed, clearing auth state');
          vikaretaCrossDomainAuth.clearAuthData();
          return { user: null, isAuthenticated: false, isLoading: false, error: 'Session expired', sessionId: null };
        }

        console.log('SSO Client: Initialization successful with valid session');
        return storedState;
      }

      console.log('SSO Client: No valid stored auth state found');
      return { user: null, isAuthenticated: false, isLoading: false, error: null, sessionId: null };
    } catch (error) {
      console.error('SSO Client: Failed to initialize:', error);
      return { user: null, isAuthenticated: false, isLoading: false, error: 'Initialization failed', sessionId: null };
    }
  }

  /**
   * Perform secure login with validation
   */
  async login(credentials: { email: string; password: string }): Promise<VikaretaAuthState> {
    try {
      console.log('SSO Client: Making login request to /api/auth/login');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getCSRFToken() && { 'X-XSRF-TOKEN': this.getCSRFToken()! })
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      console.log('Login API response:', { success: response.ok, status: response.status, data });

      if (!response.ok) {
        console.error('Login API failed with status:', response.status, data);
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: data.message || data.error?.message || `Login failed (${response.status})`,
          sessionId: null
        };
      }

      // Check if response indicates success
      if (!data.success) {
        console.error('Login API returned success=false:', data);
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: data.message || data.error?.message || 'Login failed',
          sessionId: null
        };
      }

      // Validate required fields
      if (!data.user || !data.accessToken || !data.refreshToken) {
        console.error('Login API missing required fields:', data);
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Invalid login response: missing required fields',
          sessionId: null
        };
      }

      // Transform backend response to expected format
      const authData: VikaretaAuthData = {
        user: data.user,
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tokenType: 'Bearer' as const
        },
        domain: 'dashboard' as const,
        sessionId: data.sessionId
      };

      // Validate transformed data
      if (!isVikaretaAuthData(authData)) {
        console.error('Invalid auth data after transformation:', { original: data, transformed: authData });
        throw new Error('Invalid authentication response structure');
      }

      // Store auth data securely
      vikaretaCrossDomainAuth.storeAuthData(authData);

  // Sync across domains
  await vikaretaCrossDomainAuth.syncSSOAcrossDomains();

      return {
        user: authData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionId: authData.sessionId || null
      };
    } catch (error) {
      console.error('SSO Client: Login failed with error:', error);
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login request failed',
        sessionId: null
      };
    }
  }

  /**
   * Secure token refresh with user validation
   */
  async refreshToken(): Promise<boolean> {
    // Prevent concurrent refresh requests
    if (this.refreshInProgress) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.refreshInProgress = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshInProgress = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Secure logout with cross-domain cleanup
   */
  async logout(): Promise<void> {
    try {
      await vikaretaCrossDomainAuth.logoutFromAllDomains();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force local cleanup even if API fails
      vikaretaCrossDomainAuth.clearAuthData();
    }
  }

  /**
   * Get current user with validation
   */
  getCurrentUser(): VikaretaUser | null {
    const state = vikaretaCrossDomainAuth.getStoredAuthData();
    return state.user && isVikaretaUser(state.user) ? state.user : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const state = vikaretaCrossDomainAuth.getStoredAuthData();
    return state.isAuthenticated && state.user !== null;
  }

  /**
   * Get access token for API calls
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.storageKeys.AUTH_STATE) ? this.getTokenFromCookie() : null;
  }

  /**
   * Validate current session
   */
  private async validateSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data && data.user && isVikaretaUser(data.user);
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Perform actual token refresh
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      // Get current user for validation
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getCSRFToken() && { 'X-XSRF-TOKEN': this.getCSRFToken()! })
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      // Validate refresh response
      if (!data || !data.user || !isVikaretaUser(data.user)) {
        console.error('Invalid refresh response');
        return false;
      }

      // Security: Verify user hasn't changed during refresh
      if (data.user.id !== currentUser.id) {
        console.error('User ID mismatch during token refresh - potential security issue');
        vikaretaCrossDomainAuth.clearAuthData();
        return false;
      }

      // Update stored auth data
      const authData: VikaretaAuthData = {
        user: data.user,
        tokens: {
          accessToken: data.accessToken || '',
          refreshToken: data.refreshToken || '',
          tokenType: 'Bearer'
        },
        sessionId: data.sessionId,
        domain: vikaretaCrossDomainAuth.getCurrentDomain()
      };

      vikaretaCrossDomainAuth.storeAuthData(authData);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Get CSRF token for secure requests
   */
  private getCSRFToken(): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie =>
      cookie.trim().startsWith('XSRF-TOKEN=')
    );

    return csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;
  }

  /**
   * Get access token from cookie
   */
  private getTokenFromCookie(): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie =>
      cookie.trim().startsWith(`${this.cookieNames.ACCESS_TOKEN}=`)
    );

    return tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : null;
  }
}

// Export singleton instance
export const vikaretaSSOClient = new VikaretaSSOClient();