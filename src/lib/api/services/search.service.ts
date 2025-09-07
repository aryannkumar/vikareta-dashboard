import { apiClient } from '../client';

export interface SearchResult {
  id: string;
  type: 'product' | 'order' | 'user' | 'business' | 'category' | 'deal' | 'coupon' | 'announcement' | 'rfq' | 'quote' | 'review' | 'shipment' | 'invoice' | 'payment' | 'cart' | 'wishlist';
  title: string;
  description?: string;
  metadata: Record<string, any>;
  score: number;
  highlights?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  types?: string[];
  businessId?: string;
  userId?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  location?: string;
  radius?: number;
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'price' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeHighlights?: boolean;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'product' | 'business';
  count?: number;
  score?: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  averageResults: number;
  noResultsQueries: number;
  topQueries: Array<{ query: string; count: number; }>;
  searchTrends: Array<{ date: string; searches: number; }>;
  popularCategories: Array<{ category: string; searches: number; }>;
}

export class SearchService {
  // Perform search
  static async search(searchQuery: SearchQuery): Promise<{ results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; }> {
    const response = await apiClient.post('/search', searchQuery);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform search');
    }
    return response.data as { results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; };
  }

  // Get search suggestions
  static async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const response = await apiClient.get('/search/suggestions', { query, limit });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch search suggestions');
    }
    return response.data as SearchSuggestion[];
  }

  // Get popular searches
  static async getPopularSearches(limit: number = 20, period: 'day' | 'week' | 'month' = 'week'): Promise<Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable'; }>> {
    const response = await apiClient.get('/search/popular', { limit, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch popular searches');
    }
    return response.data as Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable'; }>;
  }

  // Get search filters/options
  static async getSearchFilters(): Promise<{
    categories: Array<{ value: string; label: string; count: number; }>;
    types: Array<{ value: string; label: string; count: number; }>;
    statuses: Array<{ value: string; label: string; count: number; }>;
    priceRanges: Array<{ min: number; max: number; label: string; count: number; }>;
    locations: Array<{ value: string; label: string; count: number; }>;
  }> {
    const response = await apiClient.get('/search/filters');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch search filters');
    }
    return response.data as {
      categories: Array<{ value: string; label: string; count: number; }>;
      types: Array<{ value: string; label: string; count: number; }>;
      statuses: Array<{ value: string; label: string; count: number; }>;
      priceRanges: Array<{ min: number; max: number; label: string; count: number; }>;
      locations: Array<{ value: string; label: string; count: number; }>;
    };
  }

  // Advanced search
  static async advancedSearch(advancedQuery: {
    query?: string;
    filters: SearchFilters;
    sortBy?: 'relevance' | 'date' | 'price' | 'rating' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    includeHighlights?: boolean;
    facets?: string[];
  }): Promise<{ results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; aggregations?: Record<string, any>; }> {
    const response = await apiClient.post('/search/advanced', advancedQuery);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform advanced search');
    }
    return response.data as { results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; aggregations?: Record<string, any>; };
  }

  // Search by location
  static async searchByLocation(query: string, location: { lat: number; lng: number; radius?: number; }, filters?: SearchFilters): Promise<{ results: SearchResult[]; total: number; took: number; }> {
    const response = await apiClient.post('/search/location', { query, location, filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform location-based search');
    }
    return response.data as { results: SearchResult[]; total: number; took: number; };
  }

  // Search products
  static async searchProducts(query: SearchQuery): Promise<{ results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; }> {
    const response = await apiClient.post('/search/products', query);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to search products');
    }
    return response.data as { results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; };
  }

  // Search businesses
  static async searchBusinesses(query: SearchQuery): Promise<{ results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; }> {
    const response = await apiClient.post('/search/businesses', query);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to search businesses');
    }
    return response.data as { results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; };
  }

  // Search orders
  static async searchOrders(query: SearchQuery, businessId?: string): Promise<{ results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; }> {
    const response = await apiClient.post('/search/orders', { ...query, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to search orders');
    }
    return response.data as { results: SearchResult[]; total: number; took: number; facets?: Record<string, any>; };
  }

  // Get search analytics
  static async getSearchAnalytics(businessId?: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SearchAnalytics> {
    const response = await apiClient.get('/search/analytics', { businessId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch search analytics');
    }
    return response.data as SearchAnalytics;
  }

  // Log search query
  static async logSearchQuery(query: string, resultsCount: number, userId?: string, businessId?: string): Promise<void> {
    const response = await apiClient.post('/search/log', { query, resultsCount, userId, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to log search query');
    }
  }

  // Get search recommendations
  static async getSearchRecommendations(userId?: string, businessId?: string, limit: number = 10): Promise<Array<{ query: string; reason: string; score: number; }>> {
    const response = await apiClient.get('/search/recommendations', { userId, businessId, limit });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch search recommendations');
    }
    return response.data as Array<{ query: string; reason: string; score: number; }>;
  }

  // Autocomplete search
  static async autocomplete(query: string, types?: string[], limit: number = 10): Promise<Array<{ text: string; type: string; count?: number; }>> {
    const response = await apiClient.get('/search/autocomplete', { query, types: types?.join(','), limit });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch autocomplete suggestions');
    }
    return response.data as Array<{ text: string; type: string; count?: number; }>;
  }

  // Search with filters and aggregations
  static async searchWithAggregations(searchQuery: SearchQuery, aggregations: string[] = []): Promise<{
    results: SearchResult[];
    total: number;
    took: number;
    aggregations: Record<string, { buckets: Array<{ key: string; doc_count: number; }> }>;
  }> {
    const response = await apiClient.post('/search/aggregations', { ...searchQuery, aggregations });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform search with aggregations');
    }
    return response.data as {
      results: SearchResult[];
      total: number;
      took: number;
      aggregations: Record<string, { buckets: Array<{ key: string; doc_count: number; }> }>;
    };
  }

  // Export search results
  static async exportSearchResults(searchQuery: SearchQuery, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/search/export', { ...searchQuery, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export search results');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Get search history
  static async getSearchHistory(userId?: string, businessId?: string, limit: number = 50): Promise<Array<{ query: string; timestamp: string; resultsCount: number; }>> {
    const response = await apiClient.get('/search/history', { userId, businessId, limit });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch search history');
    }
    return response.data as Array<{ query: string; timestamp: string; resultsCount: number; }>;
  }

  // Clear search history
  static async clearSearchHistory(userId?: string, businessId?: string): Promise<{ cleared: number; }> {
    const response = await apiClient.delete('/search/history', { userId, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to clear search history');
    }
    return response.data as { cleared: number; };
  }

  // Reindex search data
  static async reindexSearchData(type?: string, businessId?: string): Promise<{ success: boolean; indexed: number; failed: number; duration: number; errors?: string[]; }> {
    const response = await apiClient.post('/search/reindex', { type, businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reindex search data');
    }
    return response.data as { success: boolean; indexed: number; failed: number; duration: number; errors?: string[]; };
  }
}