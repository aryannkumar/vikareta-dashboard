import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add cache headers for static assets to improve performance
  if (pathname.startsWith('/_next/static/') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/images/') ||
      pathname.startsWith('/icons/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // Add no-cache headers for API routes to ensure fresh data
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // SSO access control for dashboard
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/') && !pathname.startsWith('/favicon.ico')) {
    // Check if user is authenticated by making a request to /api/auth/me
    // This will be handled by the API route which forwards to backend
    const cookie = request.headers.get('cookie');
    if (!cookie || !cookie.includes('refreshToken')) {
      // Redirect to vikareta-web for SSO login
      const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${webUrl}/auth/login?redirect=dashboard`);
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};