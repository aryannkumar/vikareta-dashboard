'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { vikaretaCrossDomainAuth } from '@/lib/auth/vikareta';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const { addToast } = useToast();

  useEffect(() => {
    // Check for authentication errors from URL
    const error = searchParams.get('error');
    
    if (error === 'auth_failed') {
      setAuthError('Authentication failed. Please try logging in again.');
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
      return;
    }

    // Don't auto-redirect if there's an auth error (user needs to see the error)
    // or if user is already authenticated
    if (error || isAuthenticated) {
      return;
    }

    // Only auto-redirect to main site if not authenticated and no auth error
    // Also check if we're in the middle of an authentication process
    const hasStoredToken = typeof window !== 'undefined' && 
      (localStorage.getItem('vikareta_access_token') || localStorage.getItem('dashboard_token'));
    
    if (!isAuthenticated && !error && !hasStoredToken) {
      const redirectTimer = setTimeout(() => {
        const mainAppUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/auth/login' 
          : 'https://vikareta.com/auth/login';
        
        window.location.href = `${mainAppUrl}?redirect=${encodeURIComponent(window.location.origin + '/dashboard')}`;
      }, 3000); // Give 3 seconds for auth check to complete

      return () => clearTimeout(redirectTimer);
    }
  }, [searchParams, isAuthenticated, isLoading, router]);

  // Clear auth error when component unmounts or auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      setAuthError(null);
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    setLoginLoading(true);
    setAuthError(null);

    try {
      const success = await login({ email, password });
      
      if (success) {
        addToast({
          type: 'success',
          title: 'Login Successful',
          description: 'Welcome to Vikareta Dashboard!'
        });

        // Best-effort: sync SSO tokens to configured subdomains
        try { vikaretaCrossDomainAuth.syncSSOAcrossDomains(); } catch {}

        // Return user to where they started, or default per app logic
        try { vikaretaCrossDomainAuth.handlePostLoginRedirect(); } catch { router.push('/'); }
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An error occurred during login.',
      });
      setAuthError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p>Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Vikareta Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Access your business dashboard
          </p>
        </CardHeader>
        <CardContent>
          {authError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{authError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loginLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loginLoading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Don't have access?</p>
            <a 
              href={process.env.NODE_ENV === 'development' 
                ? 'http://localhost:3000/auth/register' 
                : 'https://vikareta.com/auth/register'
              }
              className="text-primary hover:underline"
            >
              Contact support for dashboard access
            </a>
          </div>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>
              You will be redirected to the main site in a few seconds if not authenticated.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}