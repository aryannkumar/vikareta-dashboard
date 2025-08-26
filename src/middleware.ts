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

  // For protected routes, redirect to centralized login
  console.log('Middleware: Protected route, redirecting to centralized login');
  const returnUrl = encodeURIComponent(request.url);
  const centralLoginUrl = `https://vikareta.com/login?returnUrl=${returnUrl}`;
  return NextResponse.redirect(centralLoginUrl);


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