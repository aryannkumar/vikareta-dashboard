import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AdCampaign, AdAnalytics, CreateCampaignRequest, AdCampaignFilters } from '@/types';
import { apiClient } from '@/lib/api/client';

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
          const response = await apiClient.getAdvertisementCampaigns(filters);
          
          if (response.success) {
            set({ campaigns: (response.data as AdCampaign[]) || [], loading: false });
          } else {
            throw new Error(response.error?.message || 'Failed to fetch campaigns');
          }
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
          const response = await apiClient.get(`/ads/campaigns/${id}`);
          
          if (response.success) {
            set({ selectedCampaign: response.data as AdCampaign, loading: false });
          } else {
            throw new Error(response.error?.message || 'Failed to fetch campaign');
          }
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
          const response = await apiClient.createAdvertisementCampaign(data);

          if (response.success) {
            const newCampaign = response.data as AdCampaign;
            set(state => ({
              campaigns: [newCampaign, ...state.campaigns],
              loading: false
            }));

            return newCampaign;
          } else {
            throw new Error(response.error?.message || 'Failed to create campaign');
          }
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
          const response = await apiClient.updateAdvertisementCampaign(id, data);

          if (response.success) {
            const updatedCampaign = response.data as AdCampaign;

            set(state => ({
              campaigns: state.campaigns.map(c => 
                c.id === id ? updatedCampaign : c
              ),
              selectedCampaign: state.selectedCampaign?.id === id ? updatedCampaign : state.selectedCampaign,
              loading: false
            }));

            return updatedCampaign;
          } else {
            throw new Error(response.error?.message || 'Failed to update campaign');
          }
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
          const response = await apiClient.put(`/ads/campaigns/${id}/pause`);

          if (response.success) {
            set(state => ({
              campaigns: state.campaigns.map(c => 
                c.id === id ? { ...c, status: 'paused' as const } : c
              ),
              loading: false
            }));
          } else {
            throw new Error(response.error?.message || 'Failed to pause campaign');
          }
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
          const response = await apiClient.put(`/ads/campaigns/${id}/resume`);

          if (response.success) {
            set(state => ({
              campaigns: state.campaigns.map(c => 
                c.id === id ? { ...c, status: 'active' as const } : c
              ),
              loading: false
            }));
          } else {
            throw new Error(response.error?.message || 'Failed to resume campaign');
          }
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
          const response = await apiClient.deleteAdvertisementCampaign(id);

          if (response.success) {
            set(state => ({
              campaigns: state.campaigns.filter(c => c.id !== id),
              selectedCampaign: state.selectedCampaign?.id === id ? null : state.selectedCampaign,
              loading: false
            }));
          } else {
            throw new Error(response.error?.message || 'Failed to delete campaign');
          }
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
          const response = await apiClient.getAdvertisementAnalytics({ period: dateRange });
          
          if (response.success) {
            set({ analytics: (response.data as AdAnalytics[]) || [], loading: false });
          } else {
            throw new Error(response.error?.message || 'Failed to fetch analytics');
          }
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