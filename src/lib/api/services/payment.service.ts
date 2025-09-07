import { apiClient } from '../client';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  name: string;
  isDefault: boolean;
  details: {
    last4?: string;
    cardType?: string;
    upiId?: string;
    bankName?: string;
    walletName?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethod: string;
  description?: string;
  orderId?: string;
  rfqId?: string;
  clientSecret: string;
  paymentUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  rfqId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  gatewayTransactionId?: string;
  gateway: 'razorpay' | 'cashfree' | 'stripe' | 'paypal';
  failureReason?: string;
  refundedAmount?: number;
  refundReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentData {
  amount: number;
  currency?: string;
  paymentMethod: string;
  orderId?: string;
  rfqId?: string;
  description?: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface RefundData {
  amount: number;
  reason: string;
  notes?: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  supportedMethods: string[];
  fees: {
    percentage?: number;
    fixed?: number;
  };
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successRate: number;
  averagePayment: number;
  paymentMethods: Record<string, number>;
  dailyPayments: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export interface PaymentReceipt {
  receiptUrl: string;
  downloadUrl: string;
}

export interface PaymentValidation {
  valid: boolean;
  message?: string;
  fees?: number;
}

export class PaymentService {
  // Get user's saved payment methods
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.getPaymentMethods();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch payment methods');
    }
    return response.data as PaymentMethod[];
  }

  // Add payment method
  static async addPaymentMethod(data: {
    type: 'card' | 'upi' | 'netbanking' | 'wallet';
    token: string; // Token from payment gateway
    isDefault?: boolean;
  }): Promise<PaymentMethod> {
    const response = await apiClient.addPaymentMethod(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add payment method');
    }
    return response.data as PaymentMethod;
  }

  // Update payment method
  static async updatePaymentMethod(id: string, data: {
    isDefault?: boolean;
    isActive?: boolean;
  }): Promise<PaymentMethod> {
    const response = await apiClient.updatePaymentMethod(id, data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update payment method');
    }
    return response.data as PaymentMethod;
  }

  // Delete payment method
  static async deletePaymentMethod(id: string): Promise<void> {
    const response = await apiClient.deletePaymentMethod(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete payment method');
    }
  }

  // Create payment intent
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntent> {
    const response = await apiClient.createPaymentIntent(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create payment intent');
    }
    return response.data as PaymentIntent;
  }

  // Get payment intent
  static async getPaymentIntent(id: string): Promise<PaymentIntent> {
    const response = await apiClient.getPaymentIntent(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch payment intent');
    }
    return response.data as PaymentIntent;
  }

  // Confirm payment
  static async confirmPayment(intentId: string, data?: {
    paymentMethodId?: string;
    returnUrl?: string;
  }): Promise<PaymentTransaction> {
    const response = await apiClient.confirmPayment(intentId, data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to confirm payment');
    }
    return response.data as PaymentTransaction;
  }

  // Get payment transactions
  static async getTransactions(filters?: {
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: PaymentTransaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.getPaymentTransactions(filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch transactions');
    }
    return response.data as {
      transactions: PaymentTransaction[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Get payment transaction by ID
  static async getTransaction(id: string): Promise<PaymentTransaction> {
    const response = await apiClient.getPaymentTransaction(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch transaction');
    }
    return response.data as PaymentTransaction;
  }

  // Process refund
  static async processRefund(transactionId: string, data: RefundData): Promise<{
    refundId: string;
    amount: number;
    status: string;
  }> {
    const response = await apiClient.processPaymentRefund(transactionId, data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to process refund');
    }
    return response.data as {
      refundId: string;
      amount: number;
      status: string;
    };
  }

  // Get payment gateways
  static async getPaymentGateways(): Promise<PaymentGateway[]> {
    const response = await apiClient.getPaymentGateways();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch payment gateways');
    }
    return response.data as PaymentGateway[];
  }

  // Get payment statistics
  static async getPaymentStats(period?: '7d' | '30d' | '90d' | '1y'): Promise<PaymentStats> {
    const response = await apiClient.getPaymentStats({ period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch payment stats');
    }
    return response.data as PaymentStats;
  }

  // Validate payment method
  static async validatePaymentMethod(methodId: string, amount: number): Promise<PaymentValidation> {
    const response = await apiClient.validatePaymentMethod(methodId, amount);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate payment method');
    }
    return response.data as PaymentValidation;
  }

  // Get payment receipt
  static async getPaymentReceipt(transactionId: string): Promise<PaymentReceipt> {
    const response = await apiClient.getPaymentReceipt(transactionId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch payment receipt');
    }
    return response.data as PaymentReceipt;
  }

  // Dashboard-specific payment methods
  static async getPaymentAnalytics(params?: {
    period?: string;
    gateway?: string;
    status?: string;
  }): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    averageTransactionValue: number;
    topPaymentMethods: Array<{
      method: string;
      count: number;
      revenue: number;
    }>;
    revenueByPeriod: Array<{
      period: string;
      revenue: number;
      transactions: number;
    }>;
    gatewayPerformance: Array<{
      gateway: string;
      transactions: number;
      successRate: number;
      revenue: number;
    }>;
  }> {
    const response = await apiClient.getPaymentAnalytics(params);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch payment analytics');
    }
    return response.data as {
      totalRevenue: number;
      totalTransactions: number;
      successRate: number;
      averageTransactionValue: number;
      topPaymentMethods: Array<{
        method: string;
        count: number;
        revenue: number;
      }>;
      revenueByPeriod: Array<{
        period: string;
        revenue: number;
        transactions: number;
      }>;
      gatewayPerformance: Array<{
        gateway: string;
        transactions: number;
        successRate: number;
        revenue: number;
      }>;
    };
  }

  // Bulk process refunds
  static async bulkProcessRefunds(refunds: Array<{
    transactionId: string;
    amount: number;
    reason: string;
    notes?: string;
  }>): Promise<{
    processed: number;
    failed: number;
    results: Array<{
      transactionId: string;
      success: boolean;
      refundId?: string;
      error?: string;
    }>;
  }> {
    const response = await apiClient.bulkProcessPaymentRefunds(refunds);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to process bulk refunds');
    }
    return response.data as {
      processed: number;
      failed: number;
      results: Array<{
        transactionId: string;
        success: boolean;
        refundId?: string;
        error?: string;
      }>;
    };
  }

  // Get failed payments for retry
  static async getFailedPayments(params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    payments: Array<{
      id: string;
      orderId?: string;
      amount: number;
      failureReason: string;
      paymentMethod: string;
      createdAt: string;
      retryCount: number;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.getFailedPayments(params);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch failed payments');
    }
    return response.data as {
      payments: Array<{
        id: string;
        orderId?: string;
        amount: number;
        failureReason: string;
        paymentMethod: string;
        createdAt: string;
        retryCount: number;
      }>;
      total: number;
      page: number;
      limit: number;
    };
  }

  // Retry failed payment
  static async retryPayment(paymentId: string, paymentMethodId?: string): Promise<PaymentTransaction> {
    const response = await apiClient.retryPayment(paymentId, paymentMethodId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to retry payment');
    }
    return response.data as PaymentTransaction;
  }

  // Get payment gateway configuration
  static async getGatewayConfig(gatewayId: string): Promise<{
    id: string;
    name: string;
    config: Record<string, any>;
    isActive: boolean;
    testMode: boolean;
  }> {
    const response = await apiClient.getPaymentGatewayConfig(gatewayId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch gateway config');
    }
    return response.data as {
      id: string;
      name: string;
      config: Record<string, any>;
      isActive: boolean;
      testMode: boolean;
    };
  }

  // Update payment gateway configuration
  static async updateGatewayConfig(gatewayId: string, config: Record<string, any>): Promise<void> {
    const response = await apiClient.updatePaymentGatewayConfig(gatewayId, config);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update gateway config');
    }
  }
}