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
  
  const redirectToLogin = () => {
    const mainAppUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/auth/login' 
      : 'https://vikareta.com/auth/login';
    window.location.href = mainAppUrl;
  };

  // Force check auth when layout loads
  useEffect(() => {
    if (isHydrated && !isAuthenticated && !authLoading) {
      console.log('Dashboard Layout: Forcing auth check...');
      checkAuth();
    }
  }, [isHydrated, isAuthenticated, authLoading, checkAuth]);
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

  // Redirect to dashboard if on root path
  useEffect(() => {
    if (isAuthenticated && user && pathname === '/') {
      console.log('Dashboard: Redirecting to /dashboard');
      window.location.replace('/dashboard');
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
    console.log('Dashboard Layout: Auth state check', {
      isAuthenticated,
      user: user ? 'Present' : 'Null',
      isHydrated,
      authLoading
    });

    if (isHydrated && !authLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access the dashboard. You will be redirected to the login page.
            </p>
            <Button onClick={redirectToLogin} className="w-full mb-2">
              Go to Login
            </Button>
            <Button 
              onClick={() => {
                console.log('Manual auth check triggered');
                checkAuth();
              }} 
              variant="outline" 
              className="w-full"
            >
              Check Authentication
            </Button>
            <div className="mt-4 text-xs text-gray-500">
              Debug: isAuth={isAuthenticated ? 'true' : 'false'}, user={user ? 'yes' : 'no'}, loading={authLoading ? 'true' : 'false'}
            </div>
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