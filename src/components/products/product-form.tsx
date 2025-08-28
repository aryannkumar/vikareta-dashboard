/**
 * Simple Product Form - Easy and Fast Product Creation
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface ProductData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  stockQuantity: number;
  minOrderQuantity: number;
}

interface ProductFormProps {
  product?: any;
  onSave?: (product: any) => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<ProductData>({
    title: product?.title || '',
    description: product?.description || '',
    categoryId: product?.categoryId || '',
    subcategoryId: product?.subcategoryId || '',
    price: product?.price || 0,
    stockQuantity: product?.stockQuantity || 0,
    minOrderQuantity: product?.minOrderQuantity || 1,
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        console.log('Categories API response:', response);
        
        if (response.success && Array.isArray(response.data)) {
          // Validate that categories have valid ID format
          const validCategories = response.data.filter(cat => 
            cat.id && typeof cat.id === 'string' && isValidId(cat.id)
          );
          
          if (validCategories.length > 0) {
            setCategories(validCategories);
          } else {
            console.warn('No valid categories found');
            toast({
              title: 'Warning',
              description: 'Categories are not properly configured. Please contact support.',
              variant: 'destructive',
            });
          }
        } else if (response.success && response.data && typeof response.data === 'object' && 'categories' in response.data) {
          setCategories((response.data as any).categories);
        } else {
          console.warn('Categories API failed, no data returned');
          toast({
            title: 'Error',
            description: 'Failed to load categories. Please refresh the page.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories. Please check your connection.',
          variant: 'destructive',
        });
      }
    };
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.categoryId && isValidId(formData.categoryId)) {
      const loadSubcategories = async () => {
        try {
          const response = await apiClient.get(`/subcategories/category/${formData.categoryId}`);
          console.log('Subcategories API response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            // Validate subcategories have valid ID format
            const validSubcategories = response.data.filter(sub => 
              sub.id && typeof sub.id === 'string' && isValidId(sub.id)
            );
            setSubcategories(validSubcategories);
          } else if (response.success && response.data && typeof response.data === 'object' && 'subcategories' in response.data) {
            setSubcategories((response.data as any).subcategories);
          } else {
            setSubcategories([]);
          }
        } catch (error) {
          console.error('Failed to load subcategories:', error);
          setSubcategories([]);
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId]);

  const isValidId = (str: string) => {
    // Accept UUID, CUID, and string slug formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const cuidRegex = /^c[a-z0-9]{24}$/i; // CUID format: c + 24 alphanumeric chars
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i; // String slug format: letters, numbers, hyphens
    return uuidRegex.test(str) || cuidRegex.test(str) || slugRegex.test(str);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.categoryId) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      // Validate ID format for categoryId
      if (!isValidId(formData.categoryId)) {
        toast({
          title: 'Invalid Category',
          description: 'Please select a valid category from the dropdown',
          variant: 'destructive',
        });
        return;
      }

      // Validate ID format for subcategoryId if provided
      if (formData.subcategoryId && !isValidId(formData.subcategoryId)) {
        toast({
          title: 'Invalid Subcategory',
          description: 'Please select a valid subcategory from the dropdown',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        price: Number(formData.price),
        currency: 'INR',
        stockQuantity: Number(formData.stockQuantity),
        minOrderQuantity: Number(formData.minOrderQuantity),
        isService: false,
      };

      console.log('Submitting product payload:', payload);

      const response = product
        ? await apiClient.put(`/products/${product.id}`, payload)
        : await apiClient.post('/products', payload);

      if (response.success) {
        toast({
          title: 'Success! 🎉',
          description: `Product ${product ? 'updated' : 'created'} successfully`,
        });
        onSave?.(response.data);
      } else {
        const errorMsg = response.error?.message || response.error?.details?.[0]?.msg || 'Failed to save product';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Product save error:', error);
      let errorMessage = 'Failed to save product';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            {product ? 'Edit Product' : 'Create New Product'}
          </CardTitle>
          <CardDescription>
            Fill in the basic details to create your product quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="Enter product title (e.g., iPhone 15 Pro, Samsung TV, Dell Laptop)"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your product (e.g., Latest iPhone with advanced camera, 6.1-inch display, 128GB storage)"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value, subcategoryId: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                <Select
                  value={formData.subcategoryId || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoryId: value }))}
                >
                  <SelectTrigger disabled={!formData.categoryId || subcategories.length === 0}>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (INR) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            {/* Stock & Order Quantity */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrder">Min Order Quantity *</Label>
                <Input
                  id="minOrder"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.minOrderQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderQuantity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}