import { apiClient } from '../client';

export interface Wallet {
  id: string;
  businessId: string;
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'closed';
  type: 'business' | 'personal';
  autoTopupEnabled: boolean;
  autoTopupAmount?: number;
  autoTopupThreshold?: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference: string;
  category: 'payment' | 'refund' | 'withdrawal' | 'deposit' | 'fee' | 'adjustment' | 'transfer';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  externalReference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  processedAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export interface WalletTransfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  createdAt: string;
  processedAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export interface AddMoneyData {
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface WithdrawMoneyData {
  amount: number;
  currency: string;
  withdrawalMethod: string;
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    ifscCode?: string;
    upiId?: string;
  };
  description?: string;
  metadata?: Record<string, any>;
}

export interface WalletFilter {
  businessId?: string;
  userId?: string;
  status?: 'active' | 'suspended' | 'closed';
  type?: 'business' | 'personal';
  minBalance?: number;
  maxBalance?: number;
  limit?: number;
  offset?: number;
}

export interface TransactionFilter {
  walletId?: string;
  type?: 'credit' | 'debit';
  category?: 'payment' | 'refund' | 'withdrawal' | 'deposit' | 'fee' | 'adjustment' | 'transfer';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
}

export class WalletService {
  // Get wallet by ID
  static async getWalletById(id: string): Promise<Wallet> {
    const response = await apiClient.get(`/wallets/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wallet');
    }
    return response.data as Wallet;
  }

  // Get user wallet
  static async getUserWallet(userId: string): Promise<Wallet> {
    const response = await apiClient.get(`/wallets/user/${userId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch user wallet');
    }
    return response.data as Wallet;
  }

  // Get business wallet
  static async getBusinessWallet(businessId: string): Promise<Wallet> {
    const response = await apiClient.get(`/wallets/business/${businessId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch business wallet');
    }
    return response.data as Wallet;
  }

  // Create wallet
  static async createWallet(walletData: {
    userId?: string;
    businessId?: string;
    currency: string;
    type: 'business' | 'personal';
    initialBalance?: number;
    autoTopupEnabled?: boolean;
    autoTopupAmount?: number;
    autoTopupThreshold?: number;
    metadata?: Record<string, any>;
  }): Promise<Wallet> {
    const response = await apiClient.post('/wallets', walletData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create wallet');
    }
    return response.data as Wallet;
  }

  // Update wallet
  static async updateWallet(id: string, walletData: {
    autoTopupEnabled?: boolean;
    autoTopupAmount?: number;
    autoTopupThreshold?: number;
    metadata?: Record<string, any>;
  }): Promise<Wallet> {
    const response = await apiClient.put(`/wallets/${id}`, walletData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update wallet');
    }
    return response.data as Wallet;
  }

  // Suspend wallet
  static async suspendWallet(id: string, reason?: string): Promise<Wallet> {
    const response = await apiClient.post(`/wallets/${id}/suspend`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to suspend wallet');
    }
    return response.data as Wallet;
  }

  // Activate wallet
  static async activateWallet(id: string): Promise<Wallet> {
    const response = await apiClient.post(`/wallets/${id}/activate`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to activate wallet');
    }
    return response.data as Wallet;
  }

  // Close wallet
  static async closeWallet(id: string, reason?: string): Promise<Wallet> {
    const response = await apiClient.post(`/wallets/${id}/close`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to close wallet');
    }
    return response.data as Wallet;
  }

  // Add money to wallet
  static async addMoney(walletId: string, moneyData: AddMoneyData): Promise<{ transaction: WalletTransaction; paymentUrl?: string; }> {
    const response = await apiClient.post(`/wallets/${walletId}/add-money`, moneyData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add money to wallet');
    }
    return response.data as { transaction: WalletTransaction; paymentUrl?: string; };
  }

  // Withdraw money from wallet
  static async withdrawMoney(walletId: string, withdrawalData: WithdrawMoneyData): Promise<WalletTransaction> {
    const response = await apiClient.post(`/wallets/${walletId}/withdraw`, withdrawalData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to withdraw money from wallet');
    }
    return response.data as WalletTransaction;
  }

  // Transfer money between wallets
  static async transferMoney(transferData: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<WalletTransfer> {
    const response = await apiClient.post('/wallets/transfer', transferData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to transfer money');
    }
    return response.data as WalletTransfer;
  }

  // Get wallet transactions
  static async getWalletTransactions(walletId: string, filters: Omit<TransactionFilter, 'walletId'> = {}): Promise<{ transactions: WalletTransaction[]; total: number; }> {
    const response = await apiClient.get(`/wallets/${walletId}/transactions`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wallet transactions');
    }
    return response.data as { transactions: WalletTransaction[]; total: number; };
  }

  // Get transaction by ID
  static async getTransactionById(id: string): Promise<WalletTransaction> {
    const response = await apiClient.get(`/wallets/transactions/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch transaction');
    }
    return response.data as WalletTransaction;
  }

  // Get wallet balance
  static async getWalletBalance(walletId: string): Promise<{ balance: number; currency: string; availableBalance: number; }> {
    const response = await apiClient.get(`/wallets/${walletId}/balance`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wallet balance');
    }
    return response.data as { balance: number; currency: string; availableBalance: number; };
  }

  // Get wallet analytics
  static async getWalletAnalytics(walletId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalCredits: number;
    totalDebits: number;
    netFlow: number;
    transactionCount: number;
    averageTransactionAmount: number;
    topCategories: Array<{ category: string; amount: number; count: number; }>;
    balanceTrend: Array<{ date: string; balance: number; }>;
    transactionTrend: Array<{ date: string; credits: number; debits: number; }>;
  }> {
    const response = await apiClient.get(`/wallets/${walletId}/analytics`, { period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wallet analytics');
    }
    return response.data as {
      totalCredits: number;
      totalDebits: number;
      netFlow: number;
      transactionCount: number;
      averageTransactionAmount: number;
      topCategories: Array<{ category: string; amount: number; count: number; }>;
      balanceTrend: Array<{ date: string; balance: number; }>;
      transactionTrend: Array<{ date: string; credits: number; debits: number; }>;
    };
  }

  // Export wallet transactions
  static async exportWalletTransactions(walletId: string, filters: TransactionFilter = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post(`/wallets/${walletId}/export`, { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export wallet transactions');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Get wallet statement
  static async getWalletStatement(walletId: string, startDate: string, endDate: string): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.get(`/wallets/${walletId}/statement`, { startDate, endDate });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wallet statement');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Get pending transactions
  static async getPendingTransactions(walletId: string): Promise<WalletTransaction[]> {
    const response = await apiClient.get(`/wallets/${walletId}/pending-transactions`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch pending transactions');
    }
    return response.data as WalletTransaction[];
  }

  // Cancel pending transaction
  static async cancelPendingTransaction(transactionId: string): Promise<WalletTransaction> {
    const response = await apiClient.post(`/wallets/transactions/${transactionId}/cancel`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel pending transaction');
    }
    return response.data as WalletTransaction;
  }

  // Get wallet limits
  static async getWalletLimits(walletId: string): Promise<{
    dailyWithdrawalLimit: number;
    monthlyWithdrawalLimit: number;
    dailyTransferLimit: number;
    monthlyTransferLimit: number;
    maxBalance: number;
    currency: string;
  }> {
    const response = await apiClient.get(`/wallets/${walletId}/limits`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wallet limits');
    }
    return response.data as {
      dailyWithdrawalLimit: number;
      monthlyWithdrawalLimit: number;
      dailyTransferLimit: number;
      monthlyTransferLimit: number;
      maxBalance: number;
      currency: string;
    };
  }

  // Update wallet limits
  static async updateWalletLimits(walletId: string, limits: {
    dailyWithdrawalLimit?: number;
    monthlyWithdrawalLimit?: number;
    dailyTransferLimit?: number;
    monthlyTransferLimit?: number;
    maxBalance?: number;
  }): Promise<{ success: boolean; }> {
    const response = await apiClient.put(`/wallets/${walletId}/limits`, limits);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update wallet limits');
    }
    return response.data as { success: boolean; };
  }

  // Get wallet settings
  static async getWalletSettings(walletId: string): Promise<{
    notifications: {
      email: boolean;
      sms: boolean;
      lowBalance: boolean;
      largeTransaction: boolean;
    };
    security: {
      requireOtpForWithdrawals: boolean;
      requireOtpForTransfers: boolean;
      blockInternationalTransfers: boolean;
    };
    autoTopup: {
      enabled: boolean;
      amount?: number;
      threshold?: number;
      paymentMethod?: string;
    };
  }> {
    const response = await apiClient.get(`/wallets/${walletId}/settings`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wallet settings');
    }
    return response.data as {
      notifications: {
        email: boolean;
        sms: boolean;
        lowBalance: boolean;
        largeTransaction: boolean;
      };
      security: {
        requireOtpForWithdrawals: boolean;
        requireOtpForTransfers: boolean;
        blockInternationalTransfers: boolean;
      };
      autoTopup: {
        enabled: boolean;
        amount?: number;
        threshold?: number;
        paymentMethod?: string;
      };
    };
  }

  // Update wallet settings
  static async updateWalletSettings(walletId: string, settings: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      lowBalance?: boolean;
      largeTransaction?: boolean;
    };
    security?: {
      requireOtpForWithdrawals?: boolean;
      requireOtpForTransfers?: boolean;
      blockInternationalTransfers?: boolean;
    };
    autoTopup?: {
      enabled?: boolean;
      amount?: number;
      threshold?: number;
      paymentMethod?: string;
    };
  }): Promise<{ success: boolean; }> {
    const response = await apiClient.put(`/wallets/${walletId}/settings`, settings);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update wallet settings');
    }
    return response.data as { success: boolean; };
  }

  // Get wallet summary
  static async getWalletSummary(businessId?: string, userId?: string): Promise<{
    totalWallets: number;
    activeWallets: number;
    totalBalance: number;
    currency: string;
    recentTransactions: WalletTransaction[];
    topWallets: Array<{ walletId: string; balance: number; transactionCount: number; }>;
  }> {
    const response = await apiClient.get('/wallets/summary', { businessId, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wallet summary');
    }
    return response.data as {
      totalWallets: number;
      activeWallets: number;
      totalBalance: number;
      currency: string;
      recentTransactions: WalletTransaction[];
      topWallets: Array<{ walletId: string; balance: number; transactionCount: number; }>;
    };
  }

  // Bulk create wallets
  static async bulkCreateWallets(wallets: Array<{
    userId?: string;
    businessId?: string;
    currency: string;
    type: 'business' | 'personal';
    initialBalance?: number;
  }>): Promise<{ created: Wallet[]; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/wallets/bulk', { wallets });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk create wallets');
    }
    return response.data as { created: Wallet[]; failed: number; errors?: string[]; };
  }

  // Get wallet conversion rates
  static async getConversionRates(baseCurrency: string): Promise<Record<string, number>> {
    const response = await apiClient.get('/wallets/conversion-rates', { baseCurrency });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch conversion rates');
    }
    return response.data as Record<string, number>;
  }

  // Convert wallet currency
  static async convertWalletCurrency(walletId: string, targetCurrency: string, amount?: number): Promise<{ transaction: WalletTransaction; convertedAmount: number; rate: number; }> {
    const response = await apiClient.post(`/wallets/${walletId}/convert`, { targetCurrency, amount });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to convert wallet currency');
    }
    return response.data as { transaction: WalletTransaction; convertedAmount: number; rate: number; };
  }
}