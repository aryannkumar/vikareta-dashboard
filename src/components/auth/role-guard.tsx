'use client';

import { useVikaretaAuthContext } from '@/lib/auth/vikareta';
import { Loading } from '@/components/ui/loading';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('buyer' | 'seller' | 'both')[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useVikaretaAuthContext();

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

  // Check if user has required role (both role can access everything)
  const userRole = user.userType || 'buyer';
  const hasAccess = userRole === 'both' || allowedRoles.includes(userRole as 'buyer' | 'seller' | 'both');
  
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
            Your role: {user.userType || 'buyer'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}