'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth, setToken, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleAuth = async () => {
      // Check if there's a token in the URL (from cross-domain redirect)
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

        // Check authentication with the new token and wait for completion
        try {
          await checkAuth();
          console.log('Dashboard: Authentication check completed for URL token');
        } catch (error) {
          console.error('Dashboard: Authentication check failed for URL token:', error);
        }
      } else {
        console.log('Dashboard: No token in URL, checking existing authentication');
        // No token in URL, check existing authentication
        try {
          await checkAuth();
          console.log('Dashboard: Authentication check completed for existing session');
        } catch (error) {
          console.error('Dashboard: Authentication check failed for existing session:', error);
        }
      }
    };

    handleAuth();
  }, [isHydrated, searchParams, checkAuth, setToken]);

  // Handle redirects based on authentication state
  useEffect(() => {
    if (!isHydrated || isLoading) return;

    const urlToken = searchParams.get('token');
    const { error } = useAuthStore.getState();

    console.log('Dashboard: Redirect logic - Auth state:', {
      isAuthenticated,
      hasUrlToken: !!urlToken,
      hasError: !!error,
      errorType: error?.includes('Network connection') ? 'network' : 'auth'
    });

    // Check if there's a network error
    if (error && error.includes('Network connection')) {
      console.warn('Dashboard: Network error detected, not redirecting');
      return;
    }

    // If we have a URL token, handle cross-domain authentication flow
    if (urlToken) {
      if (isAuthenticated) {
        // Successfully authenticated with URL token, redirect to dashboard
        console.log('Dashboard: Cross-domain authentication successful, redirecting to dashboard');
        router.push('/dashboard');
      } else if (error && !error.includes('Network connection')) {
        // Had token but authentication failed (and no network error)
        console.error('Dashboard: Cross-domain authentication failed after receiving token');
        router.push('/login?error=auth_failed');
      } else {
        // Still processing authentication, wait
        console.log('Dashboard: Still processing cross-domain authentication...');
      }
    } else {
      // No URL token - normal authentication flow
      if (isAuthenticated) {
        // Already authenticated, redirect to dashboard
        console.log('Dashboard: Already authenticated, redirecting to dashboard');
        router.push('/dashboard');
      } else if (!error || !error.includes('Network connection')) {
        // Not authenticated and no network error, redirect to login
        console.log('Dashboard: Not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, isHydrated, searchParams, router]);

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