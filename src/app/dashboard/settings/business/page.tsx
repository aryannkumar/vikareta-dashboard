'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Camera,
  FileText,
  CreditCard,
  Shield
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';

interface BusinessProfile {
  id: string;
  companyName: string;
  businessType: string;
  industry: string;
  description: string;
  logo?: string;
  website?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  taxInfo: {
    taxId: string;
    gstNumber?: string;
    panNumber?: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    swiftCode?: string;
  };
  verification: {
    isVerified: boolean;
    verificationLevel: 'basic' | 'standard' | 'premium';
    documents: Array<{
      type: string;
      status: 'pending' | 'approved' | 'rejected';
      uploadedAt: string;
    }>;
  };
  settings: {
    allowPublicProfile: boolean;
    showContactInfo: boolean;
    autoAcceptOrders: boolean;
    requireApprovalForLargeOrders: boolean;
    largeOrderThreshold: number;
  };
}

export default function BusinessSettingsPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { toast } = useToast();

  const loadBusinessProfile = async () => {
    try {
      setIsLoading(true);
      const response = await vikaretaApiClient.getSettingsBusiness();
      
      if (response.success) {
        setProfile(response.data as BusinessProfile);
      } else {
        // Initialize with default values if no profile exists
        setProfile({
          id: '',
          companyName: '',
          businessType: '',
          industry: '',
          description: '',
          email: '',
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: ''
          },
          taxInfo: {
            taxId: '',
            gstNumber: '',
            panNumber: ''
          },
          bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            swiftCode: ''
          },
          verification: {
            isVerified: false,
            verificationLevel: 'basic',
            documents: []
          },
          settings: {
            allowPublicProfile: true,
            showContactInfo: false,
            autoAcceptOrders: false,
            requireApprovalForLargeOrders: true,
            largeOrderThreshold: 10000
          }
        });
      }
    } catch (error) {
      console.error('Failed to load business profile:', error);
      toast({
        title: "Error",
        description: "Failed to load business profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      
      // Upload logo if changed
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        
        const uploadResponse = await vikaretaApiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadResponse.success) {
          profile.logo = (uploadResponse.data as any).url;
        }
      }

      const response = await vikaretaApiClient.updateSettingsBusiness(profile);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Business profile updated successfully",
        });
        setLogoFile(null);
        setLogoPreview(null);
      } else {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save business profile:', error);
      toast({
        title: "Error",
        description: "Failed to save business profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = (updates: Partial<BusinessProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const updateNestedField = (path: string, value: any) => {
    if (!profile) return;
    
    const keys = path.split('.');
    const newProfile = { ...profile };
    let current: any = newProfile;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setProfile(newProfile);
  };

  const getVerificationBadge = () => {
    if (!profile?.verification.isVerified) {
      return <Badge variant="destructive">Unverified</Badge>;
    }
    
    const levelColors = {
      basic: 'bg-yellow-100 text-yellow-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={levelColors[profile.verification.verificationLevel]}>
        {profile.verification.verificationLevel.charAt(0).toUpperCase() + 
         profile.verification.verificationLevel.slice(1)} Verified
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

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load business profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your business profile and company information
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getVerificationBadge()}
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General', icon: Building2 },
            { id: 'contact', label: 'Contact & Address', icon: MapPin },
            { id: 'financial', label: 'Financial Details', icon: CreditCard },
            { id: 'verification', label: 'Verification', icon: Shield },
            { id: 'preferences', label: 'Preferences', icon: FileText }
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
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Company Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview || profile.logo ? (
                    <img 
                      src={logoPreview || profile.logo} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No logo</p>
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button variant="outline" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic information about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={profile.companyName}
                    onChange={(e) => updateProfile({ companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <select
                    id="businessType"
                    value={profile.businessType}
                    onChange={(e) => updateProfile({ businessType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select business type</option>
                    <option value="sole-proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="private-limited">Private Limited</option>
                    <option value="public-limited">Public Limited</option>
                    <option value="llp">Limited Liability Partnership</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <select
                    id="industry"
                    value={profile.industry}
                    onChange={(e) => updateProfile({ industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select industry</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="services">Services</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => updateProfile({ website: e.target.value })}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={(e) => updateProfile({ description: e.target.value })}
                  placeholder="Describe your business..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  placeholder="business@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Business Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateProfile({ phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={profile.address.street}
                  onChange={(e) => updateNestedField('address.street', e.target.value)}
                  placeholder="123 Business Street"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.address.city}
                    onChange={(e) => updateNestedField('address.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={profile.address.state}
                    onChange={(e) => updateNestedField('address.state', e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.address.country}
                    onChange={(e) => updateNestedField('address.country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
                
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={profile.address.postalCode}
                    onChange={(e) => updateNestedField('address.postalCode', e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  value={profile.taxInfo.taxId}
                  onChange={(e) => updateNestedField('taxInfo.taxId', e.target.value)}
                  placeholder="12-3456789"
                />
              </div>
              
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={profile.taxInfo.gstNumber || ''}
                  onChange={(e) => updateNestedField('taxInfo.gstNumber', e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              
              <div>
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={profile.taxInfo.panNumber || ''}
                  onChange={(e) => updateNestedField('taxInfo.panNumber', e.target.value)}
                  placeholder="ABCDE1234F"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={profile.bankDetails.accountName}
                  onChange={(e) => updateNestedField('bankDetails.accountName', e.target.value)}
                  placeholder="Business Account Name"
                />
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={profile.bankDetails.accountNumber}
                  onChange={(e) => updateNestedField('bankDetails.accountNumber', e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={profile.bankDetails.bankName}
                  onChange={(e) => updateNestedField('bankDetails.bankName', e.target.value)}
                  placeholder="Bank Name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={profile.bankDetails.ifscCode}
                    onChange={(e) => updateNestedField('bankDetails.ifscCode', e.target.value)}
                    placeholder="ABCD0123456"
                  />
                </div>
                
                <div>
                  <Label htmlFor="swiftCode">SWIFT Code</Label>
                  <Input
                    id="swiftCode"
                    value={profile.bankDetails.swiftCode || ''}
                    onChange={(e) => updateNestedField('bankDetails.swiftCode', e.target.value)}
                    placeholder="ABCDUS33"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'verification' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Business Verification
            </CardTitle>
            <CardDescription>
              Verify your business to increase trust and unlock premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Verification Status</h4>
                  <p className="text-sm text-gray-600">
                    Current verification level: {profile.verification.verificationLevel}
                  </p>
                </div>
                {getVerificationBadge()}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Required Documents</h4>
                
                {[
                  { type: 'Business Registration', required: true },
                  { type: 'Tax Certificate', required: true },
                  { type: 'Bank Statement', required: false },
                  { type: 'Address Proof', required: true }
                ].map((doc) => {
                  const uploaded = profile.verification.documents.find(d => d.type === doc.type);
                  
                  return (
                    <div key={doc.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{doc.type}</p>
                          <p className="text-sm text-gray-600">
                            {doc.required ? 'Required' : 'Optional'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {uploaded ? (
                          <Badge 
                            className={
                              uploaded.status === 'approved' ? 'bg-green-100 text-green-800' :
                              uploaded.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {uploaded.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Uploaded</Badge>
                        )}
                        
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <CardHeader>
            <CardTitle>Business Preferences</CardTitle>
            <CardDescription>
              Configure how your business operates on the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Public Profile</h4>
                  <p className="text-sm text-gray-600">
                    Allow others to view your business profile
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.settings.allowPublicProfile}
                  onChange={(e) => updateNestedField('settings.allowPublicProfile', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Contact Information</h4>
                  <p className="text-sm text-gray-600">
                    Display contact details on public profile
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.settings.showContactInfo}
                  onChange={(e) => updateNestedField('settings.showContactInfo', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Accept Orders</h4>
                  <p className="text-sm text-gray-600">
                    Automatically accept orders without manual approval
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.settings.autoAcceptOrders}
                  onChange={(e) => updateNestedField('settings.autoAcceptOrders', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Require Approval for Large Orders</h4>
                  <p className="text-sm text-gray-600">
                    Manually approve orders above threshold amount
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.settings.requireApprovalForLargeOrders}
                  onChange={(e) => updateNestedField('settings.requireApprovalForLargeOrders', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              {profile.settings.requireApprovalForLargeOrders && (
                <div>
                  <Label htmlFor="largeOrderThreshold">Large Order Threshold ($)</Label>
                  <Input
                    id="largeOrderThreshold"
                    type="number"
                    value={profile.settings.largeOrderThreshold}
                    onChange={(e) => updateNestedField('settings.largeOrderThreshold', Number(e.target.value))}
                    placeholder="10000"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}