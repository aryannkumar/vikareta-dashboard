'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CreateCampaignRequest, CreateAdRequest, AdTargetingConfig } from '@/types';
import { useWalletStore } from '@/lib/stores/wallet';
import { formatCurrency } from '@/lib/utils';

interface CampaignFormProps {
  initialData?: Partial<CreateCampaignRequest>;
  onSubmit: (data: CreateCampaignRequest) => void;
  onSaveDraft?: (data: CreateCampaignRequest) => void;
  loading?: boolean;
}

export function CampaignForm({ 
  initialData, 
  onSubmit, 
  onSaveDraft, 
  loading = false 
}: CampaignFormProps) {
  const { balance, fetchBalance } = useWalletStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [ads, setAds] = useState<CreateAdRequest[]>(initialData?.ads || []);
  const [targetingConfig, setTargetingConfig] = useState<AdTargetingConfig>(
    initialData?.targetingConfig || {
      demographics: { ageRange: [18, 65] as [number, number], gender: 'all', interests: [] },
      location: { countries: [], states: [], cities: [] },
      behavior: { deviceTypes: ['desktop', 'mobile'], platforms: ['web', 'mobile'] },
    }
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCampaignRequest>({
    defaultValues: initialData,
  });

  const watchedBudget = watch('budget');
  const watchedDailyBudget = watch('dailyBudget');

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const addAd = () => {
    const newAd: CreateAdRequest = {
      title: '',
      description: '',
      adType: 'banner',
      adFormat: 'image',
      content: { images: [] },
      callToAction: 'Learn More',
      destinationUrl: '',
      priority: 1,
    };
    setAds([...ads, newAd]);
  };

  const removeAd = (index: number) => {
    setAds(ads.filter((_, i) => i !== index));
  };

  const updateAd = (index: number, updatedAd: CreateAdRequest) => {
    const updatedAds = [...ads];
    updatedAds[index] = updatedAd;
    setAds(updatedAds);
  };

  const handleFormSubmit = (data: CreateCampaignRequest) => {
    const formData = {
      ...data,
      targetingConfig,
      ads,
    };
    onSubmit(formData);
  };

  const handleSaveDraft = () => {
    const formData = {
      ...watch(),
      targetingConfig,
      ads,
    };
    onSaveDraft?.(formData);
  };

  const steps = [
    { id: 1, title: 'Campaign Details', description: 'Basic campaign information' },
    { id: 2, title: 'Budget & Bidding', description: 'Set your budget and bidding strategy' },
    { id: 3, title: 'Targeting', description: 'Define your target audience' },
    { id: 4, title: 'Advertisements', description: 'Create your ad creatives' },
    { id: 5, title: 'Review', description: 'Review and launch your campaign' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Campaign Name *
              </label>
              <Input
                {...register('name')}
                placeholder="Enter campaign name"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Describe your campaign objectives"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Campaign Type *
              </label>
              <Select {...register('campaignType')}>
                <option value="product">Product Promotion</option>
                <option value="service">Service Promotion</option>
                <option value="brand">Brand Awareness</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  {...register('startDate')}
                  min={new Date().toISOString().split('T')[0]}
                  error={errors.startDate?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date (Optional)
                </label>
                <Input
                  type="date"
                  {...register('endDate')}
                  min={watch('startDate')}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-ad-blue/10 border border-ad-blue/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Wallet Balance</h3>
                  <p className="text-sm text-muted-foreground">Available for advertising</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-ad-blue">
                    {formatCurrency(balance?.availableBalance || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Locked: {formatCurrency(balance?.lockedBalance || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Total Budget * (Minimum ₹100)
              </label>
              <Input
                type="number"
                {...register('budget', { valueAsNumber: true })}
                placeholder="Enter total budget"
                error={errors.budget?.message}
              />
              {watchedBudget > (balance?.availableBalance || 0) && (
                <p className="text-sm text-destructive mt-1">
                  Insufficient wallet balance. Please add money to your wallet.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Daily Budget (Optional)
              </label>
              <Input
                type="number"
                {...register('dailyBudget', { valueAsNumber: true })}
                placeholder="Enter daily budget limit"
              />
              {watchedDailyBudget && watchedBudget && watchedDailyBudget > watchedBudget && (
                <p className="text-sm text-destructive mt-1">
                  Daily budget cannot exceed total budget
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bidding Strategy *
              </label>
              <Select {...register('biddingStrategy')}>
                <option value="cpc">Cost Per Click (CPC)</option>
                <option value="cpm">Cost Per Thousand Impressions (CPM)</option>
                <option value="cpa">Cost Per Acquisition (CPA)</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bid Amount * (Minimum ₹0.10)
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('bidAmount', { valueAsNumber: true })}
                placeholder="Enter bid amount"
                error={errors.bidAmount?.message}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recommended bid range: ₹0.50 - ₹5.00 for better performance
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Age Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={targetingConfig.demographics?.ageRange?.[0] || 18}
                      onChange={(e) => setTargetingConfig({
                        ...targetingConfig,
                        demographics: {
                          ...targetingConfig.demographics,
                          ageRange: [parseInt(e.target.value), targetingConfig.demographics?.ageRange?.[1] || 65]
                        }
                      })}
                      min="13"
                      max="100"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      value={targetingConfig.demographics?.ageRange?.[1] || 65}
                      onChange={(e) => setTargetingConfig({
                        ...targetingConfig,
                        demographics: {
                          ...targetingConfig.demographics,
                          ageRange: [targetingConfig.demographics?.ageRange?.[0] || 18, parseInt(e.target.value)]
                        }
                      })}
                      min="13"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Gender
                  </label>
                  <Select
                    value={targetingConfig.demographics?.gender || 'all'}
                    onValueChange={(value) => setTargetingConfig({
                      ...targetingConfig,
                      demographics: {
                        ...targetingConfig.demographics,
                        gender: value as 'male' | 'female' | 'all'
                      }
                    })}
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Device & Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Device Types
                  </label>
                  <div className="space-y-2">
                    {['desktop', 'mobile', 'tablet'].map((device) => (
                      <label key={device} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={targetingConfig.behavior?.deviceTypes?.includes(device)}
                          onChange={(e) => {
                            const devices = targetingConfig.behavior?.deviceTypes || [];
                            const updatedDevices = e.target.checked
                              ? [...devices, device]
                              : devices.filter(d => d !== device);
                            setTargetingConfig({
                              ...targetingConfig,
                              behavior: {
                                ...targetingConfig.behavior,
                                deviceTypes: updatedDevices
                              }
                            });
                          }}
                          className="mr-2"
                        />
                        <span className="capitalize">{device}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Platforms
                  </label>
                  <div className="space-y-2">
                    {['web', 'mobile', 'dashboard'].map((platform) => (
                      <label key={platform} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={targetingConfig.behavior?.platforms?.includes(platform)}
                          onChange={(e) => {
                            const platforms = targetingConfig.behavior?.platforms || [];
                            const updatedPlatforms = e.target.checked
                              ? [...platforms, platform]
                              : platforms.filter(p => p !== platform);
                            setTargetingConfig({
                              ...targetingConfig,
                              behavior: {
                                ...targetingConfig.behavior,
                                platforms: updatedPlatforms
                              }
                            });
                          }}
                          className="mr-2"
                        />
                        <span className="capitalize">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Advertisement Creatives</h3>
              <Button
                type="button"
                onClick={addAd}
                className="bg-ad-orange hover:bg-ad-orange/90 text-ad-orange-foreground"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Advertisement
              </Button>
            </div>

            {ads.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No advertisements created yet</p>
                <Button
                  type="button"
                  onClick={addAd}
                  className="mt-4 bg-ad-orange hover:bg-ad-orange/90 text-ad-orange-foreground"
                >
                  Create Your First Ad
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {ads.map((ad, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-foreground">Advertisement {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAd(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Ad Title
                        </label>
                        <Input
                          value={ad.title}
                          onChange={(e) => updateAd(index, { ...ad, title: e.target.value })}
                          placeholder="Enter ad title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Call to Action
                        </label>
                        <Select
                          value={ad.callToAction}
                          onValueChange={(value) => updateAd(index, { ...ad, callToAction: value })}
                        >
                          <option value="Learn More">Learn More</option>
                          <option value="Shop Now">Shop Now</option>
                          <option value="Get Quote">Get Quote</option>
                          <option value="Contact Us">Contact Us</option>
                          <option value="Sign Up">Sign Up</option>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Description
                        </label>
                        <textarea
                          value={ad.description}
                          onChange={(e) => updateAd(index, { ...ad, description: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={2}
                          placeholder="Enter ad description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Ad Type
                        </label>
                        <Select
                          value={ad.adType}
                          onValueChange={(value) => updateAd(index, { 
                            ...ad, 
                            adType: value as 'banner' | 'native' | 'video' | 'carousel' 
                          })}
                        >
                          <option value="banner">Banner</option>
                          <option value="native">Native</option>
                          <option value="video">Video</option>
                          <option value="carousel">Carousel</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Destination URL
                        </label>
                        <Input
                          value={ad.destinationUrl}
                          onChange={(e) => updateAd(index, { ...ad, destinationUrl: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground">Campaign Review</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-medium text-foreground mb-3">Campaign Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{watch('name')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{watch('campaignType')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{watch('startDate')}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-foreground mb-3">Budget & Bidding</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Budget:</span>
                    <span className="font-medium text-ad-orange">
                      {formatCurrency(watch('budget'))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bidding Strategy:</span>
                    <span className="uppercase">{watch('biddingStrategy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bid Amount:</span>
                    <span>{formatCurrency(watch('bidAmount'))}</span>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h4 className="font-medium text-foreground mb-3">Advertisements ({ads.length})</h4>
              <div className="space-y-2">
                {ads.map((ad, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <span className="font-medium">{ad.title || `Ad ${index + 1}`}</span>
                      <span className="text-sm text-muted-foreground ml-2">({ad.adType})</span>
                    </div>
                    <span className="text-sm text-ad-orange">{ad.callToAction}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-ad-orange text-ad-orange-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-ad-orange' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </div>

        {renderStepContent()}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
          )}
          {onSaveDraft && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save Draft
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-ad-orange hover:bg-ad-orange/90 text-ad-orange-foreground"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading || ads.length === 0}
              className="bg-ad-orange hover:bg-ad-orange/90 text-ad-orange-foreground"
            >
              {loading ? 'Creating Campaign...' : 'Launch Campaign'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}