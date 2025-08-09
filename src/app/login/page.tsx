'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_CONFIG } from '@/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuthStore();
  const { addToast } = useToast();

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
    window.location.href = APP_CONFIG.mainAppUrl;
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