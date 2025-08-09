'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { RFQ } from '@/types';

export interface UseRFQsOptions {
  autoLoad?: boolean;
  limit?: number;
  status?: string;
  search?: string;
}

export interface UseRFQsReturn {
  rfqs: RFQ[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    totalPages: number;
  };
  loadRFQs: (params?: any) => Promise<void>;
  createRFQ: (rfqData: Partial<RFQ>) => Promise<RFQ | null>;
  updateRFQ: (id: string, rfqData: Partial<RFQ>) => Promise<RFQ | null>;
  deleteRFQ: (id: string) => Promise<boolean>;
  respondToRFQ: (rfqId: string, response: any) => Promise<any>;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useRFQs(options: UseRFQsOptions = {}): UseRFQsReturn {
  const { 
    autoLoad = true, 
    limit = 10, 
    status, 
    search 
  } = options;

  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: limit,
    totalPages: 0
  });

  const loadRFQs = useCallback(async (params: any = {}) => {
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

      // Mock RFQs data
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
      
      setRFQs(mockRFQs);
      setPagination(prev => ({
        ...prev,
        total: mockRFQs.length,
        totalPages: Math.ceil(mockRFQs.length / prev.pageSize)
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load RFQs';
      setError(errorMessage);
      console.error('Error loading RFQs:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, status, search]);

  const createRFQ = useCallback(async (rfqData: Partial<RFQ>): Promise<RFQ | null> => {
    try {
      setLoading(true);
      
      // Mock create RFQ
      const newRFQ: RFQ = {
        id: Date.now().toString(),
        buyerId: 'buyer1',
        title: rfqData.title || 'New RFQ',
        description: rfqData.description || 'RFQ description',
        categoryId: rfqData.categoryId || 'cat1',
        subcategoryId: rfqData.subcategoryId || 'subcat1',
        quantity: rfqData.quantity || 1,
        budgetMin: rfqData.budgetMin || 0,
        budgetMax: rfqData.budgetMax || 0,
        deliveryTimeline: rfqData.deliveryTimeline || '30 days',
        deliveryLocation: rfqData.deliveryLocation || 'Mumbai',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        quotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await loadRFQs(); // Refresh the list
      return newRFQ;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create RFQ';
      setError(errorMessage);
      console.error('Error creating RFQ:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadRFQs]);

  const updateRFQ = useCallback(async (id: string, rfqData: Partial<RFQ>): Promise<RFQ | null> => {
    try {
      setLoading(true);
      
      // Mock update RFQ
      const updatedRFQ: RFQ = {
        id,
        buyerId: 'buyer1',
        title: rfqData.title || 'Updated RFQ',
        description: rfqData.description || 'Updated description',
        categoryId: rfqData.categoryId || 'cat1',
        subcategoryId: rfqData.subcategoryId || 'subcat1',
        quantity: rfqData.quantity || 1,
        budgetMin: rfqData.budgetMin || 0,
        budgetMax: rfqData.budgetMax || 0,
        deliveryTimeline: rfqData.deliveryTimeline || '30 days',
        deliveryLocation: rfqData.deliveryLocation || 'Mumbai',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        quotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await loadRFQs(); // Refresh the list
      return updatedRFQ;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update RFQ';
      setError(errorMessage);
      console.error('Error updating RFQ:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadRFQs]);

  const deleteRFQ = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`/rfqs/${id}`);
      if (response.success) {
        await loadRFQs(); // Refresh the list
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to delete RFQ');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete RFQ';
      setError(errorMessage);
      console.error('Error deleting RFQ:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadRFQs]);

  const respondToRFQ = useCallback(async (rfqId: string, response: any): Promise<any> => {
    try {
      setLoading(true);
      const apiResponse = await apiClient.post(`/rfqs/${rfqId}/responses`, response);
      if (apiResponse.success && apiResponse.data) {
        await loadRFQs(); // Refresh the list
        return apiResponse.data;
      } else {
        throw new Error(apiResponse.error?.message || 'Failed to respond to RFQ');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to respond to RFQ';
      setError(errorMessage);
      console.error('Error responding to RFQ:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadRFQs]);

  const refresh = useCallback(() => loadRFQs(), [loadRFQs]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, current: 1 }));
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadRFQs();
    }
  }, [autoLoad, loadRFQs]);

  return {
    rfqs,
    loading,
    error,
    pagination,
    loadRFQs,
    createRFQ,
    updateRFQ,
    deleteRFQ,
    respondToRFQ,
    refresh,
    setPage,
    setPageSize
  };
}