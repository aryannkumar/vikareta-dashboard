'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Heart,
    Search,
    Filter,
    Users,
    Building2,
    MapPin,
    Star,
    Eye,
    MessageCircle,
    UserMinus,
    RefreshCw,
    Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface FollowedUser {
    id: string;
    firstName: string;
    lastName: string;
    businessName: string;
    avatar: string;
    userType: 'buyer' | 'seller' | 'both';
    location: string;
    isVerified: boolean;
    followedAt: string;
    totalProducts: number;
    totalOrders: number;
    rating: number;
    bio: string;
}

export default function FollowingPage() {
    const [following, setFollowing] = useState<FollowedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('followedAt');

    const loadFollowing = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/follow/following', {
                params: {
                    search: searchTerm,
                    userType: typeFilter,
                    sortBy,
                    limit: 50
                }
            });

            if (response.success && response.data) {
                const data = response.data as any;
                const followingList = Array.isArray(data) ? data : data.following || data.data || [];
                setFollowing(followingList);
            } else {
                setFollowing([]);
            }
        } catch (error) {
            console.error('Failed to load following:', error);
            toast({
                title: 'Error',
                description: 'Failed to load following list. Please try again.',
                variant: 'destructive',
            });
            setFollowing([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (userId: string) => {
        if (!confirm('Are you sure you want to unfollow this user?')) {
            return;
        }

        try {
            const response = await apiClient.delete(`/follow/${userId}`);

            if (response.success) {
                toast({
                    title: 'Success',
                    description: 'User unfollowed successfully.',
                });
                setFollowing(prev => prev.filter(user => user.id !== userId));
            } else {
                throw new Error('Failed to unfollow user');
            }
        } catch (error) {
            console.error('Failed to unfollow user:', error);
            toast({
                title: 'Error',
                description: 'Failed to unfollow user. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleSearch = () => {
        loadFollowing();
    };

    useEffect(() => {
        loadFollowing();
    }, [sortBy]);

    const getUserTypeColor = (userType: string) => {
        switch (userType) {
            case 'seller': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'buyer': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'both': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Following</h1>
                    <p className="text-muted-foreground">Manage users and businesses you follow</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={loadFollowing} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/dashboard/followers">
                        <Button variant="outline">
                            <Users className="mr-2 h-4 w-4" />
                            View Followers
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Following</p>
                                <p className="text-2xl font-bold">{following.length}</p>
                            </div>
                            <Heart className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Sellers</p>
                                <p className="text-2xl font-bold">{following.filter(u => u.userType === 'seller' || u.userType === 'both').length}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Buyers</p>
                                <p className="text-2xl font-bold">{following.filter(u => u.userType === 'buyer' || u.userType === 'both').length}</p>
                            </div>
                            <Users className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                                <p className="text-2xl font-bold">{following.filter(u => u.isVerified).length}</p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or business..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    <SelectItem value="seller">Sellers</SelectItem>
                                    <SelectItem value="buyer">Buyers</SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="followedAt">Recently Followed</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="rating">Rating</SelectItem>
                                    <SelectItem value="products">Products</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Following List */}
            <Card>
                <CardHeader>
                    <CardTitle>Following ({following.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="ml-2 text-muted-foreground">Loading...</p>
                        </div>
                    ) : following.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {following.map((user) => (
                                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={user.avatar} alt={user.firstName} />
                                                    <AvatarFallback>
                                                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-semibold">
                                                            {user.firstName} {user.lastName}
                                                        </h3>
                                                        {user.isVerified && (
                                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                        )}
                                                    </div>
                                                    {user.businessName && (
                                                        <p className="text-sm text-muted-foreground">{user.businessName}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge className={getUserTypeColor(user.userType)}>
                                                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                                            </Badge>
                                        </div>

                                        {user.bio && (
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {user.bio}
                                            </p>
                                        )}

                                        <div className="space-y-2 mb-4">
                                            {user.location && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    {user.location}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                                                    <span>{user.totalProducts} products</span>
                                                </div>
                                                {user.rating > 0 && (
                                                    <div className="flex items-center">
                                                        <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                                                        <span>{user.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Following since {formatDate(user.followedAt)}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Link href={`/profile/${user.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Profile
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`/messages/${user.id}`, '_blank')}
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUnfollow(user.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No one followed yet</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || typeFilter
                                    ? 'Try adjusting your search or filters.'
                                    : 'Start following sellers and buyers to see them here.'
                                }
                            </p>
                            {searchTerm || typeFilter ? (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setTypeFilter('');
                                        loadFollowing();
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            ) : (
                                <Link href="/marketplace">
                                    <Button>
                                        <Users className="h-4 w-4 mr-2" />
                                        Explore Marketplace
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}