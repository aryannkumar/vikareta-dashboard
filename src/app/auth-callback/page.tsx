'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/use-auth';

export default function AuthCallback() {
  const { isInitialized, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        // Get return URL from query params or default to dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl') || '/dashboard';
        window.location.href = returnUrl;
      } else {
        // Authentication failed, redirect to centralized login
        window.location.href = 'https://vikareta.com/login';
      }
    }
  }, [isInitialized, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}