'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Send, 
  Mail, 
  Phone, 
  Bell,
  Eye,
  Reply,
  Archive,
  Star,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'notification' | 'system';
  direction: 'inbound' | 'outbound';
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  recipient: {
    id: string;
    name: string;
    email: string;
  };
  relatedTo?: {
    type: 'order' | 'rfq' | 'customer' | 'supplier';
    id: string;
    title: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    url: string;
  }>;
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
}

interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  todayMessages: number;
  responseRate: number;
  averageResponseTime: number;
  activeConversations: number;
}

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadMessages = useCallback(async (p = 1, searchTerm = search, statusF = statusFilter, typeF = typeFilter, priorityF = priorityFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20 
      };
      
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusF !== 'all') params.status = statusF;
      if (typeF !== 'all') params.type = typeF;
      if (priorityF !== 'all') params.priority = priorityF;

      const response = await apiClient.getMessages(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        setMessages(data.messages || []);
        setPages(data.pagination?.pages || 0);
        setTotal(data.pagination?.total || 0);
      } else {
        setMessages([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err?.message || 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, priorityFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getCommunicationStats();
      
      if (response.success && response.data) {
        setStats(response.data as CommunicationStats);
      } else {
        setStats({
          totalMessages: 0,
          unreadMessages: 0,
          todayMessages: 0,
          responseRate: 0,
          averageResponseTime: 0,
          activeConversations: 0
        });
      }
    } catch (err) {
      console.error('Failed to load communication stats:', err);
      setStats({
        totalMessages: 0,
        unreadMessages: 0,
        todayMessages: 0,
        responseRate: 0,
        averageResponseTime: 0,
        activeConversations: 0
      });
    }
  }, []);

  const markAsRead = async (messageId: string) => {
    try {
      const response = await apiClient.markMessageAsRead(messageId);
      
      if (response.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'read', readAt: new Date().toISOString() }
            : msg
        ));
        loadStats();
      }
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const sendReply = async (messageId: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await apiClient.replyToMessage(messageId, {
        content: replyContent.trim()
      });
      
      if (response.success) {
        setReplyContent('');
        setSelectedMessage(null);
        loadMessages();
        loadStats();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
      setError('Failed to send reply');
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      const response = await apiClient.archiveMessage(messageId);
      
      if (response.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'archived' }
            : msg
        ));
        loadStats();
      }
    } catch (err) {
      console.error('Failed to archive message:', err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadMessages(1, search, statusFilter, typeFilter, priorityFilter);
  };

  const handleRefresh = () => {
    loadMessages(page, search, statusFilter, typeFilter, priorityFilter);
    loadStats();
  };

  useEffect(() => {
    loadMessages(1);
    loadStats();
  }, [loadMessages, loadStats]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'system': return <AlertCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
        <MessageSquare className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Messages Found</h3>
      <p className="text-muted-foreground mb-4">
        {search || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
          ? 'No messages match your current filters. Try adjusting your search criteria.'
          : 'You don\'t have any messages yet. Messages will appear here when customers contact you.'
        }
      </p>
      {(search || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all') && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setTypeFilter('all');
            setPriorityFilter('all');
            setPage(1);
            loadMessages(1, '', 'all', 'all', 'all');
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Messages</h3>
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">
            Manage your messages, notifications, and customer communications
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalMessages}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.unreadMessages}</div>
                  <div className="text-sm text-muted-foreground">Unread</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.todayMessages}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.responseRate.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatResponseTime(stats.averageResponseTime)}</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.activeConversations}</div>
                  <div className="text-sm text-muted-foreground">Active Chats</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search messages by subject, sender, or content..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
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
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="notification">Notification</option>
                <option value="system">System</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && messages.length === 0 ? (
            renderLoadingState()
          ) : error && messages.length === 0 ? (
            renderErrorState()
          ) : messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    message.status === 'unread' ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'unread') {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{message.subject}</h3>
                            {getTypeIcon(message.type)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>From: {message.sender.name}</span>
                            <span>•</span>
                            <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                            {message.relatedTo && (
                              <>
                                <span>•</span>
                                <span>Re: {message.relatedTo.type} #{message.relatedTo.id}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(message);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(message);
                            }}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveMessage(message.id);
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} messages
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadMessages(np, search, statusFilter, typeFilter, priorityFilter); 
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
                loadMessages(np, search, statusFilter, typeFilter, priorityFilter); 
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedMessage.subject}</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
                  ×
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>From: {selectedMessage.sender.name} ({selectedMessage.sender.email})</span>
                <Badge className={getPriorityColor(selectedMessage.priority)}>
                  {selectedMessage.priority}
                </Badge>
                <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                        <span className="text-sm">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Reply</h4>
                <Textarea
                  placeholder="Type your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => sendReply(selectedMessage.id)} disabled={!replyContent.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}