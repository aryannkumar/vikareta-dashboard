'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  DollarSign,
  Calendar,
  BarChart3,
  Users,
  MousePointer,
  RefreshCw,
  Wallet,
  AlertCircle,
  TrendingUp
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  type: 'banner' | 'sponsored' | 'featured';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
  budget: number;
  spent: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  createdAt: string;
  updatedAt: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  walletBalance: number;
}

interface WalletBalance {
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/advertisements', {
        params: {
          search: searchTerm,
          status: statusFilter,
          type: typeFilter,
          limit: 50
        }
      });

      if (response.success && response.data) {
        const data = response.data as any;
        const adsList = Array.isArray(data) ? data : data.advertisements || data.data || [];
        setAdvertisements(adsList);
      } else {
        setAdvertisements([]);
      }
    } catch (error) {
      console.error('Failed to load advertisements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load advertisements. Please try again.',
        variant: 'destructive',
      });
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const response = await apiClient.get('/wallet/balance');
      if (response.success && response.data) {
        setWalletBalance(response.data as WalletBalance);
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const handleStatusChange = async (adId: string, newStatus: 'active' | 'paused') => {
    try {
      const response = await apiClient.put(`/advertisements/${adId}/status`, {
        status: newStatus
      });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Advertisement ${newStatus === 'active' ? 'activated' : 'paused'} successfully.`,
        });
        loadAdvertisements();
      } else {
        throw new Error('Failed to update advertisement status');
      }
    } catch (error) {
      console.error('Failed to update advertisement status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update advertisement status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/advertisements/${adId}`);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Advertisement deleted successfully.',
        });
        loadAdvertisements();
      } else {
        throw new Error('Failed to delete advertisement');
      }
    } catch (error) {
      console.error('Failed to delete advertisement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete advertisement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    loadAdvertisements();
  };

  useEffect(() => {
    loadAdvertisements();
    loadWalletBalance();
  }, [loadAdvertisements]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'banner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'sponsored': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'featured': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const totalSpent = advertisements.reduce((sum, ad) => sum + ad.spent, 0);
  const totalBudget = advertisements.reduce((sum, ad) => sum + ad.budget, 0);
  const activeAds = advertisements.filter(ad => ad.status === 'active').length;
  const totalImpressions = advertisements.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = advertisements.reduce((sum, ad) => sum + ad.clicks, 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Advertisements</h1>
          <p className="text-muted-foreground">Create and manage your advertising campaigns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/wallet">
            <Button variant="outline" size="sm">
              <Wallet className="mr-2 h-4 w-4" />
              Wallet: {walletBalance ? formatCurrency(walletBalance.availableBalance) : '₹0'}
            </Button>
          </Link>
          <Button variant="outline" onClick={loadAdvertisements} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/advertisements/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Wallet Balance Warning */}
      {walletBalance && walletBalance.availableBalance < 1000 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Low Wallet Balance</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your wallet balance is low. Add funds to continue running advertisements.
                </p>
              </div>
              <Link href="/dashboard/wallet/add-money">
                <Button size="sm" variant="outline">
                  Add Funds
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{activeAds}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-muted-foreground">of {formatCurrency(totalBudget)} budget</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average CTR</p>
                <p className="text-2xl font-bold">{averageCTR.toFixed(2)}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-orange-500" />
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
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="sponsored">Sponsored</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
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

      {/* Advertisements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({advertisements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2 text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : advertisements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisements.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ad.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {ad.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(ad.type)}>
                        {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ad.status)}>
                        {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrency(ad.budget)}</div>
                        <div className="text-sm text-muted-foreground">
                          Spent: {formatCurrency(ad.spent)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{ad.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MousePointer className="h-3 w-3 mr-1" />
                          <span>{ad.clicks} ({ad.ctr.toFixed(2)}%)</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(ad.startDate)}</div>
                        <div className="text-muted-foreground">
                          to {formatDate(ad.endDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/dashboard/advertisements/${ad.id}`} className="flex items-center w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/dashboard/advertisements/${ad.id}/analytics`} className="flex items-center w-full">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/dashboard/advertisements/${ad.id}/edit`} className="flex items-center w-full">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {ad.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(ad.id, 'paused')}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Pause Campaign
                            </DropdownMenuItem>
                          ) : ad.status === 'paused' ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(ad.id, 'active')}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Resume Campaign
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(ad.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter || typeFilter
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first advertising campaign to start promoting your products.'
                }
              </p>
              {searchTerm || statusFilter || typeFilter ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setTypeFilter('');
                    loadAdvertisements();
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href="/dashboard/advertisements/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}