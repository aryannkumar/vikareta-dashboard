/**
 * Enhanced Product Form - Easy Product Creation with Image Upload
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Save, Loader2, Package, Search, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FileUpload } from '@/components/ui/file-upload';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface ProductData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  stockQuantity: number;
  minOrderQuantity: number;
  images: string[];
}

interface ProductFormProps {
  product?: any;
  onSave?: (product: any) => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [formData, setFormData] = useState<ProductData>({
    title: product?.title || '',
    description: product?.description || '',
    categoryId: product?.categoryId || '',
    subcategoryId: product?.subcategoryId || '',
    price: product?.price || 0,
    stockQuantity: product?.stockQuantity || 0,
    minOrderQuantity: product?.minOrderQuantity || 1,
    images: product?.images || [],
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Loading categories...');
        const response = await apiClient.getCategories();
        console.log('Categories API response:', response);

        if (response.success && response.data) {
          const categoriesData = Array.isArray(response.data) ? response.data : (response.data as any).categories || [];
          console.log('Categories data:', categoriesData);
          setCategories(categoriesData);
          
          if (categoriesData.length === 0) {
            toast({
              title: 'No Categories',
              description: 'No categories found. Please contact support.',
              variant: 'destructive',
            });
          }
        } else {
          console.warn('Categories API failed:', response);
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to load categories. Please refresh the page.',
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
    if (formData.categoryId) {
      const loadSubcategories = async () => {
        try {
          console.log('Loading subcategories for category:', formData.categoryId);
          const response = await apiClient.getSubcategoriesByCategory(formData.categoryId);
          console.log('Subcategories API response:', response);

          if (response.success && response.data) {
            const subcategoriesData = Array.isArray(response.data) ? response.data : (response.data as any).subcategories || [];
            console.log('Subcategories data:', subcategoriesData);
            setSubcategories(subcategoriesData);
          } else {
            console.warn('No subcategories found for category:', formData.categoryId);
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
      // Reset subcategory selection when category changes
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Filter subcategories based on search
  const filteredSubcategories = useMemo(() => {
    if (!subcategorySearch) return subcategories;
    return subcategories.filter(subcategory =>
      subcategory.name.toLowerCase().includes(subcategorySearch.toLowerCase())
    );
  }, [subcategories, subcategorySearch]);

  // Get selected category and subcategory names
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
  const selectedSubcategory = subcategories.find(sub => sub.id === formData.subcategoryId);

  // Handle image uploads
  const handleImagesUploaded = (uploadedFiles: any[]) => {
    const imageUrls = uploadedFiles.map(file => file.url).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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

      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        price: Number(formData.price),
        currency: 'INR',
        stockQuantity: Number(formData.stockQuantity),
        minOrderQuantity: Number(formData.minOrderQuantity),
        images: formData.images,
        isService: false,
      };

      console.log('Submitting product payload:', payload);

      const response = product
        ? await apiClient.updateProduct(product.id, payload)
        : await apiClient.createProduct(payload);

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

            {/* Category & Subcategory with Search */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between"
                    >
                      {selectedCategory ? selectedCategory.name : "Select category..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search categories..."
                        value={categorySearch}
                        onValueChange={setCategorySearch}
                      />
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.id}
                            onSelect={() => {
                              setFormData(prev => ({
                                ...prev,
                                categoryId: category.id,
                                subcategoryId: ''
                              }));
                              setCategoryOpen(false);
                              setCategorySearch('');
                            }}
                          >
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                <Popover open={subcategoryOpen} onOpenChange={setSubcategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={subcategoryOpen}
                      className="w-full justify-between"
                      disabled={!formData.categoryId || subcategories.length === 0}
                    >
                      {selectedSubcategory ? selectedSubcategory.name : "Select subcategory..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search subcategories..."
                        value={subcategorySearch}
                        onValueChange={setSubcategorySearch}
                      />
                      <CommandEmpty>No subcategory found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredSubcategories.map((subcategory) => (
                          <CommandItem
                            key={subcategory.id}
                            value={subcategory.id}
                            onSelect={() => {
                              setFormData(prev => ({
                                ...prev,
                                subcategoryId: subcategory.id
                              }));
                              setSubcategoryOpen(false);
                              setSubcategorySearch('');
                            }}
                          >
                            {subcategory.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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

            {/* Product Images */}
            <div className="space-y-4">
              <Label>Product Images</Label>

              {/* Current Images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Upload */}
              <FileUpload
                onFilesUploaded={handleImagesUploaded}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxFiles={10}
                folder="products"
                resize={{ width: 800, height: 600, quality: 0.8 }}
                generateThumbnail={true}
              />
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