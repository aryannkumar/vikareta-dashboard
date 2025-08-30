/**
 * Enhanced Service Form - Easy Service Creation with Image Upload
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Save, Loader2, Wrench, DollarSign, Clock, MapPin, Search, X } from 'lucide-react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FileUpload } from '@/components/ui/file-upload';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

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
  images: string[];
}

interface ServiceFormProps {
  service?: any;
  onSave?: (service: any) => void;
  onCancel?: () => void;
}

export function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
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
    images: service?.images || [],
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.getCategories();
        console.log('Categories API response:', response);
        
        if (response.success && Array.isArray(response.data)) {
          setCategories(response.data);
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
    if (formData.categoryId) {
      const loadSubcategories = async () => {
        try {
          const response = await apiClient.getSubcategoriesByCategory(formData.categoryId);
          console.log('Subcategories API response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            setSubcategories(response.data);
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

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Filter subcategories based on search
  const filteredSubcategories = useMemo(() => {
    if (!subcategorySearch) return subcategories;
    return subcategories.filter(subcategory =>
      subcategory.name.toLowerCase().includes(subcategorySearch.toLowerCase())
    );
  }, [subcategories, subcategorySearch]);

  // Get selected category and subcategory names
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
  const selectedSubcategory = subcategories.find(sub => sub.id === formData.subcategoryId);

  // Handle image uploads
  const handleImagesUploaded = (uploadedFiles: any[]) => {
    const imageUrls = uploadedFiles.map(file => file.url).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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
        images: formData.images,
      };

      console.log('Submitting service payload:', payload);

      const response = service 
        ? await apiClient.updateService(service.id, payload)
        : await apiClient.createService(payload);

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

            {/* Category & Subcategory with Search */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between"
                    >
                      {selectedCategory ? selectedCategory.name : "Select category..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search categories..." 
                        value={categorySearch}
                        onValueChange={setCategorySearch}
                      />
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.id}
                            onSelect={() => {
                              setFormData(prev => ({ 
                                ...prev, 
                                categoryId: category.id,
                                subcategoryId: '' 
                              }));
                              setCategoryOpen(false);
                              setCategorySearch('');
                            }}
                          >
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                <Popover open={subcategoryOpen} onOpenChange={setSubcategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={subcategoryOpen}
                      className="w-full justify-between"
                      disabled={!formData.categoryId || subcategories.length === 0}
                    >
                      {selectedSubcategory ? selectedSubcategory.name : "Select subcategory..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search subcategories..." 
                        value={subcategorySearch}
                        onValueChange={setSubcategorySearch}
                      />
                      <CommandEmpty>No subcategory found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredSubcategories.map((subcategory) => (
                          <CommandItem
                            key={subcategory.id}
                            value={subcategory.id}
                            onSelect={() => {
                              setFormData(prev => ({ 
                                ...prev, 
                                subcategoryId: subcategory.id
                              }));
                              setSubcategoryOpen(false);
                              setSubcategorySearch('');
                            }}
                          >
                            {subcategory.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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

            {/* Service Images */}
            <div className="space-y-4">
              <Label>Service Images</Label>
              
              {/* Current Images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Service image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Upload */}
              <FileUpload
                onFilesUploaded={handleImagesUploaded}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxFiles={10}
                folder="services"
                resize={{ width: 800, height: 600, quality: 0.8 }}
                generateThumbnail={true}
              />
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