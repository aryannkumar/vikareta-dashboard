import { apiClient } from '../client';

export interface Invoice {
  id: string;
  businessId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  cancelledAt?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceData {
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  dueDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
}

export interface UpdateInvoiceData {
  status?: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';
  paidAt?: string;
  cancelledAt?: string;
  notes?: string;
}

export class InvoiceService {
  // Get all invoices for a business
  static async getInvoices(businessId: string, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ invoices: Invoice[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/invoices', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch invoices');
    }
    return response.data as { invoices: Invoice[]; total: number; page: number; totalPages: number; };
  }

  // Get invoice by ID
  static async getInvoiceById(id: string): Promise<Invoice> {
    const response = await apiClient.get(`/invoices/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch invoice');
    }
    return response.data as Invoice;
  }

  // Create invoice
  static async createInvoice(invoiceData: CreateInvoiceData): Promise<Invoice> {
    const response = await apiClient.post('/invoices', invoiceData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create invoice');
    }
    return response.data as Invoice;
  }

  // Update invoice
  static async updateInvoice(id: string, invoiceData: UpdateInvoiceData): Promise<Invoice> {
    const response = await apiClient.put(`/invoices/${id}`, invoiceData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update invoice');
    }
    return response.data as Invoice;
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<void> {
    const response = await apiClient.delete(`/invoices/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete invoice');
    }
  }

  // Download invoice PDF
  static async downloadInvoice(id: string): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.get(`/invoices/${id}/download`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to download invoice');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Bulk actions for invoices
  static async bulkInvoiceAction(actionData: { invoiceIds: string[]; action: 'mark_paid' | 'cancel' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/invoices/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export invoices
  static async exportInvoices(filters?: { businessId?: string; status?: string; dateFrom?: string; dateTo?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/invoices/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export invoices');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}
