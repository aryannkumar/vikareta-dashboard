'use client';

import { useMemo } from 'react';
import { AdCampaign, AdAnalytics } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface CampaignComparisonProps {
  campaigns: AdCampaign[];
  analytics: AdAnalytics[];
}

export function CampaignComparison({ campaigns, analytics }: CampaignComparisonProps) {
  const comparisonData = useMemo(() => {
    return campaigns.map(campaign => {
      const campaignAnalytics = analytics.filter(a => a.campaignId === campaign.id);
      
      const totals = campaignAnalytics.reduce(
        (acc, curr) => ({
          impressions: acc.impressions + curr.impressions,
          clicks: acc.clicks + curr.clicks,
          conversions: acc.conversions + curr.conversions,
          spend: acc.spend + curr.spend,
          revenue: acc.revenue + curr.revenue,
        }),
        { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
      );

      const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
      const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
      const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

      return {
        campaign,
        totals,
        metrics: { ctr, cpc, roas, conversionRate },
      };
    });
  }, [campaigns, analytics]);

  if (comparisonData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Select campaigns to compare their performance</p>
      </div>
    );
  }

  // Find max values for scaling bars
  const maxImpressions = Math.max(...comparisonData.map(d => d.totals.impressions));
  const maxClicks = Math.max(...comparisonData.map(d => d.totals.clicks));

  return (
    <div className="space-y-6">
      {comparisonData.map((data) => (
        <div key={data.campaign.id} className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-foreground">{data.campaign.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                {data.campaign.campaignType} • {data.campaign.status}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-ad-orange">
                {formatCurrency(data.campaign.budget)}
              </div>
              <div className="text-xs text-muted-foreground">
                Spent: {formatCurrency(data.totals.spend)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Impressions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Impressions</span>
                <span className="text-sm font-medium text-ad-blue">
                  {data.totals.impressions.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-ad-blue h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${maxImpressions > 0 ? (data.totals.impressions / maxImpressions) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Clicks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Clicks</span>
                <span className="text-sm font-medium text-ad-orange">
                  {data.totals.clicks.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-ad-orange h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${maxClicks > 0 ? (data.totals.clicks / maxClicks) * 100 : 0}%`
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                CTR: {formatPercentage(data.metrics.ctr / 100)}
              </div>
            </div>

            {/* Conversions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Conversions</span>
                <span className="text-sm font-medium text-ad-status-success">
                  {data.totals.conversions.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-ad-status-success h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${data.totals.conversions > 0 ? Math.min((data.totals.conversions / Math.max(...comparisonData.map(d => d.totals.conversions))) * 100, 100) : 0}%`
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Rate: {formatPercentage(data.metrics.conversionRate / 100)}
              </div>
            </div>

            {/* ROAS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ROAS</span>
                <span className="text-sm font-medium text-ad-status-success">
                  {data.metrics.roas.toFixed(2)}x
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-ad-status-success h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(data.metrics.roas * 20, 100)}%` // Scale ROAS for visual representation
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                CPC: {formatCurrency(data.metrics.cpc)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Performance Summary */}
      {comparisonData.length > 1 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Best CTR:</span>
              <div className="font-medium text-ad-blue">
                {comparisonData.reduce((best, current) => 
                  current.metrics.ctr > best.metrics.ctr ? current : best
                ).campaign.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPercentage(Math.max(...comparisonData.map(d => d.metrics.ctr)) / 100)}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Best ROAS:</span>
              <div className="font-medium text-ad-status-success">
                {comparisonData.reduce((best, current) => 
                  current.metrics.roas > best.metrics.roas ? current : best
                ).campaign.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.max(...comparisonData.map(d => d.metrics.roas)).toFixed(2)}x
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Lowest CPC:</span>
              <div className="font-medium text-ad-orange">
                {comparisonData.reduce((best, current) => 
                  current.metrics.cpc < best.metrics.cpc && current.metrics.cpc > 0 ? current : best
                ).campaign.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(Math.min(...comparisonData.map(d => d.metrics.cpc).filter(cpc => cpc > 0)))}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Most Conversions:</span>
              <div className="font-medium text-ad-status-success">
                {comparisonData.reduce((best, current) => 
                  current.totals.conversions > best.totals.conversions ? current : best
                ).campaign.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.max(...comparisonData.map(d => d.totals.conversions)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}