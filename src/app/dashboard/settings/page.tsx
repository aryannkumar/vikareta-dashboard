'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Plug, 
  ChevronRight,
  Settings as SettingsIcon,
  Palette,
  Globe,
  CreditCard,
  Download,
  Upload,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';

interface SettingsOverview {
  account: {
    completionPercentage: number;
    lastUpdated: string;
    verificationStatus: 'verified' | 'pending' | 'unverified';
  };
  business: {
    completionPercentage: number;
    verificationStatus: 'verified' | 'pending' | 'unverified';
    documentsUploaded: number;
    totalDocuments: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    totalRules: number;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    activeSessions: number;
    securityScore: number;
  };
  integrations: {
    connectedServices: number;
    totalAvailable: number;
    lastSync: string;
  };
}

export default function SettingsPage() {
  const [overview, setOverview] = useState<SettingsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettingsOverview();
  }, []);

  const loadSettingsOverview = async () => {
    try {
      setIsLoading(true);
      const response = await vikaretaApiClient.get('/settings/overview');
      setOverview(response.data as SettingsOverview);
    } catch (error) {
      console.error('Failed to load settings overview:', error);
      toast({
        title: "Error",
        description: "Failed to load settings overview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const settingsCategories = [
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Manage your personal information and preferences',
      href: '/dashboard/settings/account',
      icon: User,
      color: 'text-blue-600 bg-blue-100',
      completion: overview?.account.completionPercentage || 0,
      status: overview?.account.verificationStatus || 'unverified'
    },
    {
      id: 'business',
      title: 'Business Settings',
      description: 'Configure your business profile and verification',
      href: '/dashboard/settings/business',
      icon: Building,
      color: 'text-green-600 bg-green-100',
      completion: overview?.business.completionPercentage || 0,
      status: overview?.business.verificationStatus || 'unverified'
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      description: 'Control how and when you receive notifications',
      href: '/dashboard/settings/notifications',
      icon: Bell,
      color: 'text-yellow-600 bg-yellow-100',
      completion: 100,
      status: 'configured'
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Manage your account security and privacy',
      href: '/dashboard/settings/security',
      icon: Shield,
      color: 'text-red-600 bg-red-100',
      completion: overview?.security.securityScore || 0,
      status: overview?.security.twoFactorEnabled ? 'secure' : 'needs-attention'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with third-party services and APIs',
      href: '/dashboard/settings/integrations',
      icon: Plug,
      color: 'text-purple-600 bg-purple-100',
      completion: overview ? (overview.integrations.connectedServices / overview.integrations.totalAvailable) * 100 : 0,
      status: 'available'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      verified: { variant: 'default' as const, text: 'Verified', color: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary' as const, text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      unverified: { variant: 'destructive' as const, text: 'Unverified', color: 'bg-red-100 text-red-800' },
      secure: { variant: 'default' as const, text: 'Secure', color: 'bg-green-100 text-green-800' },
      'needs-attention': { variant: 'destructive' as const, text: 'Needs Attention', color: 'bg-red-100 text-red-800' },
      configured: { variant: 'default' as const, text: 'Configured', color: 'bg-blue-100 text-blue-800' },
      available: { variant: 'secondary' as const, text: 'Available', color: 'bg-gray-100 text-gray-800' }
    };

    const config = variants[status as keyof typeof variants] || variants.available;
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account, business, and platform preferences
        </p>
      </div>

      {/* Quick Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.account.completionPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.security.securityScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plug className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Integrations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.integrations.connectedServices}/{overview.integrations.totalAvailable}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Business Docs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.business.documentsUploaded}/{overview.business.totalDocuments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Link key={category.id} href={category.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {category.description}
                        </p>
                        
                        {/* Completion Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Completion</span>
                            <span className="text-xs font-medium text-gray-700">
                              {Math.round(category.completion)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getCompletionColor(category.completion)}`}
                              style={{ width: `${category.completion}%` }}
                            />
                          </div>
                        </div>
                        
                        {getStatusBadge(category.status)}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common settings tasks and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="h-5 w-5" />
              <span className="text-sm">Export Data</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Upload className="h-5 w-5" />
              <span className="text-sm">Import Settings</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Palette className="h-5 w-5" />
              <span className="text-sm">Theme Settings</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm">Language</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Account Management
          </CardTitle>
          <CardDescription>
            Dangerous actions that affect your entire account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div>
                <h4 className="font-medium text-yellow-900">Deactivate Account</h4>
                <p className="text-sm text-yellow-700">
                  Temporarily disable your account (can be reactivated)
                </p>
              </div>
              <Button variant="outline" size="sm">
                Deactivate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}