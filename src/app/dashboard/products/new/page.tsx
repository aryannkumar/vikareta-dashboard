'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import { Loading } from '@/components/ui/loading';
import { ProductFormData, ProductVariant } from '@/types';
import { apiClient } from '@/lib/api/client';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    price: 0,
    stockQuantity: 0,
    minOrderQuantity: 1,
    isService: false,
    media: [],
    variants: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isDocument = file.type === 'application/pdf';
      return isImage || isVideo || isDocument;
    });

    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...newFiles],
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: '',
          value: '',
          priceAdjustment: 0,
          stockQuantity: 0,
        },
      ],
    }));
  };

  const updateVariant = (index: number, field: keyof Omit<ProductVariant, 'id' | 'productId'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.isService && formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity cannot be negative';
    }

    if (formData.minOrderQuantity <= 0) {
      newErrors.minOrderQuantity = 'Minimum order quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // First, upload media files
      const mediaUrls: string[] = [];
      
      for (const file of formData.media) {
        // Create FormData for file upload
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        
        const uploadResponse = await apiClient.post('/products/media/upload', fileFormData);
        
        // Update progress (simplified)
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100,
        }));
        
        if (uploadResponse.success && uploadResponse.data) {
          mediaUrls.push(uploadResponse.data as string);
        }
      }

      // Create product data
      const productData = {
        ...formData,
        media: mediaUrls.map((url, index) => ({
          mediaType: formData.media[index].type.startsWith('image/') ? 'image' : 
                    formData.media[index].type.startsWith('video/') ? 'video' : 'document',
          url,
          altText: formData.title,
          sortOrder: index,
        })),
      };

      const response = await apiClient.createProduct(productData);
      
      if (response.success) {
        router.push('/dashboard/products');
      } else {
        throw new Error(response.error?.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create product' });
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product or service listing
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Product Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter product title"
                  error={errors.title}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.isService ? 'service' : 'product'}
                  onValueChange={(value) => handleInputChange('isService', value === 'service')}
                >
                  <option value="product">Physical Product</option>
                  <option value="service">Service</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description *</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your product or service"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                >
                  <option value="">Select Category</option>
                  {/* Categories would be loaded from API */}
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="services">Services</option>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Subcategory</label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => handleInputChange('subcategoryId', value)}
                >
                  <option value="">Select Subcategory</option>
                  {/* Subcategories would be loaded based on selected category */}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  error={errors.price}
                />
              </div>
              {!formData.isService && (
                <div>
                  <label className="text-sm font-medium">Stock Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    error={errors.stockQuantity}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Min Order Quantity *</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.minOrderQuantity}
                  onChange={(e) => handleInputChange('minOrderQuantity', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  error={errors.minOrderQuantity}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to select
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Select Files
              </Button>
            </div>

            {formData.media.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                {formData.media.map((file, index) => (
                  <div key={index} className="relative border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    {uploadProgress[file.name] && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {uploadProgress[file.name]}%
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Variants */}
        {!formData.isService && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Variants</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Variant {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="e.g., Size, Color"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Value</label>
                      <Input
                        value={variant.value}
                        onChange={(e) => updateVariant(index, 'value', e.target.value)}
                        placeholder="e.g., Large, Red"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price Adjustment (₹)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.priceAdjustment}
                        onChange={(e) => updateVariant(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stock</label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.variants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No variants added yet.</p>
                  <p className="text-sm">Add variants like size, color, or material options.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loading size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
        </div>

        {errors.submit && (
          <Card>
            <CardContent className="py-4">
              <div className="text-red-600">
                {errors.submit}
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}