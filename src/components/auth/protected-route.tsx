'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { Loading } from '@/components/ui/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('buyer' | 'seller' | 'both')[];
  requireVerification?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['buyer', 'seller', 'both'],
  requireVerification = false,
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Show loading if not authenticated - let middleware handle redirects
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  // Check role permissions (using userType from VikaretaUser)
  const userRole = user.userType || 'buyer';
  if (!allowedRoles.includes(userRole as 'buyer' | 'seller' | 'both')) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don&apos;t have permission to access this page.
            </p>
            <div className="text-sm space-y-1">
              <p><strong>Required roles:</strong> {allowedRoles.join(', ')}</p>
              <p><strong>Your role:</strong> {user.userType || 'buyer'}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check verification requirement
  if (requireVerification && !user.isVerified) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-warning">Verification Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This page requires account verification. Please complete your verification process.
            </p>
            <div className="text-sm space-y-1">
              <p><strong>Current tier:</strong> {user.verificationTier}</p>
              <p><strong>Status:</strong> {user.isVerified ? 'Verified' : 'Pending'}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/profile/verification')}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Complete Verification
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}