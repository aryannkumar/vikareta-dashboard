'use client';

import { useMemo } from 'react';
import { AdAnalytics } from '@/types';

interface PerformanceChartProps {
  analytics: AdAnalytics[];
  dateRange: string;
}

export function PerformanceChart({ analytics }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!analytics.length) return null;

    // Group analytics by date and aggregate
    const groupedData = analytics.reduce((acc, curr) => {
      const date = curr.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
        };
      }
      
      acc[date].impressions += curr.impressions;
      acc[date].clicks += curr.clicks;
      acc[date].conversions += curr.conversions;
      acc[date].spend += curr.spend;
      acc[date].revenue += curr.revenue;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    const sortedData = Object.values(groupedData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedData;
  }, [analytics]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available for chart</p>
      </div>
    );
  }

  // Calculate max values for scaling
  const maxImpressions = Math.max(...chartData.map((d: any) => d.impressions));
  const maxClicks = Math.max(...chartData.map((d: any) => d.clicks));
  const maxSpend = Math.max(...chartData.map((d: any) => d.spend));

  return (
    <div className="space-y-4">
      {/* Simple Bar Chart Representation */}
      <div className="space-y-6">
        {/* Impressions Chart */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Daily Impressions</h4>
          <div className="space-y-2">
            {chartData.map((data: any, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-xs text-muted-foreground">
                  {new Date(data.date).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1 bg-muted rounded-full h-2 relative">
                  <div
                    className="bg-ad-blue h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${maxImpressions > 0 ? (data.impressions / maxImpressions) * 100 : 0}%`
                    }}
                  />
                </div>
                <div className="w-20 text-xs text-right text-foreground font-medium">
                  {data.impressions.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clicks Chart */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Daily Clicks</h4>
          <div className="space-y-2">
            {chartData.map((data: any, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-xs text-muted-foreground">
                  {new Date(data.date).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1 bg-muted rounded-full h-2 relative">
                  <div
                    className="bg-ad-orange h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${maxClicks > 0 ? (data.clicks / maxClicks) * 100 : 0}%`
                    }}
                  />
                </div>
                <div className="w-20 text-xs text-right text-foreground font-medium">
                  {data.clicks.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spend Chart */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Daily Spend</h4>
          <div className="space-y-2">
            {chartData.map((data: any, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-xs text-muted-foreground">
                  {new Date(data.date).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1 bg-muted rounded-full h-2 relative">
                  <div
                    className="bg-ad-status-success h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${maxSpend > 0 ? (data.spend / maxSpend) * 100 : 0}%`
                    }}
                  />
                </div>
                <div className="w-20 text-xs text-right text-foreground font-medium">
                  ₹{data.spend.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-ad-blue rounded-full" />
          <span className="text-xs text-muted-foreground">Impressions</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-ad-orange rounded-full" />
          <span className="text-xs text-muted-foreground">Clicks</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-ad-status-success rounded-full" />
          <span className="text-xs text-muted-foreground">Spend</span>
        </div>
      </div>
    </div>
  );
}