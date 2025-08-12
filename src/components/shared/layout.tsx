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
    
    // Check for auth token in URL parameters (for cross-domain auth)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Store the token and check authentication
        localStorage.setItem('dashboard_token', token);
        localStorage.setItem('auth_token', token); // Also store as main auth token
        
        // Clean up URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Check authentication with the new token
        checkAuth();
      } else {
        // Check if we have existing auth
        checkAuth();
      }
    }
  }, [checkAuth]);

  // Clear auth attempt timestamp when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      sessionStorage.removeItem('auth_attempt_timestamp');
    }
  }, [isAuthenticated, user]);

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
      
      if (hasRecentlyAttemptedAuth && (now - parseInt(hasRecentlyAttemptedAuth)) < 10000) {
        // If we attempted auth within the last 10 seconds, show error instead of redirecting
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to access the dashboard.</p>
              <Button 
                onClick={() => {
                  const mainAppUrl = process.env.NODE_ENV === 'development' 
                    ? 'http://localhost:3000/auth/login' 
                    : 'https://vikareta.com/auth/login';
                  window.location.href = mainAppUrl;
                }}
              >
                Go to Login
              </Button>
            </div>
          </div>
        );
      }
      
      // Mark that we're attempting auth to prevent loops
      sessionStorage.setItem('auth_attempt_timestamp', now.toString());
      
      const mainAppUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/auth/login' 
        : 'https://vikareta.com/auth/login';
      
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