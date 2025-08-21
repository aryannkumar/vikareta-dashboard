'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

import { DataTable } from '../../../../components/ui/data-table';
import { apiClient } from '../../../../lib/api/client';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import type { LockedAmount, WalletBalance } from '../../../../types';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';

export default function LockedAmountsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [lockedAmounts, setLockedAmounts] = useState<LockedAmount[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'all'
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [balanceResponse, lockedAmountsResponse] = await Promise.all([
        apiClient.get('/wallet/balance'),
        apiClient.get('/wallet/locked-amounts', {
          params: {
            page: pagination.current,
            limit: pagination.pageSize,
            status: filters.status === 'all' ? undefined : filters.status
          }
        })
      ]);

      if (balanceResponse.success && balanceResponse.data) {
        setBalance(balanceResponse.data as WalletBalance);
      }

      if (lockedAmountsResponse.success && lockedAmountsResponse.data) {
        const data = lockedAmountsResponse.data as any;
        setLockedAmounts(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReleaseLock = async (lockId: string) => {
    if (!confirm('Are you sure you want to release this locked amount?')) {
      return;
    }

    try {
      const response = await apiClient.post(`/wallet/locked-amounts/${lockId}/release`);
      if (response.success) {
        alert('Locked amount released successfully');
        loadData();
      }
    } catch (error) {
      console.error('Error releasing lock:', error);
      alert('Failed to release locked amount');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: Lock, label: 'Active' },
      released: { color: 'bg-blue-100 text-blue-800', icon: Unlock, label: 'Released' },
      expired: { color: 'bg-red-100 text-red-800', icon: Clock, label: 'Expired' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRemainingTime = (lockedUntil: string) => {
    const now = new Date();
    const lockExpiry = new Date(lockedUntil);
    const diff = lockExpiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const columns: ColumnDef<LockedAmount>[] = [
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => (
        <span className="font-semibold text-lg">{formatCurrency(getValue() as number)}</span>
      )
    },
    {
      accessorKey: 'lockReason',
      header: 'Reason',
      cell: ({ getValue }) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900">{getValue() as string}</p>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => getStatusBadge(getValue() as string)
    },
    {
      accessorKey: 'lockedUntil',
      header: 'Locked Until',
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-medium">{formatDate(getValue() as string)}</p>
          {row.original.status === 'active' && (
            <p className="text-sm text-gray-600">
              {getRemainingTime(getValue() as string)} remaining
            </p>
          )}
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => formatDate(getValue() as string)
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/orders/${row.original.referenceId}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReleaseLock(row.original.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Unlock className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const activeLockedAmount = lockedAmounts
    .filter(lock => lock.status === 'active')
    .reduce((sum, lock) => sum + lock.amount, 0);

  const expiredLockedAmount = lockedAmounts
    .filter(lock => lock.status === 'expired')
    .reduce((sum, lock) => sum + lock.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locked Amounts</h1>
          <p className="text-gray-600">Track your deal assurance and locked funds</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Locked</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(balance?.lockedBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Locks</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(activeLockedAmount)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired Locks</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(expiredLockedAmount)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(balance?.availableBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">About Locked Amounts</h3>
            <p className="text-sm text-blue-800 mt-1">
              Locked amounts are funds temporarily held to ensure transaction completion. These amounts are automatically
              released when orders are completed or can be manually released if orders are cancelled. Locked funds
              provide assurance to both buyers and sellers in high-value transactions.
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="released">Released</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </Card>

      {/* Locked Amounts Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Locked Amounts History</h3>
        </div>

        <DataTable
          data={lockedAmounts}
          columns={columns}
          isLoading={loading}
          searchKey="lockReason"
          searchPlaceholder="Search by reason..."
        />
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lock Activity</h3>

        <div className="space-y-3">
          {lockedAmounts.slice(0, 5).map((lock) => (
            <div key={lock.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${lock.status === 'active' ? 'bg-yellow-100' :
                  lock.status === 'released' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                  {lock.status === 'active' ? (
                    <Lock className="h-4 w-4 text-yellow-600" />
                  ) : lock.status === 'released' ? (
                    <Unlock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{lock.lockReason}</p>
                  <p className="text-sm text-gray-600">{formatDate(lock.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(lock.amount)}</p>
                {getStatusBadge(lock.status)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}