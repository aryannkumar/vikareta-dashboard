/**
 * New Product Page
 * Create new products with MinIO file upload integration
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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
    <DashboardLayout
      title="Add New Product"
      description="Create a new product for your catalog"
      actions={
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      }
    >
      <ProductForm onSave={handleSave} onCancel={handleCancel} />
    </DashboardLayout>
  );
}