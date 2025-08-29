'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  LifeBuoy,
  Plus, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Tag,
  FileText,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'product' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  messages: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      type: 'customer' | 'agent';
    };
    timestamp: string;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      size: number;
    }>;
  }>;
  tags: string[];
  satisfaction?: {
    rating: number;
    feedback?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  satisfactionRating: number;
  ticketsToday: number;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledge'>('tickets');

  const loadTickets = useCallback(async (p = 1, searchT = searchTerm, statusF = statusFilter, priorityF = priorityFilter, categoryF = categoryFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20 
      };
      
      if (searchT.trim()) params.search = searchT.trim();
      if (statusF !== 'all' && statusF) params.status = statusF;
      if (priorityF !== 'all' && priorityF) params.priority = priorityF;
      if (categoryF !== 'all' && categoryF) params.category = categoryF;

      const response = await apiClient.getSupportTickets(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setTickets(data);
          setPages(1);
          setTotal(data.length);
        } else {
          setTickets(data.tickets || data.data || []);
          setPages(data.pagination?.pages || 0);
          setTotal(data.pagination?.total || 0);
        }
      } else {
        setTickets([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load support tickets:', err);
      setError(err?.message || 'Failed to load support tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getSupportStats();
      
      if (response.success && response.data) {
        setStats(response.data as SupportStats);
      } else {
        // Calculate stats from current tickets if API doesn't exist
        const openTickets = tickets.filter(t => t.status === 'open').length;
        const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
        const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
        
        setStats({
          totalTickets: tickets.length,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          averageResponseTime: 2.5, // Default value in hours
          averageResolutionTime: 24, // Default value in hours
          satisfactionRating: 4.8, // Default rating
          ticketsToday: Math.floor(tickets.length * 0.1) // Estimate
        });
      }
    } catch (err) {
      console.error('Failed to load support stats:', err);
      // Use fallback stats
      setStats({
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        averageResponseTime: 0,
        averageResolutionTime: 0,
        satisfactionRating: 0,
        ticketsToday: 0
      });
    }
  }, [tickets]);

  const loadKnowledgeBase = useCallback(async () => {
    try {
      const response = await apiClient.getKnowledgeBase({ limit: 10 });
      
      if (response.success && response.data) {
        setKnowledgeBase(response.data as KnowledgeBaseArticle[]);
      } else {
        setKnowledgeBase([]);
      }
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
      setKnowledgeBase([]);
    }
  }, []);

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateSupportTicketStatus(ticketId, newStatus as 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed');
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Ticket status updated successfully.',
        });
        loadTickets();
        loadStats();
      } else {
        throw new Error(response.error?.message || 'Failed to update ticket status');
      }
    } catch (error: any) {
      console.error('Failed to update ticket status:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update ticket status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadTickets(1, searchTerm, statusFilter, priorityFilter, categoryFilter);
  };

  const handleRefresh = () => {
    if (activeTab === 'tickets') {
      loadTickets(page, searchTerm, statusFilter, priorityFilter, categoryFilter);
      loadStats();
    } else {
      loadKnowledgeBase();
    }
  };

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets(1);
    } else {
      loadKnowledgeBase();
    }
  }, [activeTab, loadTickets, loadKnowledgeBase]);

  useEffect(() => {
    if (tickets.length > 0) {
      loadStats();
    }
  }, [tickets, loadStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'waiting_response': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'waiting_response': return <MessageSquare className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <LifeBuoy className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {activeTab === 'tickets' ? 'No Support Tickets Found' : 'No Knowledge Base Articles Found'}
      </h3>
      <p className="text-muted-foreground mb-4">
        {activeTab === 'tickets' 
          ? (searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
              ? 'No tickets match your current filters. Try adjusting your search criteria.'
              : 'You haven\'t created any support tickets yet. Start by creating your first ticket.')
          : 'No knowledge base articles available at the moment.'
        }
      </p>
      {activeTab === 'tickets' && (
        (searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') ? (
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setCategoryFilter('all');
              setPage(1);
              loadTickets(1, '', 'all', 'all', 'all');
            }}
          >
            Clear Filters
          </Button>
        ) : (
          <Link href="/dashboard/support/tickets/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </Link>
        )
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">
            Get help and manage support tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/support/tickets/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LifeBuoy className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalTickets}</div>
                  <div className="text-sm text-muted-foreground">Total Tickets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.openTickets}</div>
                  <div className="text-sm text-muted-foreground">Open Tickets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.resolvedTickets}</div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.satisfactionRating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tickets'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Support Tickets
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'knowledge'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Knowledge Base
        </button>
      </div>

      {activeTab === 'tickets' && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets by subject, description, or ticket number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_response">Waiting Response</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="product">Product</option>
                    <option value="general">General</option>
                  </select>
                  
                  <Button onClick={handleSearch} disabled={loading}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && tickets.length === 0 ? (
                renderLoadingState()
              ) : error && tickets.length === 0 ? (
                renderErrorState()
              ) : tickets.length === 0 ? (
                renderEmptyState()
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getStatusIcon(ticket.status)}
                            </div>
                            <div>
                              <h3 className="font-medium">{ticket.ticketNumber} - {ticket.subject}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{ticket.customer.name}</span>
                                <span className="capitalize">{ticket.category}</span>
                                <span>{formatDate(ticket.createdAt)}</span>
                                {ticket.assignedTo && (
                                  <span>Assigned to {ticket.assignedTo.name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority.toUpperCase()}
                              </Badge>
                              <div className="text-sm text-muted-foreground mt-1">
                                {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                            
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link href={`/dashboard/support/tickets/${ticket.id}`} className="flex items-center w-full">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Add Reply
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Mark In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} tickets
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={page <= 1 || loading} 
                  onClick={() => { 
                    const np = page - 1; 
                    setPage(np); 
                    loadTickets(np, searchTerm, statusFilter, priorityFilter, categoryFilter); 
                  }}
                >
                  Previous
                </Button>
                <div className="text-sm px-3 py-2">
                  Page {page} of {pages}
                </div>
                <Button 
                  variant="outline" 
                  disabled={page >= pages || loading} 
                  onClick={() => { 
                    const np = page + 1; 
                    setPage(np); 
                    loadTickets(np, searchTerm, statusFilter, priorityFilter, categoryFilter); 
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'knowledge' && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              renderLoadingState()
            ) : knowledgeBase.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4">
                {knowledgeBase.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{article.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{article.category}</span>
                              <span>{article.views} views</span>
                              <span>{formatDate(article.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span>{article.helpful}</span>
                              <ThumbsDown className="h-4 w-4 text-red-600" />
                              <span>{article.notHelpful}</span>
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Article
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/support/tickets/new">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Plus className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-medium mb-2">Create Ticket</h3>
                <p className="text-sm text-muted-foreground">Submit a new support request</p>
              </div>
            </Link>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <MessageSquare className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="font-medium mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our support team</p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Phone className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="font-medium mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground">Call us for urgent issues</p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Mail className="h-8 w-8 text-purple-500 mb-3" />
              <h3 className="font-medium mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground">Send us an email</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}