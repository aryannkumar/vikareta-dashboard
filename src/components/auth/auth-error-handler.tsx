'use client';

import { useEffect, useState } from 'react';
import { useVikaretaAuthContext } from '@/lib/auth/vikareta';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

export function AuthErrorHandler() {
  const { error, clearError } = useVikaretaAuthContext();
  const [countdown, setCountdown] = useState(0);

  // Handle rate limiting countdown
  useEffect(() => {
    if (error?.includes('Rate limited') || error?.includes('Too many requests')) {
      setCountdown(60); // 1 minute countdown
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            clearError(); // Clear error when countdown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [error, clearError]);

  // Auto-clear non-rate-limit errors after 10 seconds
  useEffect(() => {
    if (error && !error.includes('Rate limited') && !error.includes('Too many requests')) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  const isRateLimited = error.includes('Rate limited') || error.includes('Too many requests');
  const isSessionExpired = error.includes('Session expired') || error.includes('Authentication failed');

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className={`${isRateLimited ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}`}>
        <div className="flex items-start space-x-2">
          {isRateLimited ? (
            <ClockIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <AlertDescription className={`${isRateLimited ? 'text-yellow-800' : 'text-red-800'}`}>
              {isRateLimited ? (
                <div>
                  <p className="font-medium">Rate Limited</p>
                  <p className="text-sm mt-1">
                    Too many requests. Please wait {countdown > 0 ? `${countdown} seconds` : 'a moment'} before trying again.
                  </p>
                  {countdown > 0 && (
                    <div className="mt-2 bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${((60 - countdown) / 60) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : isSessionExpired ? (
                <div>
                  <p className="font-medium">Session Expired</p>
                  <p className="text-sm mt-1">Your session has expired. Please log in again.</p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      clearError();
                      window.location.href = process.env.NODE_ENV === 'development' 
                        ? 'http://localhost:3000/auth/login' 
                        : 'https://vikareta.com/auth/login';
                    }}
                  >
                    Go to Login
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Authentication Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
            </AlertDescription>
          </div>
          {!isRateLimited && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              ×
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}