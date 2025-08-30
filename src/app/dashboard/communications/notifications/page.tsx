'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Search, 
  Settings, 
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Helper function for relative time
const formatDistanceToNowLocal = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'order' | 'payment' | 'inventory' | 'system' | 'marketing' | 'security';
  status: 'unread' | 'read' | 'dismissed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  relatedTo?: {
    type: 'order' | 'rfq' | 'quote' | 'customer' | 'supplier' | 'product';
    id: string;
    title: string;
  };
  metadata?: {
    [key: string]: any;
  };
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  categories: {
    [key: string]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bulkActions, setBulkActions] = useState({
    selectedIds: new Set<string>(),
    isSelecting: false
  });
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await apiClient.getNotifications(params);

      if (response.success && response.data) {
        // Handle both array response and object with notifications property
        if (Array.isArray(response.data)) {
          setNotifications(response.data as Notification[]);
        } else {
          const data = response.data as any;
          setNotifications(data.notifications || []);
        }
      } else {
        // Fallback data for development
        const fallbackNotifications: Notification[] = [
          {
            id: '1',
            title: 'New Order Received',
            message: 'You have received a new order #12345 from ABC Manufacturing worth $5,250.',
            type: 'success',
            category: 'order',
            status: 'unread',
            priority: 'high',
            createdAt: '2024-01-16T10:30:00Z',
            actionUrl: '/dashboard/orders/12345',
            actionText: 'View Order',
            relatedTo: {
              type: 'order',
              id: '12345',
              title: 'Industrial Equipment Order'
            }
          },
          {
            id: '2',
            title: 'Low Stock Alert',
            message: 'Steel Pipes inventory is running low. Current stock: 5 units (minimum: 20 units).',
            type: 'warning',
            category: 'inventory',
            status: 'unread',
            priority: 'high',
            createdAt: '2024-01-16T09:15:00Z',
            actionUrl: '/dashboard/inventory/low-stock',
            actionText: 'Manage Inventory',
            relatedTo: {
              type: 'product',
              id: 'prod-123',
              title: 'Steel Pipes Bundle'
            }
          },
          {
            id: '3',
            title: 'Payment Received',
            message: 'Payment of $3,200 has been received for order #12340.',
            type: 'success',
            category: 'payment',
            status: 'read',
            priority: 'normal',
            createdAt: '2024-01-15T14:20:00Z',
            readAt: '2024-01-15T15:30:00Z',
            actionUrl: '/dashboard/orders/12340',
            actionText: 'View Payment'
          },
          {
            id: '4',
            title: 'System Maintenance Scheduled',
            message: 'System maintenance is scheduled for tonight from 2:00 AM to 4:00 AM EST.',
            type: 'info',
            category: 'system',
            status: 'read',
            priority: 'normal',
            createdAt: '2024-01-15T11:45:00Z',
            readAt: '2024-01-15T12:00:00Z'
          },
          {
            id: '5',
            title: 'Security Alert',
            message: 'Unusual login activity detected from a new device. Please verify if this was you.',
            type: 'error',
            category: 'security',
            status: 'unread',
            priority: 'urgent',
            createdAt: '2024-01-14T16:30:00Z',
            actionUrl: '/dashboard/settings/security',
            actionText: 'Review Security'
          }
        ];

        setNotifications(fallbackNotifications);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, categoryFilter, statusFilter]);

  const loadSettings = useCallback(async () => {
    try {
      const response = await apiClient.getNotificationSettings();
      
      if (response.success && response.data) {
        setSettings(response.data as NotificationSettings);
      } else {
        // Fallback settings for development
        const fallbackSettings: NotificationSettings = {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          categories: {
            order: { enabled: true, email: true, push: true, sms: false },
            payment: { enabled: true, email: true, push: true, sms: true },
            inventory: { enabled: true, email: true, push: true, sms: false },
            system: { enabled: true, email: false, push: true, sms: false },
            marketing: { enabled: false, email: false, push: false, sms: false },
            security: { enabled: true, email: true, push: true, sms: true }
          }
        };
        setSettings(fallbackSettings);
      }
    } catch (err) {
      console.error('Failed to load notification settings:', err);
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read' as const, readAt: new Date().toISOString() }
            : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.markAllNotificationsAsRead();
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.status === 'unread' 
              ? { ...notif, status: 'read' as const, readAt: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const response = await apiClient.dismissNotification(notificationId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, status: 'dismissed' as const }
              : notif
          )
        );
      }
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500';
      case 'high': return 'border-l-4 border-orange-500';
      case 'normal': return 'border-l-4 border-blue-500';
      case 'low': return 'border-l-4 border-gray-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, [loadNotifications, loadSettings]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-gray-600">Stay updated with important alerts and messages</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={loadNotifications} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && settings && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Global Settings */}
              <div>
                <h4 className="font-medium mb-4">Global Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch checked={settings.emailNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receive browser push notifications</p>
                    </div>
                    <Switch checked={settings.pushNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <Switch checked={settings.smsNotifications} />
                  </div>
                </div>
              </div>

              {/* Category Settings */}
              <div>
                <h4 className="font-medium mb-4">Category Preferences</h4>
                <div className="space-y-4">
                  {Object.entries(settings.categories).map(([category, prefs]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium capitalize">{category}</h5>
                        <Switch checked={prefs.enabled} />
                      </div>
                      {prefs.enabled && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Switch checked={prefs.email} />
                            <span>Email</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch checked={prefs.push} />
                            <span>Push</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch checked={prefs.sms} />
                            <span>SMS</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            {notifications.length} notifications found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadNotifications} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications found</p>
              <p className="text-sm text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    notification.status === 'unread' ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-gray-50'
                  } ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm ${notification.status === 'unread' ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                          </h4>
                          <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNowLocal(notification.createdAt)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {notification.actionUrl && (
                              <Button size="sm" variant="outline">
                                {notification.actionText || 'View'}
                              </Button>
                            )}
                            {notification.status === 'unread' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissNotification(notification.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}