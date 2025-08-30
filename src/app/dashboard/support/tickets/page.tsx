'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare,
  User,
  Calendar,
  RefreshCw,
  Eye,
  Edit
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

// Helper function for relative time
const formatDistanceToNow = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
};

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  messages: Array<{
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      type: 'customer' | 'support';
    };
    createdAt: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
  }>;
}

interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const response = await apiClient.getSupportTickets(params);

      if (response.success && response.data) {
        // Handle both array response and object with tickets property
        if (Array.isArray(response.data)) {
          setTickets(response.data as SupportTicket[]);
          setStats(null);
        } else {
          const data = response.data as any;
          setTickets(data.tickets || []);
          setStats(data.stats || null);
        }
      } else {
        // Fallback data for development
        const fallbackTickets: SupportTicket[] = [
          {
            id: '1',
            title: 'Unable to process payment for order #12345',
            description: 'Customer is experiencing issues with payment processing. The payment gateway returns an error when trying to complete the transaction.',
            status: 'open',
            priority: 'high',
            category: 'payment',
            createdAt: '2024-01-16T10:30:00Z',
            updatedAt: '2024-01-16T10:30:00Z',
            customer: {
              id: 'c1',
              name: 'John Smith',
              email: 'john.smith@example.com'
            },
            messages: [
              {
                id: 'm1',
                content: 'I am unable to complete my payment for order #12345. The page keeps showing an error message.',
                sender: {
                  id: 'c1',
                  name: 'John Smith',
                  type: 'customer'
                },
                createdAt: '2024-01-16T10:30:00Z'
              }
            ]
          },
          {
            id: '2',
            title: 'Product delivery delayed - need update',
            description: 'Customer inquiring about delayed delivery for their recent order. Expected delivery was 3 days ago.',
            status: 'in-progress',
            priority: 'medium',
            category: 'shipping',
            createdAt: '2024-01-15T14:20:00Z',
            updatedAt: '2024-01-16T09:15:00Z',
            assignedTo: {
              id: 's1',
              name: 'Sarah Johnson',
              email: 'sarah.j@support.com'
            },
            customer: {
              id: 'c2',
              name: 'ABC Manufacturing',
              email: 'orders@abc-mfg.com'
            },
            messages: [
              {
                id: 'm2',
                content: 'Our order was supposed to arrive 3 days ago. Can you provide an update on the shipping status?',
                sender: {
                  id: 'c2',
                  name: 'ABC Manufacturing',
                  type: 'customer'
                },
                createdAt: '2024-01-15T14:20:00Z'
              },
              {
                id: 'm3',
                content: 'I am looking into your shipment status and will provide an update within 2 hours.',
                sender: {
                  id: 's1',
                  name: 'Sarah Johnson',
                  type: 'support'
                },
                createdAt: '2024-01-16T09:15:00Z'
              }
            ]
          },
          {
            id: '3',
            title: 'Account verification issues',
            description: 'Customer unable to complete account verification process. Documents uploaded but verification is stuck.',
            status: 'resolved',
            priority: 'low',
            category: 'account',
            createdAt: '2024-01-14T11:45:00Z',
            updatedAt: '2024-01-15T16:30:00Z',
            assignedTo: {
              id: 's2',
              name: 'Mike Chen',
              email: 'mike.c@support.com'
            },
            customer: {
              id: 'c3',
              name: 'Global Solutions Ltd',
              email: 'admin@global.com'
            },
            messages: [
              {
                id: 'm4',
                content: 'I uploaded my verification documents 2 days ago but my account is still not verified.',
                sender: {
                  id: 'c3',
                  name: 'Global Solutions Ltd',
                  type: 'customer'
                },
                createdAt: '2024-01-14T11:45:00Z'
              },
              {
                id: 'm5',
                content: 'Your account has been successfully verified. You should now have full access to all features.',
                sender: {
                  id: 's2',
                  name: 'Mike Chen',
                  type: 'support'
                },
                createdAt: '2024-01-15T16:30:00Z'
              }
            ]
          }
        ];

        const fallbackStats: TicketStats = {
          totalTickets: 45,
          openTickets: 12,
          inProgressTickets: 8,
          resolvedTickets: 25,
          averageResponseTime: 4.5,
          customerSatisfaction: 4.2
        };

        setTickets(fallbackTickets);
        setStats(fallbackStats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load support tickets');
      setTickets([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  const createTicket = async () => {
    try {
      const response = await apiClient.createSupportTicket({
        ...newTicket,
        priority: newTicket.priority as 'low' | 'medium' | 'high' | 'urgent'
      });
      
      if (response.success) {
        setShowCreateDialog(false);
        setNewTicket({
          title: '',
          description: '',
          priority: 'medium',
          category: 'general'
        });
        loadTickets();
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const response = await apiClient.updateSupportTicket(ticketId, { 
        status: status as 'open' | 'in-progress' | 'resolved' | 'closed' 
      });
      
      if (response.success) {
        loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: status as any });
        }
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

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
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-gray-600">Manage customer support requests and inquiries</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Create a new support ticket for customer assistance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Detailed description of the issue"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="shipping">Shipping</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createTicket}>
                  Create Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                All time tickets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.openTickets}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inProgressTickets} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageResponseTime}h</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customerSatisfaction}/5</div>
              <p className="text-xs text-muted-foreground">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadTickets} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>
              {tickets.length} tickets found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadTickets} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No support tickets found</p>
                <p className="text-sm text-gray-400">Create a new ticket to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{ticket.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {ticket.customer.name} • {formatDistanceToNow(ticket.createdAt)} ago
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>#{ticket.id}</span>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-3 h-3" />
                        <span>{ticket.messages.length}</span>
                        {ticket.assignedTo && (
                          <>
                            <User className="w-3 h-3 ml-2" />
                            <span>{ticket.assignedTo.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>
              {selectedTicket ? `Ticket #${selectedTicket.id}` : 'Select a ticket to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-6">
                {/* Ticket Header */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{selectedTicket.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Created by {selectedTicket.customer.name} • {formatDate(selectedTicket.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                </div>

                {/* Status Actions */}
                <div className="flex space-x-2">
                  {selectedTicket.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in-progress')}
                    >
                      Start Working
                    </Button>
                  )}
                  {selectedTicket.status === 'in-progress' && (
                    <Button
                      size="sm"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {selectedTicket.status === 'resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                    >
                      Close Ticket
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-medium mb-3">Conversation</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender.type === 'customer'
                            ? 'bg-gray-100 ml-4'
                            : 'bg-blue-100 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{message.sender.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(message.createdAt)} ago
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <div>
                  <Textarea
                    placeholder="Type your reply..."
                    rows={3}
                    className="mb-2"
                  />
                  <Button size="sm">
                    Send Reply
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a ticket to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}