import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WalletBalance } from '@/types';
import { apiClient } from '@/lib/api/client';

interface WalletState {
  // State
  balance: WalletBalance | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchBalance: () => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>()(
  devtools(
    (set) => ({
      // Initial state
      balance: null,
      loading: false,
      error: null,

      // Actions
      fetchBalance: async () => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.getWalletBalance();
          if (response.success) {
            set({ balance: response.data, loading: false });
          } else {
            throw new Error(response.error || 'Failed to fetch wallet balance');
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch wallet balance',
            loading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'wallet-store',
    }
  )
);