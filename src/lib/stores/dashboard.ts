'use client';

import { create } from 'zustand';
import { dashboardApi, type DashboardStats } from '../api/services/dashboard';

interface DashboardState {
  metrics: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fetchDashboardData: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getDashboardStats();
      if (response.success) {
        set({
          metrics: response.data,
          isLoading: false,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        set({
          error: response.error?.message || 'Failed to fetch dashboard data',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      set({
        error: 'Failed to fetch dashboard data',
        isLoading: false,
      });
    }
  },
  clearError: () => set({ error: null }),
}));