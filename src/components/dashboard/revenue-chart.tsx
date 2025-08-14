'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueData {
  period: string;
  revenue: number;
  orders: number;
  growth: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growthRate: number;
  data: RevenueData[];
}

export function RevenueChart() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getRevenueAnalytics(period);
        
        if (response.success && response.data) {
          const data = response.data as any;
          const revenueMetrics: RevenueMetrics = {
            totalRevenue: data.totalRevenue || 0,
            totalOrders: data.totalOrders || 0,
            averageOrderValue: data.averageOrderValue || 0,
            growthRate: data.growthRate || 0,
            data: data.chartData || []
          };
          setMetrics(revenueMetrics);
        } else {
          // Set empty data if API fails
          setMetrics({
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            growthRate: 0,
            data: []
          });
        }
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
        // Set empty data on error
        setMetrics({
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          growthRate: 0,
          data: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period]);

  // Remove unused generateMockData function since we don't use mock data anymore

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-lg w-full h-full"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Failed to load revenue data
      </div>
    );
  }

  const maxRevenue = Math.max(...metrics.data.map(d => d.revenue));
  const minRevenue = Math.min(...metrics.data.map(d => d.revenue));

  return (
    <div className="w-full h-full">
      {/* Header with metrics */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold">₹{formatCurrency(metrics.totalRevenue)}</div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-semibold">{metrics.totalOrders.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Orders</div>
          </div>
          <div className="text-right">
            <div className={`flex items-center ${metrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.growthRate >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(metrics.growthRate).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Growth</div>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex space-x-2 mb-4">
        {(['7d', '30d', '90d', '1y'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              period === p
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
          </button>
        ))}
      </div>

      {/* Simple chart visualization */}
      <div className="relative h-48 bg-gradient-to-t from-primary/5 to-transparent rounded-lg p-4">
        {metrics.data && metrics.data.length > 0 ? (
          <div className="flex items-end justify-between h-full space-x-1">
            {metrics.data.slice(-20).map((item, index) => {
              const height = maxRevenue > minRevenue ? ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 100 : 50;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all"
                      style={{ height: `${Math.max(height * 0.7, 3)}%` }}
                    ></div>
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-md transition-opacity z-10">
                    <div className="font-medium">{item.period}</div>
                    <div>₹{item.revenue.toLocaleString()}</div>
                    <div>{item.orders} orders</div>
                  </div>
                  
                  {index % Math.ceil(metrics.data.slice(-20).length / 5) === 0 && (
                    <div className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-left">
                      {item.period}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-sm">No revenue data available</div>
              <div className="text-xs mt-1">Data will appear when orders are processed</div>
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
        <div>
          <div className="text-lg font-semibold">₹{Math.round(metrics.averageOrderValue).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Avg Order Value</div>
        </div>
        <div>
          <div className="text-lg font-semibold">
            ₹{Math.round(metrics.totalRevenue / metrics.data.length).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Daily Average</div>
        </div>
        <div>
          <div className="text-lg font-semibold">
            {Math.round(metrics.totalOrders / metrics.data.length)}
          </div>
          <div className="text-xs text-muted-foreground">Orders/Day</div>
        </div>
      </div>
    </div>
  );
}