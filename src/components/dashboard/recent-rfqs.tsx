'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { useRFQs } from '@/lib/hooks/use-rfqs';
import Link from 'next/link';

const getStatusColor = (status: string) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    published: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    closed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    awarded: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

export function RecentRFQs() {
  const { rfqs, loading, error, refresh } = useRFQs({ 
    autoLoad: true, 
    limit: 5 
  });

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getDaysUntilDelivery = (dateString: string) => {
    const now = new Date();
    const deliveryDate = new Date(dateString);
    const diffInDays = Math.ceil((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">{error}</div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (rfqs.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <div className="text-muted-foreground mb-4">No recent RFQs</div>
        <Link href="/dashboard/rfqs/new">
          <Button variant="outline" size="sm">
            Create RFQ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rfqs.map((rfq) => {
        const daysUntilExpiry = getDaysUntilDelivery(rfq.expiresAt);
        return (
          <div key={rfq.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{rfq.id}</h4>
                  <p className="text-xs text-muted-foreground">{rfq.title}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {rfq.quotes?.length || 0} quotes
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry}d left` : 'Expired'}
                </div>
                <div>
                  {getTimeAgo(rfq.createdAt)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs ${getStatusColor(rfq.status)}`}>
                {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
              </Badge>
              <Link href={`/dashboard/rfqs/${rfq.id}`}>
                <Button variant="ghost" size="sm" className="p-1">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
      
      <div className="text-center pt-2">
        <Link href="/dashboard/rfqs">
          <Button variant="outline" size="sm">
            View All RFQs
          </Button>
        </Link>
      </div>
    </div>
  );
}