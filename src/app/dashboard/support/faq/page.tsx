'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  BookOpen,
  Users,
  TrendingUp
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  priority: 'high' | 'medium' | 'low';
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface FAQCategory {
  id: string;
  name: string;
  description: string;
  faqCount: number;
  icon: string;
}

interface FAQStats {
  totalFAQs: number;
  publishedFAQs: number;
  totalViews: number;
  averageHelpfulness: number;
  topCategories: Array<{
    category: string;
    count: number;
    views: number;
  }>;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [stats, setStats] = useState<FAQStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'categories'>('list');

  const { toast } = useToast();

  const loadFAQs = useCallback(async () => {
    try {
      setIsLoading(true);
      const [faqsResponse, categoriesResponse, statsResponse] = await Promise.all([
        vikaretaApiClient.get('/support/faqs', {
          params: {
            search: searchQuery,
            category: selectedCategory !== 'all' ? selectedCategory : undefined
          }
        }),
        vikaretaApiClient.get('/support/faq-categories'),
        vikaretaApiClient.get('/support/faqs/stats')
      ]);

      setFaqs((faqsResponse.data as any).faqs);
      setCategories((categoriesResponse.data as any).categories);
      setStats(statsResponse.data as any);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, toast]);

  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  const handleCreateFAQ = async (data: Partial<FAQ>) => {
    try {
      await vikaretaApiClient.post('/support/faqs', data);
      toast({
        title: "Success",
        description: "FAQ created successfully",
      });
      setShowCreateModal(false);
      loadFAQs();
    } catch (error) {
      console.error('Failed to create FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to create FAQ",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFAQ = async (id: string, data: Partial<FAQ>) => {
    try {
      await vikaretaApiClient.put(`/support/faqs/${id}`, data);
      toast({
        title: "Success",
        description: "FAQ updated successfully",
      });
      setEditingFAQ(null);
      loadFAQs();
    } catch (error) {
      console.error('Failed to update FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to update FAQ",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await vikaretaApiClient.delete(`/support/faqs/${id}`);
      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
      loadFAQs();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const handleToggleExpand = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading && faqs.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600 mt-1">
            Manage frequently asked questions and help content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'categories' : 'list')}
          >
            {viewMode === 'list' ? 'Category View' : 'List View'}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New FAQ
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HelpCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total FAQs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFAQs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publishedFAQs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ThumbsUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Helpfulness</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageHelpfulness.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name} ({category.faqCount})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'categories' ? (
        /* Categories View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.name}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category.faqCount} FAQs</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    View FAQs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleToggleExpand(faq.id)}
                        className="flex items-center gap-2 text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{faq.category}</Badge>
                      {getPriorityBadge(faq.priority)}
                      {getStatusBadge(faq.status)}
                    </div>
                    
                    {expandedFAQ === faq.id && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {faq.viewCount} views
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {faq.helpfulCount} helpful
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="h-4 w-4" />
                        {faq.notHelpfulCount} not helpful
                      </div>
                      <span>Updated {formatDate(faq.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingFAQ(faq)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteFAQ(faq.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Top Categories */}
      {stats?.topCategories && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{category.count} FAQs</span>
                    <span>{category.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}