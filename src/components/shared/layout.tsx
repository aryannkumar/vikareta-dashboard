'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { AuthErrorHandler } from '@/components/auth/auth-error-handler';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const redirectToLogin = () => {
    const mainAppUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/auth/login'
      : 'https://vikareta.com/auth/login';
    window.location.href = mainAppUrl;
  };

  // Check authentication when layout loads (only once when hydrated)
  useEffect(() => {
    if (isHydrated && !isAuthenticated && !authLoading) {
      checkAuth();
    }
  }, [authLoading, checkAuth, isAuthenticated, isHydrated]); // Remove dependencies to prevent infinite loops
  // const { sidebarCollapsed } = useDashboardStore();

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);

    // Clean up any URL parameters (no longer needed with HttpOnly cookies)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('token') || urlParams.has('redirect') || urlParams.has('source')) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  // Only redirect to dashboard if explicitly requested via URL parameter
  useEffect(() => {
    if (isAuthenticated && user && pathname === '/') {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldRedirectToDashboard = urlParams.get('redirect') === 'dashboard';

      if (shouldRedirectToDashboard) {
        console.log('Dashboard: Redirecting to /dashboard as requested');
        window.location.replace('/dashboard');
      }
      // Otherwise, let user stay on landing page or choose where to go
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

  // Show loading or login prompt if not authenticated
  if (!isAuthenticated || !user) {
    if (isHydrated && !authLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access the dashboard. You will be redirected to the login page.
            </p>
            <Button onClick={redirectToLogin} className="w-full">
              Go to Login
            </Button>
          </div>
        </div>
      );
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
      {/* Auth Error Handler */}
      <AuthErrorHandler />

      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay - TODO: Implement mobile sidebar */}
      {/* This would show the sidebar on mobile when toggled */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className={cn(
          'flex-1 overflow-y-auto p-4 lg:p-6',
          className
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}