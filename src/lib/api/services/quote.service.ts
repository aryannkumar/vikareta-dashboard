import { apiClient } from '../client';

export interface Quote {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    description?: string;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuoteData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    description?: string;
  }>;
  tax?: number;
  discount?: number;
  validUntil: string;
  notes?: string;
  terms?: string;
}

export interface UpdateQuoteData {
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  items?: Array<{
    id?: string;
    name: string;
    quantity: number;
    price: number;
    description?: string;
  }>;
  tax?: number;
  discount?: number;
  validUntil?: string;
  notes?: string;
  terms?: string;
}

export class QuoteService {
  // Get all quotes for a business
  static async getQuotes(businessId: string, filters?: {
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ quotes: Quote[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/quotes', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch quotes');
    }
    return response.data as { quotes: Quote[]; total: number; page: number; totalPages: number; };
  }

  // Get quote by ID
  static async getQuoteById(id: string): Promise<Quote> {
    const response = await apiClient.get(`/quotes/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch quote');
    }
    return response.data as Quote;
  }

  // Create quote
  static async createQuote(quoteData: CreateQuoteData): Promise<Quote> {
    const response = await apiClient.post('/quotes', quoteData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create quote');
    }
    return response.data as Quote;
  }

  // Update quote
  static async updateQuote(id: string, quoteData: UpdateQuoteData): Promise<Quote> {
    const response = await apiClient.put(`/quotes/${id}`, quoteData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update quote');
    }
    return response.data as Quote;
  }

  // Delete quote
  static async deleteQuote(id: string): Promise<void> {
    const response = await apiClient.delete(`/quotes/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete quote');
    }
  }

  // Send quote to customer
  static async sendQuote(id: string): Promise<Quote> {
    const response = await apiClient.post(`/quotes/${id}/send`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send quote');
    }
    return response.data as Quote;
  }

  // Accept quote
  static async acceptQuote(id: string): Promise<Quote> {
    const response = await apiClient.post(`/quotes/${id}/accept`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to accept quote');
    }
    return response.data as Quote;
  }

  // Reject quote
  static async rejectQuote(id: string): Promise<Quote> {
    const response = await apiClient.post(`/quotes/${id}/reject`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reject quote');
    }
    return response.data as Quote;
  }

  // Bulk actions for quotes
  static async bulkQuoteAction(actionData: { quoteIds: string[]; action: 'send' | 'accept' | 'reject' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/quotes/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export quotes
  static async exportQuotes(filters?: { businessId?: string; status?: string; customerId?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/quotes/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export quotes');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}