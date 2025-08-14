'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { SSOAuthClient } from '@/lib/auth/sso-client';

export default function DebugAuthPage() {
  const { user, isAuthenticated, isLoading, error, checkAuth } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [apiTest, setApiTest] = useState<string>('');

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = {
        localStorage: {
          vikareta_access_token: localStorage.getItem('vikareta_access_token'),
          dashboard_token: localStorage.getItem('dashboard_token'),
          auth_token: localStorage.getItem('auth_token'),
        },
        authStore: {
          user: user ? { id: user.id, email: user.email } : null,
          isAuthenticated,
          isLoading,
          error,
        },
        url: {
          href: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search,
        }
      };
      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated, isLoading, error]);

  const testApiCall = async () => {
    try {
      setApiTest('Testing...');
      const ssoClient = new SSOAuthClient();
      const user = await ssoClient.getCurrentUser();
      setApiTest(user ? `Success: ${user.email}` : 'No user returned');
    } catch (error) {
      setApiTest(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const forceCheckAuth = async () => {
    await checkAuth();
  };

  const testTokenFromMain = () => {
    // Simulate receiving a token from main site
    const testToken = prompt('Enter a test token (or leave empty to simulate):');
    if (testToken !== null) {
      const { setToken } = useAuthStore.getState();
      setToken(testToken || 'test-token-123');
      // Force a check auth after setting token
      setTimeout(() => {
        checkAuth();
      }, 100);
    }
  };

  const clearAllTokens = () => {
    localStorage.clear();
    const { logout } = useAuthStore.getState();
    logout();
    window.location.reload();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">LocalStorage Tokens</h2>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(debugInfo.localStorage, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Auth Store State</h2>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(debugInfo.authStore, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">URL Info</h2>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(debugInfo.url, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">API Test</h2>
          <button 
            onClick={testApiCall}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 mb-2"
          >
            Test API Call
          </button>
          <button 
            onClick={forceCheckAuth}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2 mb-2"
          >
            Force Check Auth
          </button>
          <button 
            onClick={testTokenFromMain}
            className="bg-purple-500 text-white px-4 py-2 rounded mr-2 mb-2"
          >
            Simulate Token from Main
          </button>
          <button 
            onClick={clearAllTokens}
            className="bg-red-500 text-white px-4 py-2 rounded mb-2"
          >
            Clear All & Reload
          </button>
          <div className="text-sm bg-white p-3 rounded border">
            {apiTest || 'Click "Test API Call" to test authentication'}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Instructions</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Login on the main site (vikareta.com)</li>
          <li>Navigate to dashboard - you should be redirected here with a token</li>
          <li>Check if tokens are stored in localStorage</li>
          <li>Check if auth store shows authenticated state</li>
          <li>Test API call to verify backend communication</li>
        </ol>
      </div>
    </div>
  );
}