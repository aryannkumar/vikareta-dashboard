'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Eye,
  Settings,
  Tag,
  DollarSign,
  Clock,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  Camera,
  FileText,
  Users
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  pricing: {
    type: 'fixed' | 'hourly' | 'project' | 'custom';
    basePrice: number;
    currency: string;
    packages?: Array<{
      name: string;
      price: number;
      description: string;
      features: string[];
    }>;
  };
  delivery: {
    timeframe: number;
    timeUnit: 'hours' | 'days' | 'weeks' | 'months';
    revisions: number;
    location?: string;
    isRemote: boolean;
  };
  media: {
    images: string[];
    videos?: string[];
    documents?: string[];
  };
  requirements: string[];
  features: string[];
  tags: string[];
  availability: {
    isActive: boolean;
    schedule?: {
      monday: { start: string; end: string; available: boolean };
      tuesday: { start: string; end: string; available: boolean };
      wednesday: { start: string; end: string; available: boolean };
      thursday: { start: string; end: string; available: boolean };
      friday: { start: string; end: string; available: boolean };
      saturday: { start: string; end: string; available: boolean };
      sunday: { start: string; end: string; available: boolean };
    };
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  status: 'draft' | 'active' | 'paused' | 'archived';
  stats?: {
    views: number;
    orders: number;
    rating: number;
    reviewCount: number;
  };
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newFeature, setNewFeature] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    try {
      setIsLoading(true);
      const response = await vikaretaApiClient.getService(serviceId);
      
      if (response.success) {
        setService(response.data);
      } else {
        throw new Error(response.error?.message || 'Service not found');
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      toast({
        title: "Error",
        description: "Failed to load service",
        variant: "destructive",
      });
      router.push('/dashboard/services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!service) return;

    try {
      setIsSaving(true);
      
      // Upload new image if selected
      if (newImage) {
        const formData = new FormData();
        formData.append('image', newImage);
        
        const uploadResponse = await vikaretaApiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadResponse.success) {
          service.media.images.push((uploadResponse.data as any)?.url || '');
        }
      }

      const response = await vikaretaApiClient.updateService(serviceId, service);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Service updated successfully",
        });
        setNewImage(null);
        setImagePreview(null);
      } else {
        throw new Error(response.error?.message || 'Failed to update service');
      }
    } catch (error) {
      console.error('Failed to save service:', error);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    if (service) {
      const newImages = [...service.media.images];
      newImages.splice(index, 1);
      setService({ ...service, media: { ...service.media, images: newImages } });
    }
  };

  const addTag = () => {
    if (newTag.trim() && service && !service.tags.includes(newTag.trim())) {
      setService({
        ...service,
        tags: [...service.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    if (service) {
      setService({
        ...service,
        tags: service.tags.filter(t => t !== tag)
      });
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && service) {
      setService({
        ...service,
        requirements: [...service.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    if (service) {
      const newRequirements = [...service.requirements];
      newRequirements.splice(index, 1);
      setService({ ...service, requirements: newRequirements });
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && service) {
      setService({
        ...service,
        features: [...service.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    if (service) {
      const newFeatures = [...service.features];
      newFeatures.splice(index, 1);
      setService({ ...service, features: newFeatures });
    }
  };

  const updateService = (updates: Partial<Service>) => {
    if (service) {
      setService({ ...service, ...updates });
    }
  };

  const updateNestedField = (path: string, value: any) => {
    if (!service) return;
    
    const keys = path.split('.');
    const newService = { ...service };
    let current: any = newService;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setService(newService);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Service not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-600">{service.title}</p>
              {getStatusBadge(service.status)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push(`/dashboard/services/${serviceId}`)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Service Stats */}
      {service.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Views</p>
                  <p className="text-2xl font-bold text-gray-900">{service.stats.views}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{service.stats.orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{service.stats.rating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{service.stats.reviewCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info', icon: FileText },
            { id: 'pricing', label: 'Pricing', icon: DollarSign },
            { id: 'delivery', label: 'Delivery', icon: Clock },
            { id: 'media', label: 'Media', icon: Camera },
            { id: 'details', label: 'Details', icon: Settings },
            { id: 'seo', label: 'SEO', icon: Tag }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={service.title}
                  onChange={(e) => updateService({ title: e.target.value })}
                  placeholder="Enter service title"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Textarea
                  id="shortDescription"
                  value={service.shortDescription}
                  onChange={(e) => updateService({ shortDescription: e.target.value })}
                  placeholder="Brief description (max 160 characters)"
                  rows={2}
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {service.shortDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={service.description}
                  onChange={(e) => updateService({ description: e.target.value })}
                  placeholder="Detailed description of your service"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={service.category}
                    onChange={(e) => updateService({ category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="design">Design & Creative</option>
                    <option value="development">Development & IT</option>
                    <option value="marketing">Marketing</option>
                    <option value="writing">Writing & Translation</option>
                    <option value="business">Business</option>
                    <option value="consulting">Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <select
                    id="subcategory"
                    value={service.subcategory}
                    onChange={(e) => updateService({ subcategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select subcategory</option>
                    <option value="web-design">Web Design</option>
                    <option value="logo-design">Logo Design</option>
                    <option value="web-development">Web Development</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="seo">SEO</option>
                    <option value="content-writing">Content Writing</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={service.status}
                  onChange={(e) => updateService({ status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span>Available for orders</span>
                <input
                  type="checkbox"
                  checked={service.availability.isActive}
                  onChange={(e) => updateNestedField('availability.isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tips for Success:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use clear, descriptive titles</li>
                  <li>• Include relevant keywords</li>
                  <li>• Write detailed descriptions</li>
                  <li>• Add high-quality images</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'pricing' && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Structure</CardTitle>
            <CardDescription>
              Set your service pricing and packages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pricingType">Pricing Type</Label>
                <select
                  id="pricingType"
                  value={service.pricing.type}
                  onChange={(e) => updateNestedField('pricing.type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="project">Project Based</option>
                  <option value="custom">Custom Quote</option>
                </select>
              </div>

              <div>
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={service.pricing.basePrice}
                  onChange={(e) => updateNestedField('pricing.basePrice', Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={service.pricing.currency}
                  onChange={(e) => updateNestedField('pricing.currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            {service.pricing.packages && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Service Packages</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {service.pricing.packages.map((pkg, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{pkg.name}</h4>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mb-2">
                          ${pkg.price}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                        <ul className="text-sm space-y-1">
                          {pkg.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'delivery' && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
            <CardDescription>
              Set delivery timeframes and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="timeframe">Delivery Time</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={service.delivery.timeframe}
                  onChange={(e) => updateNestedField('delivery.timeframe', Number(e.target.value))}
                  placeholder="1"
                />
              </div>

              <div>
                <Label htmlFor="timeUnit">Time Unit</Label>
                <select
                  id="timeUnit"
                  value={service.delivery.timeUnit}
                  onChange={(e) => updateNestedField('delivery.timeUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>

              <div>
                <Label htmlFor="revisions">Revisions Included</Label>
                <Input
                  id="revisions"
                  type="number"
                  value={service.delivery.revisions}
                  onChange={(e) => updateNestedField('delivery.revisions', Number(e.target.value))}
                  placeholder="3"
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Remote Service</span>
                <input
                  type="checkbox"
                  checked={service.delivery.isRemote}
                  onChange={(e) => updateNestedField('delivery.isRemote', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>

            {!service.delivery.isRemote && (
              <div>
                <Label htmlFor="location">Service Location</Label>
                <Input
                  id="location"
                  value={service.delivery.location || ''}
                  onChange={(e) => updateNestedField('delivery.location', e.target.value)}
                  placeholder="City, State, Country"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'media' && (
        <Card>
          <CardHeader>
            <CardTitle>Media Gallery</CardTitle>
            <CardDescription>
              Add images and videos to showcase your service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Images</h3>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" type="button">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">New Image Preview</h4>
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                </div>
              )}

              {/* Existing Images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {service.media.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Service image ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Add relevant tags to help customers find your service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                What do you need from the customer to get started?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement"
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                />
                <Button onClick={addRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {service.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span>{requirement}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeRequirement(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                What's included in your service?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeFeature(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'seo' && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>
              Optimize your service for search engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={service.seo.metaTitle || ''}
                onChange={(e) => updateNestedField('seo.metaTitle', e.target.value)}
                placeholder="SEO title for search engines"
                maxLength={60}
              />
              <p className="text-sm text-gray-500 mt-1">
                {(service.seo.metaTitle || '').length}/60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={service.seo.metaDescription || ''}
                onChange={(e) => updateNestedField('seo.metaDescription', e.target.value)}
                placeholder="Brief description for search results"
                rows={3}
                maxLength={160}
              />
              <p className="text-sm text-gray-500 mt-1">
                {(service.seo.metaDescription || '').length}/160 characters
              </p>
            </div>

            <div>
              <Label>SEO Keywords</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(service.seo.keywords || []).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {keyword}
                    <button onClick={() => {
                      const newKeywords = [...(service.seo.keywords || [])];
                      newKeywords.splice(index, 1);
                      updateNestedField('seo.keywords', newKeywords);
                    }}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                className="mt-2"
                placeholder="Add SEO keywords (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value && !(service.seo.keywords || []).includes(value)) {
                      updateNestedField('seo.keywords', [...(service.seo.keywords || []), value]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}