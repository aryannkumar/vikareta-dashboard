'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { SSOAuthClient } from '@/lib/auth/sso-client';
import { handlePostLoginRedirect } from '@/lib/utils/cross-domain-auth';

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

        // Store the token from URL
        setToken(urlToken);

        // Clear the token and redirect params from URL for security
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('redirect');
        window.history.replaceState({}, '', url.toString());

        // Check authentication with the new token
        await checkAuth();

        // Give a moment for the auth state to update
        setTimeout(() => {
          const { isAuthenticated: authResult, error } = useAuthStore.getState();

          if (authResult) {
            // If we successfully authenticated because of a token, return the
            // user to where they started rather than forcing /dashboard.
            try { handlePostLoginRedirect(); } catch { if (window.location.pathname === '/login' || window.location.pathname === '/') router.push('/'); }
          } else if (error && !error.includes('Network connection')) {
            console.error('Dashboard: Authentication failed after receiving token:', error);
            // Redirect back to main site login instead of dashboard login
            const mainAppUrl = process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000/auth/login' 
              : 'https://vikareta.com/auth/login';
            window.location.href = `${mainAppUrl}?error=dashboard_auth_failed`;
          }
        }, 100);
      } else {

        // Check existing authentication
        await checkAuth();

        // Give a moment for the auth state to update
        setTimeout(() => {
          const { isAuthenticated: authResult, error } = useAuthStore.getState();

          if (authResult) {
            try { handlePostLoginRedirect(); } catch { if (window.location.pathname === '/login' || window.location.pathname === '/') router.push('/'); }
          } else if (!error || !error.includes('Network connection')) {
            // Don't auto-redirect from login page - let the login page handle its own logic
            if (window.location.pathname !== '/login') {
              const mainAppUrl = process.env.NODE_ENV === 'development' 
                ? 'http://localhost:3000/auth/login' 
                : 'https://vikareta.com/auth/login';
              
              // Add current dashboard URL as redirect parameter
              const currentUrl = window.location.href;
              window.location.href = `${mainAppUrl}?redirect=${encodeURIComponent(currentUrl)}`;
            }
          }
        }, 100);
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