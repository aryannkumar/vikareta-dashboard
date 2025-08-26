'use client';

import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/ui/loading';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('buyer' | 'seller' | 'both')[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loading size="lg" text="Checking permissions..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Check if user has required role (users with both buyer and seller roles can access everything)
  const userRole = user.roles.includes('seller') ? 'seller' : 'buyer';
  const hasBothRoles = user.roles.includes('buyer') && user.roles.includes('seller');
  const hasAccess = hasBothRoles || allowedRoles.includes(userRole as 'buyer' | 'seller' | 'both');
  
  if (!hasAccess) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Required roles: {allowedRoles.join(', ')}
          </p>
          <p className="text-sm text-muted-foreground">
            Your roles: {user.roles.join(', ') || 'buyer'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}