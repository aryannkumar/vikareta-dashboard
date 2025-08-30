'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    MessageSquare,
    Plus,
    Search,
    Send,
    Reply,
    Archive,
    Star,
    Clock,
    User,
    Building,
    RefreshCw,
    Eye,
    MoreHorizontal
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

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

interface Message {
    id: string;
    subject: string;
    content: string;
    sender: {
        id: string;
        name: string;
        email: string;
        type: 'customer' | 'supplier' | 'internal';
        company?: string;
    };
    recipient: {
        id: string;
        name: string;
        email: string;
    };
    status: 'unread' | 'read' | 'replied' | 'archived';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    type: 'email' | 'sms' | 'notification' | 'system';
    createdAt: string;
    updatedAt: string;
    relatedTo?: {
        type: 'order' | 'rfq' | 'quote' | 'customer' | 'supplier';
        id: string;
        title: string;
    };
    attachments?: Array<{
        id: string;
        name: string;
        url: string;
        size: number;
    }>;
    thread?: Array<{
        id: string;
        content: string;
        sender: {
            id: string;
            name: string;
            type: 'customer' | 'supplier' | 'internal';
        };
        createdAt: string;
    }>;
}

interface MessageStats {
    totalMessages: number;
    unreadMessages: number;
    todayMessages: number;
    responseRate: number;
    averageResponseTime: number;
    activeConversations: number;
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [stats, setStats] = useState<MessageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [showComposeDialog, setShowComposeDialog] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [replyingToMessage, setReplyingToMessage] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [bulkActions, setBulkActions] = useState({
        selectedIds: new Set<string>(),
        isSelecting: false
    });
    const [newMessage, setNewMessage] = useState({
        to: '',
        subject: '',
        content: '',
        type: 'email',
        priority: 'normal'
    });
    const { toast } = useToast();

    const loadMessages = useCallback(async (page = 1, append = false) => {
        try {
            if (!append) setLoading(true);
            setError(null);

            const params: any = {
                page,
                limit: pagination.limit
            };
            if (searchTerm.trim()) params.search = searchTerm.trim();
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.type = typeFilter;
            if (priorityFilter !== 'all') params.priority = priorityFilter;

            // Load messages and stats in parallel for better performance
            const [messagesResponse, statsResponse] = await Promise.all([
                apiClient.getMessages(params),
                apiClient.getCommunicationStats()
            ]);

            if (messagesResponse.success && messagesResponse.data) {
                // Handle both array response and object with messages property
                let newMessages: Message[] = [];
                let totalCount = 0;
                
                if (Array.isArray(messagesResponse.data)) {
                    newMessages = messagesResponse.data as Message[];
                    totalCount = newMessages.length;
                } else {
                    const data = messagesResponse.data as any;
                    newMessages = data.messages || data.data || [];
                    totalCount = data.total || data.pagination?.total || newMessages.length;
                }

                if (append) {
                    setMessages(prev => [...prev, ...newMessages]);
                } else {
                    setMessages(newMessages);
                }

                setPagination(prev => ({
                    ...prev,
                    page,
                    total: totalCount,
                    hasMore: newMessages.length === pagination.limit
                }));
            } else {
                // Fallback data for development
                const fallbackMessages: Message[] = [
                    {
                        id: '1',
                        subject: 'Order #12345 - Payment Confirmation Required',
                        content: 'Hello, we need confirmation for the payment method for your recent order #12345. Please reply with your preferred payment option.',
                        sender: {
                            id: 'c1',
                            name: 'John Smith',
                            email: 'john.smith@example.com',
                            type: 'customer',
                            company: 'ABC Manufacturing'
                        },
                        recipient: {
                            id: 'u1',
                            name: 'Support Team',
                            email: 'support@vikareta.com'
                        },
                        status: 'unread',
                        priority: 'high',
                        type: 'email',
                        createdAt: '2024-01-16T10:30:00Z',
                        updatedAt: '2024-01-16T10:30:00Z',
                        relatedTo: {
                            type: 'order',
                            id: '12345',
                            title: 'Industrial Equipment Order'
                        }
                    },
                    {
                        id: '2',
                        subject: 'RFQ Response - Steel Pipes Quotation',
                        content: 'Thank you for your RFQ. We are pleased to provide our quotation for the steel pipes as requested. Please find the details attached.',
                        sender: {
                            id: 's1',
                            name: 'Steel Corp Ltd',
                            email: 'sales@steelcorp.com',
                            type: 'supplier',
                            company: 'Steel Corp Ltd'
                        },
                        recipient: {
                            id: 'u1',
                            name: 'Procurement Team',
                            email: 'procurement@vikareta.com'
                        },
                        status: 'read',
                        priority: 'normal',
                        type: 'email',
                        createdAt: '2024-01-15T14:20:00Z',
                        updatedAt: '2024-01-16T09:15:00Z',
                        relatedTo: {
                            type: 'rfq',
                            id: 'rfq-456',
                            title: 'Steel Pipes RFQ'
                        }
                    },
                    {
                        id: '3',
                        subject: 'Welcome to Vikareta Platform',
                        content: 'Welcome to Vikareta! Your account has been successfully created. You can now start exploring our platform and connect with suppliers.',
                        sender: {
                            id: 'system',
                            name: 'Vikareta System',
                            email: 'noreply@vikareta.com',
                            type: 'internal'
                        },
                        recipient: {
                            id: 'c2',
                            name: 'New User',
                            email: 'newuser@example.com'
                        },
                        status: 'read',
                        priority: 'low',
                        type: 'notification',
                        createdAt: '2024-01-14T11:45:00Z',
                        updatedAt: '2024-01-14T11:45:00Z'
                    }
                ];

                const fallbackStats: MessageStats = {
                    totalMessages: 156,
                    unreadMessages: 23,
                    todayMessages: 12,
                    responseRate: 94.5,
                    averageResponseTime: 2.3,
                    activeConversations: 18
                };

                setMessages(fallbackMessages);
            }

            // Load stats from separate response or fallback
            if (statsResponse?.success && statsResponse.data) {
                setStats(statsResponse.data as MessageStats);
            } else {
                const fallbackStats: MessageStats = {
                    totalMessages: 156,
                    unreadMessages: 23,
                    todayMessages: 12,
                    responseRate: 94.5,
                    averageResponseTime: 2.3,
                    activeConversations: 18
                };
                setStats(fallbackStats);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load messages');
            setMessages([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, typeFilter, priorityFilter]);

    const sendMessage = async () => {
        if (!newMessage.to || !newMessage.subject || !newMessage.content) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        try {
            setError(null);
            setSendingMessage(true);
            const response = await apiClient.sendMessage({
                to: newMessage.to,
                subject: newMessage.subject,
                content: newMessage.content,
                type: newMessage.type as 'email' | 'sms' | 'notification',
                priority: newMessage.priority as 'low' | 'normal' | 'high' | 'urgent'
            });

            if (response.success) {
                toast({
                    title: "Message Sent",
                    description: "Your message has been sent successfully"
                });
                setShowComposeDialog(false);
                setNewMessage({
                    to: '',
                    subject: '',
                    content: '',
                    type: 'email',
                    priority: 'normal'
                });
                // Refresh messages to show the new message
                await loadMessages(1, false);
            } else {
                toast({
                    title: "Send Failed",
                    description: response.error?.message || 'Failed to send message',
                    variant: "destructive"
                });
            }
        } catch (err) {
            toast({
                title: "Send Failed",
                description: err instanceof Error ? err.message : 'Failed to send message',
                variant: "destructive"
            });
            console.error('Failed to send message:', err);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleBulkMarkAsRead = async () => {
        if (bulkActions.selectedIds.size === 0) return;

        try {
            const selectedIds = Array.from(bulkActions.selectedIds);
            await Promise.all(selectedIds.map(id => apiClient.markMessageAsRead(id)));
            
            toast({
                title: "Messages Updated",
                description: `${selectedIds.length} messages marked as read`
            });
            
            setBulkActions({ selectedIds: new Set(), isSelecting: false });
            await loadMessages(1, false);
        } catch (err) {
            toast({
                title: "Update Failed",
                description: "Failed to update messages",
                variant: "destructive"
            });
        }
    };

    const handleBulkArchive = async () => {
        if (bulkActions.selectedIds.size === 0) return;

        try {
            const selectedIds = Array.from(bulkActions.selectedIds);
            await Promise.all(selectedIds.map(id => apiClient.archiveMessage(id)));
            
            toast({
                title: "Messages Archived",
                description: `${selectedIds.length} messages archived`
            });
            
            setBulkActions({ selectedIds: new Set(), isSelecting: false });
            await loadMessages(1, false);
        } catch (err) {
            toast({
                title: "Archive Failed",
                description: "Failed to archive messages",
                variant: "destructive"
            });
        }
    };

    const loadMoreMessages = async () => {
        if (!pagination.hasMore || loading) return;
        await loadMessages(pagination.page + 1, true);
    };

    const refreshMessages = async () => {
        setIsRefreshing(true);
        try {
            await loadMessages(1, false);
            toast({
                title: "Messages Refreshed",
                description: "Latest messages loaded"
            });
        } catch (err) {
            toast({
                title: "Refresh Failed",
                description: "Failed to refresh messages",
                variant: "destructive"
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    const replyToMessage = async (messageId: string) => {
        if (!replyContent.trim()) {
            setError('Please enter a reply message');
            return;
        }

        try {
            setError(null);
            setReplyingToMessage(messageId);
            const response = await apiClient.replyToMessage(messageId, {
                content: replyContent
            });

            if (response.success) {
                setReplyContent('');
                await loadMessages();
                if (selectedMessage) {
                    // Refresh selected message to show new reply
                    const updatedResponse = await apiClient.getMessage(messageId);
                    if (updatedResponse.success) {
                        setSelectedMessage(updatedResponse.data as Message);
                    }
                }
            } else {
                setError(response.error?.message || 'Failed to send reply');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reply');
            console.error('Failed to reply to message:', err);
        } finally {
            setReplyingToMessage(null);
        }
    };

    const markAsRead = async (messageId: string) => {
        try {
            await apiClient.markMessageAsRead(messageId);
            loadMessages();
        } catch (err) {
            console.error('Failed to mark message as read:', err);
        }
    };

    const archiveMessage = async (messageId: string) => {
        try {
            await apiClient.archiveMessage(messageId);
            loadMessages();
            if (selectedMessage?.id === messageId) {
                setSelectedMessage(null);
            }
        } catch (err) {
            console.error('Failed to archive message:', err);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'unread': return 'bg-blue-100 text-blue-800';
            case 'read': return 'bg-gray-100 text-gray-800';
            case 'replied': return 'bg-green-100 text-green-800';
            case 'archived': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSenderIcon = (type: string) => {
        switch (type) {
            case 'customer': return <User className="w-4 h-4" />;
            case 'supplier': return <Building className="w-4 h-4" />;
            case 'internal': return <MessageSquare className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    useEffect(() => {
        loadMessages(1, false);
    }, [searchTerm, statusFilter, typeFilter, priorityFilter]);

    // WebSocket real-time updates
    useEffect(() => {
        // Connect to WebSocket for real-time updates
        apiClient.connectWebSocket();

        // Listen for new messages
        const unsubscribeNewMessage = apiClient.onWebSocketEvent('new_message', (message: Message) => {
            setMessages(prev => [message, ...prev]);
            setStats(prev => prev ? { ...prev, totalMessages: prev.totalMessages + 1, unreadMessages: prev.unreadMessages + 1 } : null);
            
            toast({
                title: "New Message",
                description: `From ${message.sender.name}: ${message.subject}`,
            });
        });

        // Listen for message status updates
        const unsubscribeMessageUpdate = apiClient.onWebSocketEvent('message_updated', (updatedMessage: Message) => {
            setMessages(prev => prev.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
            ));
        });

        // Listen for stats updates
        const unsubscribeStatsUpdate = apiClient.onWebSocketEvent('communication_stats', (newStats: MessageStats) => {
            setStats(newStats);
        });

        return () => {
            unsubscribeNewMessage();
            unsubscribeMessageUpdate();
            unsubscribeStatsUpdate();
            apiClient.disconnectWebSocket();
        };
    }, [toast]);

    // Auto-refresh messages every 30 seconds as fallback
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading && !sendingMessage) {
                loadMessages(1, false);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [loading, sendingMessage]);

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
                    <h1 className="text-3xl font-bold">Messages</h1>
                    <p className="text-gray-600">Manage communications with customers and suppliers</p>
                </div>

                <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Compose Message
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Compose New Message</DialogTitle>
                            <DialogDescription>
                                Send a message to customers, suppliers, or team members
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">To</label>
                                <Input
                                    value={newMessage.to}
                                    onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                                    placeholder="Email address or user ID"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Subject</label>
                                <Input
                                    value={newMessage.subject}
                                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                                    placeholder="Message subject"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Message</label>
                                <Textarea
                                    value={newMessage.content}
                                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                                    placeholder="Type your message here..."
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <Select value={newMessage.type} onValueChange={(value) => setNewMessage({ ...newMessage, type: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="sms">SMS</SelectItem>
                                            <SelectItem value="notification">Notification</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select value={newMessage.priority} onValueChange={(value) => setNewMessage({ ...newMessage, priority: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={sendMessage} disabled={sendingMessage}>
                                    <Send className="w-4 h-4 mr-2" />
                                    {sendingMessage ? 'Sending...' : 'Send Message'}
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
                            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMessages}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.todayMessages} today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.unreadMessages}</div>
                            <p className="text-xs text-muted-foreground">
                                Require attention
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                            <Reply className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.responseRate}%</div>
                            <p className="text-xs text-muted-foreground">
                                Average response rate
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
                                {stats.activeConversations} active chats
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
                                    placeholder="Search messages..."
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
                                <SelectItem value="replied">Replied</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="notification">Notification</SelectItem>
                                <SelectItem value="system">System</SelectItem>
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
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={() => loadMessages()} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Messages List and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Messages</CardTitle>
                        <CardDescription>
                            {messages.length} messages found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <div className="text-center py-8">
                                <p className="text-red-600 mb-4">{error}</p>
                                <Button onClick={() => loadMessages()} variant="outline">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No messages found</p>
                                <p className="text-sm text-gray-400">Start a conversation to see messages here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedMessage?.id === message.id ? 'border-blue-500 bg-blue-50' :
                                            message.status === 'unread' ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => {
                                            setSelectedMessage(message);
                                            if (message.status === 'unread') {
                                                markAsRead(message.id);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                {getSenderIcon(message.sender.type)}
                                                <div>
                                                    <p className="font-medium text-sm">{message.sender.name}</p>
                                                    {message.sender.company && (
                                                        <p className="text-xs text-gray-500">{message.sender.company}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                                                    {message.priority}
                                                </Badge>
                                                <Badge className={`text-xs ${getStatusColor(message.status)}`}>
                                                    {message.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <h4 className={`text-sm mb-1 ${message.status === 'unread' ? 'font-semibold' : 'font-medium'}`}>
                                            {message.subject}
                                        </h4>
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                            {message.content}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{formatDistanceToNowLocal(message.createdAt)}</span>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {message.type}
                                                </Badge>
                                                {message.relatedTo && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {message.relatedTo.type}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Message Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Message Details</CardTitle>
                        <CardDescription>
                            {selectedMessage ? selectedMessage.subject : 'Select a message to view details'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedMessage ? (
                            <div className="space-y-6">
                                {/* Message Header */}
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            {getSenderIcon(selectedMessage.sender.type)}
                                            <div>
                                                <p className="font-medium">{selectedMessage.sender.name}</p>
                                                <p className="text-sm text-gray-600">{selectedMessage.sender.email}</p>
                                                {selectedMessage.sender.company && (
                                                    <p className="text-sm text-gray-500">{selectedMessage.sender.company}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Badge className={getPriorityColor(selectedMessage.priority)}>
                                                {selectedMessage.priority}
                                            </Badge>
                                            <Badge className={getStatusColor(selectedMessage.status)}>
                                                {selectedMessage.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {formatDate(selectedMessage.createdAt)}
                                    </p>
                                    {selectedMessage.relatedTo && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium">Related to:</p>
                                            <p className="text-sm text-gray-600">
                                                {selectedMessage.relatedTo.type.toUpperCase()} #{selectedMessage.relatedTo.id} - {selectedMessage.relatedTo.title}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {selectedMessage.content}
                                    </p>
                                </div>

                                {/* Thread Messages */}
                                {selectedMessage.thread && selectedMessage.thread.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-3">Conversation Thread</h4>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {selectedMessage.thread.map((threadMessage) => (
                                                <div
                                                    key={threadMessage.id}
                                                    className={`p-3 rounded-lg ${threadMessage.sender.type === 'internal'
                                                        ? 'bg-blue-100 mr-4'
                                                        : 'bg-gray-100 ml-4'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium">{threadMessage.sender.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDistanceToNowLocal(threadMessage.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{threadMessage.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        onClick={() => replyToMessage(selectedMessage.id)}
                                        disabled={!replyContent.trim()}
                                    >
                                        <Reply className="w-4 h-4 mr-2" />
                                        Reply
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => archiveMessage(selectedMessage.id)}
                                    >
                                        <Archive className="w-4 h-4 mr-2" />
                                        Archive
                                    </Button>
                                </div>

                                {/* Reply Form */}
                                <div>
                                    <Textarea
                                        placeholder="Type your reply..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        rows={3}
                                        className="mb-2"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Select a message to view details</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}