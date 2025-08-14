/**
 * New Product Page
 * Create new products with MinIO file upload integration
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// Layout is handled by dashboard/layout.tsx
import { ProductForm } from '@/components/products/product-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();

  const handleSave = (product: any) => {
    // Navigate to product list or product detail page
    router.push('/dashboard/products');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product for your catalog</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>

      <ProductForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}