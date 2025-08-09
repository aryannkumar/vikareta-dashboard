'use client';

import { useState, useCallback } from 'react';
import { ApiResponse } from '@/lib/api/client';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

/**
 * Hook for API calls with loading and error states
 */
export function useApi<T = any>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
        options.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error?.message || 'An error occurred';
        setError(errorMessage);
        options.onError?.(new Error(errorMessage));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T = any>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    apiCall: (params: { page: number; limit: number }) => Promise<ApiResponse<{ data: T[]; pagination: typeof pagination }>>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiCall({ page: pagination.page, limit: pagination.limit });
      
      if (response.success && response.data) {
        setData(response.data.data);
        setPagination(response.data.pagination);
        options.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error?.message || 'An error occurred';
        setError(errorMessage);
        options.onError?.(new Error(errorMessage));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, options]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    pagination,
    isLoading,
    error,
    execute,
    setPage,
    setLimit,
    reset,
  };
}