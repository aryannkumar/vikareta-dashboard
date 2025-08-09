'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  Star,
  FileText,
  ArrowRight,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import { Loading } from '@/components/ui/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { RecentRFQs } from '@/components/dashboard/recent-rfqs';
import { ProductPerformance } from '@/components/dashboard/product-performance';
import { AdAnalytics } from '@/components/dashboard/ad-analytics';
import { SubscriptionStatus } from '@/components/dashboard/subscription-status';

// Utility functions for formatting
const formatPrice = (value: number) => `₹${value.toLocaleString()}`;
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};






export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    metrics, 
    recentOrders,
    walletBalance,
    loading: dashboardLoading, 
    error, 
    refresh
  } = useDashboard({ 
    autoLoad: isAuthenticated,
    refreshInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });

  // Let the layout handle authentication checks
  // This page should only render if user is authenticated
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your business today.
            </p>
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {error}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={refresh}
            disabled={dashboardLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics?.totalOrders || 0}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics?.pendingOrders || 0}</div>
                <div className="text-sm text-muted-foreground">Pending Orders</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatPrice(metrics?.totalRevenue || 0)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics?.activeCustomers || 0}</div>
                <div className="text-sm text-muted-foreground">Active Customers</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/products">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Manage Products</div>
                  </div>
                </Link>
                
                <Link href="/dashboard/rfqs">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">View RFQs</div>
                  </div>
                </Link>
                
                <Link href="/dashboard/orders">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Orders</div>
                  </div>
                </Link>
                
                <Link href="/dashboard/wallet">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Wallet</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Link href="/dashboard/orders">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0 text-blue-500">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">Order #{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">Buyer ID: {order.buyerId}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{formatPrice(order.totalAmount)}</div>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Account Status */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Verification:</span>
                  <Badge className={user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {user?.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tier:</span>
                  <Badge variant="outline">
                    {user?.verificationTier ? user.verificationTier.charAt(0).toUpperCase() + user.verificationTier.slice(1) : 'Basic'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Role:</span>
                  <Badge variant="secondary">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Basic info completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Email verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Phone verification pending</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Complete Profile
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Orders</span>
                  </div>
                  <span className="font-medium">{metrics?.completedOrders || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">RFQs</span>
                  </div>
                  <span className="font-medium">{metrics?.activeRFQs || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Reviews</span>
                  </div>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">API Status:</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated:</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dashboard Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {/* Revenue Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <RevenueChart />
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Orders</span>
                  <span className="text-2xl font-bold text-green-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending RFQs</span>
                  <span className="text-2xl font-bold text-orange-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Ads</span>
                  <span className="text-2xl font-bold text-blue-600">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Wallet Balance</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {formatPrice(walletBalance?.availableBalance || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentOrders />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent RFQs</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentRFQs />
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPerformance />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advertisement Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <AdAnalytics />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionStatus />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}