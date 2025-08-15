'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, 
  DollarSign, 
  Calendar, 
  Users, 
  Image as ImageIcon,
  Wallet,
  AlertCircle,
  Info,
  ArrowLeft,
  Save,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface WalletBalance {
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
}

interface AdFormData {
  title: string;
  description: string;
  type: 'banner' | 'sponsored' | 'featured';
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  targetAudience: {
    locations: string[];
    categories: string[];
    userTypes: string[];
    ageGroups: string[];
  };
  creativeAssets: {
    images: string[];
    videos: string[];
  };
  bidStrategy: 'cpc' | 'cpm' | 'cpa';
  maxBid: number;
}

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    description: '',
    type: 'sponsored',
    budget: 5000,
    dailyBudget: 500,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetAudience: {
      locations: [],
      categories: [],
      userTypes: [],
      ageGroups: [],
    },
    creativeAssets: {
      images: [],
      videos: [],
    },
    bidStrategy: 'cpc',
    maxBid: 10,
  });

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    try {
      const response = await apiClient.get('/wallet/balance');
      if (response.success && response.data) {
        setWalletBalance(response.data as WalletBalance);
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const handleInputChange = (field: keyof AdFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetAudienceChange = (field: keyof AdFormData['targetAudience'], value: string[]) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.budget) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }

      // Check wallet balance
      if (walletBalance && walletBalance.availableBalance < formData.budget) {
        toast({
          title: 'Insufficient Balance',
          description: 'Your wallet balance is insufficient for this campaign budget.',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        ...formData,
        status: isDraft ? 'draft' : 'pending_approval',
        paymentMethod: 'wallet',
      };

      const response = await apiClient.post('/advertisements', payload);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Advertisement ${isDraft ? 'saved as draft' : 'created and submitted for approval'} successfully.`,
        });
        
        // Redirect to advertisements list
        router.push('/dashboard/advertisements');
      } else {
        throw new Error('Failed to create advertisement');
      }
    } catch (error) {
      console.error('Failed to create advertisement:', error);
      toast({
        title: 'Error',
        description: 'Failed to create advertisement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const estimatedDuration = Math.ceil(formData.budget / formData.dailyBudget);
  const canAfford = walletBalance ? walletBalance.availableBalance >= formData.budget : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Create Advertisement</h1>
            <p className="text-muted-foreground">Create a new advertising campaign</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Wallet Balance</p>
            <p className="font-medium">
              {walletBalance ? formatCurrency(walletBalance.availableBalance) : 'Loading...'}
            </p>
          </div>
          <Wallet className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      {/* Wallet Balance Check */}
      {walletBalance && !canAfford && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Insufficient Wallet Balance</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  You need {formatCurrency(formData.budget - walletBalance.availableBalance)} more to create this campaign.
                </p>
              </div>
              <Button size="sm" onClick={() => router.push('/dashboard/wallet/add-money')}>
                Add Funds
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter campaign title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your campaign"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Advertisement Type *</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sponsored" id="sponsored" />
                    <Label htmlFor="sponsored">Sponsored Product (₹5-50 per click)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="banner" id="banner" />
                    <Label htmlFor="banner">Banner Ad (₹100-1000 per day)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="featured" id="featured" />
                    <Label htmlFor="featured">Featured Listing (₹500-2000 per week)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle>Budget & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget (₹) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                    min="100"
                    step="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyBudget">Daily Budget (₹) *</Label>
                  <Input
                    id="dailyBudget"
                    type="number"
                    value={formData.dailyBudget}
                    onChange={(e) => handleInputChange('dailyBudget', parseInt(e.target.value) || 0)}
                    min="50"
                    step="50"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Campaign Estimate</span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>Duration: {estimatedDuration} days</p>
                  <p>Estimated reach: {(formData.budget / 2).toLocaleString()} users</p>
                  <p>Payment will be deducted from your wallet balance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User Types</Label>
                <div className="flex flex-wrap gap-2">
                  {['buyers', 'sellers', 'both'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.targetAudience.userTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...formData.targetAudience.userTypes, type]
                            : formData.targetAudience.userTypes.filter(t => t !== type);
                          handleTargetAudienceChange('userTypes', newTypes);
                        }}
                      />
                      <Label htmlFor={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {['Electronics', 'Textiles', 'Machinery', 'Chemicals', 'Automotive', 'Food & Beverages'].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={formData.targetAudience.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          const newCategories = checked
                            ? [...formData.targetAudience.categories, category]
                            : formData.targetAudience.categories.filter(c => c !== category);
                          handleTargetAudienceChange('categories', newCategories);
                        }}
                      />
                      <Label htmlFor={category}>{category}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Locations</Label>
                <div className="flex flex-wrap gap-2">
                  {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'All India'].map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={location}
                        checked={formData.targetAudience.locations.includes(location)}
                        onCheckedChange={(checked) => {
                          const newLocations = checked
                            ? [...formData.targetAudience.locations, location]
                            : formData.targetAudience.locations.filter(l => l !== location);
                          handleTargetAudienceChange('locations', newLocations);
                        }}
                      />
                      <Label htmlFor={location}>{location}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bidding Strategy */}
          <Card>
            <CardHeader>
              <CardTitle>Bidding Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bid Strategy</Label>
                <RadioGroup
                  value={formData.bidStrategy}
                  onValueChange={(value) => handleInputChange('bidStrategy', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cpc" id="cpc" />
                    <Label htmlFor="cpc">Cost Per Click (CPC) - Pay when users click</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cpm" id="cpm" />
                    <Label htmlFor="cpm">Cost Per Mille (CPM) - Pay per 1000 impressions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cpa" id="cpa" />
                    <Label htmlFor="cpa">Cost Per Action (CPA) - Pay when users take action</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBid">Maximum Bid (₹)</Label>
                <Input
                  id="maxBid"
                  type="number"
                  value={formData.maxBid}
                  onChange={(e) => handleInputChange('maxBid', parseFloat(e.target.value) || 0)}
                  min="1"
                  step="0.5"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: ₹5-15 for {formData.bidStrategy.toUpperCase()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Wallet Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletBalance ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Available:</span>
                      <span className="font-medium">{formatCurrency(walletBalance.availableBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Locked:</span>
                      <span className="font-medium">{formatCurrency(walletBalance.lockedBalance)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-medium">{formatCurrency(walletBalance.totalBalance)}</span>
                    </div>
                  </div>
                  
                  {!canAfford && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Insufficient balance for this campaign
                      </p>
                      <Button size="sm" className="mt-2 w-full" onClick={() => router.push('/dashboard/wallet/add-money')}>
                        Add Funds
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Type:</span>
                  <span className="font-medium capitalize">{formData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Budget:</span>
                  <span className="font-medium">{formatCurrency(formData.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Daily Budget:</span>
                  <span className="font-medium">{formatCurrency(formData.dailyBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Duration:</span>
                  <span className="font-medium">{estimatedDuration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bid Strategy:</span>
                  <span className="font-medium">{formData.bidStrategy.toUpperCase()}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Payment:</strong> Amount will be deducted from your wallet balance when campaign is approved.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sponsored Products:</span>
                  <span>₹5-50 per click</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Banner Ads:</span>
                  <span>₹100-1000 per day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Featured Listings:</span>
                  <span>₹500-2000 per week</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-300">
                  Higher budgets get better placement and more visibility
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleSubmit(true)}
          disabled={saving || !formData.title || !formData.description}
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button 
          onClick={() => handleSubmit(false)}
          disabled={saving || !canAfford || !formData.title || !formData.description}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {saving ? 'Creating...' : 'Create & Pay'}
        </Button>
      </div>
    </div>
  );
}