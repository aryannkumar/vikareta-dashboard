'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  // const { sidebarCollapsed } = useDashboardStore();

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);

    // Handle cross-domain authentication - only once per page load
    if (typeof window !== 'undefined') {
      // Check if token processing is already in progress
      const tokenProcessingFlag = sessionStorage.getItem('token_processing');
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const redirectSource = urlParams.get('source');

      console.log('Dashboard: Checking URL parameters', {
        hasToken: !!token,
        source: redirectSource,
        url: window.location.href,
        tokenProcessing: !!tokenProcessingFlag
      });

      if (token && !tokenProcessingFlag) {
        // Mark token processing as in progress
        sessionStorage.setItem('token_processing', 'true');
        
        console.log('Dashboard: Received token from URL, setting up authentication...');
        console.log('Dashboard: Redirect source:', redirectSource);

        // Store the token in both locations for compatibility
        localStorage.setItem('dashboard_token', token);
        localStorage.setItem('auth_token', token);

        // Clean up URL immediately to prevent token exposure
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        // Set token in auth store and check authentication
        useAuthStore.getState().setToken(token);

        // Small delay to ensure token is properly set before checking auth
        setTimeout(() => {
          checkAuth();
        }, 100);
      } else if (!token && !tokenProcessingFlag) {
        console.log('Dashboard: No token in URL, checking existing authentication');
        sessionStorage.setItem('token_processing', 'true');
        // Check if we have existing auth
        checkAuth();
      }
    }
  }, [checkAuth]);

  // Clear auth attempt timestamp when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Dashboard: Authentication successful');
      sessionStorage.removeItem('auth_attempt_timestamp');
      sessionStorage.removeItem('token_processing'); // Clear token processing flag

      // If we're on the root path, redirect to the main dashboard
      if (pathname === '/') {
        console.log('Dashboard: On root path, redirecting to /dashboard');
        // Use router.replace instead of window.location for better UX
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 100);
      }
    }
  }, [isAuthenticated, user, pathname]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Authenticating..." />
      </div>
    );
  }

  // If not authenticated, redirect to main app login
  if (!isAuthenticated || !user) {
    if (isHydrated && !authLoading) {
      // Prevent redirect loops by checking if we just came from login
      const hasRecentlyAttemptedAuth = sessionStorage.getItem('auth_attempt_timestamp');
      const now = Date.now();

      if (hasRecentlyAttemptedAuth && (now - parseInt(hasRecentlyAttemptedAuth)) < 15000) {
        // If we attempted auth within the last 15 seconds, show error instead of redirecting
        console.log('Dashboard: Recent auth attempt detected, showing login prompt');
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to access the dashboard. If you just logged in, please wait a moment and try again.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    // Clear the timestamp and try auth again
                    sessionStorage.removeItem('auth_attempt_timestamp');
                    checkAuth();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    const dashboardUrl = process.env.NODE_ENV === 'development'
                      ? 'http://localhost:3001'
                      : 'https://dashboard.vikareta.com';
                    const mainAppUrl = process.env.NODE_ENV === 'development'
                      ? `http://localhost:3000/auth/login?redirect=${encodeURIComponent(dashboardUrl)}`
                      : `https://vikareta.com/auth/login?redirect=${encodeURIComponent(dashboardUrl)}`;
                    window.location.href = mainAppUrl;
                  }}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Mark that we're attempting auth to prevent loops
      sessionStorage.setItem('auth_attempt_timestamp', now.toString());
      sessionStorage.removeItem('token_processing'); // Clear token processing flag

      console.log('Dashboard: Not authenticated, redirecting to login');

      const dashboardUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : 'https://dashboard.vikareta.com';
      const mainAppUrl = process.env.NODE_ENV === 'development'
        ? `http://localhost:3000/auth/login?redirect=${encodeURIComponent(dashboardUrl)}`
        : `https://vikareta.com/auth/login?redirect=${encodeURIComponent(dashboardUrl)}`;

      console.log('Dashboard: Redirecting to:', mainAppUrl);
      window.location.href = mainAppUrl;
      return null;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Don't show layout on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col overflow-hidden transition-all duration-300',
        'ml-64' // TODO: Implement sidebar collapse functionality
      )}>
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className={cn(
          'flex-1 overflow-y-auto p-6',
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}