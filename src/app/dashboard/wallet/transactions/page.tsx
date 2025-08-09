'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
// import { Loading } from '../../../../components/ui/loading';
import { DataTable } from '../../../../components/ui/data-table';
// import { WalletService } from '../../../../lib/api/services/wallet.service';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import type { WalletTransaction, WalletBalance } from '../../../../types';
import type { ColumnDef } from '@tanstack/react-table';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight,
  Lock,
  Unlock,
  Search,
  Filter,
  Download,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function TransactionsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls when backend is ready
      // Mock wallet balance
      const mockBalance: WalletBalance = {
        availableBalance: 125000,
        lockedBalance: 25000,
        negativeBalance: 0,
        totalBalance: 150000
      };

      // Mock transactions
      const mockTransactions: WalletTransaction[] = [
        {
          id: '1',
          walletId: 'wallet-1',
          transactionType: 'credit',
          amount: 25000,
          description: 'Payment received from Order #ORD-2024-001',
          balanceAfter: 125000,
          referenceType: 'order',
          referenceId: 'ORD-2024-001',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          walletId: 'wallet-1',
          transactionType: 'debit',
          amount: 5000,
          description: 'Advertisement campaign payment',
          balanceAfter: 120000,
          referenceType: 'advertisement',
          referenceId: 'AD-2024-001',
          createdAt: '2024-01-14T15:45:00Z',
        },
        {
          id: '3',
          walletId: 'wallet-1',
          transactionType: 'credit',
          amount: 15000,
          description: 'Refund for cancelled order',
          balanceAfter: 100000,
          referenceType: 'refund',
          referenceId: 'REF-2024-001',
          createdAt: '2024-01-13T09:20:00Z',
        },
        {
          id: '4',
          walletId: 'wallet-1',
          transactionType: 'lock',
          amount: 10000,
          description: 'Amount locked for pending order',
          balanceAfter: 90000,
          referenceType: 'order',
          referenceId: 'ORD-2024-002',
          createdAt: '2024-01-12T14:20:00Z',
        },
        {
          id: '5',
          walletId: 'wallet-1',
          transactionType: 'unlock',
          amount: 10000,
          description: 'Amount unlocked after order completion',
          balanceAfter: 100000,
          referenceType: 'order',
          referenceId: 'ORD-2024-002',
          createdAt: '2024-01-11T16:30:00Z',
        }
      ];

      setBalance(mockBalance);
      setTransactions(mockTransactions);
      setPagination(prev => ({
        ...prev,
        total: mockTransactions.length
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // This would typically call an export API endpoint
      alert('Export functionality would be implemented here');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Failed to export transactions');
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
        return <Unlock className="h-4 w-4 text-blue-600" />;
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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      credit: { color: 'bg-green-100 text-green-800', label: 'Credit' },
      debit: { color: 'bg-red-100 text-red-800', label: 'Debit' },
      lock: { color: 'bg-yellow-100 text-yellow-800', label: 'Lock' },
      unlock: { color: 'bg-blue-100 text-blue-800', label: 'Unlock' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { color: 'bg-gray-100 text-gray-800', label: type };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const columns: ColumnDef<WalletTransaction>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Date & Time',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{formatDate(row.original.createdAt)}</p>
          <p className="text-sm text-gray-600">
            {new Date(row.original.createdAt).toLocaleTimeString()}
          </p>
        </div>
      )
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getTransactionIcon(row.original.transactionType)}
          {getTypeBadge(row.original.transactionType)}
        </div>
      )
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.description}</p>
          {row.original.referenceType && (
            <p className="text-sm text-gray-600">
              Ref: {row.original.referenceType} - {row.original.referenceId.slice(0, 8)}...
            </p>
          )}
        </div>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className={`font-semibold text-lg ${getTransactionColor(row.original.transactionType)}`}>
          {row.original.transactionType === 'credit' || row.original.transactionType === 'unlock' ? '+' : '-'}
          {formatCurrency(row.original.amount)}
        </span>
      )
    },
    {
      accessorKey: 'balanceAfter',
      header: 'Balance After',
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.balanceAfter)}</span>
      )
    },
    {
      accessorKey: 'cashfreeTransactionId',
      header: 'Transaction ID',
      cell: ({ row }) => (
        row.original.cashfreeTransactionId ? (
          <span className="text-sm font-mono text-gray-600">
            {row.original.cashfreeTransactionId.slice(0, 12)}...
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      )
    }
  ];

  const creditTransactions = transactions.filter(t => t.transactionType === 'credit');
  const debitTransactions = transactions.filter(t => t.transactionType === 'debit');
  const totalCredits = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = debitTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600">View and manage your wallet transactions</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(balance?.availableBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalCredits)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Debits</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalDebits)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locked Balance</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(balance?.lockedBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Type:</label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="lock">Lock</option>
              <option value="unlock">Unlock</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-600" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-64"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ type: 'all', dateFrom: '', dateTo: '', search: '' })}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
          <div className="text-sm text-gray-600">
            Showing {transactions.length} of {pagination.total} transactions
          </div>
        </div>

        <DataTable
          data={transactions}
          columns={columns}
          isLoading={loading}
        />
      </Card>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Credits</h3>
          <div className="space-y-3">
            {creditTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                <span className="font-semibold text-green-600">
                  +{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
            {creditTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">No credit transactions</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Debits</h3>
          <div className="space-y-3">
            {debitTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
            {debitTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">No debit transactions</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}