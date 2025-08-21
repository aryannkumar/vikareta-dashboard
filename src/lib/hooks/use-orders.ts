'use client';
import { useState, useEffect, useCallback } from 'react';

import type { Order } from '@/types';

export interface UseOrdersOptions {
  autoLoad?: boolean;
  limit?: number;
  status?: string;
  orderType?: string;
  search?: string;
}

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    totalPages: number;
  };
  loadOrders: (params?: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<Order | null>;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { 
    autoLoad = true, 
    limit = 10, 
    status, 
    orderType,
    search 
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: limit,
    totalPages: 0
  });

  const loadOrders = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        status,
        orderType,
        search,
        ...params
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      // Mock orders data with both product and service orders
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
        {
          id: '3',
          buyerId: 'buyer3',
          sellerId: 'seller1',
          orderNumber: 'ORD-003',
          orderType: 'product',
          subtotal: 750,
          taxAmount: 135,
          shippingAmount: 50,
          discountAmount: 25,
          totalAmount: 910,
          status: 'shipped',
          paymentStatus: 'paid',
          items: [],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '4',
          buyerId: 'buyer4',
          sellerId: 'seller1',
          orderNumber: 'ORD-004',
          orderType: 'service',
          subtotal: 1200,
          taxAmount: 216,
          shippingAmount: 0,
          discountAmount: 0,
          totalAmount: 1416,
          status: 'delivered',
          paymentStatus: 'paid',
          items: [],
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '5',
          buyerId: 'buyer5',
          sellerId: 'seller1',
          orderNumber: 'ORD-005',
          orderType: 'product',
          subtotal: 3200,
          taxAmount: 576,
          shippingAmount: 150,
          discountAmount: 200,
          totalAmount: 3726,
          status: 'pending',
          paymentStatus: 'pending',
          items: [],
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          updatedAt: new Date(Date.now() - 345600000).toISOString(),
        },
        {
          id: '6',
          buyerId: 'buyer6',
          sellerId: 'seller1',
          orderNumber: 'ORD-006',
          orderType: 'service',
          subtotal: 800,
          taxAmount: 144,
          shippingAmount: 0,
          discountAmount: 50,
          totalAmount: 894,
          status: 'cancelled',
          paymentStatus: 'refunded',
          items: [],
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      // Apply filters to mock data
      let filteredOrders = mockOrders;
      
      if (queryParams.status) {
        filteredOrders = filteredOrders.filter(order => order.status === queryParams.status);
      }
      
      if (queryParams.orderType) {
        filteredOrders = filteredOrders.filter(order => order.orderType === queryParams.orderType);
      }
      
      if (queryParams.search) {
        const searchLower = queryParams.search.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.buyerId.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower)
        );
      }
      
      setOrders(filteredOrders);
      setPagination(prev => ({
        ...prev,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / prev.pageSize)
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setError(errorMessage);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, status, orderType, search]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string): Promise<Order | null> => {
    try {
      setLoading(true);
      
      // Mock update - find and update the order
      const updatedOrder: Order = {
        id: orderId,
        buyerId: 'buyer1',
        sellerId: 'seller1',
        orderNumber: `ORD-${orderId}`,
        orderType: 'product',
        subtotal: 1500,
        taxAmount: 270,
        shippingAmount: 100,
        discountAmount: 0,
        totalAmount: 1870,
        status: newStatus as any,
        paymentStatus: 'paid',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await loadOrders(); // Refresh the list
      return updatedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      console.error('Error updating order status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  const refresh = useCallback(() => loadOrders(), [loadOrders]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, current: 1 }));
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadOrders();
    }
  }, [autoLoad, loadOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    loadOrders,
    updateOrderStatus,
    refresh,
    setPage,
    setPageSize
  };
}