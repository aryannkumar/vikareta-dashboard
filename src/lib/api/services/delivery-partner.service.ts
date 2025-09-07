import { apiClient } from '../client';

export interface DeliveryPartner {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: number;
  totalDeliveries: number;
  successRate: number;
  vehicleType: 'bike' | 'car' | 'truck' | 'van';
  licenseNumber: string;
  insuranceExpiry: string;
  documents: Array<{
    type: string;
    url: string;
    verified: boolean;
  }>;
  workingHours: {
    monday: { start: string; end: string; };
    tuesday: { start: string; end: string; };
    wednesday: { start: string; end: string; };
    thursday: { start: string; end: string; };
    friday: { start: string; end: string; };
    saturday: { start: string; end: string; };
    sunday: { start: string; end: string; };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryPartnerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  vehicleType: 'bike' | 'car' | 'truck' | 'van';
  licenseNumber: string;
  insuranceExpiry: string;
  workingHours: {
    monday: { start: string; end: string; };
    tuesday: { start: string; end: string; };
    wednesday: { start: string; end: string; };
    thursday: { start: string; end: string; };
    friday: { start: string; end: string; };
    saturday: { start: string; end: string; };
    sunday: { start: string; end: string; };
  };
}

export interface UpdateDeliveryPartnerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  vehicleType?: 'bike' | 'car' | 'truck' | 'van';
  licenseNumber?: string;
  insuranceExpiry?: string;
  workingHours?: {
    monday?: { start: string; end: string; };
    tuesday?: { start: string; end: string; };
    wednesday?: { start: string; end: string; };
    thursday?: { start: string; end: string; };
    friday?: { start: string; end: string; };
    saturday?: { start: string; end: string; };
    sunday?: { start: string; end: string; };
  };
}

export class DeliveryPartnerService {
  // Get all delivery partners for a business
  static async getDeliveryPartners(businessId: string, filters?: {
    status?: string;
    vehicleType?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<{ partners: DeliveryPartner[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/delivery-partners', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch delivery partners');
    }
    return response.data as { partners: DeliveryPartner[]; total: number; page: number; totalPages: number; };
  }

  // Get delivery partner by ID
  static async getDeliveryPartnerById(id: string): Promise<DeliveryPartner> {
    const response = await apiClient.get(`/delivery-partners/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch delivery partner');
    }
    return response.data as DeliveryPartner;
  }

  // Create delivery partner
  static async createDeliveryPartner(partnerData: CreateDeliveryPartnerData): Promise<DeliveryPartner> {
    const response = await apiClient.post('/delivery-partners', partnerData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create delivery partner');
    }
    return response.data as DeliveryPartner;
  }

  // Update delivery partner
  static async updateDeliveryPartner(id: string, partnerData: UpdateDeliveryPartnerData): Promise<DeliveryPartner> {
    const response = await apiClient.put(`/delivery-partners/${id}`, partnerData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update delivery partner');
    }
    return response.data as DeliveryPartner;
  }

  // Delete delivery partner
  static async deleteDeliveryPartner(id: string): Promise<void> {
    const response = await apiClient.delete(`/delivery-partners/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete delivery partner');
    }
  }

  // Verify delivery partner documents
  static async verifyDocuments(id: string, documentType: string): Promise<DeliveryPartner> {
    const response = await apiClient.post(`/delivery-partners/${id}/verify`, { documentType });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify documents');
    }
    return response.data as DeliveryPartner;
  }

  // Get delivery partner performance
  static async getPartnerPerformance(id: string): Promise<{ rating: number; totalDeliveries: number; successRate: number; averageDeliveryTime: number; }> {
    const response = await apiClient.get(`/delivery-partners/${id}/performance`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch partner performance');
    }
    return response.data as { rating: number; totalDeliveries: number; successRate: number; averageDeliveryTime: number; };
  }

  // Assign delivery to partner
  static async assignDelivery(partnerId: string, deliveryId: string): Promise<{ success: boolean; message: string; }> {
    const response = await apiClient.post(`/delivery-partners/${partnerId}/assign`, { deliveryId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to assign delivery');
    }
    return response.data as { success: boolean; message: string; };
  }

  // Bulk actions for delivery partners
  static async bulkPartnerAction(actionData: { partnerIds: string[]; action: 'activate' | 'suspend' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/delivery-partners/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export delivery partners
  static async exportDeliveryPartners(filters?: { businessId?: string; status?: string; vehicleType?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/delivery-partners/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export delivery partners');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}