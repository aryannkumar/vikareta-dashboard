'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, checkAuth } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      urlToken: searchParams.get('token'),
      redirectSource: searchParams.get('redirect'),
      localStorageToken: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
      dashboardToken: typeof window !== 'undefined' ? localStorage.getItem('dashboard_token') : null,
      storeToken: token,
      isAuthenticated,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      currentUrl: typeof window !== 'undefined' ? window.location.href : null,
    };
    setDebugInfo(info);
  }, [searchParams, token, isAuthenticated, user]);

  const handleTestAuth = async () => {
    console.log('Testing authentication...');
    await checkAuth();
  };

  const handleClearTokens = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('dashboard_token');
      localStorage.removeItem('dashboard-auth-storage');
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Authentication Status</h3>
                <div className={`p-3 rounded-md ${isAuthenticated ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Debug Information</h3>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleTestAuth}>
                  Test Authentication
                </Button>
                <Button variant="outline" onClick={handleClearTokens}>
                  Clear All Tokens
                </Button>
                <Button variant="outline" onClick={() => window.location.href = 'https://vikareta.com/auth/login'}>
                  Go to Main Site Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Cross-Domain Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To test the cross-domain authentication flow:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to the main Vikareta website (vikareta.com)</li>
                <li>Log in with your credentials</li>
                <li>You should be automatically redirected to this dashboard</li>
                <li>Check this debug page to see if the token was received properly</li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Expected Flow:</strong><br />
                  vikareta.com/auth/login → dashboard.vikareta.com?token=xxx → dashboard.vikareta.com/dashboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}