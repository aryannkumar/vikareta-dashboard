/**
 * Edit Product Page - Simple Product Editing
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${params.id}`);
        if (response.success) {
          setProduct(response.data);
        } else {
          toast({
            title: 'Error',
            description: 'Product not found',
            variant: 'destructive',
          });
          router.push('/dashboard/products');
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product',
          variant: 'destructive',
        });
        router.push('/dashboard/products');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id, router]);

  const handleSave = () => {
    router.push('/dashboard/products');
  };

  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ProductForm 
        product={product} 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    </div>
  );
}