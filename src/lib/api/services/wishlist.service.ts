import { apiClient } from '../client';

export interface WishlistItem {
  id: string;
  businessId: string;
  userId: string;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice: number;
  currency: string;
  addedAt: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateWishlistItemData {
  productId: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateWishlistItemData {
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface WishlistFilter {
  businessId?: string;
  userId?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface WishlistSummary {
  totalItems: number;
  itemsByPriority: Record<string, number>;
  itemsByTag: Record<string, number>;
  recentAdditions: WishlistItem[];
  totalValue: number;
  currency: string;
}

export class WishlistService {
  // Get wishlist items with filtering
  static async getWishlistItems(filters: WishlistFilter = {}): Promise<{ items: WishlistItem[]; total: number; }> {
    const response = await apiClient.get('/wishlist', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wishlist items');
    }
    return response.data as { items: WishlistItem[]; total: number; };
  }

  // Get wishlist item by ID
  static async getWishlistItemById(id: string): Promise<WishlistItem> {
    const response = await apiClient.get(`/wishlist/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wishlist item');
    }
    return response.data as WishlistItem;
  }

  // Add item to wishlist
  static async addToWishlist(itemData: CreateWishlistItemData): Promise<WishlistItem> {
    const response = await apiClient.post('/wishlist', itemData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add item to wishlist');
    }
    return response.data as WishlistItem;
  }

  // Update wishlist item
  static async updateWishlistItem(id: string, itemData: UpdateWishlistItemData): Promise<WishlistItem> {
    const response = await apiClient.put(`/wishlist/${id}`, itemData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update wishlist item');
    }
    return response.data as WishlistItem;
  }

  // Remove item from wishlist
  static async removeFromWishlist(id: string): Promise<void> {
    const response = await apiClient.delete(`/wishlist/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove item from wishlist');
    }
  }

  // Check if product is in wishlist
  static async isInWishlist(productId: string, userId?: string): Promise<{ inWishlist: boolean; itemId?: string; }> {
    const response = await apiClient.get('/wishlist/check', { productId, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to check wishlist status');
    }
    return response.data as { inWishlist: boolean; itemId?: string; };
  }

  // Bulk add items to wishlist
  static async bulkAddToWishlist(items: CreateWishlistItemData[]): Promise<{ added: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/wishlist/bulk-add', { items });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk add items to wishlist');
    }
    return response.data as { added: number; failed: number; errors?: string[]; };
  }

  // Bulk remove items from wishlist
  static async bulkRemoveFromWishlist(itemIds: string[]): Promise<{ removed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/wishlist/bulk-remove', { itemIds });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk remove items from wishlist');
    }
    return response.data as { removed: number; failed: number; errors?: string[]; };
  }

  // Get wishlist summary
  static async getWishlistSummary(businessId?: string, userId?: string): Promise<WishlistSummary> {
    const response = await apiClient.get('/wishlist/summary', { businessId, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wishlist summary');
    }
    return response.data as WishlistSummary;
  }

  // Get wishlist analytics
  static async getWishlistAnalytics(businessId?: string, userId?: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalItems: number;
    addedItems: number;
    removedItems: number;
    conversionRate: number;
    topCategories: Array<{ category: string; count: number; }>;
    topTags: Array<{ tag: string; count: number; }>;
    timeline: Array<{ date: string; added: number; removed: number; }>;
    averagePrice: number;
    currency: string;
  }> {
    const response = await apiClient.get('/wishlist/analytics', { businessId, userId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wishlist analytics');
    }
    return response.data as {
      totalItems: number;
      addedItems: number;
      removedItems: number;
      conversionRate: number;
      topCategories: Array<{ category: string; count: number; }>;
      topTags: Array<{ tag: string; count: number; }>;
      timeline: Array<{ date: string; added: number; removed: number; }>;
      averagePrice: number;
      currency: string;
    };
  }

  // Export wishlist
  static async exportWishlist(filters: WishlistFilter = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/wishlist/export', { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export wishlist');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Share wishlist
  static async shareWishlist(shareData: {
    itemIds?: string[];
    recipientEmail: string;
    message?: string;
    expiresAt?: string;
  }): Promise<{ shareId: string; shareUrl: string; expiresAt?: string; }> {
    const response = await apiClient.post('/wishlist/share', shareData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to share wishlist');
    }
    return response.data as { shareId: string; shareUrl: string; expiresAt?: string; };
  }

  // Get shared wishlist
  static async getSharedWishlist(shareId: string): Promise<{ items: WishlistItem[]; sharedBy: string; message?: string; expiresAt?: string; }> {
    const response = await apiClient.get(`/wishlist/shared/${shareId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch shared wishlist');
    }
    return response.data as { items: WishlistItem[]; sharedBy: string; message?: string; expiresAt?: string; };
  }

  // Move item to cart
  static async moveToCart(itemId: string, quantity?: number): Promise<{ success: boolean; cartItemId?: string; }> {
    const response = await apiClient.post(`/wishlist/${itemId}/move-to-cart`, { quantity });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to move item to cart');
    }
    return response.data as { success: boolean; cartItemId?: string; };
  }

  // Bulk move items to cart
  static async bulkMoveToCart(itemIds: string[], quantities?: Record<string, number>): Promise<{ moved: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/wishlist/bulk-move-to-cart', { itemIds, quantities });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk move items to cart');
    }
    return response.data as { moved: number; failed: number; errors?: string[]; };
  }

  // Get wishlist recommendations
  static async getWishlistRecommendations(userId?: string, limit: number = 10): Promise<Array<{
    productId: string;
    productName: string;
    productImage?: string;
    productPrice: number;
    currency: string;
    reason: string;
    score: number;
  }>> {
    const response = await apiClient.get('/wishlist/recommendations', { userId, limit });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch wishlist recommendations');
    }
    return response.data as Array<{
      productId: string;
      productName: string;
      productImage?: string;
      productPrice: number;
      currency: string;
      reason: string;
      score: number;
    }>;
  }

  // Update item priority
  static async updateItemPriority(id: string, priority: 'low' | 'medium' | 'high'): Promise<WishlistItem> {
    const response = await apiClient.put(`/wishlist/${id}/priority`, { priority });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update item priority');
    }
    return response.data as WishlistItem;
  }

  // Add tags to wishlist item
  static async addTagsToItem(id: string, tags: string[]): Promise<WishlistItem> {
    const response = await apiClient.post(`/wishlist/${id}/tags`, { tags });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add tags to wishlist item');
    }
    return response.data as WishlistItem;
  }

  // Remove tags from wishlist item
  static async removeTagsFromItem(id: string, tags: string[]): Promise<WishlistItem> {
    const response = await apiClient.delete(`/wishlist/${id}/tags`, { tags });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove tags from wishlist item');
    }
    return response.data as WishlistItem;
  }
}