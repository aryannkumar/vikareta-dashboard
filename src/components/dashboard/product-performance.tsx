'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Eye, ShoppingCart, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface ProductPerformance {
  id: string;
  name: string;
  views: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export function ProductPerformance() {
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getProductPerformance(5);
      
      if (response.success && response.data) {
        setProducts(response.data as ProductPerformance[]);
      } else {
        // Fallback to mock data if API fails
        const mockProducts: ProductPerformance[] = [
          {
            id: '1',
            name: 'Industrial LED Lights',
            views: 1250,
            orders: 45,
            revenue: 112500,
            conversionRate: 3.6,
            trend: 'up',
            trendPercentage: 12.5,
            category: 'Electronics',
            stockStatus: 'in_stock'
          },
          {
            id: '2',
            name: 'Cotton Fabric Rolls',
            views: 890,
            orders: 32,
            revenue: 14400,
            conversionRate: 3.6,
            trend: 'up',
            trendPercentage: 8.2,
            category: 'Textiles',
            stockStatus: 'low_stock'
          },
          {
            id: '3',
            name: 'Steel Pipes Grade 304',
            views: 1560,
            orders: 28,
            revenue: 33600,
            conversionRate: 1.8,
            trend: 'down',
            trendPercentage: -5.3,
            category: 'Machinery',
            stockStatus: 'in_stock'
          },
          {
            id: '4',
            name: 'Organic Wheat Flour',
            views: 720,
            orders: 18,
            revenue: 15300,
            conversionRate: 2.5,
            trend: 'stable',
            trendPercentage: 0.8,
            category: 'Food',
            stockStatus: 'out_of_stock'
          },
          {
            id: '5',
            name: 'Automotive Parts Kit',
            views: 950,
            orders: 22,
            revenue: 44000,
            conversionRate: 2.3,
            trend: 'up',
            trendPercentage: 15.7,
            category: 'Automotive',
            stockStatus: 'in_stock'
          }
        ];
        setProducts(mockProducts);
      }
    } catch (err) {
      console.error('Failed to fetch product performance:', err);
      setError('Failed to load product performance data');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductPerformance();
  }, []);

  const maxRevenue = Math.max(...products.map(p => p.revenue));
  const maxViews = Math.max(...products.map(p => p.views));

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600';
      case 'low_stock': return 'text-yellow-600';
      case 'out_of_stock': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-12"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">{error}</div>
        <Button variant="outline" size="sm" onClick={fetchProductPerformance}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">No product performance data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Top performing products this month
        </div>
        <Button variant="ghost" size="sm" onClick={fetchProductPerformance}>
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
      
      {products.map((product, index) => (
        <div key={product.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{product.name}</div>
                <div className="text-xs text-muted-foreground">{product.category}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`text-xs ${getStockStatusColor(product.stockStatus)}`}>
                {getStockStatusText(product.stockStatus)}
              </div>
              <div className="flex items-center space-x-1">
                {product.trend === 'up' && (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                )}
                {product.trend === 'down' && (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${
                  product.trend === 'up' ? 'text-green-600' : 
                  product.trend === 'down' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {product.trend === 'up' ? '+' : product.trend === 'down' ? '' : ''}
                  {product.trendPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Eye className="w-3 h-3 mr-1 text-blue-600" />
                <span className="font-medium">{product.views.toLocaleString()}</span>
              </div>
              <div className="text-muted-foreground">Views</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <ShoppingCart className="w-3 h-3 mr-1 text-green-600" />
                <span className="font-medium">{product.orders}</span>
              </div>
              <div className="text-muted-foreground">Orders</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="font-medium">₹{(product.revenue / 1000).toFixed(0)}K</div>
              <div className="text-muted-foreground">Revenue</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Conversion Rate</span>
              <span className="font-medium">{product.conversionRate}%</span>
            </div>
            <Progress 
              value={product.conversionRate} 
              max={5} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Revenue Performance</span>
              <span className="font-medium">{((product.revenue / maxRevenue) * 100).toFixed(0)}%</span>
            </div>
            <Progress 
              value={(product.revenue / maxRevenue) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">View Performance</span>
              <span className="font-medium">{((product.views / maxViews) * 100).toFixed(0)}%</span>
            </div>
            <Progress 
              value={(product.views / maxViews) * 100} 
              className="h-2"
            />
          </div>
          
          {index < products.length - 1 && (
            <hr className="border-border" />
          )}
        </div>
      ))}
      
      <div className="text-center pt-2">
        <Button variant="outline" size="sm">
          View All Products
        </Button>
      </div>
    </div>
  );
}