'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vikareta.com/api';

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  role?: 'admin' | 'seller' | 'buyer' | 'both';
  verificationTier?: string;
  isVerified?: boolean;
  phone?: string;
  gstin?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastAuthCheck?: number;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  setToken: (token: string) => void;
}

// Legacy API call function - kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const apiCall = async (endpoint: string, options: RequestInit = {}, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Ensure proper URL construction - add leading slash if missing
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const fullUrl = `${API_BASE_URL}${normalizedEndpoint}`;
      
      // API call attempt
      
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        signal: controller.signal,
        ...options,
      });
      
      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        const errorMessage = data.error?.message || data.message || `Request failed with status ${response.status}`;
        console.error('API request failed:', { status: response.status, error: errorMessage });
        throw new Error(errorMessage);
      }

      // API request successful
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API call attempt ${attempt} failed:`, error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (attempt === retries) {
          throw new Error('Network connection failed - please check your internet connection and try again');
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        if (attempt === retries) {
          throw new Error('Request timeout - server is taking too long to respond');
        }
        // Wait before retry for timeout errors
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      // For non-network errors, don't retry
      throw error;
    }
  }
};

import { SSOAuthClient } from '@/lib/auth/sso-client';

// Create SSO client instance
const ssoClient = new SSOAuthClient();

// Token refresh interval (45 minutes - before 1 hour expiry)
let refreshInterval: NodeJS.Timeout | null = null;

const startTokenRefreshInterval = (refreshAuth: () => Promise<void>) => {
  console.log('Dashboard Auth: Starting automatic token refresh interval');
  
  // Clear existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Set up new interval to refresh token every 45 minutes
  refreshInterval = setInterval(async () => {
    console.log('Dashboard Auth: Automatic token refresh triggered');
    try {
      await refreshAuth();
      console.log('Dashboard Auth: Token refreshed automatically');
    } catch (error) {
      console.warn('Dashboard Auth: Automatic token refresh failed', error);
      
      // If automatic refresh fails with specific errors, stop the interval
      if (error instanceof Error && 
          (error.message.includes('Rate limited') || 
           error.message.includes('Authentication failed') ||
           error.message.includes('Session expired'))) {
        console.warn('Dashboard Auth: Stopping automatic refresh due to persistent errors');
        stopTokenRefreshInterval();
      }
    }
  }, 45 * 60 * 1000); // 45 minutes
};

const stopTokenRefreshInterval = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Updated auth store using SSO client
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials: { email: string; password: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ssoClient.login(credentials);

          if (response.success && response.user) {
            set({
              user: response.user,
              token: response.accessToken || null,
              refreshToken: response.refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Start automatic token refresh
            startTokenRefreshInterval(get().refreshAuth);
          } else {
            throw new Error(response.error?.message || 'Login failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
      
      logout: async () => {
        // Stop automatic token refresh
        stopTokenRefreshInterval();
        
        await ssoClient.logout();
        set({ 
          user: null, 
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null 
        });
      },
      
      refreshAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await ssoClient.refreshToken();
          
          if (response.success) {
            set({
              token: response.accessToken || null,
              refreshToken: response.refreshToken || null,
              user: response.user || get().user,
              error: null,
            });
          } else {
            // Handle specific error codes
            if (response.error?.code === 'RATE_LIMITED') {
              console.warn('Dashboard Auth: Rate limited during refresh');
              set({ 
                error: 'Too many requests. Please wait before trying again.',
                isLoading: false
              });
              return; // Don't logout on rate limit
            }
            
            // For other errors, logout
            console.warn('Dashboard Auth: Token refresh failed, logging out');
            await get().logout();
          }
        } catch (error) {
          console.error('Dashboard Auth: Token refresh failed:', error);
          
          // Don't logout if it's a rate limit error
          if (error instanceof Error && error.message.includes('Rate limited')) {
            set({ 
              error: 'Too many requests. Please wait before trying again.',
              isLoading: false
            });
            return;
          }
          
          await get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateProfile: async (data: Partial<User>) => {
        if (!get().isAuthenticated) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        
        try {
          // Use SSO client for profile updates (you may need to add this method to SSO client)
          const user = await ssoClient.getCurrentUser();
          if (!user) throw new Error('User not found');
          
          // For now, just update the local user data
          // TODO: Implement updateProfile method in SSO client
          const updatedUser = { ...user, ...data };
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
      
      clearError: () => set({ error: null }),
      
      setToken: (token: string) => {
        
        // Store token in the unified SSO format
        if (typeof window !== 'undefined') {
          localStorage.setItem('vikareta_access_token', token);
          // Also store in legacy locations for compatibility
          localStorage.setItem('dashboard_token', token);
          localStorage.setItem('auth_token', token);
        }
        
        // Update the SSO client's token as well
        try {
          // Create a new SSO client instance and set the token
          const tempSSOClient = new SSOAuthClient();
          // The token is now in localStorage, so the SSO client will pick it up automatically
        } catch (error) {
          console.warn('Dashboard Auth: Could not update SSO client token:', error);
        }
        
        // Update state with token and clear loading
        set({ 
          token,
          isLoading: false,
          error: null // Clear any previous errors
        });
        
        // Token set successfully
      },
      
      checkAuth: async () => {
        // Prevent multiple simultaneous auth checks
        const currentState = get();
        if (currentState.isLoading) {
          return;
        }

        // Throttle auth checks - don't check more than once every 5 seconds
        const lastCheck = get().lastAuthCheck || 0;
        const now = Date.now();
        if (now - lastCheck < 5000) {
          return;
        }
        
        set({ isLoading: true, lastAuthCheck: now });

        try {
          // Check if we have a token first
          const hasToken = typeof window !== 'undefined' && 
            (localStorage.getItem('vikareta_access_token') || localStorage.getItem('dashboard_token'));
          
          if (!hasToken) {
            // No token available, set as unauthenticated
            stopTokenRefreshInterval();
            set({ 
              user: null, 
              token: null, 
              refreshToken: null, 
              isAuthenticated: false, 
              error: null,
              isLoading: false,
            });
            return;
          }
          
          const user = await ssoClient.getCurrentUser();
          
          if (user) {
            set({
              user,
              token: localStorage.getItem('vikareta_access_token'),
              isAuthenticated: true,
              error: null,
              isLoading: false,
            });
            
            // Start automatic token refresh if not already running
            if (!refreshInterval) {
              startTokenRefreshInterval(get().refreshAuth);
            }
          } else {
            // If we have a token but no user, try to refresh first
            try {
              await get().refreshAuth();
              // After refresh, try to get user again
              const refreshedUser = await ssoClient.getCurrentUser();
              if (refreshedUser) {
                set({
                  user: refreshedUser,
                  token: localStorage.getItem('vikareta_access_token'),
                  isAuthenticated: true,
                  error: null,
                  isLoading: false,
                });
                
                // Start automatic token refresh if not already running
                if (!refreshInterval) {
                  startTokenRefreshInterval(get().refreshAuth);
                }
                return;
              }
            } catch (refreshError) {
              console.warn('Dashboard Auth: Token refresh failed during auth check', refreshError);
            }
            
            // If refresh failed or still no user, clear authentication
            stopTokenRefreshInterval();
            set({ 
              user: null, 
              token: null, 
              refreshToken: null, 
              isAuthenticated: false, 
              error: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.warn('Dashboard Auth: Authentication check failed', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          
          // Check if it's a 401 error (unauthorized) - try refresh first
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            try {
              await get().refreshAuth();
              // After refresh, try auth check again (but only once to prevent loops)
              const user = await ssoClient.getCurrentUser();
              if (user) {
                set({
                  user,
                  token: localStorage.getItem('vikareta_access_token'),
                  isAuthenticated: true,
                  error: null,
                  isLoading: false,
                });
                
                // Start automatic token refresh if not already running
                if (!refreshInterval) {
                  startTokenRefreshInterval(get().refreshAuth);
                }
                return;
              }
            } catch (refreshError) {
              console.warn('Dashboard Auth: Token refresh failed on 401', refreshError);
            }
            
            // Clear authentication for 401 errors after refresh attempt
            stopTokenRefreshInterval();
            set({ 
              user: null, 
              token: null, 
              refreshToken: null, 
              isAuthenticated: false, 
              error: null,
              isLoading: false,
            });
            return;
          }
          
          // For network errors, keep current state but stop loading
          set({ 
            isLoading: false,
            error: null // Don't show error for auth checks
          });
        }
      },
    }),
    {
      name: 'dashboard-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);