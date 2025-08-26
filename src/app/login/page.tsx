'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LoginContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to centralized login on main site
    const currentUrl = encodeURIComponent(window.location.href.replace('/login', '/dashboard'));
    const error = searchParams.get('error');
    
    let redirectUrl = `https://vikareta.com/login?redirect=${currentUrl}`;
    if (error) {
      redirectUrl += `&error=${error}`;
    }
    
    window.location.href = redirectUrl;
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Redirecting to Login
          </CardTitle>
          <p className="text-muted-foreground">
            Taking you to the centralized login page...
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p>Redirecting...</p>
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