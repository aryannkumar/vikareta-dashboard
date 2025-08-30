'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  Link,
  Settings,
  Key,
  Globe,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  Truck,
  BarChart3,
  Cloud,
  Webhook,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'shipping' | 'analytics' | 'communication' | 'inventory' | 'accounting' | 'marketing';
  provider: string;
  logo?: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  isEnabled: boolean;
  connectedAt?: string;
  lastSync?: string;
  config: Record<string, any>;
  features: string[];
  webhookUrl?: string;
  apiKey?: string;
  credentials?: Record<string, string>;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('integrations');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[]
  });
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  useEffect(() => {
    loadIntegrationsData();
  }, []);

  const loadIntegrationsData = async () => {
    try {
      setIsLoading(true);
      const [integrationsResponse, webhooksResponse, apiKeysResponse] = await Promise.all([
        vikaretaApiClient.get('/integrations'),
        vikaretaApiClient.get('/integrations/webhooks'),
        vikaretaApiClient.get('/integrations/api-keys')
      ]);

      if (integrationsResponse.success) {
        setIntegrations(integrationsResponse.data as Integration[]);
      } else {
        // Initialize with popular integrations
        setIntegrations([
          {
            id: '1',
            name: 'Stripe',
            description: 'Accept payments online with Stripe',
            category: 'payment',
            provider: 'Stripe Inc.',
            status: 'disconnected',
            isEnabled: false,
            config: {},
            features: ['Credit Cards', 'Bank Transfers', 'Subscriptions', 'Invoicing']
          },
          {
            id: '2',
            name: 'PayPal',
            description: 'PayPal payment processing',
            category: 'payment',
            provider: 'PayPal Holdings',
            status: 'disconnected',
            isEnabled: false,
            config: {},
            features: ['PayPal Payments', 'Express Checkout', 'Recurring Payments']
          },
          {
            id: '3',
            name: 'FedEx',
            description: 'FedEx shipping integration',
            category: 'shipping',
            provider: 'FedEx Corporation',
            status: 'disconnected',
            isEnabled: false,
            config: {},
            features: ['Rate Calculation', 'Label Printing', 'Tracking', 'Pickup Scheduling']
          },
          {
            id: '4',
            name: 'Google Analytics',
            description: 'Web analytics and reporting',
            category: 'analytics',
            provider: 'Google LLC',
            status: 'disconnected',
            isEnabled: false,
            config: {},
            features: ['Traffic Analytics', 'E-commerce Tracking', 'Custom Reports']
          },
          {
            id: '5',
            name: 'Mailchimp',
            description: 'Email marketing automation',
            category: 'marketing',
            provider: 'Intuit Mailchimp',
            status: 'disconnected',
            isEnabled: false,
            config: {},
            features: ['Email Campaigns', 'Audience Management', 'Automation', 'Analytics']
          },
          {
            id: '6',
            name: 'Slack',
            description: 'Team communication and notifications',
            category: 'communication',
            provider: 'Slack Technologies',
            status: 'disconnected',
            isEnabled: false,
            config: {},
            features: ['Notifications', 'Order Alerts', 'Team Updates']
          },
          {
            id: '7',
            name: 'QuickBooks',
            description: 'Accounting and financial management',
            category: 'accounting',
            provider: 'Intuit Inc.',
            status: 'disconnected',
            isEnabled: false,
            config: {},
            features: ['Invoice Sync', 'Expense Tracking', 'Financial Reports', 'Tax Preparation']
          },
          {
            id: '8',
            name: 'Shopify',
            description: 'E-commerce platform integration',
            category: 'inventory',
            provider: 'Shopify Inc.',
            status: 'disconnected',
            isEnabled: false,
            config: {},
            features: ['Product Sync', 'Inventory Management', 'Order Import', 'Customer Data']
          }
        ]);
      }

      if (webhooksResponse.success) {
        setWebhooks(webhooksResponse.data as WebhookEndpoint[]);
      }

      if (apiKeysResponse.success) {
        setApiKeys(apiKeysResponse.data as ApiKey[]);
      }
    } catch (error) {
      console.error('Failed to load integrations data:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectIntegration = async (integrationId: string) => {
    try {
      const response = await vikaretaApiClient.post(`/integrations/${integrationId}/connect`);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Integration connected successfully",
        });
        loadIntegrationsData();
      } else {
        throw new Error(response.error?.message || 'Failed to connect integration');
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
      toast({
        title: "Error",
        description: "Failed to connect integration",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      const response = await vikaretaApiClient.post(`/integrations/${integrationId}/disconnect`);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Integration disconnected successfully",
        });
        loadIntegrationsData();
      } else {
        throw new Error(response.error?.message || 'Failed to disconnect integration');
      }
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect integration",
        variant: "destructive",
      });
    }
  };

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    try {
      const response = await vikaretaApiClient.put(`/integrations/${integrationId}`, { isEnabled: enabled });
      
      if (response.success) {
        setIntegrations(prev => prev.map(integration => 
          integration.id === integrationId ? { ...integration, isEnabled: enabled } : integration
        ));
        
        toast({
          title: "Success",
          description: `Integration ${enabled ? 'enabled' : 'disabled'} successfully`,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to update integration');
      }
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const response = await vikaretaApiClient.post('/integrations/api-keys', newApiKey);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "API key created successfully",
        });
        setShowApiKeyModal(false);
        setNewApiKey({ name: '', permissions: [] });
        loadIntegrationsData();
      } else {
        throw new Error(response.error?.message || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const handleCreateWebhook = async () => {
    try {
      const response = await vikaretaApiClient.post('/integrations/webhooks', newWebhook);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Webhook created successfully",
        });
        setShowWebhookModal(false);
        setNewWebhook({ name: '', url: '', events: [] });
        loadIntegrationsData();
      } else {
        throw new Error(response.error?.message || 'Failed to create webhook');
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await vikaretaApiClient.delete(`/integrations/api-keys/${keyId}`);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "API key deleted successfully",
        });
        loadIntegrationsData();
      } else {
        throw new Error(response.error?.message || 'Failed to delete API key');
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await vikaretaApiClient.delete(`/integrations/webhooks/${webhookId}`);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Webhook deleted successfully",
        });
        loadIntegrationsData();
      } else {
        throw new Error(response.error?.message || 'Failed to delete webhook');
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <CreditCard className="h-5 w-5" />;
      case 'shipping': return <Truck className="h-5 w-5" />;
      case 'analytics': return <BarChart3 className="h-5 w-5" />;
      case 'communication': return <MessageSquare className="h-5 w-5" />;
      case 'inventory': return <Database className="h-5 w-5" />;
      case 'accounting': return <BarChart3 className="h-5 w-5" />;
      case 'marketing': return <Mail className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredIntegrations = integrations.filter(integration => 
    selectedCategory === 'all' || integration.category === selectedCategory
  );

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">
            Connect your business with third-party services and manage API access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Config
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'integrations', label: 'Integrations', icon: Zap },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook },
            { id: 'api-keys', label: 'API Keys', icon: Key },
            { id: 'settings', label: 'Settings', icon: Settings }
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
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {['payment', 'shipping', 'analytics', 'communication', 'inventory', 'accounting', 'marketing'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getCategoryIcon(integration.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-gray-600">{integration.provider}</p>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{integration.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {integration.status === 'connected' && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {integration.connectedAt && (
                        <p>Connected: {formatDate(integration.connectedAt)}</p>
                      )}
                      {integration.lastSync && (
                        <p>Last sync: {formatDate(integration.lastSync)}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {integration.status === 'connected' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={integration.isEnabled}
                          onChange={(e) => handleToggleIntegration(integration.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="flex gap-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDisconnectIntegration(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleConnectIntegration(integration.id)}
                        >
                          <Link className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Webhook Endpoints</h2>
              <p className="text-gray-600">Receive real-time notifications about events in your account</p>
            </div>
            <Button onClick={() => setShowWebhookModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{webhook.name}</h3>
                        <Badge className={webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-mono">{webhook.url}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(webhook.url)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          <span className="font-mono">
                            {showSecrets[webhook.id] ? webhook.secret : '••••••••••••••••'}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowSecrets(prev => ({ ...prev, [webhook.id]: !prev[webhook.id] }))}
                          >
                            {showSecrets[webhook.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(webhook.secret)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span>Events: {webhook.events.join(', ')}</span>
                          {webhook.lastTriggered && (
                            <span>Last triggered: {formatDate(webhook.lastTriggered)}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-green-600">✓ {webhook.successCount} successful</span>
                          <span className="text-red-600">✗ {webhook.failureCount} failed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Webhook Modal */}
          {showWebhookModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Create Webhook</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="webhookName">Name</Label>
                    <Input
                      id="webhookName"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Webhook"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="webhookUrl">URL</Label>
                    <Input
                      id="webhookUrl"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com/webhook"
                    />
                  </div>
                  
                  <div>
                    <Label>Events</Label>
                    <div className="space-y-2 mt-2">
                      {['order.created', 'order.updated', 'payment.received', 'inventory.low'].map((event) => (
                        <div key={event} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newWebhook.events.includes(event)}
                            onChange={(e) => {
                              const events = e.target.checked
                                ? [...newWebhook.events, event]
                                : newWebhook.events.filter(e => e !== event);
                              setNewWebhook(prev => ({ ...prev, events }));
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm">{event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateWebhook} className="flex-1">
                      Create Webhook
                    </Button>
                    <Button variant="outline" onClick={() => setShowWebhookModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">API Keys</h2>
              <p className="text-gray-600">Manage API keys for programmatic access to your account</p>
            </div>
            <Button onClick={() => setShowApiKeyModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        <Badge className={apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          <span className="font-mono">
                            {showSecrets[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowSecrets(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                          >
                            {showSecrets[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span>Created: {formatDate(apiKey.createdAt)}</span>
                          {apiKey.lastUsed && (
                            <span>Last used: {formatDate(apiKey.lastUsed)}</span>
                          )}
                          {apiKey.expiresAt && (
                            <span>Expires: {formatDate(apiKey.expiresAt)}</span>
                          )}
                        </div>
                        
                        <div>
                          <span>Permissions: {apiKey.permissions.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create API Key Modal */}
          {showApiKeyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Create API Key</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="apiKeyName">Name</Label>
                    <Input
                      id="apiKeyName"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My API Key"
                    />
                  </div>
                  
                  <div>
                    <Label>Permissions</Label>
                    <div className="space-y-2 mt-2">
                      {['read:orders', 'write:orders', 'read:products', 'write:products', 'read:customers', 'write:customers'].map((permission) => (
                        <div key={permission} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newApiKey.permissions.includes(permission)}
                            onChange={(e) => {
                              const permissions = e.target.checked
                                ? [...newApiKey.permissions, permission]
                                : newApiKey.permissions.filter(p => p !== permission);
                              setNewApiKey(prev => ({ ...prev, permissions }));
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-mono">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateApiKey} className="flex-1">
                      Create API Key
                    </Button>
                    <Button variant="outline" onClick={() => setShowApiKeyModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure global settings for integrations and API access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Rate Limiting</h4>
                  <p className="text-sm text-gray-600">
                    Enable rate limiting for API requests
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Webhook Retries</h4>
                  <p className="text-sm text-gray-600">
                    Automatically retry failed webhook deliveries
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">API Logging</h4>
                  <p className="text-sm text-gray-600">
                    Log all API requests for debugging
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <Textarea
                  id="ipWhitelist"
                  placeholder="Enter IP addresses (one per line)"
                  rows={4}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Restrict API access to specific IP addresses
                </p>
              </div>
              
              <div>
                <Label htmlFor="corsOrigins">CORS Origins</Label>
                <Textarea
                  id="corsOrigins"
                  placeholder="Enter allowed origins (one per line)"
                  rows={3}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Configure Cross-Origin Resource Sharing settings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}