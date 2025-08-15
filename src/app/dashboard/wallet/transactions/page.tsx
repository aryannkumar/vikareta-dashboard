'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download,
  Calendar,
  DollarSign,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  CreditCard,
  Wallet as WalletIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface WalletTransaction {
  id: string;
  transactionType: 'credit' | 'debit' | 'lock' | 'unlock';
  amount: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  description: string;
  cashfreeTransactionId: string;
  createdAt: string;
}

interface TransactionFilters {
  type?: string;
  dateRange?: string;
  minAmount?: number;
  maxAmount?: number;
}

export default function WalletTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const loadTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get('/wallet/transactions', {
        params: {
          page,
          limit: 20,
          search: searchTerm,
          type: filters.type,
          dateRange: filters.dateRange,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
        }
      });

      if (response.success && response.data) {
        const data = response.data as any;
        setTransactions(data.transactions || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setTotalTransactions(data.total || 0);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions. Please try again.',
        variant: 'destructive',
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTransactions(1);
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/wallet/transactions/export', {
        params: {
          search: searchTerm,
          type: filters.type,
          dateRange: filters.dateRange,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
          format: 'csv'
        }
      });

      if (response.success) {
        // Create and download CSV file
        const blob = new Blob([response.data as string], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Transactions exported successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to export transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to export transactions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

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
        return <WalletIcon className="h-4 w-4 text-gray-600" />;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'debit':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'lock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'unlock':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAmountDisplay = (transaction: WalletTransaction) => {
    const sign = transaction.transactionType === 'credit' || transaction.transactionType === 'unlock' ? '+' : '-';
    return `${sign}${formatCurrency(transaction.amount)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">View and manage your wallet transaction history</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadTransactions(currentPage)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
              <WalletIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits</p>
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.transactionType === 'credit').length}
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Debits</p>
                <p className="text-2xl font-bold text-red-600">
                  {transactions.filter(t => t.transactionType === 'debit').length}
                </p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    transactions.reduce((sum, t) => {
                      const amount = t.transactionType === 'credit' || t.transactionType === 'unlock' 
                        ? t.amount 
                        : -t.amount;
                      return sum + amount;
                    }, 0)
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by description or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filters.type || ''} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="lock">Lock</SelectItem>
                  <SelectItem value="unlock">Unlock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.dateRange || ''} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({totalTransactions})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2 text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.transactionType)}
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {transaction.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.transactionType)}>
                          {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getTransactionColor(transaction.transactionType)}`}>
                          {getAmountDisplay(transaction)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(transaction.balanceAfter)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{transaction.referenceType}</div>
                          {transaction.referenceId && (
                            <div className="text-muted-foreground">
                              {transaction.referenceId.slice(0, 8)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(transaction.createdAt)}</div>
                          <div className="text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalTransactions)} of {totalTransactions} transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = currentPage - 1;
                        setCurrentPage(newPage);
                        loadTransactions(newPage);
                      }}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = currentPage + 1;
                        setCurrentPage(newPage);
                        loadTransactions(newPage);
                      }}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <WalletIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'Try adjusting your search or filters.'
                  : 'Your wallet transactions will appear here.'
                }
              </p>
              {searchTerm || Object.keys(filters).length > 0 ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({});
                    setCurrentPage(1);
                    loadTransactions(1);
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}