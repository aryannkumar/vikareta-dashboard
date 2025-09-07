import { apiClient } from '../client';

export interface SupportTicket {
  id: string;
  businessId: string;
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'business' | 'admin' | 'support';
  message: string;
  createdAt: string;
}

export interface CreateSupportTicketData {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateSupportTicketData {
  status?: 'open' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
}

export class SupportService {
  // Get all support tickets for a business
  static async getTickets(businessId: string, filters?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tickets: SupportTicket[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/support/tickets', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch support tickets');
    }
    return response.data as { tickets: SupportTicket[]; total: number; page: number; totalPages: number; };
  }

  // Get ticket by ID
  static async getTicketById(id: string): Promise<SupportTicket> {
    const response = await apiClient.get(`/support/tickets/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch support ticket');
    }
    return response.data as SupportTicket;
  }

  // Create support ticket
  static async createTicket(ticketData: CreateSupportTicketData): Promise<SupportTicket> {
    const response = await apiClient.post('/support/tickets', ticketData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create support ticket');
    }
    return response.data as SupportTicket;
  }

  // Update support ticket
  static async updateTicket(id: string, ticketData: UpdateSupportTicketData): Promise<SupportTicket> {
    const response = await apiClient.put(`/support/tickets/${id}`, ticketData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update support ticket');
    }
    return response.data as SupportTicket;
  }

  // Delete support ticket
  static async deleteTicket(id: string): Promise<void> {
    const response = await apiClient.delete(`/support/tickets/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete support ticket');
    }
  }

  // Add message to ticket
  static async addMessage(ticketId: string, message: string, senderId: string, senderType: 'business' | 'admin' | 'support'): Promise<SupportMessage> {
    const response = await apiClient.post(`/support/tickets/${ticketId}/messages`, { message, senderId, senderType });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add message');
    }
    return response.data as SupportMessage;
  }

  // Bulk actions for support tickets
  static async bulkTicketAction(actionData: { ticketIds: string[]; action: 'resolve' | 'close' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/support/tickets/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export support tickets
  static async exportTickets(filters?: { businessId?: string; status?: string; priority?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/support/tickets/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export support tickets');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}
