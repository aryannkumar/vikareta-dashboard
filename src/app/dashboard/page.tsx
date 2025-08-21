'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  Activity,
  Star,
  MessageSquare,
  Clock,
  CheckCircle
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
  gradient?: string;
}

function MetricCard({ title, value, change, icon: Icon, description, href, loading, gradient = "from-amber-400 to-amber-600" }: MetricCardProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="animate-pulse bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-amber-200 dark:bg-amber-800 rounded w-1/2"></div>
            <div className="h-4 w-4 bg-amber-200 dark:bg-amber-800 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-amber-200 dark:bg-amber-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-amber-200 dark:bg-amber-800 rounded w-full"></div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const CardWrapper = href ? Link : 'div';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <CardWrapper href={href || '#'} className={href ? 'block' : ''}>
        <Card className={`${href ? 'hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-amber-300 dark:hover:border-amber-600' : ''} relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30 group`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</CardTitle>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
            {change !== undefined && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-xs mt-2"
              >
                <motion.div
                  animate={{ rotate: change >= 0 ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className={`h-3 w-3 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </motion.div>
                <span className={`font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-gray-500 dark:text-gray-400">from last month</span>
              </motion.div>
            )}
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            )}
            {href && (
              <motion.div
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.2 }}
              >
                <ArrowUpRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </CardWrapper>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Unable to load dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={refreshData} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Seller Dashboard
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Welcome back! Here's how your business is performing.
          </motion.p>
        </div>
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isLoading}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/analytics">
              <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          change={metrics?.revenueChange}
          icon={DollarSign}
          description="Total earnings this month"
          href="/dashboard/analytics"
          loading={isLoading}
          gradient="from-emerald-400 to-emerald-600"
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(metrics?.totalOrders || 0)}
          change={metrics?.ordersChange}
          icon={ShoppingCart}
          description="Orders received"
          href="/dashboard/orders"
          loading={isLoading}
          gradient="from-blue-400 to-blue-600"
        />
        <MetricCard
          title="Products Listed"
          value={formatNumber(metrics?.totalProducts || 0)}
          change={metrics?.productsChange}
          icon={Package}
          description="Active products"
          href="/dashboard/products"
          loading={isLoading}
          gradient="from-purple-400 to-purple-600"
        />
        <MetricCard
          title="Wallet Balance"
          value={formatCurrency(walletBalance?.availableBalance || 0)}
          icon={DollarSign}
          description="Available funds"
          href="/dashboard/wallet"
          loading={isLoading}
          gradient="from-amber-400 to-amber-600"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Common tasks and shortcuts to manage your business efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/dashboard/products/new", icon: Plus, label: "Add Product", gradient: "from-green-500 to-green-600" },
                { href: "/dashboard/rfqs/new", icon: Package, label: "Create RFQ", gradient: "from-blue-500 to-blue-600" },
                { href: "/dashboard/orders", icon: ShoppingCart, label: "View Orders", gradient: "from-purple-500 to-purple-600" },
                { href: "/dashboard/wallet", icon: DollarSign, label: "Manage Wallet", gradient: "from-amber-500 to-amber-600" }
              ].map((action, index) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={action.href}>
                    <Button className={`w-full h-24 flex-col space-y-2 group bg-gradient-to-r ${action.gradient} hover:shadow-lg transition-all duration-300 text-white border-0`}>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <action.icon className="h-7 w-7" />
                      </motion.div>
                      <span className="font-medium">{action.label}</span>
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart - Takes 2 columns */}
        <motion.div 
          className="lg:col-span-2"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                Revenue Overview
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Your revenue performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Performance - Takes 1 column */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Star className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                Top Products
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductPerformance />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Secondary Content Grid */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Latest orders from your customers</CardDescription>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/dashboard/orders">
                  <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30">
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </CardHeader>
            <CardContent>
              <RecentOrders />
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Stats */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                Business Overview
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Key metrics for your business performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: metrics?.activeRFQs || 0, label: "Active RFQs", color: "blue", icon: MessageSquare },
                    { value: metrics?.completedOrders || 0, label: "Completed Orders", color: "green", icon: CheckCircle },
                    { value: metrics?.pendingOrders || 0, label: "Pending Orders", color: "yellow", icon: Clock },
                    { value: walletBalance ? formatCurrency(walletBalance.lockedBalance || 0) : '₹0', label: "Locked Balance", color: "purple", icon: DollarSign }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`text-center p-4 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 dark:from-${stat.color}-900/20 dark:to-${stat.color}-800/20 rounded-xl border border-${stat.color}-200 dark:border-${stat.color}-800/30`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="flex justify-center mb-2"
                      >
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </motion.div>
                      <div className={`text-2xl font-bold text-${stat.color}-700 dark:text-${stat.color}-300`}>{stat.value}</div>
                      <p className={`text-sm text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4 border-t border-amber-200 dark:border-amber-800/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                    >
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">Active</Badge>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity Summary */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
              Recent Activity Summary
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Quick overview of your recent business activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Package,
                  title: "Products Added",
                  description: `${topProducts?.length || 0} new products this week`,
                  color: "blue"
                },
                {
                  icon: ShoppingCart,
                  title: "Orders Processed",
                  description: `${recentOrders?.length || 0} orders this week`,
                  color: "green"
                },
                {
                  icon: TrendingUp,
                  title: "Revenue Growth",
                  description: `${metrics?.revenueChange ? `+${metrics.revenueChange.toFixed(1)}%` : '0%'} this month`,
                  color: "purple"
                }
              ].map((activity, index) => (
                <motion.div
                  key={activity.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`flex items-center space-x-4 p-4 border-2 rounded-xl bg-gradient-to-br from-${activity.color}-50 to-${activity.color}-100 dark:from-${activity.color}-900/20 dark:to-${activity.color}-800/20 border-${activity.color}-200 dark:border-${activity.color}-800/30 transition-all duration-300`}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className={`w-12 h-12 bg-gradient-to-r from-${activity.color}-400 to-${activity.color}-600 rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <activity.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <p className={`font-semibold text-${activity.color}-800 dark:text-${activity.color}-200`}>{activity.title}</p>
                    <p className={`text-sm text-${activity.color}-600 dark:text-${activity.color}-400`}>
                      {activity.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}