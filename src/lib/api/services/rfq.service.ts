import { apiClient } from '../client';

export interface RFQ {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deliveryTimeline: string;
  deliveryLocation: string;
  status: 'active' | 'expired' | 'closed' | 'draft';
  quotesCount: number;
  createdAt: string;
  expiresAt: string;
  category: string;
  subcategory: string;
  specifications?: Array<{
    key: string;
    value: string;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

export interface Quote {
  id: string;
  rfqId: string;
  sellerId: string;
  sellerName: string;
  totalPrice: number;
  deliveryTimeline: string;
  termsConditions: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories?: Category[];
}

export interface RFQFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface RFQStats {
  active: number;
  totalQuotes: number;
  avgResponseTime: string;
  successRate: string;
}

export interface RFQsResponse {
  rfqs: RFQ[];
  total: number;
  page: number;
  limit: number;
  stats: RFQStats;
}

export interface CreateRFQData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deliveryTimeline: string;
  deliveryLocation: string;
  specifications?: Array<{
    key: string;
    value: string;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

export interface UpdateRFQData {
  title?: string;
  description?: string;
  quantity?: number;
  budgetMin?: number;
  budgetMax?: number;
  deliveryTimeline?: string;
  deliveryLocation?: string;
  status?: RFQ['status'];
}

export interface CreateQuoteData {
  rfqId: string;
  totalPrice: number;
  deliveryTimeline: string;
  termsConditions: string;
  validUntil: string;
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export interface NegotiationData {
  counterPrice: number;
  message: string;
  deliveryTimeline?: string;
}

class RFQService {
  private baseUrl = '/rfqs';

  async getRFQs(filters: RFQFilters = {}): Promise<RFQsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data as RFQsResponse;
  }

  async getRFQ(id: string): Promise<RFQ> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data as RFQ;
  }

  async createRFQ(data: CreateRFQData): Promise<RFQ> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data as RFQ;
  }

  async updateRFQ(id: string, data: UpdateRFQData): Promise<RFQ> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data as RFQ;
  }

  async deleteRFQ(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getRFQQuotes(rfqId: string): Promise<Quote[]> {
    const response = await apiClient.get(`${this.baseUrl}/${rfqId}/quotes`);
    return response.data as Quote[];
  }

  async getQuote(quoteId: string): Promise<Quote> {
    const response = await apiClient.get(`/quotes/${quoteId}`);
    return response.data as Quote;
  }

  async createQuote(data: CreateQuoteData): Promise<Quote> {
    const response = await apiClient.post('/quotes', data);
    return response.data as Quote;
  }

  async acceptQuote(quoteId: string): Promise<{ orderId: string }> {
    const response = await apiClient.post(`/quotes/${quoteId}/accept`);
    return response.data as { orderId: string };
  }

  async rejectQuote(quoteId: string, reason?: string): Promise<void> {
    await apiClient.post(`/quotes/${quoteId}/reject`, { reason });
  }

  async negotiateQuote(quoteId: string, data: NegotiationData): Promise<Quote> {
    const response = await apiClient.post(`/quotes/${quoteId}/negotiate`, data);
    return response.data as Quote;
  }

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories');
    return response.data as Category[];
  }

  async getSubcategories(categoryId: string): Promise<Category[]> {
    const response = await apiClient.get(`/categories/${categoryId}/subcategories`);
    return response.data as Category[];
  }

  async uploadAttachment(file: File): Promise<{
    name: string;
    url: string;
    size: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as {
      name: string;
      url: string;
      size: number;
    };
  }

  async sendRFQToSellers(rfqId: string, sellerIds?: string[]): Promise<{
    sentCount: number;
    sellers: Array<{
      id: string;
      name: string;
      status: 'sent' | 'failed';
    }>;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/${rfqId}/send`, {
      sellerIds,
    });
    return response.data as {
      sentCount: number;
      sellers: Array<{
        id: string;
        name: string;
        status: 'sent' | 'failed';
      }>;
    };
  }

  async extendRFQDeadline(rfqId: string, newExpiryDate: string): Promise<RFQ> {
    const response = await apiClient.post(`${this.baseUrl}/${rfqId}/extend`, {
      expiresAt: newExpiryDate,
    });
    return response.data as RFQ;
  }

  async closeRFQ(rfqId: string, reason?: string): Promise<RFQ> {
    const response = await apiClient.post(`${this.baseUrl}/${rfqId}/close`, {
      reason,
    });
    return response.data as RFQ;
  }

  async getRFQAnalytics(rfqId: string): Promise<{
    viewsCount: number;
    quotesReceived: number;
    avgQuotePrice: number;
    responseRate: number;
    timeToFirstQuote: string;
    quotePriceRange: {
      min: number;
      max: number;
    };
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${rfqId}/analytics`);
    return response.data as {
      viewsCount: number;
      quotesReceived: number;
      avgQuotePrice: number;
      responseRate: number;
      timeToFirstQuote: string;
      quotePriceRange: {
        min: number;
        max: number;
      };
    };
  }

  async getDashboardStats(): Promise<{
    totalRFQs: number;
    activeRFQs: number;
    totalQuotes: number;
    avgResponseTime: string;
    successRate: number;
    recentRFQs: Array<{
      id: string;
      title: string;
      quotesCount: number;
      createdAt: string;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/dashboard/stats`);
    return response.data as {
      totalRFQs: number;
      activeRFQs: number;
      totalQuotes: number;
      avgResponseTime: string;
      successRate: number;
      recentRFQs: Array<{
        id: string;
        title: string;
        quotesCount: number;
        createdAt: string;
      }>;
    };
  }

  async exportRFQs(filters: RFQFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);

    const response = await apiClient.get(
      `${this.baseUrl}/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data as Blob;
  }
}

export const rfqService = new RFQService();