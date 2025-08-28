/**
 * New Service Page - Simple and Fast Service Creation
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ServiceForm } from '@/components/services/service-form';

export default function NewServicePage() {
  const router = useRouter();

  const handleSave = () => {
    router.push('/dashboard/services');
  };

  const handleCancel = () => {
    router.push('/dashboard/services');
  };

  return (
    <div className="container mx-auto py-6">
      <ServiceForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}