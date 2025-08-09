'use client';

import { useMemo } from 'react';
import { AdAnalytics } from '@/types';

interface AudienceInsightsProps {
  analytics: AdAnalytics[];
  dateRange: string;
}

export function AudienceInsights({ }: AudienceInsightsProps) {
  const insights = useMemo(() => {
    // Mock audience data - in real implementation, this would come from analytics
    const mockAudienceData = {
      demographics: {
        ageGroups: [
          { range: '18-24', percentage: 25, impressions: 12500, clicks: 375 },
          { range: '25-34', percentage: 35, impressions: 17500, clicks: 525 },
          { range: '35-44', percentage: 25, impressions: 12500, clicks: 300 },
          { range: '45-54', percentage: 10, impressions: 5000, clicks: 100 },
          { range: '55+', percentage: 5, impressions: 2500, clicks: 50 },
        ],
        genderDistribution: [
          { gender: 'Male', percentage: 55, impressions: 27500, clicks: 688 },
          { gender: 'Female', percentage: 45, impressions: 22500, clicks: 562 },
        ],
      },
      locations: [
        { location: 'Mumbai', percentage: 30, impressions: 15000, clicks: 450 },
        { location: 'Delhi', percentage: 25, impressions: 12500, clicks: 375 },
        { location: 'Bangalore', percentage: 20, impressions: 10000, clicks: 300 },
        { location: 'Chennai', percentage: 15, impressions: 7500, clicks: 225 },
        { location: 'Others', percentage: 10, impressions: 5000, clicks: 150 },
      ],
      devices: [
        { device: 'Mobile', percentage: 65, impressions: 32500, clicks: 975 },
        { device: 'Desktop', percentage: 30, impressions: 15000, clicks: 225 },
        { device: 'Tablet', percentage: 5, impressions: 2500, clicks: 50 },
      ],
      timeOfDay: [
        { hour: '6-9 AM', percentage: 15, impressions: 7500, clicks: 225 },
        { hour: '9-12 PM', percentage: 20, impressions: 10000, clicks: 250 },
        { hour: '12-3 PM', percentage: 25, impressions: 12500, clicks: 375 },
        { hour: '3-6 PM', percentage: 20, impressions: 10000, clicks: 300 },
        { hour: '6-9 PM', percentage: 15, impressions: 7500, clicks: 262 },
        { hour: '9-12 AM', percentage: 5, impressions: 2500, clicks: 38 },
      ],
    };

    return mockAudienceData;
  }, []);

  const renderInsightSection = (title: string, data: any[], colorClass: string) => (
    <div>
      <h4 className="font-medium text-foreground mb-3">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => {
          const key = Object.keys(item)[0]; // First key (range, gender, location, etc.)
          const label = item[key];
          const percentage = item.percentage;
          const impressions = item.impressions || 0;
          const clicks = item.clicks || 0;
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{label}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground">
                    {impressions.toLocaleString()} imp
                  </span>
                  <span className="text-muted-foreground">
                    {clicks.toLocaleString()} clicks
                  </span>
                  <span className="text-muted-foreground">
                    {ctr.toFixed(1)}% CTR
                  </span>
                  <span className="font-medium text-foreground w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Age Groups */}
      {renderInsightSection('Age Groups', insights.demographics.ageGroups, 'bg-ad-blue')}

      {/* Gender Distribution */}
      {renderInsightSection('Gender Distribution', insights.demographics.genderDistribution, 'bg-ad-orange')}

      {/* Top Locations */}
      {renderInsightSection('Top Locations', insights.locations, 'bg-ad-status-success')}

      {/* Device Types */}
      {renderInsightSection('Device Types', insights.devices, 'bg-ad-status-pending')}

      {/* Time of Day */}
      {renderInsightSection('Performance by Time', insights.timeOfDay, 'bg-ad-status-metrics')}

      {/* Key Insights */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-ad-blue rounded-full" />
              <span className="text-muted-foreground">Primary audience:</span>
              <span className="font-medium text-foreground">25-34 age group (35%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-ad-orange rounded-full" />
              <span className="text-muted-foreground">Top performing device:</span>
              <span className="font-medium text-foreground">Mobile (65% traffic)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-ad-status-success rounded-full" />
              <span className="text-muted-foreground">Best location:</span>
              <span className="font-medium text-foreground">Mumbai (30% of traffic)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-ad-status-pending rounded-full" />
              <span className="text-muted-foreground">Peak time:</span>
              <span className="font-medium text-foreground">12-3 PM (25% of impressions)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}