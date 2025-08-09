'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { AdAnalytics } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface AnalyticsOverviewProps {
  analytics: AdAnalytics[];
  dateRange: string;
  loading?: boolean;
}

export function AnalyticsOverview({ analytics, dateRange, loading }: AnalyticsOverviewProps) {
  const aggregatedData = useMemo(() => {
    if (!analytics.length) return null;

    const totals = analytics.reduce(
      (acc, curr) => ({
        impressions: acc.impressions + curr.impressions,
        clicks: acc.clicks + curr.clicks,
        conversions: acc.conversions + curr.conversions,
        spend: acc.spend + curr.spend,
        revenue: acc.revenue + curr.revenue,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
    );

    const averages = {
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
      cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
      roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
      conversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
    };

    return { totals, averages };
  }, [analytics]);

  if (loading) {
    return (
      <Card className="p-6">
        <Loading />
      </Card>
    );
  }

  if (!aggregatedData) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No analytics data available for the selected period</p>
        </div>
      </Card>
    );
  }

  const { totals, averages } = aggregatedData;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Performance Overview</h2>
        <span className="text-sm text-muted-foreground capitalize">
          {dateRange.replace('d', ' days')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Impressions */}
        <div className="text-center">
          <div className="text-2xl font-bold text-ad-blue mb-1">
            {totals.impressions.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Impressions</div>
          <div className="text-xs text-ad-blue mt-1">
            CPM: {formatCurrency(averages.cpm)}
          </div>
        </div>

        {/* Clicks */}
        <div className="text-center">
          <div className="text-2xl font-bold text-ad-blue mb-1">
            {totals.clicks.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Clicks</div>
          <div className="text-xs text-ad-blue mt-1">
            CTR: {formatPercentage(averages.ctr / 100)}
          </div>
        </div>

        {/* Conversions */}
        <div className="text-center">
          <div className="text-2xl font-bold text-ad-status-success mb-1">
            {totals.conversions.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Conversions</div>
          <div className="text-xs text-ad-status-success mt-1">
            Rate: {formatPercentage(averages.conversionRate / 100)}
          </div>
        </div>

        {/* Spend */}
        <div className="text-center">
          <div className="text-2xl font-bold text-ad-orange mb-1">
            {formatCurrency(totals.spend)}
          </div>
          <div className="text-sm text-muted-foreground">Total Spend</div>
          <div className="text-xs text-ad-orange mt-1">
            CPC: {formatCurrency(averages.cpc)}
          </div>
        </div>

        {/* ROAS */}
        <div className="text-center">
          <div className="text-2xl font-bold text-ad-status-success mb-1">
            {averages.roas.toFixed(2)}x
          </div>
          <div className="text-sm text-muted-foreground">ROAS</div>
          <div className="text-xs text-ad-status-success mt-1">
            Revenue: {formatCurrency(totals.revenue)}
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Click-through Rate</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                averages.ctr >= 2 ? 'bg-ad-status-success' : 
                averages.ctr >= 1 ? 'bg-ad-status-pending' : 'bg-ad-status-rejected'
              }`} />
              <span className="text-sm font-medium">
                {formatPercentage(averages.ctr / 100)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Conversion Rate</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                averages.conversionRate >= 5 ? 'bg-ad-status-success' : 
                averages.conversionRate >= 2 ? 'bg-ad-status-pending' : 'bg-ad-status-rejected'
              }`} />
              <span className="text-sm font-medium">
                {formatPercentage(averages.conversionRate / 100)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Return on Ad Spend</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                averages.roas >= 3 ? 'bg-ad-status-success' : 
                averages.roas >= 1.5 ? 'bg-ad-status-pending' : 'bg-ad-status-rejected'
              }`} />
              <span className="text-sm font-medium">
                {averages.roas.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}