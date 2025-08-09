'use client';

import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const statusConfig: Record<string, { variant: any; className: string }> = {
  // Order statuses
  pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { variant: 'default', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { variant: 'default', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  shipped: { variant: 'default', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  delivered: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
  
  // Payment statuses
  paid: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  failed: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
  refunded: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  
  // Product statuses
  active: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  inactive: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  draft: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  
  // RFQ statuses
  open: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  closed: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  expired: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
  
  // Quote statuses
  accepted: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
  
  // Deal statuses
  initiated: { variant: 'default', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  negotiating: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  completed: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  
  // Verification statuses
  verified: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  unverified: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  
  // Generic statuses
  success: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  warning: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  error: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
  info: { variant: 'default', className: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, '');
  const config = statusConfig[normalizedStatus] || statusConfig.info;
  
  return (
    <Badge
      variant={variant || config.variant}
      className={cn(
        'font-medium',
        !variant && config.className,
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/[_]/g, ' ')}
    </Badge>
  );
}