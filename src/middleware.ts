import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['buyer', 'seller', 'both', 'admin', 'super_admin'],
  '/products': ['seller', 'both', 'admin', 'super_admin'],
  '/orders': ['buyer', 'seller', 'both', 'admin', 'super_admin'],
  '/rfqs': ['buyer', 'seller', 'both', 'admin', 'super_admin'],
  '/quotes': ['buyer', 'seller', 'both', 'admin', 'super_admin'],
  '/deals': ['buyer', 'seller', 'both', 'admin', 'super_admin'],
  '/wallet': ['buyer', 'seller', 'both', 'admin', 'super_admin'],
  '/analytics': ['seller', 'both', 'admin', 'super_admin'],
};

// Check if path matches any protected route pattern
function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') ||
    Object.keys(protectedRoutes).some(route => pathname.startsWith(route));
}

// Public routes that don't require authentication
const publicRoutes = ['/login', '/health', '/', '/sso/receive'];

// Helper function to decode JWT token and extract user role
function getUserRoleFromToken(token: string): string | null {
  try {
    // Simple JWT decode (in production, use a proper JWT library)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || payload.userType || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('Middleware: Processing request for:', pathname);

  // Handle manifest.json request
  if (pathname === '/manifest.json') {
    return new NextResponse(JSON.stringify({
      name: 'Vikareta Dashboard',
      short_name: 'Dashboard',
      description: 'Vikareta Business Dashboard',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#f97316',
      icons: [
        {
          src: '/favicon.ico',
          sizes: '64x64 32x32 24x24 16x16',
          type: 'image/x-icon'
        }
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

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
    console.log('Middleware: Public route, allowing access');
    return NextResponse.next();
  }

  // Only protect routes that actually need protection
  if (!isProtectedRoute(pathname)) {
    console.log('Middleware: Non-protected route, allowing access');
    return NextResponse.next();
  }

  // Get auth token from various sources
  const authToken = request.cookies.get('vikareta_access_token')?.value ||
    request.cookies.get('access_token')?.value ||
    request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.nextUrl.searchParams.get('token');

  console.log('Middleware: Auth token present:', !!authToken);

  // If no token found, allow client-side auth handling but add a flag
  if (!authToken) {
    console.log('Middleware: No token found, allowing client-side auth handling');
    const response = NextResponse.next();
    response.headers.set('x-auth-required', 'true');
    return response;
  }

  // For dashboard routes, check if the route requires specific roles
  const requiredRoles = protectedRoutes[pathname as keyof typeof protectedRoutes];

  if (requiredRoles) {
    try {
      // Decode JWT token to get user role (simplified version)
      const userRole = getUserRoleFromToken(authToken);
      console.log('Middleware: User role:', userRole, 'Required roles:', requiredRoles);

      // Check if user has required role
      if (userRole && !requiredRoles.includes(userRole)) {
        console.log('Middleware: User lacks required role, redirecting to unauthorized');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch {
      console.log('Middleware: Token invalid, allowing client-side handling');
      const response = NextResponse.next();
      response.headers.set('x-auth-invalid', 'true');
      return response;
    }
  }

  console.log('Middleware: Auth check passed, allowing access');
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