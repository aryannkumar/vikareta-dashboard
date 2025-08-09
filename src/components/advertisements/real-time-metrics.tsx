'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  EyeIcon, 
  CursorArrowRaysIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { AdAnalytics } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface RealTimeMetricsProps {
  analytics: AdAnalytics[];
  refreshInterval?: number; // in seconds
}

interface RealTimeData {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  timestamp: string;
}

export function RealTimeMetrics({ analytics, refreshInterval = 30 }: RealTimeMetricsProps) {
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeData | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<RealTimeData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Calculate current metrics from analytics
  const calculateMetrics = useCallback((): RealTimeData => {
    const today = new Date().toISOString().split('T')[0];
    const todayAnalytics = analytics.filter(a => 
      new Date(a.date).toISOString().split('T')[0] === today
    );

    const totals = todayAnalytics.reduce(
      (acc, curr) => ({
        impressions: acc.impressions + curr.impressions,
        clicks: acc.clicks + curr.clicks,
        spend: acc.spend + curr.spend,
        conversions: acc.conversions + curr.conversions,
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const roas = totals.spend > 0 ? (totals.conversions * 100) / totals.spend : 0; // Assuming ₹100 per conversion

    return {
      ...totals,
      ctr,
      cpc,
      roas,
      timestamp: new Date().toISOString(),
    };
  }, [analytics]);

  // Auto-refresh effect
  useEffect(() => {
    // Update metrics
    const updateMetrics = () => {
      const newMetrics = calculateMetrics();
      setPreviousMetrics(currentMetrics);
      setCurrentMetrics(newMetrics);
      setLastUpdate(new Date());
    };

    updateMetrics();
    
    if (isLive) {
      const interval = setInterval(updateMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [analytics, isLive, refreshInterval, calculateMetrics, currentMetrics]);

  // Calculate change percentages
  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return ArrowTrendingUpIcon;
    if (change < 0) return ArrowTrendingDownIcon;
    return MinusIcon;
  };

  const getTrendColor = (change: number, isPositiveGood = true) => {
    if (change === 0) return 'text-muted-foreground';
    const isGood = isPositiveGood ? change > 0 : change < 0;
    return isGood ? 'text-ad-status-success' : 'text-ad-status-rejected';
  };

  if (!currentMetrics) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const metrics = [
    {
      title: 'Impressions',
      value: currentMetrics.impressions.toLocaleString(),
      change: previousMetrics ? getChange(currentMetrics.impressions, previousMetrics.impressions) : 0,
      icon: EyeIcon,
      color: 'text-ad-blue',
      bgColor: 'bg-ad-blue/10',
      isPositiveGood: true,
    },
    {
      title: 'Clicks',
      value: currentMetrics.clicks.toLocaleString(),
      change: previousMetrics ? getChange(currentMetrics.clicks, previousMetrics.clicks) : 0,
      icon: CursorArrowRaysIcon,
      color: 'text-ad-blue',
      bgColor: 'bg-ad-blue/10',
      isPositiveGood: true,
      subValue: `${formatPercentage(currentMetrics.ctr / 100)} CTR`,
    },
    {
      title: 'Spend',
      value: formatCurrency(currentMetrics.spend),
      change: previousMetrics ? getChange(currentMetrics.spend, previousMetrics.spend) : 0,
      icon: CurrencyDollarIcon,
      color: 'text-ad-orange',
      bgColor: 'bg-ad-orange/10',
      isPositiveGood: false,
      subValue: `${formatCurrency(currentMetrics.cpc)} CPC`,
    },
    {
      title: 'Conversions',
      value: currentMetrics.conversions.toLocaleString(),
      change: previousMetrics ? getChange(currentMetrics.conversions, previousMetrics.conversions) : 0,
      icon: ArrowTrendingUpIcon,
      color: 'text-ad-status-success',
      bgColor: 'bg-ad-status-success/10',
      isPositiveGood: true,
      subValue: `${currentMetrics.roas.toFixed(1)}% ROAS`,
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Real-Time Performance</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-ad-status-success animate-pulse' : 'bg-muted'}`} />
            <span className="text-sm text-muted-foreground">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-sm text-ad-blue hover:text-ad-blue/80 transition-colors"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = getTrendIcon(metric.change);
          const trendColor = getTrendColor(metric.change, metric.isPositiveGood);

          return (
            <div key={metric.title} className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${metric.color}`}>
                    {metric.value}
                  </p>
                  {metric.subValue && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.subValue}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>

              {/* Change indicator */}
              {previousMetrics && (
                <div className="flex items-center space-x-1">
                  <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                  <span className={`text-xs font-medium ${trendColor}`}>
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs last update
                  </span>
                </div>
              )}

              {/* Live indicator for active metrics */}
              {isLive && metric.change !== 0 && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-ad-status-success rounded-full animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-foreground">
              {formatPercentage(currentMetrics.ctr / 100)}
            </div>
            <div className="text-sm text-muted-foreground">Click-Through Rate</div>
            <div className={`text-xs mt-1 ${
              currentMetrics.ctr >= 2 ? 'text-ad-status-success' : 
              currentMetrics.ctr >= 1 ? 'text-ad-status-pending' : 'text-ad-status-rejected'
            }`}>
              {currentMetrics.ctr >= 2 ? 'Excellent' : 
               currentMetrics.ctr >= 1 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(currentMetrics.cpc)}
            </div>
            <div className="text-sm text-muted-foreground">Cost Per Click</div>
            <div className={`text-xs mt-1 ${
              currentMetrics.cpc <= 2 ? 'text-ad-status-success' : 
              currentMetrics.cpc <= 5 ? 'text-ad-status-pending' : 'text-ad-status-rejected'
            }`}>
              {currentMetrics.cpc <= 2 ? 'Excellent' : 
               currentMetrics.cpc <= 5 ? 'Good' : 'High'}
            </div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-foreground">
              {currentMetrics.roas.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Return on Ad Spend</div>
            <div className={`text-xs mt-1 ${
              currentMetrics.roas >= 300 ? 'text-ad-status-success' : 
              currentMetrics.roas >= 150 ? 'text-ad-status-pending' : 'text-ad-status-rejected'
            }`}>
              {currentMetrics.roas >= 300 ? 'Excellent' : 
               currentMetrics.roas >= 150 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          {isLive ? `Auto-refreshing every ${refreshInterval} seconds` : 'Auto-refresh paused'}
        </p>
      </div>
    </Card>
  );
}