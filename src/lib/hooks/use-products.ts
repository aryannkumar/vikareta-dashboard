'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Product } from '@/types';

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

interface ProductSubcategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
}

export interface UseProductsOptions {
  autoLoad?: boolean;
  limit?: number;
  category?: string;
  subcategory?: string;
  search?: string;
  status?: string;
}

export interface UseProductsReturn {
  products: Product[];
  categories: ProductCategory[];
  subcategories: ProductSubcategory[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    totalPages: number;
  };
  loadProducts: (params?: any) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadSubcategories: (categoryId?: string) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { 
    autoLoad = true, 
    limit = 10, 
    category, 
    subcategory, 
    search, 
    status 
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: limit,
    totalPages: 0
  });

  const loadProducts = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        category,
        subcategory,
        search,
        status,
        ...params
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      // Mock products data
      const mockProducts: Product[] = [
        {
          id: '1',
          sellerId: 'seller1',
          title: 'Industrial Pump Model X1',
          description: 'High-efficiency industrial pump for heavy-duty applications',
          categoryId: 'cat1',
          subcategoryId: 'subcat1',
          price: 15000,
          currency: 'INR',
          stockQuantity: 25,
          minOrderQuantity: 1,
          isService: false,
          status: 'active',
          media: [],
          variants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          sellerId: 'seller1',
          title: 'Office Chair Premium',
          description: 'Ergonomic office chair with lumbar support',
          categoryId: 'cat2',
          subcategoryId: 'subcat2',
          price: 8500,
          currency: 'INR',
          stockQuantity: 50,
          minOrderQuantity: 5,
          isService: false,
          status: 'active',
          media: [],
          variants: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      
      setProducts(mockProducts);
      setPagination(prev => ({
        ...prev,
        total: mockProducts.length,
        totalPages: Math.ceil(mockProducts.length / prev.pageSize)
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, category, subcategory, search, status]);

  const loadCategories = useCallback(async () => {
    try {
      // Mock categories data
      const mockCategories: ProductCategory[] = [
        { id: 'cat1', name: 'Industrial Equipment', description: 'Heavy machinery and industrial equipment' },
        { id: 'cat2', name: 'Office Supplies', description: 'Office furniture and supplies' },
        { id: 'cat3', name: 'Electronics', description: 'Electronic devices and components' },
      ];
      
      setCategories(mockCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  const loadSubcategories = useCallback(async (categoryId?: string) => {
    try {
      // Mock subcategories data
      const mockSubcategories: ProductSubcategory[] = [
        { id: 'subcat1', categoryId: 'cat1', name: 'Pumps', description: 'Industrial pumps and accessories' },
        { id: 'subcat2', categoryId: 'cat2', name: 'Chairs', description: 'Office chairs and seating' },
        { id: 'subcat3', categoryId: 'cat3', name: 'Computers', description: 'Desktop and laptop computers' },
      ];
      
      const filteredSubcategories = categoryId 
        ? mockSubcategories.filter(sub => sub.categoryId === categoryId)
        : mockSubcategories;
      
      setSubcategories(filteredSubcategories);
    } catch (err) {
      console.error('Error loading subcategories:', err);
    }
  }, []);

  const createProduct = useCallback(async (productData: Partial<Product>): Promise<Product | null> => {
    try {
      setLoading(true);
      
      // Mock create product
      const newProduct: Product = {
        id: Date.now().toString(),
        sellerId: 'seller1',
        title: productData.title || 'New Product',
        description: productData.description || 'Product description',
        categoryId: productData.categoryId || 'cat1',
        subcategoryId: productData.subcategoryId || 'subcat1',
        price: productData.price || 0,
        currency: 'INR',
        stockQuantity: productData.stockQuantity || 0,
        minOrderQuantity: productData.minOrderQuantity || 1,
        isService: productData.isService || false,
        status: 'active',
        media: [],
        variants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await loadProducts(); // Refresh the list
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      console.error('Error creating product:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>): Promise<Product | null> => {
    try {
      setLoading(true);
      
      // Mock update product
      const updatedProduct: Product = {
        id,
        sellerId: 'seller1',
        title: productData.title || 'Updated Product',
        description: productData.description || 'Updated description',
        categoryId: productData.categoryId || 'cat1',
        subcategoryId: productData.subcategoryId || 'subcat1',
        price: productData.price || 0,
        currency: 'INR',
        stockQuantity: productData.stockQuantity || 0,
        minOrderQuantity: productData.minOrderQuantity || 1,
        isService: productData.isService || false,
        status: 'active',
        media: [],
        variants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await loadProducts(); // Refresh the list
      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      console.error('Error updating product:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`/products/${id}`);
      if (response.success) {
        await loadProducts(); // Refresh the list
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to delete product');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      console.error('Error deleting product:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  const refresh = useCallback(() => loadProducts(), [loadProducts]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, current: 1 }));
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadProducts();
      loadCategories();
    }
  }, [autoLoad, loadProducts, loadCategories]);

  return {
    products,
    categories,
    subcategories,
    loading,
    error,
    pagination,
    loadProducts,
    loadCategories,
    loadSubcategories,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh,
    setPage,
    setPageSize
  };
}