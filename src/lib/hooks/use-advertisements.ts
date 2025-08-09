'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Advertisement, AdvertisementMetrics } from '@/types';

export interface UseAdvertisementsOptions {
  autoLoad?: boolean;
  limit?: number;
  status?: string;
  search?: string;
}

export interface UseAdvertisementsReturn {
  advertisements: Advertisement[];
  metrics: AdvertisementMetrics | null;
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    totalPages: number;
  };
  loadAdvertisements: (params?: any) => Promise<void>;
  loadMetrics: () => Promise<void>;
  createAdvertisement: (adData: Partial<Advertisement>) => Promise<Advertisement | null>;
  updateAdvertisement: (id: string, adData: Partial<Advertisement>) => Promise<Advertisement | null>;
  deleteAdvertisement: (id: string) => Promise<boolean>;
  pauseAdvertisement: (id: string) => Promise<boolean>;
  resumeAdvertisement: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useAdvertisements(options: UseAdvertisementsOptions = {}): UseAdvertisementsReturn {
  const { 
    autoLoad = true, 
    limit = 10, 
    status, 
    search 
  } = options;

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [metrics, setMetrics] = useState<AdvertisementMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: limit,
    totalPages: 0
  });

  const loadAdvertisements = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        status,
        search,
        ...params
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await apiClient.get('/advertisements', { params: queryParams });
      
      if (response.success && response.data) {
        const data = response.data as { data: Advertisement[]; total: number };
        setAdvertisements(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / prev.pageSize)
        }));
      } else {
        throw new Error('Failed to load advertisements');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load advertisements';
      setError(errorMessage);
      console.error('Error loading advertisements:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, status, search]);

  const loadMetrics = useCallback(async () => {
    try {
      const response = await apiClient.get('/advertisements/metrics');
      if (response.success && response.data) {
        setMetrics(response.data as AdvertisementMetrics);
      }
    } catch (err) {
      console.error('Error loading advertisement metrics:', err);
    }
  }, []);

  const createAdvertisement = useCallback(async (adData: Partial<Advertisement>): Promise<Advertisement | null> => {
    try {
      setLoading(true);
      const response = await apiClient.post('/advertisements', adData);
      if (response.success && response.data) {
        await loadAdvertisements(); // Refresh the list
        return response.data as Advertisement;
      } else {
        throw new Error(response.error?.message || 'Failed to create advertisement');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create advertisement';
      setError(errorMessage);
      console.error('Error creating advertisement:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadAdvertisements]);

  const updateAdvertisement = useCallback(async (id: string, adData: Partial<Advertisement>): Promise<Advertisement | null> => {
    try {
      setLoading(true);
      const response = await apiClient.put(`/advertisements/${id}`, adData);
      if (response.success && response.data) {
        await loadAdvertisements(); // Refresh the list
        return response.data as Advertisement;
      } else {
        throw new Error(response.error?.message || 'Failed to update advertisement');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update advertisement';
      setError(errorMessage);
      console.error('Error updating advertisement:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadAdvertisements]);

  const deleteAdvertisement = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`/advertisements/${id}`);
      if (response.success) {
        await loadAdvertisements(); // Refresh the list
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to delete advertisement');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete advertisement';
      setError(errorMessage);
      console.error('Error deleting advertisement:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAdvertisements]);

  const pauseAdvertisement = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/advertisements/${id}/pause`);
      if (response.success) {
        await loadAdvertisements(); // Refresh the list
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to pause advertisement');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause advertisement';
      setError(errorMessage);
      console.error('Error pausing advertisement:', err);
      return false;
    }
  }, [loadAdvertisements]);

  const resumeAdvertisement = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/advertisements/${id}/resume`);
      if (response.success) {
        await loadAdvertisements(); // Refresh the list
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to resume advertisement');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume advertisement';
      setError(errorMessage);
      console.error('Error resuming advertisement:', err);
      return false;
    }
  }, [loadAdvertisements]);

  const refresh = useCallback(async () => {
    await Promise.all([loadAdvertisements(), loadMetrics()]);
  }, [loadAdvertisements, loadMetrics]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, current: 1 }));
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadAdvertisements();
      loadMetrics();
    }
  }, [autoLoad, loadAdvertisements, loadMetrics]);

  return {
    advertisements,
    metrics,
    loading,
    error,
    pagination,
    loadAdvertisements,
    loadMetrics,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    pauseAdvertisement,
    resumeAdvertisement,
    refresh,
    setPage,
    setPageSize
  };
}