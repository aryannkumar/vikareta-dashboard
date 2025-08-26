// Centralized Auth Guard - Redirects to vikareta.com login
import { NextRequest, NextResponse } from 'next/server';

export function authGuard(request: NextRequest) {
  // Check if user is authenticated (you can check for Keycloak token in cookies)
  const authToken = request.cookies.get('keycloak-token');
  
  // If not authenticated, redirect to centralized login
  if (!authToken) {
    const returnUrl = encodeURIComponent(request.url);
    const loginUrl = `https://vikareta.com/login?returnUrl=${returnUrl}`;
    
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Routes that require authentication
export const protectedRoutes = [
  '/dashboard',
  '/analytics',
  '/profile',
  '/settings'
];

export function shouldProtectRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}