'use client';

import { useAuthStore } from '@/lib/stores/auth';

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  } = useAuthStore();

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Computed
    isAdmin: user?.userType === 'admin',
    isSeller: user?.userType === 'seller' || user?.userType === 'both',
    isBuyer: user?.userType === 'buyer' || user?.userType === 'both',
    isVerified: user?.isVerified || false,
    verificationTier: user?.verificationTier || 'basic',
    
    // Actions
    login,
    logout,
  };
}