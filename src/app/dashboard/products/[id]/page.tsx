'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, Edit, Trash2, Package, 
  Eye, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { useApi } from '@/lib/hooks/use-api';
import { Product } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiClient, ApiResponse } from '@/lib/api/client';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const {
    data: product,
    isLoading,
    error,
    execute: fetchProduct,
  } = useApi<Product>();

  const {
    data: analytics,
    isLoading: analyticsLoading,
    execute: fetchAnalytics,
  } = useApi();

  useEffect(() => {
    fetchProduct(() => apiClient.getProduct(productId) as Promise<ApiResponse<Product>>);
    fetchAnalytics(() => apiClient.get(`/products/${productId}/analytics`));
  }, [productId, fetchProduct, fetchAnalytics]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await apiClient.deleteProduct(productId);
        router.push('/dashboard/products');
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleStatusToggle = async () => {
    if (!product) return;
    
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await apiClient.updateProduct(productId, { status: newStatus });
      fetchProduct(() => apiClient.getProduct(productId));
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-8">
              {error || 'The product you are looking for does not exist.'}
            </p>
            <Button onClick={() => router.push('/dashboard/products')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = product.isService ? 'N/A' : 
    product.stockQuantity === 0 ? 'Out of Stock' :
    product.stockQuantity <= 10 ? 'Low Stock' : 'In Stock';

  const stockColor = product.isService ? 'text-gray-500' :
    product.stockQuantity === 0 ? 'text-red-500' :
    product.stockQuantity <= 10 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/products')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <p className="text-muted-foreground">
                Product ID: {product.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleStatusToggle}
            >
              {product.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/products/${productId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                {product.media && product.media.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.media.map((media) => (
                      <div key={media.id} className="relative aspect-square">
                        <Image
                          src={media.url}
                          alt={media.altText || product.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No images available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {product.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{variant.name}: {variant.value}</div>
                          <div className="text-sm text-gray-500">
                            Stock: {variant.stockQuantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {variant.priceAdjustment >= 0 ? '+' : ''}
                            {formatCurrency(variant.priceAdjustment)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    <StatusBadge status={product.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Type:</span>
                    <Badge variant="outline">
                      {product.isService ? 'Service' : 'Product'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Stock:</span>
                    <span className={`text-sm font-medium ${stockColor}`}>
                      {stockStatus}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      per {product.isService ? 'service' : 'unit'}
                    </div>
                  </div>
                  
                  {!product.isService && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Stock Quantity:</span>
                        <span className="font-medium">{product.stockQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Min Order:</span>
                        <span className="font-medium">{product.minOrderQuantity}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loading size="sm" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Views</span>
                      </div>
                      <span className="font-medium">{analytics.views || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Orders</span>
                      </div>
                      <span className="font-medium">{analytics.orders || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <span className="font-medium">
                        {analytics.rating ? `${analytics.rating}/5` : 'No ratings'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No analytics data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Created:</span>
                    <span className="text-sm font-medium">
                      {formatDate(product.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Updated:</span>
                    <span className="text-sm font-medium">
                      {formatDate(product.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Currency:</span>
                    <span className="text-sm font-medium">{product.currency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}