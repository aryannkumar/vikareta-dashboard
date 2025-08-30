'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe,
  Camera,
  Save,
  Edit,
  Check,
  X,
  Upload,
  Eye,
  EyeOff,
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'system';
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts-only';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setIsLoading(true);
      const [profileResponse, activityResponse] = await Promise.all([
        vikaretaApiClient.get('/account/profile'),
        vikaretaApiClient.get('/account/activity-log', { params: { limit: 10 } })
      ]);

      setProfile((profileResponse.data as any) || null);
      setActivityLog((activityResponse.data as any)?.activities || []);
    } catch (error) {
      console.error('Failed to load account data:', error);
      toast({
        title: "Error",
        description: "Failed to load account information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (section: string, data: any) => {
    try {
      setSaving(true);
      await vikaretaApiClient.put('/account/profile', { [section]: data });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setEditingSection(null);
      loadAccountData();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      await vikaretaApiClient.post('/account/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
      
      loadAccountData();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await vikaretaApiClient.post('/account/verify-email');
      toast({
        title: "Success",
        description: "Verification email sent",
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    }
  };

  const handleVerifyPhone = async () => {
    try {
      await vikaretaApiClient.post('/account/verify-phone');
      toast({
        title: "Success",
        description: "Verification SMS sent",
      });
    } catch (error) {
      console.error('Failed to send verification SMS:', error);
      toast({
        title: "Error",
        description: "Failed to send verification SMS",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information and account preferences
        </p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarFile(file);
                        handleAvatarUpload(file);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-xs text-gray-500">Member since {formatDate(profile.createdAt)}</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              {editingSection === 'basic' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input
                        defaultValue={profile.firstName}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input
                        defaultValue={profile.lastName}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <Textarea
                      defaultValue={profile.bio}
                      placeholder="Tell us about yourself..."
                      onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveProfile('basic', {
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        bio: profile.bio
                      })}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingSection(null)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-gray-600">{profile.bio || 'No bio provided'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection('basic')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{profile.email}</p>
                <p className="text-sm text-gray-500">Primary email address</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.verification.emailVerified ? (
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <>
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                  <Button size="sm" onClick={handleVerifyEmail}>
                    Verify
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{profile.phone || 'No phone number'}</p>
                <p className="text-sm text-gray-500">Phone number</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.phone ? (
                profile.verification.phoneVerified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <>
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                    <Button size="sm" onClick={handleVerifyPhone}>
                      Verify
                    </Button>
                  </>
                )
              ) : (
                <Button size="sm" variant="outline">
                  Add Phone
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Profile Visibility</p>
                <p className="text-sm text-gray-500">Who can see your profile information</p>
              </div>
              <select
                value={profile.privacy.profileVisibility}
                onChange={(e) => handleSaveProfile('privacy', {
                  ...profile.privacy,
                  profileVisibility: e.target.value
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="public">Public</option>
                <option value="contacts-only">Contacts Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Show Email</p>
                <p className="text-sm text-gray-500">Display email on your profile</p>
              </div>
              <Button
                variant={profile.privacy.showEmail ? "default" : "outline"}
                size="sm"
                onClick={() => handleSaveProfile('privacy', {
                  ...profile.privacy,
                  showEmail: !profile.privacy.showEmail
                })}
              >
                {profile.privacy.showEmail ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Allow Messages</p>
                <p className="text-sm text-gray-500">Allow other users to send you messages</p>
              </div>
              <Button
                variant={profile.privacy.allowMessages ? "default" : "outline"}
                size="sm"
                onClick={() => handleSaveProfile('privacy', {
                  ...profile.privacy,
                  allowMessages: !profile.privacy.allowMessages
                })}
              >
                {profile.privacy.allowMessages ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActivityLog(!showActivityLog)}
            >
              {showActivityLog ? 'Hide' : 'Show'} Details
            </Button>
          </CardTitle>
        </CardHeader>
        {showActivityLog && (
          <CardContent>
            <div className="space-y-3">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{formatDate(activity.timestamp)}</span>
                      <span>IP: {activity.ipAddress}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}