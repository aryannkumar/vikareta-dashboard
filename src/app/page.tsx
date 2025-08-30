'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVikaretaAuthContext } from '@/lib/auth/vikareta';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  BarChart3, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useVikaretaAuthContext();
  const [isHydrated, setIsHydrated] = useState(false);
  const [checkingSSO, setCheckingSSO] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Simplified SSO check - trust the auth context more
  useEffect(() => {
    const checkSSOAuth = async () => {
      if (!isHydrated) return;

      console.log('Dashboard Home: Starting auth check...', { 
        isAuthenticated, 
        user: !!user,
        hasUserId: user?.id,
        userType: user?.userType 
      });
      
      // If already authenticated via store, trust it
      if (isAuthenticated && user?.id) {
        console.log('Dashboard Home: Already authenticated via store with valid user');
        setCheckingSSO(false);
        return;
      }

      // Single wait for auth context to settle
      console.log('Dashboard Home: Waiting for auth context to settle...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if auth state updated during wait
      if (isAuthenticated && user?.id) {
        console.log('Dashboard Home: Authentication detected after wait');
        setCheckingSSO(false);
        return;
      }

      // Single API check as fallback
      try {
        console.log('Dashboard Home: Making single auth check request...');
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.user?.id) {
            console.log('Dashboard Home: Valid user found via API, triggering auth refresh...');
            // Dispatch custom event to trigger auth refresh
            window.dispatchEvent(new CustomEvent('vikareta-auth-refresh'));
            // Small delay then refresh
            setTimeout(() => {
              window.location.reload();
            }, 300);
            return;
          }
        }
      } catch (error) {
        console.warn('Dashboard Home: Auth check failed:', error);
      }
      
      console.log('Dashboard Home: No authentication found');
      setCheckingSSO(false);
    };

    checkSSOAuth();
  }, [isHydrated, isAuthenticated, user]);

  // Show loading while hydrating or checking SSO
  if (!isHydrated || isLoading || checkingSSO) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>{checkingSSO ? "Checking authentication..." : "Loading..."}</span>
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard-style content directly at the root
  // This makes dashboard.vikareta.com feel like the main dashboard, not a redirect
  if (isAuthenticated && user) {
    return (
      <AuthGuard requiredRoles={['buyer', 'seller', 'both', 'admin', 'super_admin']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {user.firstName || 'User'}!
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Ready to manage your business?
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Successfully logged in</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard')}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <LayoutDashboard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dashboard</CardTitle>
                      <CardDescription>View your business overview</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push('/dashboard'); }}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/products')}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Products</CardTitle>
                      <CardDescription>Manage your product catalog</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push('/dashboard/products'); }}>
                    Manage Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/orders')}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Orders</CardTitle>
                      <CardDescription>Track and manage orders</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push('/dashboard/orders'); }}>
                    View Orders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/customers')}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Customers</CardTitle>
                      <CardDescription>Manage customer relationships</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push('/dashboard/customers'); }}>
                    View Customers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/analytics')}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Analytics</CardTitle>
                      <CardDescription>View business insights</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push('/dashboard/analytics'); }}>
                    View Analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/wallet')}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <LayoutDashboard className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Wallet</CardTitle>
                      <CardDescription>Manage your finances</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push('/dashboard/wallet'); }}>
                    View Wallet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your business at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Active Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">₹0</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer Actions */}
            <div className="text-center">
              <Button 
                size="lg" 
                className="mr-4"
                onClick={() => router.push('/dashboard')}
              >
                Go to Full Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const mainAppUrl = process.env.NODE_ENV === 'development'
                    ? 'http://localhost:3000' 
                    : 'https://vikareta.com';
                  window.location.href = mainAppUrl;
                }}
              >
                Back to Main Site
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // If not authenticated, show login options
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Vikareta Dashboard</CardTitle>
          <CardDescription>
            Please log in to access your business dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => {
              // Redirect to main site login with proper return URL
              const mainAppUrl = process.env.NODE_ENV === 'development'
                ? 'http://localhost:3000/auth/login' 
                : 'https://vikareta.com/auth/login';
              const returnUrl = encodeURIComponent(window.location.origin);
              window.location.href = `${mainAppUrl}?returnUrl=${returnUrl}`;
            }}
          >
            Login via Main Site
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // Try the dashboard's own login as secondary option
              router.push('/login');
            }}
          >
            Dashboard Login
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => {
              const mainAppUrl = process.env.NODE_ENV === 'development'
                ? 'http://localhost:3000' 
                : 'https://vikareta.com';
              window.location.href = mainAppUrl;
            }}
          >
            Back to Main Site
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}