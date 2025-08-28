/**
 * Simple Service Form - Easy and Fast Service Creation
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Wrench, DollarSign, Clock, MapPin } from 'lucide-react';
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
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface ServiceData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  pricingType: string;
  duration: number;
  durationUnit: string;
  location: string;
  serviceArea: string;
}

interface ServiceFormProps {
  service?: any;
  onSave?: (service: any) => void;
  onCancel?: () => void;
}

export function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<ServiceData>({
    title: service?.title || '',
    description: service?.description || '',
    categoryId: service?.categoryId || '',
    subcategoryId: service?.subcategoryId || '',
    price: service?.price || 0,
    pricingType: service?.pricingType || 'fixed',
    duration: service?.duration || 1,
    durationUnit: service?.durationUnit || 'hours',
    location: service?.location || 'both',
    serviceArea: service?.serviceArea || '',
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        console.log('Categories API response:', response);
        
        if (response.success && Array.isArray(response.data)) {
          // Validate that categories have valid ID format
          const validCategories = response.data.filter(cat => 
            cat.id && typeof cat.id === 'string' && isValidId(cat.id)
          );
          
          if (validCategories.length > 0) {
            setCategories(validCategories);
          } else {
            console.warn('No valid categories found');
            toast({
              title: 'Warning',
              description: 'Categories are not properly configured. Please contact support.',
              variant: 'destructive',
            });
          }
        } else if (response.success && response.data && typeof response.data === 'object' && 'categories' in response.data) {
          setCategories((response.data as any).categories);
        } else {
          console.warn('Categories API failed, no data returned');
          toast({
            title: 'Error',
            description: 'Failed to load categories. Please refresh the page.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories. Please check your connection.',
          variant: 'destructive',
        });
      }
    };
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.categoryId && isValidId(formData.categoryId)) {
      const loadSubcategories = async () => {
        try {
          const response = await apiClient.get(`/subcategories/category/${formData.categoryId}`);
          console.log('Subcategories API response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            // Validate subcategories have valid ID format
            const validSubcategories = response.data.filter(sub => 
              sub.id && typeof sub.id === 'string' && isValidId(sub.id)
            );
            setSubcategories(validSubcategories);
          } else if (response.success && response.data && typeof response.data === 'object' && 'subcategories' in response.data) {
            setSubcategories((response.data as any).subcategories);
          } else {
            setSubcategories([]);
          }
        } catch (error) {
          console.error('Failed to load subcategories:', error);
          setSubcategories([]);
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId]);

  const isValidId = (str: string) => {
    // Accept both UUID and CUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const cuidRegex = /^c[a-z0-9]{24}$/i; // CUID format: c + 24 alphanumeric chars
    return uuidRegex.test(str) || cuidRegex.test(str);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.categoryId) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      // Validate ID format for categoryId
      if (!isValidId(formData.categoryId)) {
        toast({
          title: 'Invalid Category',
          description: 'Please select a valid category from the dropdown',
          variant: 'destructive',
        });
        return;
      }

      // Validate ID format for subcategoryId if provided
      if (formData.subcategoryId && !isValidId(formData.subcategoryId)) {
        toast({
          title: 'Invalid Subcategory',
          description: 'Please select a valid subcategory from the dropdown',
          variant: 'destructive',
        });
        return;
      }

      // Convert duration to minutes (backend expects minutes)
      const durationToMinutes = (value: number, unit: string) => {
        switch (unit) {
          case 'hours': return Math.max(15, Math.round(value * 60));
          case 'days': return Math.max(15, Math.round(value * 24 * 60));
          case 'weeks': return Math.max(15, Math.round(value * 7 * 24 * 60));
          default: return 60; // Default 1 hour
        }
      };

      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        price: formData.pricingType === 'negotiable' ? 0 : Number(formData.price),
        currency: 'INR',
        serviceType: 'one_time',
        duration: durationToMinutes(formData.duration, formData.durationUnit),
        location: formData.location,
        serviceArea: formData.serviceArea ? [formData.serviceArea] : [],
      };

      console.log('Submitting service payload:', payload);

      const response = service 
        ? await apiClient.put(`/services/${service.id}`, payload)
        : await apiClient.post('/services', payload);

      if (response.success) {
        toast({
          title: 'Success! 🎉',
          description: `Service ${service ? 'updated' : 'created'} successfully`,
        });
        onSave?.(response.data);
      } else {
        const errorMsg = response.error?.message || response.error?.details?.[0]?.msg || 'Failed to save service';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Service save error:', error);
      let errorMessage = 'Failed to save service';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="mr-2 h-5 w-5" />
            {service ? 'Edit Service' : 'Create New Service'}
          </CardTitle>
          <CardDescription>
            Fill in the basic details to create your service quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                placeholder="Enter service title (e.g., Website Development, AC Repair, Business Consulting)"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your service (e.g., Professional website development with modern design, responsive layout, and SEO optimization)"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value, subcategoryId: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                <Select
                  value={formData.subcategoryId || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoryId: value }))}
                >
                  <SelectTrigger disabled={!formData.categoryId || subcategories.length === 0}>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pricing Type *</Label>
                <Select
                  value={formData.pricingType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, pricingType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.pricingType !== 'negotiable' && (
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center">
                    <DollarSign className="mr-1 h-4 w-4" />
                    {formData.pricingType === 'hourly' ? 'Hourly Rate (INR)' : 'Price (INR)'} *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required={formData.pricingType !== 'negotiable'}
                  />
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Estimated Duration *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationUnit">Duration Unit *</Label>
                <Select
                  value={formData.durationUnit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, durationUnit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  Service Location *
                </Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online/Remote</SelectItem>
                    <SelectItem value="on_site">On-site/Physical</SelectItem>
                    <SelectItem value="both">Both Online & On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceArea">Service Area (Optional)</Label>
                <Input
                  id="serviceArea"
                  placeholder="Enter city or region (e.g., Mumbai, Delhi NCR, Pan India)"
                  value={formData.serviceArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceArea: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  Specify the geographical area where you provide this service
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {service ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Export both names for compatibility
export { ServiceForm as SimpleServiceForm };