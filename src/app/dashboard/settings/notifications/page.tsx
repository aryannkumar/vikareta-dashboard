'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Save,

  Zap
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';

interface NotificationSettings {
  email: {
    enabled: boolean;
    address: string;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    categories: {
      orders: boolean;
      payments: boolean;
      inventory: boolean;
      customers: boolean;
      marketing: boolean;
      security: boolean;
      system: boolean;
    };
  };
  sms: {
    enabled: boolean;
    phoneNumber: string;
    categories: {
      urgentOrders: boolean;
      paymentIssues: boolean;
      securityAlerts: boolean;
      systemDowntime: boolean;
    };
  };
  push: {
    enabled: boolean;
    categories: {
      newOrders: boolean;
      messages: boolean;
      lowInventory: boolean;
      paymentReceived: boolean;
      customerReviews: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    categories: {
      all: boolean;
      orders: boolean;
      messages: boolean;
      inventory: boolean;
      analytics: boolean;
    };
  };
  schedule: {
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      timezone: string;
    };
    workingDays: string[];
  };
  preferences: {
    language: string;
    digestFrequency: 'daily' | 'weekly' | 'monthly';
    marketingEmails: boolean;
    productUpdates: boolean;
    surveyInvitations: boolean;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  channels: ('email' | 'sms' | 'push' | 'inApp')[];
  enabled: boolean;
  customizable: boolean;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('channels');
  const [testNotification, setTestNotification] = useState({
    type: 'email',
    message: 'This is a test notification to verify your settings.'
  });

  const { toast } = useToast();

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setIsLoading(true);
      const [settingsResponse, templatesResponse] = await Promise.all([
        vikaretaApiClient.get('/settings/notifications'),
        vikaretaApiClient.get('/notifications/templates')
      ]);

      if (settingsResponse.success) {
        setSettings(settingsResponse.data as NotificationSettings);
      } else {
        // Initialize with default settings
        setSettings({
          email: {
            enabled: true,
            address: '',
            frequency: 'immediate',
            categories: {
              orders: true,
              payments: true,
              inventory: true,
              customers: true,
              marketing: false,
              security: true,
              system: true
            }
          },
          sms: {
            enabled: false,
            phoneNumber: '',
            categories: {
              urgentOrders: true,
              paymentIssues: true,
              securityAlerts: true,
              systemDowntime: true
            }
          },
          push: {
            enabled: true,
            categories: {
              newOrders: true,
              messages: true,
              lowInventory: true,
              paymentReceived: true,
              customerReviews: false
            }
          },
          inApp: {
            enabled: true,
            sound: true,
            desktop: true,
            categories: {
              all: true,
              orders: true,
              messages: true,
              inventory: true,
              analytics: false
            }
          },
          schedule: {
            quietHours: {
              enabled: false,
              startTime: '22:00',
              endTime: '08:00',
              timezone: 'UTC'
            },
            workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          },
          preferences: {
            language: 'en',
            digestFrequency: 'daily',
            marketingEmails: false,
            productUpdates: true,
            surveyInvitations: false
          }
        });
      }

      if (templatesResponse.success) {
        setTemplates(templatesResponse.data as NotificationTemplate[]);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await vikaretaApiClient.put('/settings/notifications', settings);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Notification settings updated successfully",
        });
      } else {
        throw new Error(response.error?.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await vikaretaApiClient.post('/notifications/test', testNotification);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Test notification sent successfully",
        });
      } else {
        throw new Error(response.error?.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      });
    }
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  const updateNestedSetting = (path: string, value: any) => {
    if (!settings) return;
    
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const toggleTemplate = async (templateId: string, enabled: boolean) => {
    try {
      await vikaretaApiClient.put(`/notifications/templates/${templateId}`, { enabled });
      
      setTemplates(prev => prev.map(template => 
        template.id === templateId ? { ...template, enabled } : template
      ));
      
      toast({
        title: "Success",
        description: `Template ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Failed to update template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'orders': return <ShoppingCart className="h-4 w-4" />;
      case 'payments': return <DollarSign className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'customers': return <Users className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load notification settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage how and when you receive notifications
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'channels', label: 'Channels', icon: Bell },
            { id: 'categories', label: 'Categories', icon: Settings },
            { id: 'schedule', label: 'Schedule', icon: Clock },
            { id: 'templates', label: 'Templates', icon: MessageSquare },
            { id: 'test', label: 'Test', icon: Zap }
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
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable email notifications</span>
                <input
                  type="checkbox"
                  checked={settings.email.enabled}
                  onChange={(e) => updateNestedSetting('email.enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {settings.email.enabled && (
                <>
                  <div>
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={settings.email.address}
                      onChange={(e) => updateNestedSetting('email.address', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emailFrequency">Frequency</Label>
                    <select
                      id="emailFrequency"
                      value={settings.email.frequency}
                      onChange={(e) => updateNestedSetting('email.frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly digest</option>
                      <option value="daily">Daily digest</option>
                      <option value="weekly">Weekly digest</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Categories</Label>
                    {Object.entries(settings.email.categories).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(key)}
                          <span className="capitalize">{key}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNestedSetting(`email.categories.${key}`, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable SMS notifications</span>
                <input
                  type="checkbox"
                  checked={settings.sms.enabled}
                  onChange={(e) => updateNestedSetting('sms.enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {settings.sms.enabled && (
                <>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={settings.sms.phoneNumber}
                      onChange={(e) => updateNestedSetting('sms.phoneNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>SMS Categories</Label>
                    {Object.entries(settings.sms.categories).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNestedSetting(`sms.categories.${key}`, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable push notifications</span>
                <input
                  type="checkbox"
                  checked={settings.push.enabled}
                  onChange={(e) => updateNestedSetting('push.enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {settings.push.enabled && (
                <div className="space-y-2">
                  <Label>Push Categories</Label>
                  {Object.entries(settings.push.categories).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateNestedSetting(`push.categories.${key}`, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                In-App Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable in-app notifications</span>
                <input
                  type="checkbox"
                  checked={settings.inApp.enabled}
                  onChange={(e) => updateNestedSetting('inApp.enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {settings.inApp.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings.inApp.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <span>Sound notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.inApp.sound}
                      onChange={(e) => updateNestedSetting('inApp.sound', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Desktop notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.inApp.desktop}
                      onChange={(e) => updateNestedSetting('inApp.desktop', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>In-App Categories</Label>
                    {Object.entries(settings.inApp.categories).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{key}</span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNestedSetting(`inApp.categories.${key}`, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
              <CardDescription>
                Set times when you don't want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable quiet hours</span>
                <input
                  type="checkbox"
                  checked={settings.schedule.quietHours.enabled}
                  onChange={(e) => updateNestedSetting('schedule.quietHours.enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {settings.schedule.quietHours.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={settings.schedule.quietHours.startTime}
                        onChange={(e) => updateNestedSetting('schedule.quietHours.startTime', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={settings.schedule.quietHours.endTime}
                        onChange={(e) => updateNestedSetting('schedule.quietHours.endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={settings.schedule.quietHours.timezone}
                      onChange={(e) => updateNestedSetting('schedule.quietHours.timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Asia/Kolkata">India</option>
                    </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working Days</CardTitle>
              <CardDescription>
                Select days when you want to receive business notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="capitalize">{day}</span>
                    <input
                      type="checkbox"
                      checked={settings.schedule.workingDays.includes(day)}
                      onChange={(e) => {
                        const workingDays = e.target.checked
                          ? [...settings.schedule.workingDays, day]
                          : settings.schedule.workingDays.filter(d => d !== day);
                        updateNestedSetting('schedule.workingDays', workingDays);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notification Templates
            </CardTitle>
            <CardDescription>
              Manage individual notification types and their delivery channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline">{template.category}</Badge>
                      {template.enabled ? (
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Channels:</span>
                      {template.channels.map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {template.customizable && (
                      <Button variant="outline" size="sm">
                        Customize
                      </Button>
                    )}
                    
                    <input
                      type="checkbox"
                      checked={template.enabled}
                      onChange={(e) => toggleTemplate(template.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'test' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Test Notifications
            </CardTitle>
            <CardDescription>
              Send test notifications to verify your settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testType">Notification Type</Label>
              <select
                id="testType"
                value={testNotification.type}
                onChange={(e) => setTestNotification(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
                <option value="inApp">In-App Notification</option>
              </select>
            </div>

            <div>
              <Label htmlFor="testMessage">Test Message</Label>
              <Input
                id="testMessage"
                value={testNotification.message}
                onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter test message"
              />
            </div>

            <Button onClick={sendTestNotification} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Test Results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Email notifications will be sent to: {settings.email.address || 'Not configured'}</li>
                <li>• SMS notifications will be sent to: {settings.sms.phoneNumber || 'Not configured'}</li>
                <li>• Push notifications: {settings.push.enabled ? 'Enabled' : 'Disabled'}</li>
                <li>• In-app notifications: {settings.inApp.enabled ? 'Enabled' : 'Disabled'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}