'use client';
import { useState, useEffect, useCallback } from 'react';

import type { 
  DashboardMetrics, 
  Order, 
  RFQ, 
  Product,
  WalletBalance 
} from '@/types';

export interface UseDashboardOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
}

export interface UseDashboardReturn {
  metrics: DashboardMetrics | null;
  recentOrders: Order[];
  recentRFQs: RFQ[];
  topProducts: Product[];
  walletBalance: WalletBalance | null;
  loading: boolean;
  error: string | null;
  loadMetrics: () => Promise<void>;
  loadRecentOrders: () => Promise<void>;
  loadRecentRFQs: () => Promise<void>;
  loadTopProducts: () => Promise<void>;
  loadWalletBalance: () => Promise<void>;
  loadAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const { autoLoad = true, refreshInterval } = options;

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentRFQs, setRecentRFQs] = useState<RFQ[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      // Mock dashboard metrics data
      const mockMetrics: DashboardMetrics = {
        totalRevenue: 125000,
        totalOrders: 342,
        totalProducts: 89,
        totalCustomers: 156,
        pendingOrders: 23,
        completedOrders: 319,
        activeCustomers: 134,
        activeRFQs: 45,
        revenueChange: 12.5,
        ordersChange: 8.3,
        productsChange: 15.2,
        customersChange: 6.7,
      };
      
      setMetrics(mockMetrics);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load metrics';
      setError(errorMessage);
      console.error('Error loading dashboard metrics:', err);
    }
  }, []);

  const loadRecentOrders = useCallback(async () => {
    try {
      // Mock recent orders data
      const mockOrders: Order[] = [
        {
          id: '1',
          buyerId: 'buyer1',
          sellerId: 'seller1',
          orderNumber: 'ORD-001',
          orderType: 'product',
          subtotal: 1500,
          taxAmount: 270,
          shippingAmount: 100,
          discountAmount: 0,
          totalAmount: 1870,
          status: 'processing',
          paymentStatus: 'paid',
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          buyerId: 'buyer2',
          sellerId: 'seller1',
          orderNumber: 'ORD-002',
          orderType: 'service',
          subtotal: 2500,
          taxAmount: 450,
          shippingAmount: 0,
          discountAmount: 100,
          totalAmount: 2850,
          status: 'confirmed',
          paymentStatus: 'paid',
          items: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      
      setRecentOrders(mockOrders);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recent orders';
      setError(errorMessage);
      console.error('Error loading recent orders:', err);
    }
  }, []);

  const loadRecentRFQs = useCallback(async () => {
    try {
      // Mock recent RFQs data
      const mockRFQs: RFQ[] = [
        {
          id: '1',
          buyerId: 'buyer1',
          title: 'Industrial Pumps Required',
          description: 'Need high-quality industrial pumps for manufacturing plant',
          categoryId: 'cat1',
          subcategoryId: 'subcat1',
          quantity: 10,
          budgetMin: 50000,
          budgetMax: 75000,
          deliveryTimeline: '30 days',
          deliveryLocation: 'Mumbai, Maharashtra',
          status: 'active',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          quotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          buyerId: 'buyer2',
          title: 'Office Furniture Bulk Order',
          description: 'Looking for modern office furniture for new branch',
          categoryId: 'cat2',
          subcategoryId: 'subcat2',
          quantity: 50,
          budgetMin: 100000,
          budgetMax: 150000,
          deliveryTimeline: '45 days',
          deliveryLocation: 'Delhi, NCR',
          status: 'active',
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          quotes: [],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      
      setRecentRFQs(mockRFQs);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recent RFQs';
      setError(errorMessage);
      console.error('Error loading recent RFQs:', err);
    }
  }, []);

  const loadTopProducts = useCallback(async () => {
    try {
      // Mock top products data
      const mockProducts: Product[] = [
        {
          id: '1',
          sellerId: 'seller1',
          title: 'Industrial Pump Model X1',
          description: 'High-efficiency industrial pump for heavy-duty applications',
          categoryId: 'cat1',
          subcategoryId: 'subcat1',
          price: 15000,
          currency: 'INR',
          stockQuantity: 25,
          minOrderQuantity: 1,
          isService: false,
          status: 'active',
          media: [],
          variants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          sellerId: 'seller1',
          title: 'Office Chair Premium',
          description: 'Ergonomic office chair with lumbar support',
          categoryId: 'cat2',
          subcategoryId: 'subcat2',
          price: 8500,
          currency: 'INR',
          stockQuantity: 50,
          minOrderQuantity: 5,
          isService: false,
          status: 'active',
          media: [],
          variants: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      
      setTopProducts(mockProducts);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load top products';
      setError(errorMessage);
      console.error('Error loading top products:', err);
    }
  }, []);

  const loadWalletBalance = useCallback(async () => {
    try {
      // Mock wallet balance data
      const mockWalletBalance: WalletBalance = {
        availableBalance: 45000,
        lockedBalance: 12000,
        negativeBalance: 0,
        totalBalance: 57000,
      };
      
      setWalletBalance(mockWalletBalance);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wallet balance';
      setError(errorMessage);
      console.error('Error loading wallet balance:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadMetrics(),
        loadRecentOrders(),
        loadRecentRFQs(),
        loadTopProducts(),
        loadWalletBalance()
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadMetrics, loadRecentOrders, loadRecentRFQs, loadTopProducts, loadWalletBalance]);

  const refresh = useCallback(() => loadAll(), [loadAll]);

  useEffect(() => {
    if (autoLoad) {
      loadAll();
    }
  }, [autoLoad, loadAll]);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refresh]);

  return {
    metrics,
    recentOrders,
    recentRFQs,
    topProducts,
    walletBalance,
    loading,
    error,
    loadMetrics,
    loadRecentOrders,
    loadRecentRFQs,
    loadTopProducts,
    loadWalletBalance,
    loadAll,
    refresh
  };
}