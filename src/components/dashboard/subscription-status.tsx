'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, Calendar, CreditCard, CheckCircle, 
  AlertCircle, Zap, Star, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'professional' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  features: {
    rfqsPerMonth: number;
    rfqsUsed: number;
    adsAllowed: number;
    adsUsed: number;
    prioritySupport: boolean;
    analyticsAccess: boolean;
    whatsappIntegration: boolean;
  };
}

const mockSubscription: SubscriptionPlan = {
  id: 'sub_1',
  name: 'Professional Plan',
  tier: 'professional',
  price: 2999,
  billingCycle: 'monthly',
  status: 'active',
  currentPeriodStart: '2024-01-01',
  currentPeriodEnd: '2024-02-01',
  features: {
    rfqsPerMonth: 100,
    rfqsUsed: 67,
    adsAllowed: 10,
    adsUsed: 5,
    prioritySupport: true,
    analyticsAccess: true,
    whatsappIntegration: true
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'free': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    case 'professional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'cancelled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getDaysRemaining = (endDate: string) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export function SubscriptionStatus() {
  const daysRemaining = getDaysRemaining(mockSubscription.currentPeriodEnd);
  const rfqUsagePercentage = (mockSubscription.features.rfqsUsed / mockSubscription.features.rfqsPerMonth) * 100;
  const adUsagePercentage = (mockSubscription.features.adsUsed / mockSubscription.features.adsAllowed) * 100;

  return (
    <div className="space-y-4">
      {/* Plan Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold">{mockSubscription.name}</span>
        </div>
        <Badge className={`text-xs ${getStatusColor(mockSubscription.status)}`}>
          {mockSubscription.status.toUpperCase()}
        </Badge>
      </div>

      {/* Plan Details */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Plan Tier</span>
          <Badge className={`text-xs ${getTierColor(mockSubscription.tier)}`}>
            {mockSubscription.tier.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Monthly Cost</span>
          <span className="font-semibold">₹{mockSubscription.price.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Billing Cycle</span>
          <span className="text-sm font-medium capitalize">{mockSubscription.billingCycle}</span>
        </div>
      </div>

      {/* Renewal Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
            Next Billing Date
          </span>
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          {new Date(mockSubscription.currentPeriodEnd).toLocaleDateString()}
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          {daysRemaining} days remaining
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Usage This Month
        </div>
        
        {/* RFQ Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">RFQs</span>
            <span className="font-medium">
              {mockSubscription.features.rfqsUsed} / {mockSubscription.features.rfqsPerMonth}
            </span>
          </div>
          <Progress value={rfqUsagePercentage} className="h-2" />
          <div className="text-xs text-gray-500">
            {mockSubscription.features.rfqsPerMonth - mockSubscription.features.rfqsUsed} remaining
          </div>
        </div>

        {/* Ad Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Active Ads</span>
            <span className="font-medium">
              {mockSubscription.features.adsUsed} / {mockSubscription.features.adsAllowed}
            </span>
          </div>
          <Progress value={adUsagePercentage} className="h-2" />
          <div className="text-xs text-gray-500">
            {mockSubscription.features.adsAllowed - mockSubscription.features.adsUsed} slots available
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Plan Features
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {mockSubscription.features.prioritySupport ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm">Priority Support</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {mockSubscription.features.analyticsAccess ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm">Advanced Analytics</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {mockSubscription.features.whatsappIntegration ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm">WhatsApp Integration</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <Link href="/dashboard/subscription/upgrade">
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Star className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </Link>
        
        <Link href="/dashboard/subscription/manage">
          <Button variant="outline" className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
        </Link>
      </div>

      {/* Upgrade Suggestion */}
      {rfqUsagePercentage > 80 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-start space-x-2">
            <Zap className="w-4 h-4 text-orange-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-orange-800 dark:text-orange-400">
                Consider Upgrading
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                You're using {rfqUsagePercentage.toFixed(0)}% of your RFQ limit. Upgrade for unlimited access.
              </div>
              <Link href="/dashboard/subscription/upgrade">
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 p-0 h-auto mt-2">
                  View Plans
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}