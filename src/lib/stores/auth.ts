'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials: { email: string; password: string }) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          const mockUser: User = {
            id: '1',
            email: credentials.email,
            firstName: 'John',
            lastName: 'Doe',
            businessName: 'Acme Corp',
            role: 'seller',
            verificationTier: 'verified',
            isVerified: true,
            phone: '+1234567890',
            gstin: 'GST123456789',
            createdAt: new Date().toISOString(),
          };
          
          const mockToken = 'mock-jwt-token';
          
          set({ 
            user: mockUser, 
            token: mockToken,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          });
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false,
          error: null 
        });
      },
      
      refreshAuth: async () => {
        const { token } = get();
        if (!token) return;
        
        set({ isLoading: true });
        try {
          // Simulate token refresh
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch {
          set({ 
            error: 'Session expired', 
            isLoading: false,
            user: null,
            token: null,
            isAuthenticated: false
          });
        }
      },
      
      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            user: { ...user, ...data },
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Update failed', 
            isLoading: false 
          });
        }
      },
      
      clearError: () => set({ error: null }),
      
      checkAuth: async () => {
        const { token } = get();
        if (!token) return;
        
        set({ isLoading: true });
        try {
          // Simulate auth check
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch {
          set({ 
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Authentication failed'
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);