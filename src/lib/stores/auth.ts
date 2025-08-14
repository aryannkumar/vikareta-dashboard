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
      
      console.log(`API Call attempt ${attempt}/${retries}: ${fullUrl}`);
      
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

      console.log('API request successful:', endpoint);
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
        try {
          const response = await ssoClient.refreshToken();
          
          if (response.success) {
            set({
              token: response.accessToken || null,
              refreshToken: response.refreshToken || null,
              user: response.user || get().user,
            });
          } else {
            await get().logout();
          }
        } catch {
          await get().logout();
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
        console.log('Dashboard Auth: Setting token from cross-domain redirect');
        
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
        
        console.log('Dashboard Auth: Token set successfully in localStorage and auth store');
      },
      
      checkAuth: async () => {
        // Prevent multiple simultaneous auth checks
        const currentState = get();
        if (currentState.isLoading) {
          console.log('Dashboard Auth: Auth check already in progress, skipping');
          return;
        }
        
        set({ isLoading: true });
        
        console.log('Dashboard Auth: Checking authentication with SSO client...');

        try {
          // Check if we have a token first
          const hasToken = typeof window !== 'undefined' && 
            (localStorage.getItem('vikareta_access_token') || localStorage.getItem('dashboard_token'));
          
          console.log('Dashboard Auth: Token available:', !!hasToken);
          
          const user = await ssoClient.getCurrentUser();
          
          if (user) {
            console.log('Dashboard Auth: User authenticated successfully', {
              id: user.id,
              email: user.email,
              role: user.role
            });
            
            set({
              user,
              token: hasToken ? localStorage.getItem('vikareta_access_token') : null,
              isAuthenticated: true,
              error: null,
              isLoading: false,
            });
          } else {
            console.log('Dashboard Auth: No authenticated user found');
            
            // If we have a token but no user, there might be an issue with the token
            if (hasToken) {
              console.warn('Dashboard Auth: Token exists but user not found - token may be invalid');
            }
            
            set({ 
              user: null, 
              token: null, 
              refreshToken: null, 
              isAuthenticated: false, 
              error: hasToken ? 'Invalid or expired token' : null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Dashboard Auth: Authentication failed', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          
          // Check if it's a network error
          if (errorMessage.includes('Network connection failed') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
            console.warn('Dashboard Auth: Network error during authentication, keeping current state');
            set({ 
              isLoading: false,
              error: 'Network connection issue - please check your internet connection'
            });
            return;
          }
          
          // For other errors (invalid token, etc.), clear authentication
          console.log('Dashboard Auth: Clearing authentication due to error:', errorMessage);
          set({ 
            user: null, 
            token: null, 
            refreshToken: null, 
            isAuthenticated: false, 
            error: errorMessage,
            isLoading: false,
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