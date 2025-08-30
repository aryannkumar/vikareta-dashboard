'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  User, 
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  MapPin,
  Globe,
  Headphones,
  MessageSquare,
  Video,
  FileText
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

interface ContactMethod {
  id: string;
  type: 'phone' | 'email' | 'chat' | 'video' | 'ticket';
  title: string;
  description: string;
  value: string;
  availability: string;
  responseTime: string;
  isActive: boolean;
  icon: string;
}

interface SupportHours {
  day: string;
  hours: string;
  isToday: boolean;
  isOpen: boolean;
}

interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  attachments?: File[];
}

interface ContactStats {
  totalInquiries: number;
  averageResponseTime: string;
  satisfactionRate: number;
  activeAgents: number;
}

export default function ContactSupportPage() {
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [supportHours, setSupportHours] = useState<SupportHours[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });

  const { toast } = useToast();

  const categories = [
    'General Inquiry',
    'Technical Support',
    'Billing & Payments',
    'Account Issues',
    'Product Questions',
    'Partnership',
    'Bug Report',
    'Feature Request',
    'Other'
  ];

  const loadContactInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const [methodsResponse, hoursResponse, statsResponse] = await Promise.all([
        vikaretaApiClient.get('/support/contact-methods'),
        vikaretaApiClient.get('/support/hours'),
        vikaretaApiClient.get('/support/stats')
      ]);

      setContactMethods((methodsResponse.data as any).methods);
      setSupportHours((hoursResponse.data as any).hours);
      setStats(statsResponse.data as any);
    } catch (error) {
      console.error('Failed to load contact info:', error);
      toast({
        title: "Error",
        description: "Failed to load contact information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadContactInfo();
  }, [loadContactInfo]);

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await vikaretaApiClient.post('/support/contact', formData);
      
      toast({
        title: "Success",
        description: "Your message has been sent successfully. We'll get back to you soon!",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        priority: 'medium',
        message: ''
      });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-6 w-6" />;
      case 'email': return <Mail className="h-6 w-6" />;
      case 'chat': return <MessageCircle className="h-6 w-6" />;
      case 'video': return <Video className="h-6 w-6" />;
      case 'ticket': return <FileText className="h-6 w-6" />;
      default: return <Headphones className="h-6 w-6" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Contact Support</h1>
        <p className="text-gray-600 mt-2">
          Get help from our support team. We're here to assist you!
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInquiries.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAgents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Methods */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Methods</CardTitle>
              <CardDescription>Choose the best way to reach us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-lg border ${
                    method.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      method.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getMethodIcon(method.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{method.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                      <p className="text-sm font-medium text-gray-900">{method.value}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{method.availability}</span>
                        <span>Response: {method.responseTime}</span>
                      </div>
                    </div>
                    {method.isActive && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {supportHours.map((schedule) => (
                  <div
                    key={schedule.day}
                    className={`flex justify-between items-center p-2 rounded ${
                      schedule.isToday ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <span className={`font-medium ${
                      schedule.isToday ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {schedule.day}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{schedule.hours}</span>
                      {schedule.isOpen && (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          Open
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitContact} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone (Optional)
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value as any)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${getPriorityColor(formData.priority)}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please describe your inquiry in detail..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Info className="h-4 w-4" />
                    <span>We typically respond within 24 hours</span>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Help */}
      <Card>
        <CardHeader>
          <CardTitle>Need Immediate Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Documentation</h4>
              <p className="text-sm text-gray-600 mb-3">
                Browse our comprehensive guides and tutorials
              </p>
              <Button variant="outline" size="sm">
                View Docs
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Live Chat</h4>
              <p className="text-sm text-gray-600 mb-3">
                Chat with our support team in real-time
              </p>
              <Button variant="outline" size="sm">
                Start Chat
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Community</h4>
              <p className="text-sm text-gray-600 mb-3">
                Get help from other users in our community
              </p>
              <Button variant="outline" size="sm">
                Join Community
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}