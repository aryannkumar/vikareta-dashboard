'use client';

import { useAuthStore } from '@/lib/stores/auth';

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshAuth,
    updateProfile,
    clearError,
    checkAuth,
  } = useAuthStore();

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Computed
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller' || user?.role === 'both',
    isBuyer: user?.role === 'buyer' || user?.role === 'both',
    isVerified: user?.isVerified || false,
    verificationTier: user?.verificationTier || 'basic',
    
    // Actions
    login,
    logout,
    refreshAuth,
    updateProfile,
    clearError,
    checkAuth,
  };
}