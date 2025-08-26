'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import { hasRouteAccess } from '@/lib/routing';

interface ProtectedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

export function ProtectedLink({ href, children, className, prefetch = true, ...props }: ProtectedLinkProps) {
  const { user } = useAuthStore();
  
  // Only prefetch if user has access to the route
  const userRole = user?.roles.includes('seller') ? 'seller' : user?.roles.includes('admin') ? 'admin' : 'buyer';
  const shouldPrefetch = prefetch && user && hasRouteAccess(href, userRole as 'buyer' | 'seller' | 'both' | 'admin');
  
  return (
    <Link 
      href={href} 
      className={className} 
      prefetch={shouldPrefetch}
      {...props}
    >
      {children}
    </Link>
  );
}