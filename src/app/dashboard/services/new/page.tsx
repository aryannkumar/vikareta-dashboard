'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wrench, 
  ArrowLeft,
  Save,
  Clock,
  DollarSign,
  MapPin,
  AlertCircle,
  Plus,
  X
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
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  serviceType: 'consultation' | 'installation' | 'maintenance' | 'repair' | 'training' | 'other';
  pricing: {
    type: 'fixed' | 'hourly' | 'project' | 'negotiable';
    amount: number;
    currency: string;
  };
  duration: {
    estimated: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  availability: {
    locations: string[];
    remote: boolean;
    onsite: boolean;
  };
  requirements: string[];
  deliverables: string[];
  status: 'active' | 'inactive' | 'draft';
}

export default function AddServicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    serviceType: 'consultation',
    pricing: {
      type: 'fixed',
      amount: 0,
      currency: 'INR',
    },
    duration: {
      estimated: 1,
      unit: 'hours',
    },
    availability: {
      locations: [],
      remote: false,
      onsite: false,
    },
    requirements: [],
    deliverables: [],
    status: 'draft',
  });

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0] as keyof ServiceFormData] as any),
          [keys[1]]: value,
        },
      }));
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()],
      }));
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          locations: [...prev.availability.locations, newLocation.trim()],
        },
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        locations: prev.availability.locations.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (status: 'draft' | 'active') => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }

      const submitData = { ...formData, status };
      const response = await apiClient.post('/services', submitData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Service ${status === 'draft' ? 'saved as draft' : 'published'} successfully.`,
        });
        
        // Redirect to services list
        router.push('/dashboard/services');
      } else {
        throw new Error('Failed to create service');
      }
    } catch (error) {
      console.error('Failed to create service:', error);
      toast({
        title: 'Error',
        description: 'Failed to create service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Add Service</h1>
            <p className="text-muted-foreground">Create a new service offering</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter service title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your service in detail..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    placeholder="Enter subcategory"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Type</Label>
                <RadioGroup
                  value={formData.serviceType}
                  onValueChange={(value) => handleInputChange('serviceType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consultation" id="consultation" />
                    <Label htmlFor="consultation">Consultation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="installation" id="installation" />
                    <Label htmlFor="installation">Installation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maintenance" id="maintenance" />
                    <Label htmlFor="maintenance">Maintenance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="repair" id="repair" />
                    <Label htmlFor="repair">Repair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="training" id="training" />
                    <Label htmlFor="training">Training</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pricing Type</Label>
                <RadioGroup
                  value={formData.pricing.type}
                  onValueChange={(value) => handleInputChange('pricing.type', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly">Hourly Rate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="project" id="project" />
                    <Label htmlFor="project">Per Project</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negotiable" id="negotiable" />
                    <Label htmlFor="negotiable">Negotiable</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.pricing.type !== 'negotiable' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (INR)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      value={formData.pricing.amount}
                      onChange={(e) => handleInputChange('pricing.amount', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration.estimated}
                      onChange={(e) => handleInputChange('duration.estimated', parseInt(e.target.value) || 1)}
                      className="pl-10"
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Duration Unit</Label>
                  <Select value={formData.duration.unit} onValueChange={(value) => handleInputChange('duration.unit', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={formData.availability.remote}
                    onCheckedChange={(checked) => handleInputChange('availability.remote', checked)}
                  />
                  <Label htmlFor="remote">Available for remote work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onsite"
                    checked={formData.availability.onsite}
                    onCheckedChange={(checked) => handleInputChange('availability.onsite', checked)}
                  />
                  <Label htmlFor="onsite">Available for on-site work</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Locations</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Add location (city, state)"
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                    />
                  </div>
                  <Button type="button" onClick={addLocation} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.availability.locations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{location}</span>
                      <button onClick={() => removeLocation(index)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Deliverables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add requirement"
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button type="button" onClick={addRequirement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((requirement, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{requirement}</span>
                      <button onClick={() => removeRequirement(index)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deliverables</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="Add deliverable"
                    onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
                  />
                  <Button type="button" onClick={addDeliverable} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.deliverables.map((deliverable, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{deliverable}</span>
                      <button onClick={() => removeDeliverable(index)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button 
                  onClick={() => handleSubmit('active')} 
                  disabled={saving || !formData.title || !formData.description || !formData.category}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Publishing...' : 'Publish Service'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSubmit('draft')} 
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button variant="outline" onClick={() => router.back()} className="w-full">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Service Guidelines</p>
                  <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Provide clear and detailed descriptions</li>
                    <li>• Set realistic pricing and timelines</li>
                    <li>• Specify all requirements upfront</li>
                    <li>• List all deliverables clearly</li>
                    <li>• Keep your service information updated</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}