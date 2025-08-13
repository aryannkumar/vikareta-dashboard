'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // If there's a token in URL, let AuthProvider handle it
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      // AuthProvider will handle the token and redirect
      return;
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    // If not authenticated and no token, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, searchParams, router]);

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Setting up your dashboard...</p>
      </div>
    </div>
  );
}
