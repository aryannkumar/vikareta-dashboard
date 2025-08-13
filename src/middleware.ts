import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['buyer', 'seller', 'both', 'admin'],
  '/products': ['seller', 'both'],
  '/orders': ['buyer', 'seller', 'both'],
  '/rfqs': ['buyer', 'seller', 'both'],
  '/quotes': ['buyer', 'seller', 'both'],
  '/deals': ['buyer', 'seller', 'both'],
  '/wallet': ['buyer', 'seller', 'both'],
  '/analytics': ['seller', 'both'],
  '/following': ['buyer', 'both'],

};

// Check if path matches any protected route pattern
function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') ||
    Object.keys(protectedRoutes).some(route => pathname.startsWith(route));
}

// Public routes that don't require authentication
const publicRoutes = ['/login', '/health', '/'];

// Helper function to decode JWT token and extract user role
function getUserRoleFromToken(token: string): string | null {
  try {
    // Simple JWT decode (in production, use a proper JWT library)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Only protect routes that actually need protection
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Get auth token from cookies, headers, or URL parameters
  const authToken = request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.nextUrl.searchParams.get('token');

  // If no token, redirect to dashboard login page instead of main app
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For dashboard routes, check if the route requires specific roles
  const requiredRoles = protectedRoutes[pathname as keyof typeof protectedRoutes];

  if (requiredRoles) {
    try {
      // Decode JWT token to get user role (simplified version)
      const userRole = getUserRoleFromToken(authToken);

      // Check if user has required role
      if (userRole && !requiredRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch {
      // If token is invalid, redirect to dashboard login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};