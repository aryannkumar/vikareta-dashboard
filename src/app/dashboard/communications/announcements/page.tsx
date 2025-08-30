'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Megaphone,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Users,
    AlertCircle,
    CheckCircle,
    Send
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'success' | 'urgent';
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    targetAudience: 'all' | 'buyers' | 'sellers' | 'premium';
    scheduledAt?: string;
    publishedAt?: string;
    expiresAt?: string;
    viewCount: number;
    clickCount: number;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
}

interface AnnouncementStats {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    totalViews: number;
    totalClicks: number;
    engagementRate: number;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [stats, setStats] = useState<AnnouncementStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    // Modal states for future implementation
    // const [showCreateModal, setShowCreateModal] = useState(false);
    // const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const { toast } = useToast();

    const loadAnnouncements = useCallback(async () => {
        try {
            setIsLoading(true);
            const [announcementsResponse, statsResponse] = await Promise.all([
                vikaretaApiClient.getCommunicationsAnnouncements({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: searchQuery,
                    type: selectedType !== 'all' ? selectedType : undefined,
                    status: selectedStatus !== 'all' ? selectedStatus : undefined
                }),
                vikaretaApiClient.getCommunicationsAnnouncementsStats()
            ]);

            if (announcementsResponse.success) {
                const data = announcementsResponse.data as any;
                setAnnouncements(data.announcements || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination?.total || 0,
                    totalPages: data.pagination?.totalPages || 0
                }));
            }

            if (statsResponse.success) {
                setStats(statsResponse.data as AnnouncementStats);
            }
        } catch (error) {
            console.error('Failed to load announcements:', error);
            toast({
                title: "Error",
                description: "Failed to load announcements",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, selectedType, selectedStatus, toast]);

    useEffect(() => {
        loadAnnouncements();
    }, [loadAnnouncements]);

    // Future implementation for create/update modals
    // const handleCreateAnnouncement = async (data: Partial<Announcement>) => {
    //     try {
    //         await vikaretaApiClient.post('/communications/announcements', data);
    //         toast({
    //             title: "Success",
    //             description: "Announcement created successfully",
    //         });
    //         setShowCreateModal(false);
    //         loadAnnouncements();
    //     } catch (error) {
    //         console.error('Failed to create announcement:', error);
    //         toast({
    //             title: "Error",
    //             description: "Failed to create announcement",
    //             variant: "destructive",
    //         });
    //     }
    // };

    // const handleUpdateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    //     try {
    //         await vikaretaApiClient.put(`/communications/announcements/${id}`, data);
    //         toast({
    //             title: "Success",
    //             description: "Announcement updated successfully",
    //         });
    //         setEditingAnnouncement(null);
    //         loadAnnouncements();
    //     } catch (error) {
    //         console.error('Failed to update announcement:', error);
    //         toast({
    //             title: "Error",
    //             description: "Failed to update announcement",
    //             variant: "destructive",
    //         });
    //     }
    // };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const response = await vikaretaApiClient.deleteCommunicationsAnnouncement(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Announcement deleted successfully",
                });
                loadAnnouncements();
            } else {
                throw new Error(response.error?.message || 'Failed to delete announcement');
            }
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            toast({
                title: "Error",
                description: "Failed to delete announcement",
                variant: "destructive",
            });
        }
    };

    const handlePublishAnnouncement = async (id: string) => {
        try {
            const response = await vikaretaApiClient.publishCommunicationsAnnouncement(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Announcement published successfully",
                });
                loadAnnouncements();
            } else {
                throw new Error(response.error?.message || 'Failed to publish announcement');
            }
        } catch (error) {
            console.error('Failed to publish announcement:', error);
            toast({
                title: "Error",
                description: "Failed to publish announcement",
                variant: "destructive",
            });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'info': return <AlertCircle className="h-4 w-4 text-blue-500" />;
            case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'secondary',
            published: 'default',
            scheduled: 'outline',
            archived: 'destructive'
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (isLoading && announcements.length === 0) {
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
                    <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-600 mt-1">
                        Create and manage platform announcements for your users
                    </p>
                </div>
                <Button onClick={() => toast({ title: "Coming Soon", description: "Create announcement feature will be available soon" })}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Megaphone className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Published</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
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
                                <Users className="h-8 w-8 text-orange-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.engagementRate.toFixed(1)}%</p>
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
                                    placeholder="Search announcements..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="success">Success</option>
                            <option value="urgent">Urgent</option>
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Announcements List */}
            <div className="space-y-4">
                {announcements.map((announcement) => (
                    <Card key={announcement.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getTypeIcon(announcement.type)}
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {announcement.title}
                                        </h3>
                                        {getStatusBadge(announcement.status)}
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {announcement.content}
                                    </p>

                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(announcement.createdAt)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            {announcement.viewCount} views
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {announcement.targetAudience}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    {announcement.status === 'draft' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handlePublishAnnouncement(announcement.id)}
                                        >
                                            <Send className="h-4 w-4 mr-1" />
                                            Publish
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toast({ title: "Coming Soon", description: "Edit feature will be available soon" })}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </Button>

                    <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <Button
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}