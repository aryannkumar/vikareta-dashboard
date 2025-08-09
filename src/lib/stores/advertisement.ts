import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AdCampaign, AdAnalytics, CreateCampaignRequest, AdCampaignFilters } from '@/types';

interface AdvertisementState {
  // State
  campaigns: AdCampaign[];
  analytics: AdAnalytics[];
  selectedCampaign: AdCampaign | null;
  loading: boolean;
  error: string | null;
  filters: AdCampaignFilters;

  // Actions
  fetchCampaigns: () => Promise<void>;
  fetchCampaign: (id: string) => Promise<void>;
  createCampaign: (data: CreateCampaignRequest) => Promise<AdCampaign>;
  updateCampaign: (id: string, data: Partial<CreateCampaignRequest>) => Promise<AdCampaign>;
  pauseCampaign: (id: string) => Promise<void>;
  resumeCampaign: (id: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  fetchAnalytics: (dateRange?: string) => Promise<void>;
  setFilters: (filters: AdCampaignFilters) => void;
  clearError: () => void;
}

export const useAdvertisementStore = create<AdvertisementState>()(
  devtools(
    (set, get) => ({
      // Initial state
      campaigns: [],
      analytics: [],
      selectedCampaign: null,
      loading: false,
      error: null,
      filters: {},

      // Actions
      fetchCampaigns: async () => {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const queryParams = new URLSearchParams();
          
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
              queryParams.append(key, value.toString());
            }
          });

          const response = await fetch(`/api/ads/campaigns?${queryParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch campaigns');
          }

          const data = await response.json();
          set({ campaigns: data.data || [], loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch campaigns',
            loading: false 
          });
        }
      },

      fetchCampaign: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/ads/campaigns/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch campaign');
          }

          const data = await response.json();
          set({ selectedCampaign: data.data, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch campaign',
            loading: false 
          });
        }
      },

      createCampaign: async (data: CreateCampaignRequest) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/ads/campaigns', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to create campaign');
          }

          const result = await response.json();
          const newCampaign = result.data;

          set(state => ({
            campaigns: [newCampaign, ...state.campaigns],
            loading: false
          }));

          return newCampaign;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create campaign',
            loading: false 
          });
          throw error;
        }
      },

      updateCampaign: async (id: string, data: Partial<CreateCampaignRequest>) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/ads/campaigns/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to update campaign');
          }

          const result = await response.json();
          const updatedCampaign = result.data;

          set(state => ({
            campaigns: state.campaigns.map(c => 
              c.id === id ? updatedCampaign : c
            ),
            selectedCampaign: state.selectedCampaign?.id === id ? updatedCampaign : state.selectedCampaign,
            loading: false
          }));

          return updatedCampaign;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update campaign',
            loading: false 
          });
          throw error;
        }
      },

      pauseCampaign: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/ads/campaigns/${id}/pause`, {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Failed to pause campaign');
          }

          set(state => ({
            campaigns: state.campaigns.map(c => 
              c.id === id ? { ...c, status: 'paused' as const } : c
            ),
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to pause campaign',
            loading: false 
          });
          throw error;
        }
      },

      resumeCampaign: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/ads/campaigns/${id}/resume`, {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Failed to resume campaign');
          }

          set(state => ({
            campaigns: state.campaigns.map(c => 
              c.id === id ? { ...c, status: 'active' as const } : c
            ),
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to resume campaign',
            loading: false 
          });
          throw error;
        }
      },

      deleteCampaign: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/ads/campaigns/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete campaign');
          }

          set(state => ({
            campaigns: state.campaigns.filter(c => c.id !== id),
            selectedCampaign: state.selectedCampaign?.id === id ? null : state.selectedCampaign,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete campaign',
            loading: false 
          });
          throw error;
        }
      },

      fetchAnalytics: async (dateRange = '30d') => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/ads/analytics?dateRange=${dateRange}`);
          if (!response.ok) {
            throw new Error('Failed to fetch analytics');
          }

          const data = await response.json();
          set({ analytics: data.data || [], loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch analytics',
            loading: false 
          });
        }
      },

      setFilters: (filters: AdCampaignFilters) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'advertisement-store',
    }
  )
);