import { apiClient } from '../client';

export interface Review {
  id: string;
  userId: string;
  productId?: string;
  serviceId?: string;
  businessId?: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    image?: string;
  };
  service?: {
    id: string;
    name: string;
    image?: string;
  };
  business?: {
    id: string;
    name: string;
    logo?: string;
  };
}

export interface CreateReviewData {
  productId?: string;
  serviceId?: string;
  businessId?: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewFilters {
  productId?: string;
  serviceId?: string;
  businessId?: string;
  userId?: string;
  rating?: number;
  isVerified?: boolean;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedReviews: number;
  recentReviews: Review[];
  topRatedProducts?: Array<{
    id: string;
    name: string;
    averageRating: number;
    totalReviews: number;
  }>;
  reviewTrends?: Array<{
    date: string;
    count: number;
    averageRating: number;
  }>;
}

export interface BulkReviewAction {
  reviewIds: string[];
  action: 'approve' | 'reject' | 'delete' | 'mark_verified';
}

export class ReviewService {
  // Get all reviews with optional filters
  static async getReviews(filters?: ReviewFilters): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/reviews', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch reviews');
    }
    return response.data as {
      reviews: Review[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Get a specific review by ID
  static async getReviewById(id: string): Promise<Review> {
    const response = await apiClient.get(`/reviews/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch review');
    }
    return response.data as Review;
  }

  // Create a new review
  static async createReview(reviewData: CreateReviewData): Promise<Review> {
    const response = await apiClient.post('/reviews', reviewData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create review');
    }
    return response.data as Review;
  }

  // Update an existing review
  static async updateReview(id: string, reviewData: UpdateReviewData): Promise<Review> {
    const response = await apiClient.put(`/reviews/${id}`, reviewData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update review');
    }
    return response.data as Review;
  }

  // Delete a review
  static async deleteReview(id: string): Promise<void> {
    const response = await apiClient.delete(`/reviews/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete review');
    }
  }

  // Get reviews for a specific product
  static async getProductReviews(productId: string, filters?: Omit<ReviewFilters, 'productId'>): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
    averageRating: number;
  }> {
    const response = await apiClient.get('/reviews', { ...filters, productId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch product reviews');
    }
    return response.data as {
      reviews: Review[];
      total: number;
      page: number;
      totalPages: number;
      averageRating: number;
    };
  }

  // Get reviews for a specific service
  static async getServiceReviews(serviceId: string, filters?: Omit<ReviewFilters, 'serviceId'>): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
    averageRating: number;
  }> {
    const response = await apiClient.get('/reviews', { ...filters, serviceId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch service reviews');
    }
    return response.data as {
      reviews: Review[];
      total: number;
      page: number;
      totalPages: number;
      averageRating: number;
    };
  }

  // Get reviews for a specific business
  static async getBusinessReviews(businessId: string, filters?: Omit<ReviewFilters, 'businessId'>): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
    averageRating: number;
  }> {
    const response = await apiClient.get('/reviews', { ...filters, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch business reviews');
    }
    return response.data as {
      reviews: Review[];
      total: number;
      page: number;
      totalPages: number;
      averageRating: number;
    };
  }

  // Get reviews by a specific user
  static async getUserReviews(userId: string, filters?: Omit<ReviewFilters, 'userId'>): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/reviews', { ...filters, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch user reviews');
    }
    return response.data as {
      reviews: Review[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Mark a review as helpful
  static async markReviewHelpful(reviewId: string): Promise<void> {
    const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to mark review as helpful');
    }
  }

  // Get review statistics
  static async getReviewStats(targetId: string, targetType: 'product' | 'service' | 'business'): Promise<ReviewStats> {
    const response = await apiClient.get('/reviews/stats', { targetId, targetType });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch review stats');
    }
    return response.data as ReviewStats;
  }

  // Get dashboard review analytics
  static async getDashboardReviewAnalytics(filters?: {
    dateRange?: { start: string; end: string };
    businessId?: string;
  }): Promise<ReviewStats> {
    const response = await apiClient.get('/reviews/dashboard/analytics', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch review analytics');
    }
    return response.data as ReviewStats;
  }

  // Bulk actions for reviews
  static async bulkReviewAction(actionData: BulkReviewAction): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors?: string[];
  }> {
    const response = await apiClient.post('/reviews/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as {
      success: boolean;
      processed: number;
      failed: number;
      errors?: string[];
    };
  }

  // Approve a review (admin action)
  static async approveReview(reviewId: string): Promise<Review> {
    const response = await apiClient.post(`/reviews/${reviewId}/approve`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to approve review');
    }
    return response.data as Review;
  }

  // Reject a review (admin action)
  static async rejectReview(reviewId: string, reason?: string): Promise<Review> {
    const response = await apiClient.post(`/reviews/${reviewId}/reject`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reject review');
    }
    return response.data as Review;
  }

  // Mark review as verified
  static async markReviewVerified(reviewId: string): Promise<Review> {
    const response = await apiClient.post(`/reviews/${reviewId}/verify`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify review');
    }
    return response.data as Review;
  }

  // Get pending reviews for moderation
  static async getPendingReviews(filters?: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/reviews/pending', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch pending reviews');
    }
    return response.data as {
      reviews: Review[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  // Get review response templates
  static async getReviewResponseTemplates(): Promise<Array<{
    id: string;
    name: string;
    template: string;
    category: string;
  }>> {
    const response = await apiClient.get('/reviews/response-templates');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch response templates');
    }
    return response.data as Array<{
      id: string;
      name: string;
      template: string;
      category: string;
    }>;
  }

  // Respond to a review
  static async respondToReview(reviewId: string, response: string): Promise<Review> {
    const responseData = await apiClient.post(`/reviews/${reviewId}/respond`, { response });
    if (!responseData.success) {
      throw new Error(responseData.error?.message || 'Failed to respond to review');
    }
    return responseData.data as Review;
  }
}