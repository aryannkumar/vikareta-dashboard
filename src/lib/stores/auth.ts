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
  verificationTier?: 'basic' | 'verified' | 'premium';
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
          const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });

          const { user, tokens } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard_token', tokens.accessToken);
            if (tokens.refreshToken) {
              localStorage.setItem('dashboard_refresh_token', tokens.refreshToken);
            }
          }

          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('dashboard_token');
          localStorage.removeItem('dashboard_refresh_token');
        }
        set({ 
          user: null, 
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null 
        });
      },
      
      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await apiCall('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          });

          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard_token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('dashboard_refresh_token', newRefreshToken);
            }
          }

          set({
            token: newToken,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
          get().logout();
        }
      },
      
      updateProfile: async (data: Partial<User>) => {
        const { token } = get();
        if (!token) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        
        try {
          const response = await apiCall('/auth/profile', {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          const { user } = response.data;
          
          set({
            user,
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('dashboard_token', token);
          localStorage.setItem('auth_token', token);
        }
        set({ 
          token,
          isLoading: false // Ensure loading state is cleared when token is set
        });
      },
      
      checkAuth: async () => {
        // Prevent multiple simultaneous auth checks
        const currentState = get();
        if (currentState.isLoading) {
          console.log('Dashboard Auth: Auth check already in progress, skipping');
          return;
        }
        
        set({ isLoading: true });
        
        let { token } = get();
        
        // If no token in state, try to get from localStorage
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('dashboard_token') || localStorage.getItem('auth_token');
          if (token) {
            console.log('Dashboard Auth: Found token in localStorage');
            set({ token });
          }
        }
        
        if (!token) {
          console.log('Dashboard Auth: No token found');
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        console.log('Dashboard Auth: Checking token with backend...');

        try {
          const response = await apiCall('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const user = response.data;
          
          // Validate user data before setting state
          if (!user || !user.id) {
            throw new Error('Invalid user data received');
          }
          
          console.log('Dashboard Auth: User authenticated successfully', {
            id: user.id,
            email: user.email,
            role: user.userType || user.role
          });
          
          set({
            user: {
              ...user,
              role: user.userType || user.role, // Normalize role field
            },
            token,
            isAuthenticated: true,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Dashboard Auth: Authentication failed', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          
          // Check if it's a network error
          if (errorMessage.includes('Network connection failed') || errorMessage.includes('fetch')) {
            console.warn('Dashboard Auth: Network error during authentication, keeping current state');
            // Don't clear tokens on network errors, just set loading to false
            set({ 
              isLoading: false,
              error: 'Network connection issue - please check your internet connection'
            });
            return;
          }
          
          // For other errors (invalid token, etc.), clear authentication
          console.log('Dashboard Auth: Clearing authentication due to non-network error');
          set({ 
            user: null, 
            token: null, 
            refreshToken: null, 
            isAuthenticated: false, 
            error: errorMessage,
            isLoading: false,
          });
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('dashboard_token');
            localStorage.removeItem('dashboard_refresh_token');
            localStorage.removeItem('auth_token');
          }
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