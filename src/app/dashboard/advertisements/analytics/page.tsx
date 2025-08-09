'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, ChartBarIcon, CurrencyDollarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { AnalyticsOverview } from '@/components/advertisements/analytics-overview';
import { PerformanceChart } from '@/components/advertisements/performance-chart';
import { CampaignComparison } from '@/components/advertisements/campaign-comparison';
import { AudienceInsights } from '@/components/advertisements/audience-insights';
import { BudgetTracker } from '@/components/advertisements/budget-tracker';
import { RealTimeMetrics } from '@/components/advertisements/real-time-metrics';
import { HistoricalPerformance } from '@/components/advertisements/historical-performance';
import { useAdvertisementStore } from '@/lib/stores/advertisement';
import { formatCurrency, formatPercentage } from '@/lib/utils';

type DateRange = '7d' | '30d' | '90d' | 'custom';

export default function AdvertisementAnalyticsPage() {
  const { 
    campaigns, 
    analytics, 
    fetchAnalytics, 
    fetchCampaigns,
    pauseCampaign,
    resumeCampaign,
    loading 
  } = useAdvertisementStore();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'realtime' | 'historical' | 'budget'>('overview');

  useEffect(() => {
    fetchAnalytics(dateRange);
    fetchCampaigns();
  }, [fetchAnalytics, fetchCampaigns, dateRange]);

  const totalMetrics = analytics.reduce(
    (acc, curr) => ({
      impressions: acc.impressions + curr.impressions,
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      spend: acc.spend + curr.spend,
      revenue: acc.revenue + curr.revenue,
    }),
    { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
  );

  const averageCTR = totalMetrics.impressions > 0 
    ? (totalMetrics.clicks / totalMetrics.impressions) * 100 
    : 0;

  const averageCPC = totalMetrics.clicks > 0 
    ? totalMetrics.spend / totalMetrics.clicks 
    : 0;

  const roas = totalMetrics.spend > 0 
    ? totalMetrics.revenue / totalMetrics.spend 
    : 0;

  const metricCards = [
    {
      title: 'Total Impressions',
      value: totalMetrics.impressions.toLocaleString(),
      icon: EyeIcon,
      color: 'text-ad-blue',
      bgColor: 'bg-ad-blue/10',
    },
    {
      title: 'Total Clicks',
      value: totalMetrics.clicks.toLocaleString(),
      icon: ChartBarIcon,
      color: 'text-ad-blue',
      bgColor: 'bg-ad-blue/10',
    },
    {
      title: 'Total Spend',
      value: formatCurrency(totalMetrics.spend),
      icon: CurrencyDollarIcon,
      color: 'text-ad-orange',
      bgColor: 'bg-ad-orange/10',
    },
    {
      title: 'Average CTR',
      value: formatPercentage(averageCTR / 100),
      icon: ChartBarIcon,
      color: 'text-ad-status-success',
      bgColor: 'bg-ad-status-success/10',
    },
  ];

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await pauseCampaign(campaignId);
    } catch (error) {
      console.error('Failed to pause campaign:', error);
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      await resumeCampaign(campaignId);
    } catch (error) {
      console.error('Failed to resume campaign:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'realtime', label: 'Real-Time', icon: EyeIcon },
    { id: 'historical', label: 'Historical', icon: CalendarIcon },
    { id: 'budget', label: 'Budget Tracking', icon: CurrencyDollarIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advertisement Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your campaign performance and optimize your advertising strategy
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={dateRange}
            onValueChange={(value: string) => setDateRange(value as DateRange)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </Select>
          <Button variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-ad-orange text-ad-orange'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.title} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2">
                        {metric.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Performance Overview */}
          <AnalyticsOverview 
            analytics={analytics}
            dateRange={dateRange}
            loading={loading}
          />

          {/* Performance Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Performance Trends</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Metric:</span>
                <Select defaultValue="impressions">
                  <option value="impressions">Impressions</option>
                  <option value="clicks">Clicks</option>
                  <option value="conversions">Conversions</option>
                  <option value="spend">Spend</option>
                </Select>
              </div>
            </div>
            <PerformanceChart 
              analytics={analytics}
              dateRange={dateRange}
            />
          </Card>

          {/* Campaign Comparison */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Campaign Comparison</h2>
              <Select
                value={selectedCampaigns[0] || ''}
                onValueChange={(value) => setSelectedCampaigns([value])}
              >
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </div>
            <CampaignComparison 
              campaigns={campaigns.filter(c => selectedCampaigns.includes(c.id))}
              analytics={analytics}
            />
          </Card>

          {/* Audience Insights */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Audience Insights</h2>
            <AudienceInsights 
              analytics={analytics}
              dateRange={dateRange}
            />
          </Card>

          {/* Key Metrics Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-ad-blue mb-2">
                  {formatCurrency(averageCPC)}
                </div>
                <div className="text-sm text-muted-foreground">Average CPC</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ad-orange mb-2">
                  {roas.toFixed(2)}x
                </div>
                <div className="text-sm text-muted-foreground">Return on Ad Spend</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ad-status-success mb-2">
                  {totalMetrics.conversions.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Conversions</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'realtime' && (
        <RealTimeMetrics 
          analytics={analytics}
          refreshInterval={30}
        />
      )}

      {activeTab === 'historical' && (
        <HistoricalPerformance 
          analytics={analytics}
          dateRange={dateRange}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetTracker 
          campaigns={campaigns}
          onPauseCampaign={handlePauseCampaign}
          onResumeCampaign={handleResumeCampaign}
        />
      )}
    </div>
  );
}