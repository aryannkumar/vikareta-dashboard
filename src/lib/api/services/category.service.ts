import { apiClient } from '../client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  level: number;
  image?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  metadata?: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  productCount?: number;
  businessCount?: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
  image?: File;
  icon?: string;
  color?: string;
  sortOrder?: number;
  metadata?: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentId?: string;
  image?: File;
  icon?: string;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
  metadata?: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

export interface CategoryFilter {
  parentId?: string;
  level?: number;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  level: number;
  children: CategoryTree[];
  productCount?: number;
  businessCount?: number;
}

export class CategoryService {
  // Get categories with filtering
  static async getCategories(filters: CategoryFilter = {}): Promise<{ categories: Category[]; total: number; }> {
    const response = await apiClient.get('/categories', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch categories');
    }
    return response.data as { categories: Category[]; total: number; };
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get(`/categories/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch category');
    }
    return response.data as Category;
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch category');
    }
    return response.data as Category;
  }

  // Create category
  static async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    const formData = new FormData();

    formData.append('name', categoryData.name);
    if (categoryData.description) {
      formData.append('description', categoryData.description);
    }
    if (categoryData.parentId) {
      formData.append('parentId', categoryData.parentId);
    }
    if (categoryData.image) {
      formData.append('image', categoryData.image);
    }
    if (categoryData.icon) {
      formData.append('icon', categoryData.icon);
    }
    if (categoryData.color) {
      formData.append('color', categoryData.color);
    }
    if (categoryData.sortOrder !== undefined) {
      formData.append('sortOrder', categoryData.sortOrder.toString());
    }
    if (categoryData.metadata) {
      formData.append('metadata', JSON.stringify(categoryData.metadata));
    }
    if (categoryData.seoTitle) {
      formData.append('seoTitle', categoryData.seoTitle);
    }
    if (categoryData.seoDescription) {
      formData.append('seoDescription', categoryData.seoDescription);
    }
    if (categoryData.keywords) {
      formData.append('keywords', JSON.stringify(categoryData.keywords));
    }

    const response = await apiClient.post('/categories', formData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create category');
    }
    return response.data as Category;
  }

  // Update category
  static async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<Category> {
    const formData = new FormData();

    if (categoryData.name) {
      formData.append('name', categoryData.name);
    }
    if (categoryData.description) {
      formData.append('description', categoryData.description);
    }
    if (categoryData.parentId !== undefined) {
      formData.append('parentId', categoryData.parentId || '');
    }
    if (categoryData.image) {
      formData.append('image', categoryData.image);
    }
    if (categoryData.icon) {
      formData.append('icon', categoryData.icon);
    }
    if (categoryData.color) {
      formData.append('color', categoryData.color);
    }
    if (categoryData.isActive !== undefined) {
      formData.append('isActive', categoryData.isActive.toString());
    }
    if (categoryData.sortOrder !== undefined) {
      formData.append('sortOrder', categoryData.sortOrder.toString());
    }
    if (categoryData.metadata) {
      formData.append('metadata', JSON.stringify(categoryData.metadata));
    }
    if (categoryData.seoTitle) {
      formData.append('seoTitle', categoryData.seoTitle);
    }
    if (categoryData.seoDescription) {
      formData.append('seoDescription', categoryData.seoDescription);
    }
    if (categoryData.keywords) {
      formData.append('keywords', JSON.stringify(categoryData.keywords));
    }

    const response = await apiClient.put(`/categories/${id}`, formData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update category');
    }
    return response.data as Category;
  }

  // Delete category
  static async deleteCategory(id: string): Promise<void> {
    const response = await apiClient.delete(`/categories/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete category');
    }
  }

  // Get category tree
  static async getCategoryTree(parentId?: string): Promise<CategoryTree[]> {
    const response = await apiClient.get('/categories/tree', { parentId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch category tree');
    }
    return response.data as CategoryTree[];
  }

  // Get root categories
  static async getRootCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories/root');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch root categories');
    }
    return response.data as Category[];
  }

  // Get child categories
  static async getChildCategories(parentId: string): Promise<Category[]> {
    const response = await apiClient.get(`/categories/${parentId}/children`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch child categories');
    }
    return response.data as Category[];
  }

  // Move category
  static async moveCategory(id: string, newParentId?: string, sortOrder?: number): Promise<Category> {
    const response = await apiClient.post(`/categories/${id}/move`, { newParentId, sortOrder });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to move category');
    }
    return response.data as Category;
  }

  // Bulk update categories
  static async bulkUpdateCategories(updates: Array<{ id: string; data: UpdateCategoryData; }>): Promise<{ updated: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.put('/categories/bulk', { updates });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk update categories');
    }
    return response.data as { updated: number; failed: number; errors?: string[]; };
  }

  // Bulk delete categories
  static async bulkDeleteCategories(categoryIds: string[]): Promise<{ deleted: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/categories/bulk-delete', { categoryIds });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk delete categories');
    }
    return response.data as { deleted: number; failed: number; errors?: string[]; };
  }

  // Get category statistics
  static async getCategoryStatistics(categoryId?: string): Promise<{
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    categoriesByLevel: Record<string, number>;
    topCategories: Array<{ id: string; name: string; productCount: number; businessCount: number; }>;
    categoryHierarchy: CategoryTree[];
  }> {
    const response = await apiClient.get('/categories/statistics', { categoryId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch category statistics');
    }
    return response.data as {
      totalCategories: number;
      activeCategories: number;
      inactiveCategories: number;
      categoriesByLevel: Record<string, number>;
      topCategories: Array<{ id: string; name: string; productCount: number; businessCount: number; }>;
      categoryHierarchy: CategoryTree[];
    };
  }

  // Export categories
  static async exportCategories(filters: CategoryFilter = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/categories/export', { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export categories');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Import categories
  static async importCategories(file: File): Promise<{ imported: number; failed: number; errors?: string[]; }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/categories/import', formData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to import categories');
    }
    return response.data as { imported: number; failed: number; errors?: string[]; };
  }

  // Search categories
  static async searchCategories(query: string, filters: CategoryFilter = {}): Promise<{ categories: Category[]; total: number; }> {
    const response = await apiClient.get('/categories/search', { query, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to search categories');
    }
    return response.data as { categories: Category[]; total: number; };
  }

  // Get category path
  static async getCategoryPath(categoryId: string): Promise<Category[]> {
    const response = await apiClient.get(`/categories/${categoryId}/path`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch category path');
    }
    return response.data as Category[];
  }

  // Duplicate category
  static async duplicateCategory(id: string, name?: string): Promise<Category> {
    const response = await apiClient.post(`/categories/${id}/duplicate`, { name });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to duplicate category');
    }
    return response.data as Category;
  }

  // Get category suggestions
  static async getCategorySuggestions(query: string, limit: number = 10): Promise<Array<{ id: string; name: string; slug: string; level: number; }>> {
    const response = await apiClient.get('/categories/suggestions', { query, limit });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch category suggestions');
    }
    return response.data as Array<{ id: string; name: string; slug: string; level: number; }>;
  }

  // Update category sort order
  static async updateCategorySortOrder(categoryIds: string[]): Promise<{ success: boolean; }> {
    const response = await apiClient.put('/categories/sort-order', { categoryIds });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update category sort order');
    }
    return response.data as { success: boolean; };
  }

  // Get categories with product counts
  static async getCategoriesWithCounts(filters: CategoryFilter = {}): Promise<{ categories: Category[]; total: number; }> {
    const response = await apiClient.get('/categories/with-counts', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch categories with counts');
    }
    return response.data as { categories: Category[]; total: number; };
  }
}