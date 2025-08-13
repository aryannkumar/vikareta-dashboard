/**
 * Cross-Domain CSRF Token Manager for Dashboard
 * Handles CSRF tokens for cross-domain authentication between vikareta.com and dashboard.vikareta.com
 */

interface CSRFTokenData {
  token: string;
  expiry: number;
  domain: string;
}

export class DashboardCSRFManager {
  private static tokens: Map<string, CSRFTokenData> = new Map();
  private static isRefreshing: Map<string, boolean> = new Map();
  private static refreshPromises: Map<string, Promise<string | null>> = new Map();

  /**
   * Get CSRF token for the current domain or a specific domain
   */
  static async getToken(targetDomain?: string): Promise<string | null> {
    const domain = targetDomain || this.getCurrentDomain();
    const cacheKey = this.getCacheKey(domain);

    // Check if token is still valid
    const cachedToken = this.tokens.get(cacheKey);
    if (cachedToken && Date.now() < cachedToken.expiry) {
      console.log(`Dashboard CSRF: Using cached token for ${domain}`);
      return cachedToken.token;
    }

    // If already refreshing for this domain, wait for the existing refresh
    if (this.isRefreshing.get(cacheKey) && this.refreshPromises.has(cacheKey)) {
      console.log(`Dashboard CSRF: Waiting for existing refresh for ${domain}`);
      return this.refreshPromises.get(cacheKey)!;
    }

    // Start refreshing
    console.log(`Dashboard CSRF: Fetching new token for ${domain}`);
    this.isRefreshing.set(cacheKey, true);
    const refreshPromise = this.fetchTokenForDomain(domain);
    this.refreshPromises.set(cacheKey, refreshPromise);

    try {
      const token = await refreshPromise;
      return token;
    } finally {
      this.isRefreshing.set(cacheKey, false);
      this.refreshPromises.delete(cacheKey);
    }
  }

  /**
   * Fetch CSRF token for a specific domain
   */
  private static async fetchTokenForDomain(domain: string): Promise<string | null> {
    try {
      const apiUrl = this.getApiUrlForDomain(domain);
      const csrfEndpoint = `${apiUrl}/csrf-token`;

      console.log(`Dashboard CSRF: Fetching token from ${csrfEndpoint} for domain ${domain}`);

      const response = await fetch(csrfEndpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': this.getOriginForDomain(domain),
          'X-Requested-With': 'XMLHttpRequest',
          'X-Cross-Domain-Auth': 'true',
          'X-Dashboard-Request': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Dashboard CSRF: Response for ${domain}:`, data);

        if (data.success && data.data && data.data.csrfToken) {
          const tokenData: CSRFTokenData = {
            token: data.data.csrfToken,
            expiry: Date.now() + (25 * 60 * 1000), // 25 minutes
            domain: domain,
          };

          this.tokens.set(this.getCacheKey(domain), tokenData);
          console.log(`Dashboard CSRF: Token cached for ${domain}`);
          return tokenData.token;
        } else {
          console.error(`Dashboard CSRF: Invalid response structure for ${domain}:`, data);
        }
      } else {
        console.error(`Dashboard CSRF: HTTP error ${response.status} for ${domain}`);
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Dashboard CSRF: Error response:`, errorText);

        // Try alternative approach for cross-domain
        if (response.status === 403 || response.status === 401) {
          return this.tryAlternativeCSRFMethod(domain);
        }
      }
    } catch (error) {
      console.error(`Dashboard CSRF: Network error for ${domain}:`, error);
      return this.tryAlternativeCSRFMethod(domain);
    }

    return null;
  }

  /**
   * Alternative CSRF method for cross-domain scenarios
   */
  private static async tryAlternativeCSRFMethod(domain: string): Promise<string | null> {
    console.log(`Dashboard CSRF: Trying alternative method for ${domain}`);

    try {
      // Method 1: Try with different credentials mode
      const apiUrl = this.getApiUrlForDomain(domain);
      const response = await fetch(`${apiUrl}/csrf-token`, {
        method: 'GET',
        credentials: 'omit', // Don't send cookies
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Cross-Domain-Auth': 'true',
          'X-Dashboard-Request': 'true',
          'X-Requested-From': domain,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.csrfToken) {
          const tokenData: CSRFTokenData = {
            token: data.data.csrfToken,
            expiry: Date.now() + (25 * 60 * 1000),
            domain: domain,
          };

          this.tokens.set(this.getCacheKey(domain), tokenData);
          console.log(`Dashboard CSRF: Alternative method succeeded for ${domain}`);
          return tokenData.token;
        }
      }
    } catch (error) {
      console.error(`Dashboard CSRF: Alternative method failed for ${domain}:`, error);
    }

    // Method 2: Generate a temporary token for cross-domain auth
    return this.generateTemporaryToken(domain);
  }

  /**
   * Generate a temporary token for cross-domain authentication
   */
  private static generateTemporaryToken(domain: string): string | null {
    console.log(`Dashboard CSRF: Generating temporary token for ${domain}`);
    
    const timestamp = Date.now();
    const tempToken = `dashboard_temp_${domain.replace(/\./g, '_')}_${timestamp}`;
    
    const tokenData: CSRFTokenData = {
      token: tempToken,
      expiry: Date.now() + (5 * 60 * 1000), // 5 minutes only
      domain: domain,
    };

    this.tokens.set(this.getCacheKey(domain), tokenData);
    console.log(`Dashboard CSRF: Temporary token generated: ${tempToken}`);
    
    return tempToken;
  }

  /**
   * Clear token for a specific domain
   */
  static clearToken(domain?: string): void {
    const targetDomain = domain || this.getCurrentDomain();
    const cacheKey = this.getCacheKey(targetDomain);
    
    console.log(`Dashboard CSRF: Clearing token for ${targetDomain}`);
    this.tokens.delete(cacheKey);
  }

  /**
   * Clear all tokens
   */
  static clearAllTokens(): void {
    console.log('Dashboard CSRF: Clearing all tokens');
    this.tokens.clear();
    this.isRefreshing.clear();
    this.refreshPromises.clear();
  }

  /**
   * Get current domain from window.location
   */
  private static getCurrentDomain(): string {
    if (typeof window === 'undefined') {
      return 'localhost';
    }
    return window.location.hostname;
  }

  /**
   * Get cache key for domain
   */
  private static getCacheKey(domain: string): string {
    return `dashboard_csrf_${domain}`;
  }

  /**
   * Get API URL for a specific domain
   */
  private static getApiUrlForDomain(domain: string): string {
    // In development, always use localhost backend
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:8000';
    }

    // In production, use the main API regardless of domain
    return 'https://api.vikareta.com';
  }

  /**
   * Get origin for a specific domain
   */
  private static getOriginForDomain(domain: string): string {
    if (process.env.NODE_ENV === 'development') {
      if (domain.includes('dashboard') || domain.includes('3001')) {
        return 'http://localhost:3001';
      }
      return 'http://localhost:3000';
    }

    if (domain.includes('dashboard')) {
      return 'https://dashboard.vikareta.com';
    }
    return 'https://vikareta.com';
  }

  /**
   * Get debug information
   */
  static getDebugInfo(): any {
    return {
      currentDomain: this.getCurrentDomain(),
      cachedTokens: Array.from(this.tokens.entries()).map(([key, data]) => ({
        key,
        domain: data.domain,
        hasToken: !!data.token,
        tokenPreview: data.token.substring(0, 10) + '...',
        expiry: new Date(data.expiry).toISOString(),
        isExpired: Date.now() > data.expiry,
      })),
      refreshingDomains: Array.from(this.isRefreshing.entries()),
    };
  }
}

// Export singleton instance
export const dashboardCSRFManager = DashboardCSRFManager;