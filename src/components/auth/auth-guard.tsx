'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVikaretaAuthContext } from '@/lib/auth/vikareta';
import { Card, CardContent } from '@/components/ui/card';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  requiredRoles?: string[];
}

export function AuthGuard({ 
  children, 
  fallbackUrl = '/login',
  requiredRoles 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasRole } = useVikaretaAuthContext();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log('AuthGuard: Checking authentication...', { 
        isAuthenticated, 
        isLoading, 
        hasUser: !!user 
      });

      // Wait for auth to finish loading
      if (isLoading) {
        console.log('AuthGuard: Still loading authentication state...');
        return;
      }

      // Give more time for SSO authentication to complete
      if (checkingAuth) {
        console.log('AuthGuard: Waiting for SSO check to complete...');
        setTimeout(() => setCheckingAuth(false), 3000);
        return;
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated || !user) {
        console.log('AuthGuard: User not authenticated, redirecting to:', fallbackUrl);
        const currentUrl = encodeURIComponent(window.location.href);
        router.push(`${fallbackUrl}?returnUrl=${currentUrl}&error=auth_required`);
        return;
      }

      // Check required roles if specified
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => hasRole(role));
        if (!hasRequiredRole) {
          console.log('AuthGuard: User lacks required roles:', requiredRoles, 'User type:', user.userType);
          router.push('/unauthorized?error=insufficient_permissions');
          return;
        }
      }

      console.log('AuthGuard: Authentication check passed');
      setCheckingAuth(false);
    };

    checkAuthentication();
  }, [isAuthenticated, isLoading, user, router, fallbackUrl, requiredRoles, hasRole, checkingAuth]);

  // Show loading state while checking authentication
  if (isLoading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p>Verifying authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authentication is valid, render children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Fallback - this shouldn't normally be reached due to redirects above
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Authentication Required</p>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthGuard;