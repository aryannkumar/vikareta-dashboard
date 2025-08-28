/**
 * Edit Service Page - Simple Service Editing
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ServiceForm } from '@/components/services/service-form';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        const response = await apiClient.get(`/services/${params.id}`);
        if (response.success) {
          setService(response.data);
        } else {
          toast({
            title: 'Error',
            description: 'Service not found',
            variant: 'destructive',
          });
          router.push('/dashboard/services');
        }
      } catch (error) {
        console.error('Failed to load service:', error);
        toast({
          title: 'Error',
          description: 'Failed to load service',
          variant: 'destructive',
        });
        router.push('/dashboard/services');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadService();
    }
  }, [params.id, router]);

  const handleSave = () => {
    router.push('/dashboard/services');
  };

  const handleCancel = () => {
    router.push('/dashboard/services');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading service...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ServiceForm 
        service={service} 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    </div>
  );
}