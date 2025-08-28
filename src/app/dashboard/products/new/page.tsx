/**
 * New Product Page - Simple and Fast Product Creation
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';

export default function NewProductPage() {
  const router = useRouter();

  const handleSave = () => {
    router.push('/dashboard/products');
  };

  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  return (
    <div className="container mx-auto py-6">
      <ProductForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}