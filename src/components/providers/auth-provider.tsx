'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { vikaretaCrossDomainAuth } from '@/lib/auth/vikareta';

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleAuth = async () => {
      const urlToken = searchParams.get('token');

      if (urlToken) {
        // Clear the token param from URL for security
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        newUrl.searchParams.delete('redirect');
        window.history.replaceState({}, '', newUrl.toString());

        // Let the unified auth system handle the token
        // The useVikaretaAuth hook will automatically detect and process it
        
        // Check authentication status after a brief delay
        setTimeout(async () => {
          if (isAuthenticated) {
            // If we successfully authenticated because of a token, return the
            // user to where they started rather than forcing /dashboard.
            try { vikaretaCrossDomainAuth.handlePostLoginRedirect(); } catch { if (window.location.pathname === '/login' || window.location.pathname === '/') router.push('/'); }
          } else {
            console.error('Dashboard: Authentication failed after receiving token');
            // Redirect back to main site login instead of dashboard login
            const mainAppUrl = process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000/auth/login' 
              : 'https://vikareta.com/auth/login';
            window.location.href = `${mainAppUrl}?error=dashboard_auth_failed`;
          }
        }, 1000);
      } else {
        // No token in URL, check if we're authenticated
        // Wait for the unified auth hook to complete its initialization
        setTimeout(() => {
          if (isAuthenticated && !isLoading) {
            try { vikaretaCrossDomainAuth.handlePostLoginRedirect(); } catch { if (window.location.pathname === '/login' || window.location.pathname === '/') router.push('/'); }
          } else if (!isLoading) {
            // Don't auto-redirect from login page - let the login page handle its own logic
            if (window.location.pathname !== '/login') {
              const mainAppUrl = process.env.NODE_ENV === 'development' 
                ? 'http://localhost:3000/auth/login' 
                : 'https://vikareta.com/auth/login';
              
              // Add current dashboard URL as redirect parameter
              const currentUrl = encodeURIComponent(window.location.href);
              window.location.href = `${mainAppUrl}?redirect=${currentUrl}`;
            }
          }
        }, 1000);
      }
    };

    handleAuth();
  }, [isHydrated, isAuthenticated, isLoading, router, searchParams]);

  // Show loading screen while checking authentication
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}