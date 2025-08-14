'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, MousePointer, DollarSign, TrendingUp, Target, RefreshCw, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

interface AdCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  impressions: number;
  clicks: number;
  spent: number;
  budget: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  conversions: number;
  roas: number; // Return on ad spend
  type: 'search' | 'display' | 'social' | 'video';
}

interface AdAnalytics {
  totalImpressions: number;
  totalClicks: number;
  totalSpent: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageROAS: number;
  campaigns: AdCampaign[];
}

const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

const getTypeColor = (type: string) => {
  const colors = {
    search: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    display: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    social: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
    video: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

export function AdAnalytics() {
  const [analytics, setAnalytics] = useState<AdAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAdvertisementAnalytics(3);
      
      if (response.success && response.data) {
        setAnalytics(response.data as AdAnalytics);
      } else {
        // Fallback to mock data if API fails
        const mockAnalytics: AdAnalytics = {
          totalImpressions: 36690,
          totalClicks: 1904,
          totalSpent: 9370,
          totalConversions: 156,
          averageCTR: 5.2,
          averageCPC: 4.92,
          averageROAS: 3.8,
          campaigns: [
            {
              id: '1',
              name: 'LED Lights Promotion',
              status: 'active',
              impressions: 15420,
              clicks: 892,
              spent: 4350,
              budget: 10000,
              ctr: 5.8,
              cpc: 4.88,
              conversions: 67,
              roas: 4.2,
              type: 'search'
            },
            {
              id: '2',
              name: 'Textile Products Banner',
              status: 'active',
              impressions: 12350,
              clicks: 567,
              spent: 2840,
              budget: 7500,
              ctr: 4.6,
              cpc: 5.01,
              conversions: 45,
              roas: 3.6,
              type: 'display'
            },
            {
              id: '3',
              name: 'Steel Products Featured',
              status: 'paused',
              impressions: 8920,
              clicks: 445,
              spent: 2180,
              budget: 5000,
              ctr: 5.0,
              cpc: 4.90,
              conversions: 44,
              roas: 3.5,
              type: 'social'
            }
          ]
        };
        setAnalytics(mockAnalytics);
      }
    } catch (err) {
      console.error('Failed to fetch ad analytics:', err);
      setError('Failed to load ad analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-4 bg-muted-foreground/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse p-3 border border-border rounded-lg">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-3 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-2 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">{error}</div>
        <Button variant="outline" size="sm" onClick={fetchAdAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <div className="text-muted-foreground mb-4">No advertising data available</div>
        <Link href="/dashboard/advertisements/new">
          <Button variant="outline" size="sm">
            Create Campaign
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Eye className="w-4 h-4 mr-1 text-blue-600" />
            <span className="text-lg font-bold">{(analytics.totalImpressions / 1000).toFixed(1)}K</span>
          </div>
          <div className="text-xs text-muted-foreground">Total Impressions</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <MousePointer className="w-4 h-4 mr-1 text-green-600" />
            <span className="text-lg font-bold">{analytics.totalClicks.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground">Total Clicks</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 mr-1 text-purple-600" />
            <span className="text-lg font-bold">₹{analytics.totalSpent.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground">Total Spent</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 mr-1 text-orange-600" />
            <span className="text-lg font-bold">{analytics.averageCTR.toFixed(1)}%</span>
          </div>
          <div className="text-xs text-muted-foreground">Avg CTR</div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-muted/30 rounded">
          <div className="font-medium">{analytics.totalConversions}</div>
          <div className="text-muted-foreground">Conversions</div>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded">
          <div className="font-medium">₹{analytics.averageCPC.toFixed(2)}</div>
          <div className="text-muted-foreground">Avg CPC</div>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded">
          <div className="font-medium">{analytics.averageROAS.toFixed(1)}x</div>
          <div className="text-muted-foreground">Avg ROAS</div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            Top Campaigns
          </div>
          <Button variant="ghost" size="sm" onClick={fetchAdAnalytics}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
        
        {analytics.campaigns.map((campaign) => (
          <div key={campaign.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Target className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm font-semibold truncate">{campaign.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${getTypeColor(campaign.type)}`}>
                  {campaign.type.toUpperCase()}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                  {campaign.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impressions</span>
                  <span className="font-medium">{(campaign.impressions / 1000).toFixed(1)}K</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clicks</span>
                  <span className="font-medium">{campaign.clicks}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CTR</span>
                  <span className="font-medium text-green-600">{campaign.ctr}%</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conversions</span>
                  <span className="font-medium text-blue-600">{campaign.conversions}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPC</span>
                  <span className="font-medium">₹{campaign.cpc.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROAS</span>
                  <span className="font-medium text-purple-600">{campaign.roas.toFixed(1)}x</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Budget Used</span>
                <span className="font-medium">
                  ₹{campaign.spent.toLocaleString()} / ₹{campaign.budget.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={(campaign.spent / campaign.budget) * 100} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground text-right">
                {((campaign.spent / campaign.budget) * 100).toFixed(1)}% used
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link href="/dashboard/advertisements">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            View All Campaigns
          </Button>
        </Link>
      </div>
    </div>
  );
}