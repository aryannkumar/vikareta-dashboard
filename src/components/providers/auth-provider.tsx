'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { SSOAuthClient } from '@/lib/auth/sso-client';

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth, setToken, isLoading, isAuthenticated: _isAuthenticated } = useAuthStore();
  const _ssoClient = new SSOAuthClient();

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleAuth = async () => {
      const urlToken = searchParams.get('token');
      const redirectSource = searchParams.get('redirect');

      if (urlToken) {
        console.log('Dashboard: Received token from URL, setting up authentication...');
        console.log('Dashboard: Redirect source:', redirectSource);

        // Store the token from URL
        setToken(urlToken);

        // Clear the token and redirect params from URL for security
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('redirect');
        window.history.replaceState({}, '', url.toString());

        // Check authentication with the new token
        await checkAuth();

        // After checkAuth completes, check the current state and redirect
        const { isAuthenticated: authResult, error } = useAuthStore.getState();

        if (authResult) {
          console.log('Dashboard: Authentication successful, staying on dashboard');
          // Don't redirect if already authenticated, just stay where we are
        } else if (error && !error.includes('Network connection')) {
          console.error('Dashboard: Authentication failed after receiving token');
          router.push('/login?error=auth_failed');
        }
      } else {
        console.log('Dashboard: No token in URL, checking existing authentication');

        // Check existing authentication
        await checkAuth();

        // After checkAuth completes, check the current state and redirect
        const { isAuthenticated: authResult, error } = useAuthStore.getState();

        if (authResult) {
          console.log('Dashboard: Already authenticated');
          // Check if we're on login page and redirect to dashboard
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            router.push('/dashboard');
          }
        } else if (!error || !error.includes('Network connection')) {
          console.log('Dashboard: Not authenticated, redirecting to login');
          // Only redirect to login if not already there
          if (window.location.pathname !== '/login') {
            router.push('/login');
          }
        }
      }
    };

    handleAuth();
  }, [isHydrated, searchParams, checkAuth, setToken, router]);

  // Show loading while checking authentication
  if (!isHydrated || isLoading) {
    const { error } = useAuthStore.getState();

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>

          {error && error.includes('Network connection') && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                <strong>Connection Issue:</strong> Having trouble connecting to the server.
                Please check your internet connection and try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}