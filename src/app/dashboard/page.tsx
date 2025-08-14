'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { ProductPerformance } from '@/components/dashboard/product-performance';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  href?: string;
  loading?: boolean;
}

function MetricCard({ title, value, change, icon: Icon, description, href, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 w-4 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  const CardWrapper = href ? Link : 'div';

  return (
    <CardWrapper href={href || '#'} className={href ? 'block' : ''}>
      <Card className={`${href ? 'hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20' : ''} relative overflow-hidden`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change !== undefined && (
            <div className="flex items-center space-x-2 text-xs mt-1">
              <TrendingUp className={`h-3 w-3 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {href && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-3 w-3 text-primary" />
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

export default function DashboardPage() {
  const {
    metrics,
    recentOrders,
    topProducts,
    walletBalance,
    loading: isLoading,
    error,
    refresh: refreshData
  } = useDashboard();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Unable to load dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/analytics">
            <Button size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          change={metrics?.revenueChange}
          icon={DollarSign}
          description="Total earnings this month"
          href="/dashboard/analytics"
          loading={isLoading}
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(metrics?.totalOrders || 0)}
          change={metrics?.ordersChange}
          icon={ShoppingCart}
          description="Orders received"
          href="/dashboard/orders"
          loading={isLoading}
        />
        <MetricCard
          title="Products Listed"
          value={formatNumber(metrics?.totalProducts || 0)}
          change={metrics?.productsChange}
          icon={Package}
          description="Active products"
          href="/dashboard/products"
          loading={isLoading}
        />
        <MetricCard
          title="Wallet Balance"
          value={formatCurrency(walletBalance?.availableBalance || 0)}
          icon={DollarSign}
          description="Available funds"
          href="/dashboard/wallet"
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts to get things done faster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/products/new">
              <Button className="w-full h-20 flex-col space-y-2 group">
                <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Add Product</span>
              </Button>
            </Link>
            <Link href="/dashboard/rfqs/new">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2 group">
                <Package className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Create RFQ</span>
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2 group">
                <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>View Orders</span>
              </Button>
            </Link>
            <Link href="/dashboard/wallet">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2 group">
                <DollarSign className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Manage Wallet</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Your revenue performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </div>

        {/* Product Performance - Takes 1 column */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductPerformance />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </div>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm">
                View All
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>

        {/* Business Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
            <CardDescription>Key metrics for your business performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics?.activeRFQs || 0}</div>
                  <p className="text-sm text-muted-foreground">Active RFQs</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics?.completedOrders || 0}</div>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{metrics?.pendingOrders || 0}</div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {walletBalance ? formatCurrency(walletBalance.lockedBalance || 0) : '₹0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Locked Balance</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Summary</CardTitle>
          <CardDescription>Quick overview of your recent business activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Products Added</p>
                <p className="text-sm text-muted-foreground">
                  {topProducts?.length || 0} new products this week
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Orders Processed</p>
                <p className="text-sm text-muted-foreground">
                  {recentOrders?.length || 0} orders this week
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Revenue Growth</p>
                <p className="text-sm text-muted-foreground">
                  {metrics?.revenueChange ? `+${metrics.revenueChange.toFixed(1)}%` : '0%'} this month
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}