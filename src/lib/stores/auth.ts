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
}

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid response format');
    }

    if (!response.ok) {
      throw new Error(data.error?.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection');
    }
    throw error;
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
      
      checkAuth: async () => {
        set({ isLoading: true });
        
        let { token } = get();
        
        // If no token in state, try to get from localStorage
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('dashboard_token') || localStorage.getItem('auth_token');
          if (token) {
            set({ token });
          }
        }
        
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        try {
          const response = await apiCall('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const user = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          // Silently logout on auth check failure
          set({ 
            user: null, 
            token: null, 
            refreshToken: null, 
            isAuthenticated: false, 
            error: null,
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