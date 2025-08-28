'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import type { WalletBalance, WalletAnalytics, WalletTransaction } from '@/types';
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  Activity
} from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadWalletData();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadWalletData = async () => {
    try {
      setLoading(true);

      // Fetch real wallet balance
      const balanceResponse = await apiClient.get('/wallet/balance');
      if (balanceResponse.success && balanceResponse.data) {
        setBalance(balanceResponse.data as WalletBalance);
      } else {
        // Fallback balance
        setBalance({
          availableBalance: 0,
          lockedBalance: 0,
          totalBalance: 0,
          negativeBalance: 0
        });
      }

      // Fetch recent transactions
      const transactionsResponse = await apiClient.getRecentWalletTransactions(5);
      if (transactionsResponse.success && transactionsResponse.data) {
        setRecentTransactions(transactionsResponse.data as WalletTransaction[]);
      } else {
        // Fallback empty transactions
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      // Load analytics from backend
      const analyticsResponse = await apiClient.getWalletAnalytics();
      let walletAnalytics: WalletAnalytics;
      
      if (analyticsResponse.success && analyticsResponse.data) {
        walletAnalytics = analyticsResponse.data as WalletAnalytics;
      } else {
        // Fallback analytics data
        walletAnalytics = {
          totalInflow: 0,
          totalOutflow: 0,
          monthlyInflow: 0,
          monthlyOutflow: 0,
          inflowChange: 0,
          outflowChange: 0,
          transactionCount: 0,
          averageTransactionAmount: 0
        };
      }

      setAnalytics(walletAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'lock':
        return <Lock className="h-4 w-4 text-yellow-600" />;
      case 'unlock':
        return <Lock className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-green-600';
      case 'debit':
        return 'text-red-600';
      case 'lock':
        return 'text-yellow-600';
      case 'unlock':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your wallet balance and transactions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard/wallet/add-money')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/wallet/withdraw')}>
            <Minus className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(balance?.availableBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <WalletIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Locked Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(balance?.lockedBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Lock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(balance?.totalBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Negative Balance</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(balance?.negativeBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Minus className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  disabled={analyticsLoading}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loading />
            </div>
          ) : analytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Total Inflow</span>
                  </div>
                  <p className="text-xl font-bold text-green-900 mt-1">
                    {formatCurrency(analytics.totalInflow)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {analytics.inflowChange > 0 ? '+' : ''}{analytics.inflowChange.toFixed(1)}% from last period
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Total Outflow</span>
                  </div>
                  <p className="text-xl font-bold text-red-900 mt-1">
                    {formatCurrency(analytics.totalOutflow)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {analytics.outflowChange > 0 ? '+' : ''}{analytics.outflowChange.toFixed(1)}% from last period
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-lg font-semibold">{analytics.transactionCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Amount</p>
                  <p className="text-lg font-semibold">{formatCurrency(analytics.averageTransactionAmount)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No analytics data available</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/wallet/transactions')}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transactionType)}
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.transactionType)}`}>
                      {transaction.transactionType === 'credit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Balance: {formatCurrency(transaction.balanceAfter)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent transactions</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => router.push('/dashboard/wallet/add-money')}
          >
            <Plus className="h-6 w-6" />
            Add Money
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => router.push('/dashboard/wallet/withdraw')}
          >
            <Minus className="h-6 w-6" />
            Withdraw
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => router.push('/dashboard/wallet/locked-amounts')}
          >
            <Lock className="h-6 w-6" />
            Locked Amounts
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => router.push('/dashboard/wallet/bank-accounts')}
          >
            <CreditCard className="h-6 w-6" />
            Bank Accounts
          </Button>
        </div>
      </Card>
    </div>
  );
}