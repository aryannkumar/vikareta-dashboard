import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WalletBalance } from '@/types';

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
          const response = await fetch('/api/wallet/balance');
          if (!response.ok) {
            throw new Error('Failed to fetch wallet balance');
          }

          const data = await response.json();
          set({ balance: data.data, loading: false });
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