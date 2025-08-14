/**
 * Dashboard SSO Authentication Hook
 * Handles authentication state for dashboard.vikareta.com
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SSOAuthClient, User } from './sso-client';

// Create dashboard SSO client instance
const dashboardSSO = new SSOAuthClient();

interface DashboardAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  redirectToLogin: () => void;
  clearError: () => void;
}

const DashboardAuthContext = createContext<DashboardAuthContextType | undefined>(undefined);

interface DashboardAuthProviderProps {
  children: ReactNode;
}

export function DashboardSSOProvider({ children }: DashboardAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  /**
   * Check session on app load and periodically
   */
  const checkSession = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardSSO.checkSession();

      if (response.success && response.user) {
        setUser(response.user);
        setError(null);
      } else {
        setUser(null);
        if (response.error?.code !== 'SESSION_ERROR') {
          setError(response.error?.message || 'Session check failed');
        }
      }
    } catch (err) {
      console.error('Dashboard session check failed:', err);
      setUser(null);
      setError('Session check failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout and clear session
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await dashboardSSO.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Dashboard logout failed:', err);
      // Clear local state even if logout request fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh session manually
   */
  const refreshSession = async () => {
    await checkSession();
  };

  /**
   * Redirect to main site login
   */
  const redirectToLogin = () => {
    dashboardSSO.redirectToLogin();
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Set up periodic session check (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Listen for storage events to sync logout across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sso_logout' && e.newValue) {
        setUser(null);
        setError(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-redirect to login if not authenticated after loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        redirectToLogin();
      }, 2000); // 2 second delay to show the login prompt

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  const value: DashboardAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    refreshSession,
    redirectToLogin,
    clearError,
  };

  return (
    <DashboardAuthContext.Provider value={value}>
      {children}
    </DashboardAuthContext.Provider>
  );
}

/**
 * Hook to use dashboard SSO authentication
 */
export function useDashboardSSO() {
  const context = useContext(DashboardAuthContext);
  if (context === undefined) {
    throw new Error('useDashboardSSO must be used within a DashboardSSOProvider');
  }
  return context;
}

/**
 * Higher-order component for protected dashboard routes
 */
export function withDashboardAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedDashboardComponent(props: P) {
    const { isAuthenticated, isLoading, redirectToLogin } = useDashboardSSO();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access the dashboard. You will be redirected to the login page.
            </p>
            <button
              onClick={redirectToLogin}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}