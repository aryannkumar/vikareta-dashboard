'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { APP_CONFIG } from '@/constants';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();
  const { addToast } = useToast();

  useEffect(() => {
    // Check for authentication errors from URL
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      setAuthError('Authentication failed. Please try logging in again.');
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    // Only auto-redirect to main site if not authenticated and no auth error
    if (!isAuthenticated && !error) {
      const redirectTimer = setTimeout(() => {
        const mainAppUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/auth/login' 
          : 'https://vikareta.com/auth/login';
        
        // Add current URL as redirect parameter
        const currentUrl = window.location.href;
        const redirectUrl = `${mainAppUrl}?redirect=${encodeURIComponent(currentUrl)}`;
        
        window.location.href = redirectUrl;
      }, 3000); // 3 second delay to show the message

      return () => clearTimeout(redirectTimer);
    }
  }, [searchParams, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter both email and password.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call for authentication
      // const response = await apiClient.post('/auth/login', { email, password });
      
      // Mock successful login for now
      await login({ email, password });
      addToast({
        type: 'success',
        title: 'Login Successful',
        description: 'Welcome to your dashboard!',
      });
      router.push('/dashboard');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An error occurred during login.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainAppRedirect = () => {
    const mainAppUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://vikareta.com';
    window.location.href = mainAppUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {APP_CONFIG.name}
          </CardTitle>
          <p className="text-muted-foreground">
            Sign in to access your business dashboard
          </p>
        </CardHeader>
        <CardContent>
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{authError}</span>
            </div>
          )}
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Redirecting...</strong> You will be redirected to the main Vikareta website to log in. 
              This ensures secure authentication across all our services.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-600">Redirecting in a few seconds...</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={handleMainAppRedirect}
                className="text-primary hover:underline"
              >
                Sign up on Vikareta
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleMainAppRedirect}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to main site
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}