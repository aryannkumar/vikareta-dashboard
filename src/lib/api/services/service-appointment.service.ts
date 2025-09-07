import { apiClient } from '../client';

export interface ServiceAppointment {
  id: string;
  serviceOrderId: string;
  providerId: string;
  customerId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  location?: string;
  notes?: string;
  customerContact: {
    name: string;
    phone: string;
    email: string;
  };
  providerContact: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceAppointmentData {
  serviceOrderId: string;
  customerId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location?: string;
  notes?: string;
}

export interface UpdateServiceAppointmentData {
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  location?: string;
  notes?: string;
}

export class ServiceAppointmentService {
  // Get all service appointments for a business
  static async getServiceAppointments(businessId: string, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ appointments: ServiceAppointment[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/service-appointments', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch service appointments');
    }
    return response.data as { appointments: ServiceAppointment[]; total: number; page: number; totalPages: number; };
  }

  // Get service appointment by ID
  static async getServiceAppointmentById(id: string): Promise<ServiceAppointment> {
    const response = await apiClient.get(`/service-appointments/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch service appointment');
    }
    return response.data as ServiceAppointment;
  }

  // Create service appointment
  static async createServiceAppointment(appointmentData: CreateServiceAppointmentData): Promise<ServiceAppointment> {
    const response = await apiClient.post('/service-appointments', appointmentData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create service appointment');
    }
    return response.data as ServiceAppointment;
  }

  // Update service appointment
  static async updateServiceAppointment(id: string, appointmentData: UpdateServiceAppointmentData): Promise<ServiceAppointment> {
    const response = await apiClient.put(`/service-appointments/${id}`, appointmentData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update service appointment');
    }
    return response.data as ServiceAppointment;
  }

  // Cancel service appointment
  static async cancelServiceAppointment(id: string, reason?: string): Promise<ServiceAppointment> {
    const response = await apiClient.post(`/service-appointments/${id}/cancel`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel service appointment');
    }
    return response.data as ServiceAppointment;
  }

  // Confirm service appointment
  static async confirmServiceAppointment(id: string): Promise<ServiceAppointment> {
    const response = await apiClient.post(`/service-appointments/${id}/confirm`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to confirm service appointment');
    }
    return response.data as ServiceAppointment;
  }

  // Mark appointment as completed
  static async completeServiceAppointment(id: string, notes?: string): Promise<ServiceAppointment> {
    const response = await apiClient.post(`/service-appointments/${id}/complete`, { notes });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to complete service appointment');
    }
    return response.data as ServiceAppointment;
  }

  // Get available time slots
  static async getAvailableSlots(providerId: string, date: string): Promise<{ time: string; available: boolean; }[]> {
    const response = await apiClient.get('/service-appointments/available-slots', { providerId, date });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch available slots');
    }
    return response.data as { time: string; available: boolean; }[];
  }

  // Bulk actions for service appointments
  static async bulkServiceAppointmentAction(actionData: { appointmentIds: string[]; action: 'confirm' | 'cancel' | 'complete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/service-appointments/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export service appointments
  static async exportServiceAppointments(filters?: { businessId?: string; status?: string; dateFrom?: string; dateTo?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/service-appointments/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export service appointments');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}