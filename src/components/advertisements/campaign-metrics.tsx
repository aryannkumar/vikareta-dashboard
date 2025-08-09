'use client';

import { useMemo } from 'react';
import { 
  EyeIcon, 
  CursorArrowRaysIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { AdCampaign } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface CampaignMetricsProps {
  campaigns: AdCampaign[];
}

export function CampaignMetrics({ campaigns }: CampaignMetricsProps) {
  const metrics = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const pausedCampaigns = campaigns.filter(c => c.status === 'paused').length;
    const pendingCampaigns = campaigns.filter(c => c.status === 'pending_approval').length;
    
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spentAmount, 0);
    
    const totalImpressions = campaigns.reduce((sum, c) => {
      return sum + (c.analytics?.reduce((aSum, a) => aSum + a.impressions, 0) || 0);
    }, 0);
    
    const totalClicks = campaigns.reduce((sum, c) => {
      return sum + (c.analytics?.reduce((aSum, a) => aSum + a.clicks, 0) || 0);
    }, 0);
    
    const totalConversions = campaigns.reduce((sum, c) => {
      return sum + (c.analytics?.reduce((aSum, a) => aSum + a.conversions, 0) || 0);
    }, 0);
    
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    
    return {
      totalCampaigns,
      activeCampaigns,
      pausedCampaigns,
      pendingCampaigns,
      totalBudget,
      totalSpent,
      totalImpressions,
      totalClicks,
      totalConversions,
      averageCTR,
      averageConversionRate,
    };
  }, [campaigns]);

  const metricCards = [
    {
      title: 'Total Campaigns',
      value: metrics.totalCampaigns.toString(),
      icon: ChartBarIcon,
      color: 'text-foreground',
      bgColor: 'bg-muted',
      subMetrics: [
        { label: 'Active', value: metrics.activeCampaigns, color: 'text-ad-status-active' },
        { label: 'Paused', value: metrics.pausedCampaigns, color: 'text-ad-status-paused' },
        { label: 'Pending', value: metrics.pendingCampaigns, color: 'text-ad-status-pending' },
      ],
    },
    {
      title: 'Total Budget',
      value: formatCurrency(metrics.totalBudget),
      icon: CurrencyDollarIcon,
      color: 'text-ad-orange',
      bgColor: 'bg-ad-orange/10',
      subMetrics: [
        { 
          label: 'Spent', 
          value: formatCurrency(metrics.totalSpent), 
          color: 'text-ad-orange' 
        },
        { 
          label: 'Remaining', 
          value: formatCurrency(metrics.totalBudget - metrics.totalSpent), 
          color: 'text-muted-foreground' 
        },
      ],
    },
    {
      title: 'Total Impressions',
      value: metrics.totalImpressions.toLocaleString(),
      icon: EyeIcon,
      color: 'text-ad-blue',
      bgColor: 'bg-ad-blue/10',
      subMetrics: [
        { 
          label: 'Clicks', 
          value: metrics.totalClicks.toLocaleString(), 
          color: 'text-ad-blue' 
        },
        { 
          label: 'CTR', 
          value: formatPercentage(metrics.averageCTR / 100), 
          color: 'text-muted-foreground' 
        },
      ],
    },
    {
      title: 'Conversions',
      value: metrics.totalConversions.toLocaleString(),
      icon: CursorArrowRaysIcon,
      color: 'text-ad-status-success',
      bgColor: 'bg-ad-status-success/10',
      subMetrics: [
        { 
          label: 'Conv. Rate', 
          value: formatPercentage(metrics.averageConversionRate / 100), 
          color: 'text-ad-status-success' 
        },
        { 
          label: 'Cost/Conv.', 
          value: metrics.totalConversions > 0 
            ? formatCurrency(metrics.totalSpent / metrics.totalConversions)
            : '₹0', 
          color: 'text-muted-foreground' 
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className={`text-2xl font-bold mt-2 ${metric.color}`}>
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
            
            {metric.subMetrics && (
              <div className="space-y-2">
                {metric.subMetrics.map((subMetric, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{subMetric.label}:</span>
                    <span className={`font-medium ${subMetric.color}`}>
                      {typeof subMetric.value === 'number' ? subMetric.value.toLocaleString() : subMetric.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}