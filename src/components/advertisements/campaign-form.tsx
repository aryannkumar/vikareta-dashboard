/**
 * Campaign Form Component - Reusable form for creating/editing campaigns
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Target,
  ImageIcon,
  TrendingUp,
  Eye,
  MousePointer,
  Users,
  Save,
  Loader2
} from 'lucide-react';

interface CampaignFormData {
  name: string;
  description: string;
  campaignType: string;
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  adType: string;
  placement: string;
  title: string;
  adDescription: string;
  imageUrl: string;
  targetUrl: string;
  callToAction: string;
}

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const campaignTypes = [
  { value: 'awareness', label: 'Brand Awareness', description: 'Increase visibility and recognition' },
  { value: 'traffic', label: 'Website Traffic', description: 'Drive visitors to your website' },
  { value: 'conversions', label: 'Conversions', description: 'Generate sales and leads' },
  { value: 'engagement', label: 'Engagement', description: 'Increase likes, shares, and comments' },
];

const adTypes = [
  { value: 'banner', label: 'Banner Ad', description: 'Display banner advertisements' },
  { value: 'product', label: 'Product Ad', description: 'Showcase specific products' },
  { value: 'category', label: 'Category Ad', description: 'Promote product categories' },
];

const placements = [
  { value: 'home', label: 'Homepage', description: 'Main homepage banner' },
  { value: 'category', label: 'Category Pages', description: 'Category listing pages' },
  { value: 'product', label: 'Product Pages', description: 'Individual product pages' },
  { value: 'search', label: 'Search Results', description: 'Search results pages' },
];

const callToActions = [
  'Shop Now',
  'Learn More',
  'Get Quote',
  'Contact Us',
  'View Products',
  'Sign Up',
  'Download',
  'Book Now',
];

export function CampaignForm({ initialData, onSubmit, loading = false, submitLabel = 'Create Campaign' }: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    campaignType: '',
    budget: 0,
    dailyBudget: 0,
    startDate: '',
    endDate: '',
    targetAudience: '',
    adType: '',
    placement: '',
    title: '',
    adDescription: '',
    imageUrl: '',
    targetUrl: '',
    callToAction: 'Shop Now',
    ...initialData,
  });

  // Set default dates if not provided
  useEffect(() => {
    if (!formData.startDate || !formData.endDate) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      setFormData(prev => ({
        ...prev,
        startDate: prev.startDate || today.toISOString().split('T')[0],
        endDate: prev.endDate || nextWeek.toISOString().split('T')[0],
      }));
    }
  }, []);

  const handleInputChange = (field: keyof CampaignFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (uploadedFiles: any[]) => {
    if (uploadedFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        imageUrl: uploadedFiles[0].url,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Campaign Details
          </CardTitle>
          <CardDescription>
            Set up your campaign objectives and budget
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Sale 2024"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaignType">Campaign Type *</Label>
              <Select value={formData.campaignType} onValueChange={(value) => handleInputChange('campaignType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign objectives and target audience"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget (₹) *</Label>
              <Input
                id="budget"
                type="number"
                min="100"
                step="10"
                placeholder="5000"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyBudget">Daily Budget (₹)</Label>
              <Input
                id="dailyBudget"
                type="number"
                min="10"
                step="10"
                placeholder="200"
                value={formData.dailyBudget}
                onChange={(e) => handleInputChange('dailyBudget', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Electronics buyers"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertisement Creative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Advertisement Creative
          </CardTitle>
          <CardDescription>
            Design your advertisement content and placement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adType">Ad Type *</Label>
              <Select value={formData.adType} onValueChange={(value) => handleInputChange('adType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ad type" />
                </SelectTrigger>
                <SelectContent>
                  {adTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement">Placement *</Label>
              <Select value={formData.placement} onValueChange={(value) => handleInputChange('placement', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  {placements.map((placement) => (
                    <SelectItem key={placement.value} value={placement.value}>
                      <div>
                        <div className="font-medium">{placement.label}</div>
                        <div className="text-sm text-gray-500">{placement.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Ad Title</Label>
              <Input
                id="title"
                placeholder="e.g., Best Electronics Deals"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callToAction">Call to Action</Label>
              <Select value={formData.callToAction} onValueChange={(value) => handleInputChange('callToAction', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {callToActions.map((cta) => (
                    <SelectItem key={cta} value={cta}>
                      {cta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adDescription">Ad Description</Label>
            <Textarea
              id="adDescription"
              placeholder="Write compelling ad copy that attracts customers"
              rows={3}
              value={formData.adDescription}
              onChange={(e) => handleInputChange('adDescription', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUrl">Target URL</Label>
            <Input
              id="targetUrl"
              type="url"
              placeholder="https://vikareta.com/your-products"
              value={formData.targetUrl}
              onChange={(e) => handleInputChange('targetUrl', e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Advertisement Image *</Label>
            <FileUpload
              onFilesUploaded={handleImageUpload}
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
              maxFiles={1}
              folder="advertisements"
              resize={{ width: 1200, height: 600, quality: 0.9 }}
              generateThumbnail={true}
            />
            {formData.imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={formData.imageUrl}
                  alt="Advertisement preview"
                  className="w-full max-w-md h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expected Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Expected Performance
          </CardTitle>
          <CardDescription>
            Estimated reach and performance based on your budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {formData.budget ? Math.floor(formData.budget * 10) : 0}
              </div>
              <p className="text-sm text-blue-600">Estimated Impressions</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <MousePointer className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {formData.budget ? Math.floor(formData.budget * 0.5) : 0}
              </div>
              <p className="text-sm text-green-600">Estimated Clicks</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {formData.budget ? Math.floor(formData.budget * 8) : 0}
              </div>
              <p className="text-sm text-purple-600">Estimated Reach</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={loading} 
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}