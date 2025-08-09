import { apiClient } from '../client';

export interface Deal {
  id: string;
  buyerId: string;
  sellerId: string;
  rfqId: string;
  quoteId: string;
  orderId?: string;
  dealValue: number;
  status: 'initiated' | 'negotiating' | 'confirmed' | 'completed' | 'cancelled';
  milestone: string;
  nextFollowUp: string;
  createdAt: string;
  updatedAt: string;
  buyerName: string;
  sellerName: string;
  rfqTitle: string;
  lastActivity: string;
  messagesCount: number;
}

export interface DealMessage {
  id: string;
  dealId: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'file' | 'system';
  createdAt: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

export interface DealFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: 'buyer' | 'seller';
}

export interface DealStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  successRate: string;
  totalValue: number;
}

export interface DealsResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
  stats: DealStats;
}

export interface CreateDealData {
  rfqId: string;
  quoteId: string;
  dealValue: number;
  milestone: string;
  nextFollowUp: string;
}

export interface UpdateDealData {
  status?: Deal['status'];
  milestone?: string;
  nextFollowUp?: string;
}

export interface SendMessageData {
  message: string;
  messageType?: 'text' | 'file';
  attachments?: File[];
}

class DealService {
  private baseUrl = '/api/deals';

  async getDeals(filters: DealFilters = {}): Promise<DealsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data as DealsResponse;
  }

  async getDeal(id: string): Promise<Deal> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data as Deal;
  }

  async createDeal(data: CreateDealData): Promise<Deal> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data as Deal;
  }

  async updateDeal(id: string, data: UpdateDealData): Promise<Deal> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data as Deal;
  }

  async deleteDeal(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getDealMessages(dealId: string, page = 1, limit = 50): Promise<{
    messages: DealMessage[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get(
      `${this.baseUrl}/${dealId}/messages?page=${page}&limit=${limit}`
    );
    return response.data as { messages: DealMessage[]; total: number; hasMore: boolean; };
  }

  async sendMessage(dealId: string, data: SendMessageData): Promise<DealMessage> {
    const formData = new FormData();
    formData.append('message', data.message);
    formData.append('messageType', data.messageType || 'text');

    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post(
      `${this.baseUrl}/${dealId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data as DealMessage;
  }

  async markMessagesAsRead(dealId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${dealId}/messages/mark-read`);
  }

  async getDealTimeline(dealId: string): Promise<Array<{
    id: string;
    type: 'status_change' | 'message' | 'milestone' | 'system';
    title: string;
    description: string;
    timestamp: string;
    user?: {
      name: string;
      role: 'buyer' | 'seller';
    };
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/${dealId}/timeline`);
    return response.data as Array<{
      id: string;
      type: 'message' | 'system' | 'status_change' | 'milestone';
      title: string;
      description: string;
      timestamp: string;
      user?: {
        name: string;
        role: 'buyer' | 'seller';
      };
    }>;
  }

  async getDealAnalytics(dealId: string): Promise<{
    responseTime: string;
    messagesCount: number;
    milestoneProgress: number;
    estimatedCompletion: string;
    riskScore: 'low' | 'medium' | 'high';
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${dealId}/analytics`);
    return response.data as {
      responseTime: string;
      messagesCount: number;
      milestoneProgress: number;
      estimatedCompletion: string;
      riskScore: 'low' | 'medium' | 'high';
    };
  }

  async scheduleFollowUp(dealId: string, followUpDate: string, note?: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${dealId}/follow-up`, {
      followUpDate,
      note,
    });
  }

  async getDashboardStats(): Promise<{
    totalDeals: number;
    activeDeals: number;
    completedDeals: number;
    totalValue: number;
    successRate: number;
    avgDealTime: string;
    upcomingFollowUps: number;
    recentActivity: Array<{
      id: string;
      type: string;
      title: string;
      timestamp: string;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/dashboard/stats`);
    return response.data as {
      totalDeals: number;
      activeDeals: number;
      completedDeals: number;
      totalValue: number;
      successRate: number;
      avgDealTime: string;
      upcomingFollowUps: number;
      recentActivity: Array<{
        id: string;
        type: string;
        title: string;
        timestamp: string;
      }>;
    };
  }

  async exportDeals(filters: DealFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);

    const response = await apiClient.get(
      `${this.baseUrl}/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data as Blob;
  }
}

export const dealService = new DealService();