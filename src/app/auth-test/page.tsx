'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { Button } from '@/components/ui/button';

export default function AuthTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const { user, token, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`Auth Test: ${message}`);
  };

  useEffect(() => {
    addLog('Auth test page loaded');
    
    // Check URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const source = urlParams.get('source');
      
      addLog(`URL token: ${urlToken ? 'Present' : 'Not found'}`);
      addLog(`Source: ${source || 'Not specified'}`);
      
      // Check localStorage
      const localToken = localStorage.getItem('auth_token');
      const dashboardToken = localStorage.getItem('dashboard_token');
      
      addLog(`localStorage auth_token: ${localToken ? 'Present' : 'Not found'}`);
      addLog(`localStorage dashboard_token: ${dashboardToken ? 'Present' : 'Not found'}`);
    }
    
    addLog(`Auth store state - Authenticated: ${isAuthenticated}, Loading: ${isLoading}`);
    addLog(`User: ${user ? `${user.email} (${user.id})` : 'Not loaded'}`);
    addLog(`Token in store: ${token ? 'Present' : 'Not found'}`);
  }, [user, token, isAuthenticated, isLoading]);

  const handleTestAuth = () => {
    addLog('Testing authentication...');
    checkAuth();
  };

  const handleClearAuth = () => {
    addLog('Clearing authentication...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('dashboard_token');
    localStorage.removeItem('dashboard_refresh_token');
    useAuthStore.getState().logout();
  };

  const handleTestCSRF = async () => {
    addLog('Testing CSRF token...');
    try {
      // Check for CSRF token in cookies
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => 
        cookie.trim().startsWith('XSRF-TOKEN=')
      );
      
      if (csrfCookie) {
        const token = decodeURIComponent(csrfCookie.split('=')[1]);
        addLog(`CSRF token found in cookie: ${token.substring(0, 20)}...`);
      } else {
        addLog('No CSRF token found in cookies');
      }
    } catch (error) {
      addLog(`CSRF test failed: ${error}`);
    }
  };

  const handleClearCSRF = async () => {
    addLog('Clearing CSRF tokens...');
    try {
      // Clear CSRF cookie
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.vikareta.com;';
      addLog('CSRF token cookie cleared');
    } catch (error) {
      addLog(`Failed to clear CSRF tokens: ${error}`);
    }
  };

  const handleGoToLogin = () => {
    const dashboardUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/auth-test' 
      : 'https://dashboard.vikareta.com/auth-test';
    const mainAppUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:3000/auth/login?redirect=${encodeURIComponent(dashboardUrl)}` 
      : `https://vikareta.com/auth/login?redirect=${encodeURIComponent(dashboardUrl)}`;
    
    addLog(`Redirecting to login: ${mainAppUrl}`);
    window.location.href = mainAppUrl;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Cross-Domain Authentication & CSRF Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current State */}
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Current State</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Authenticated:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isAuthenticated ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <strong>Loading:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {isLoading ? 'Yes' : 'No'}
              </span>
            </div>
            <div><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'Not loaded'}</div>
            <div><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'Not found'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-2">
            <Button onClick={handleTestAuth} className="w-full" variant="outline">
              Test Authentication
            </Button>
            <Button onClick={handleTestCSRF} className="w-full" variant="outline">
              Test CSRF Token
            </Button>
            <Button onClick={handleClearCSRF} className="w-full" variant="outline">
              Clear CSRF Tokens
            </Button>
            <Button onClick={handleClearAuth} className="w-full" variant="outline">
              Clear Authentication
            </Button>
            <Button onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="mt-6 bg-card p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded max-h-96 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap">
            {logs.join('\n')}
          </pre>
        </div>
        <Button 
          onClick={() => setLogs([])} 
          className="mt-2" 
          variant="outline" 
          size="sm"
        >
          Clear Logs
        </Button>
      </div>
    </div>
  );
}