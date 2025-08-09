import { apiClient } from '../client';

export interface Wallet {
  id: string;
  balance: number;
  lockedAmount: number;
  totalEarnings: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  transactions?: Array<{
    id: string;
    transactionType: string;
    amount: number;
    description?: string;
    createdAt: string;
  }>;
}

export interface GetWalletsParams {
  page?: number;
  limit?: number;
  search?: string;
  minBalance?: number;
  maxBalance?: number;
}

export class WalletService {
  static async getWallets(params?: GetWalletsParams) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.minBalance) searchParams.set('minBalance', params.minBalance.toString());
    if (params?.maxBalance) searchParams.set('maxBalance', params.maxBalance.toString());

    const response = await apiClient.get<{ data: Wallet[] }>(`/admin/wallets?${searchParams.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch wallets');
    }
    return response.data;
  }

  static async getWallet(id: string) {
    const response = await apiClient.get<Wallet>(`/admin/wallets/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch wallet');
    }
    return response.data;
  }

  static async adjustWalletBalance(id: string, data: { amount: number; reason: string; type: 'credit' | 'debit' }) {
    const response = await apiClient.post<{ wallet: Wallet }>(`/admin/wallets/${id}/adjust`, data);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to adjust wallet balance');
    }
    return response.data;
  }

  static async freezeWallet(id: string, reason: string) {
    const response = await apiClient.post<{ wallet: Wallet }>(`/admin/wallets/${id}/freeze`, { reason });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to freeze wallet');
    }
    return response.data;
  }

  static async unfreezeWallet(id: string) {
    const response = await apiClient.post<{ wallet: Wallet }>(`/admin/wallets/${id}/unfreeze`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to unfreeze wallet');
    }
    return response.data;
  }

  static async getTransactions(params?: { page?: number; limit?: number; walletId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.walletId) searchParams.set('walletId', params.walletId);

    const response = await apiClient.get<{ data: any[] }>(`/admin/wallet/transactions?${searchParams.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch wallet transactions');
    }
    return response.data;
  }
}