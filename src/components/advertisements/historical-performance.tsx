'use client';

import { useMemo, useState } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { AdAnalytics } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface HistoricalPerformanceProps {
  analytics: AdAnalytics[];
  dateRange: string;
}

type MetricType = 'impressions' | 'clicks' | 'conversions' | 'spend' | 'ctr' | 'cpc' | 'roas';
type ViewType = 'daily' | 'weekly' | 'monthly';

export function HistoricalPerformance({ analytics }: HistoricalPerformanceProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('impressions');
  const [viewType, setViewType] = useState<ViewType>('daily');

  const processedData = useMemo(() => {
    if (!analytics.length) return [];

    // Group data by the selected view type
    const groupedData = analytics.reduce((acc, item) => {
      const date = new Date(item.date);
      let key: string;

      switch (viewType) {
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = item.date;
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
        };
      }

      acc[key].impressions += item.impressions;
      acc[key].clicks += item.clicks;
      acc[key].conversions += item.conversions;
      acc[key].spend += item.spend;
      acc[key].revenue += item.revenue;

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate derived metrics
    const processedArray = Object.values(groupedData).map((item: any) => ({
      ...item,
      ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
      cpc: item.clicks > 0 ? item.spend / item.clicks : 0,
      roas: item.spend > 0 ? item.revenue / item.spend : 0,
    }));

    // Sort by date
    return processedArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [analytics, viewType]);

  const chartData = useMemo(() => {
    if (!processedData.length) return { data: [], maxValue: 0, minValue: 0 };

    const values = processedData.map(item => item[selectedMetric]);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    return {
      data: processedData.map((item, index) => ({
        ...item,
        value: item[selectedMetric],
        percentage: maxValue > 0 ? (item[selectedMetric] / maxValue) * 100 : 0,
        index,
      })),
      maxValue,
      minValue,
    };
  }, [processedData, selectedMetric]);

  const trendAnalysis = useMemo(() => {
    if (chartData.data.length < 2) return null;

    const firstHalf = chartData.data.slice(0, Math.floor(chartData.data.length / 2));
    const secondHalf = chartData.data.slice(Math.floor(chartData.data.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;

    const change = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const isImproving = change > 0;

    return {
      change,
      isImproving,
      firstHalfAvg,
      secondHalfAvg,
    };
  }, [chartData]);

  const formatValue = (value: number, metric: MetricType) => {
    switch (metric) {
      case 'spend':
      case 'cpc':
        return formatCurrency(value);
      case 'ctr':
        return formatPercentage(value / 100);
      case 'roas':
        return `${value.toFixed(2)}x`;
      default:
        return value.toLocaleString();
    }
  };

  const getMetricColor = (metric: MetricType) => {
    switch (metric) {
      case 'impressions':
      case 'clicks':
      case 'ctr':
        return 'bg-ad-blue';
      case 'spend':
      case 'cpc':
        return 'bg-ad-orange';
      case 'conversions':
      case 'roas':
        return 'bg-ad-status-success';
      default:
        return 'bg-ad-blue';
    }
  };

  const formatDateLabel = (date: string, type: ViewType) => {
    const d = new Date(date);
    switch (type) {
      case 'weekly':
        return `Week of ${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      default:
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
  };

  const metricOptions = [
    { value: 'impressions', label: 'Impressions' },
    { value: 'clicks', label: 'Clicks' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'spend', label: 'Spend' },
    { value: 'ctr', label: 'Click-Through Rate' },
    { value: 'cpc', label: 'Cost Per Click' },
    { value: 'roas', label: 'Return on Ad Spend' },
  ];

  const viewOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Historical Performance</h2>
          <p className="text-sm text-muted-foreground">
            Analyze trends and patterns over time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedMetric}
            onValueChange={(value) => setSelectedMetric(value as MetricType)}
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={viewType}
            onValueChange={(value) => setViewType(value as ViewType)}
          >
            {viewOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {chartData.data.length === 0 ? (
        <div className="text-center py-12">
          <ChartBarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No historical data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trend Summary */}
          {trendAnalysis && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {trendAnalysis.isImproving ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-ad-status-success" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-ad-status-rejected" />
                )}
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {trendAnalysis.isImproving ? 'Improving Trend' : 'Declining Trend'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.abs(trendAnalysis.change).toFixed(1)}% change from first to second half
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  Current: {formatValue(trendAnalysis.secondHalfAvg, selectedMetric)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Previous: {formatValue(trendAnalysis.firstHalfAvg, selectedMetric)}
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="space-y-3">
            {chartData.data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    {formatDateLabel(item.date, viewType)}
                  </span>
                  <span className="text-foreground font-medium">
                    {formatValue(item.value, selectedMetric)}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getMetricColor(selectedMetric)}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  {/* Peak indicator */}
                  {item.value === chartData.maxValue && chartData.data.length > 1 && (
                    <div className="absolute -top-1 right-0">
                      <div className="w-2 h-2 bg-ad-status-success rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-ad-status-success">
                {formatValue(chartData.maxValue, selectedMetric)}
              </div>
              <div className="text-sm text-muted-foreground">Peak Value</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-ad-status-rejected">
                {formatValue(chartData.minValue, selectedMetric)}
              </div>
              <div className="text-sm text-muted-foreground">Lowest Value</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-ad-blue">
                {formatValue(
                  chartData.data.reduce((sum, item) => sum + item.value, 0) / chartData.data.length,
                  selectedMetric
                )}
              </div>
              <div className="text-sm text-muted-foreground">Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {chartData.data.length}
              </div>
              <div className="text-sm text-muted-foreground">Data Points</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}