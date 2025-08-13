'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
        
        // Check authentication with the new token
        await checkAuth();
        
        // Redirect to dashboard after successful auth
        const authState = useAuthStore.getState();
        if (authState.isAuthenticated) {
          console.log('Dashboard: Authentication successful, redirecting to dashboard');
          router.push('/dashboard');
        } else {
          console.error('Dashboard: Authentication failed after receiving token');
          router.push('/login?error=auth_failed');
        }
      } else {
        console.log('Dashboard: No token in URL, checking existing authentication');
        // No token in URL, check existing authentication
        await checkAuth();
        
        // If not authenticated, redirect to login
        const authState = useAuthStore.getState();
        if (!authState.isAuthenticated && !authState.isLoading) {
          console.log('Dashboard: Not authenticated, redirecting to login');
          router.push('/login');
        }
      }
    };

    handleAuth();
  }, [isHydrated, searchParams, checkAuth, router]);

  // Show loading while checking authentication
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}