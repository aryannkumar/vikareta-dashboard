'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CampaignForm } from '@/components/advertisements/campaign-form';
import { useAdvertisementStore } from '@/lib/stores/advertisement';
import { CreateCampaignRequest } from '@/types';

export default function NewCampaignPage() {
  const router = useRouter();
  const { createCampaign, loading } = useAdvertisementStore();
  const [formData] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
    campaignType: 'product',
    budget: 0,
    dailyBudget: 0,
    bidAmount: 0,
    biddingStrategy: 'cpc',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetingConfig: {
      demographics: {
        ageRange: [18, 65],
        gender: 'all',
        interests: [],
      },
      location: {
        countries: [],
        states: [],
        cities: [],
      },
      behavior: {
        deviceTypes: ['desktop', 'mobile', 'tablet'],
        platforms: ['web', 'mobile'],
        timeOfDay: [],
        dayOfWeek: [],
      },
    },
    ads: [],
  });

  const handleSubmit = async (data: CreateCampaignRequest) => {
    try {
      const campaign = await createCampaign(data);
      router.push(`/dashboard/advertisements/${campaign.id}`);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleSaveDraft = async (data: CreateCampaignRequest) => {
    try {
      // Save as draft - this would be a separate API call
      console.log('Saving draft:', data);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Advertisement Campaign</h1>
          <p className="text-muted-foreground">
            Set up your campaign to start promoting your products and services
          </p>
        </div>
      </div>

      {/* Campaign Form */}
      <Card className="p-6">
        <CampaignForm
          initialData={formData}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          loading={loading}
        />
      </Card>
    </div>
  );
}