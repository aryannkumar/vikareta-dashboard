'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth';

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    // Simple auth check - Keycloak handles the complexity
    if (!isAuthenticated) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://vikareta.com/login?redirect=${currentUrl}`;
    }
  }, [isHydrated, isAuthenticated, isLoading]);

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