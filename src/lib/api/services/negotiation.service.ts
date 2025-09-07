import { apiClient } from '../client';

export interface Negotiation {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  originalPrice: number;
  negotiatedPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered' | 'completed';
  messages: Array<{
    id: string;
    senderId: string;
    senderType: 'business' | 'customer';
    message: string;
    price?: number;
    createdAt: string;
  }>;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNegotiationData {
  customerId: string;
  productId: string;
  originalPrice: number;
  negotiatedPrice: number;
  message: string;
  expiryDate?: string;
}

export interface UpdateNegotiationData {
  status?: 'pending' | 'accepted' | 'rejected' | 'counter_offered' | 'completed';
  negotiatedPrice?: number;
}

export class NegotiationService {
  // Get all negotiations for a business
  static async getNegotiations(businessId: string, filters?: {
    status?: string;
    customerId?: string;
    productId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ negotiations: Negotiation[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/negotiations', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch negotiations');
    }
    return response.data as { negotiations: Negotiation[]; total: number; page: number; totalPages: number; };
  }

  // Get negotiation by ID
  static async getNegotiationById(id: string): Promise<Negotiation> {
    const response = await apiClient.get(`/negotiations/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch negotiation');
    }
    return response.data as Negotiation;
  }

  // Create negotiation
  static async createNegotiation(negotiationData: CreateNegotiationData): Promise<Negotiation> {
    const response = await apiClient.post('/negotiations', negotiationData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create negotiation');
    }
    return response.data as Negotiation;
  }

  // Update negotiation
  static async updateNegotiation(id: string, negotiationData: UpdateNegotiationData): Promise<Negotiation> {
    const response = await apiClient.put(`/negotiations/${id}`, negotiationData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update negotiation');
    }
    return response.data as Negotiation;
  }

  // Delete negotiation
  static async deleteNegotiation(id: string): Promise<void> {
    const response = await apiClient.delete(`/negotiations/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete negotiation');
    }
  }

  // Add message to negotiation
  static async addMessage(id: string, message: string, price?: number): Promise<Negotiation> {
    const response = await apiClient.post(`/negotiations/${id}/messages`, { message, price });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add message');
    }
    return response.data as Negotiation;
  }

  // Accept negotiation
  static async acceptNegotiation(id: string): Promise<Negotiation> {
    const response = await apiClient.post(`/negotiations/${id}/accept`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to accept negotiation');
    }
    return response.data as Negotiation;
  }

  // Reject negotiation
  static async rejectNegotiation(id: string): Promise<Negotiation> {
    const response = await apiClient.post(`/negotiations/${id}/reject`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reject negotiation');
    }
    return response.data as Negotiation;
  }

  // Counter offer
  static async counterOffer(id: string, price: number, message: string): Promise<Negotiation> {
    const response = await apiClient.post(`/negotiations/${id}/counter`, { price, message });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to make counter offer');
    }
    return response.data as Negotiation;
  }

  // Bulk actions for negotiations
  static async bulkNegotiationAction(actionData: { negotiationIds: string[]; action: 'accept' | 'reject' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/negotiations/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export negotiations
  static async exportNegotiations(filters?: { businessId?: string; status?: string; customerId?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/negotiations/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export negotiations');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}