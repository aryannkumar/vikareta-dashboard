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

      // Call real backend API
      const apiClient = (await import('@/lib/api/client')).apiClient;
      const response = await apiClient.getOrders(queryParams);
      
      if (response.success && response.data) {
        // Handle both array response and paginated response
        const ordersData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).orders || [];
        const paginationData = (response.data as any).pagination || {};
        
        setOrders(ordersData);
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || ordersData.length,
          totalPages: paginationData.totalPages || Math.ceil(ordersData.length / prev.pageSize)
        }));
      } else {
        // Handle API error by setting empty state
        setOrders([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
        
        if (response.error) {
          setError(response.error.message || 'Failed to load orders');
        }
      }
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
      
      // Call real backend API
      const apiClient = (await import('@/lib/api/client')).apiClient;
      const response = await apiClient.updateOrderStatus(orderId, newStatus);
      
      if (response.success && response.data) {
        await loadOrders(); // Refresh the list
        return response.data as Order;
      } else {
        if (response.error) {
          setError(response.error.message || 'Failed to update order status');
        }
        return null;
      }
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