'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Loading } from '../../../../components/ui/loading';
import { DataTable } from '../../../../components/ui/data-table';
// import { WalletService } from '../../../../lib/api/services/wallet.service';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import type { Subscription, SubscriptionPlan, BillingHistory } from '../../../../types';
import type { ColumnDef } from '@tanstack/react-table';
import { 
  ArrowLeft, 
  Crown,
  Check,
  Star,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Package,
  Database
} from 'lucide-react';

export default function SubscriptionPage() {
  const router = useRouter();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls when backend is ready
      // Mock current subscription
      const mockSubscription: Subscription = {
        id: 'sub-1',
        userId: 'user-1',
        planName: 'Premium Plan',
        planType: 'premium',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      // Mock subscription plans
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'plan-1',
          name: 'Free',
          type: 'free',
          price: 0,
          billingCycle: 'monthly',
          features: ['5 Products', '2 RFQs', 'Basic Support'],
          limits: { products: 5, rfqs: 2, orders: 10, storage: 1 }
        },
        {
          id: 'plan-2',
          name: 'Basic',
          type: 'basic',
          price: 999,
          billingCycle: 'monthly',
          features: ['50 Products', '20 RFQs', 'Email Support', 'Analytics'],
          limits: { products: 50, rfqs: 20, orders: 100, storage: 5 }
        },
        {
          id: 'plan-3',
          name: 'Premium',
          type: 'premium',
          price: 2999,
          billingCycle: 'monthly',
          features: ['Unlimited Products', 'Unlimited RFQs', 'Priority Support', 'Advanced Analytics'],
          limits: { products: -1, rfqs: -1, orders: -1, storage: 50 },
          isPopular: true
        }
      ];

      // Mock billing history
      const mockBilling: BillingHistory[] = [
        {
          id: 'bill-1',
          subscriptionId: 'sub-1',
          amount: 2999,
          currency: 'INR',
          status: 'paid',
          billingPeriodStart: '2024-01-01T00:00:00Z',
          billingPeriodEnd: '2024-02-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];

      setCurrentSubscription(mockSubscription);
      setPlans(mockPlans);
      setBillingHistory(mockBilling);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(true);
      // TODO: Implement actual subscription upgrade
      // const response = await WalletService.createSubscription(planId, selectedCycle);
      
      // Mock success for now
      alert(`Subscription upgrade initiated for plan ${planId}. You will be redirected to payment page.`);
      
      // Simulate redirect to payment page
      // window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to upgrade subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      // TODO: Implement actual subscription cancellation
      // const response = await WalletService.cancelSubscription(true);
      
      // Mock success for now
      alert('Subscription cancelled successfully');
      loadData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      // TODO: Implement actual subscription reactivation
      // const response = await WalletService.reactivateSubscription();
      
      // Mock success for now
      alert('Subscription reactivated successfully');
      loadData();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Failed to reactivate subscription');
    }
  };

  const downloadInvoice = async (billingId: string) => {
    try {
      // TODO: Implement actual invoice download
      // const response = await WalletService.downloadInvoice(billingId);
      
      // Mock success for now
      alert(`Invoice download initiated for billing ${billingId}`);
      // window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free':
        return <Package className="h-6 w-6" />;
      case 'basic':
        return <Zap className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      case 'enterprise':
        return <Users className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free':
        return 'text-gray-600 bg-gray-100';
      case 'basic':
        return 'text-blue-600 bg-blue-100';
      case 'premium':
        return 'text-purple-600 bg-purple-100';
      case 'enterprise':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expired' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const billingColumns: ColumnDef<BillingHistory>[] = [
    {
      accessorKey: 'billingPeriodStart',
      header: 'Billing Period',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {formatDate(row.original.billingPeriodStart)} - {formatDate(row.original.billingPeriodEnd)}
          </p>
        </div>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatCurrency(row.original.amount)} {row.original.currency}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt)
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.invoiceUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadInvoice(row.original.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription plan and billing</p>
        </div>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${getPlanColor(currentSubscription.planType)}`}>
                {getPlanIcon(currentSubscription.planType)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 capitalize">
                  {currentSubscription.planName} Plan
                </h3>
                <p className="text-gray-600">
                  {currentSubscription.status === 'active' ? 'Active until' : 'Expires on'} {formatDate(currentSubscription.currentPeriodEnd)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(currentSubscription.status)}
              {currentSubscription.status === 'active' && !currentSubscription.cancelAtPeriodEnd ? (
                <Button variant="outline" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              ) : currentSubscription.cancelAtPeriodEnd ? (
                <Button onClick={handleReactivateSubscription}>
                  Reactivate
                </Button>
              ) : null}
            </div>
          </div>

          {currentSubscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Subscription will be cancelled at the end of the current billing period
                </span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Billing Cycle Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Cycle</h3>
        <div className="flex gap-3">
          {(['monthly', 'quarterly', 'annual'] as const).map((cycle) => (
            <Button
              key={cycle}
              variant={selectedCycle === cycle ? 'default' : 'outline'}
              onClick={() => setSelectedCycle(cycle)}
              className="capitalize"
            >
              {cycle}
              {cycle === 'annual' && (
                <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.planType === plan.type;
          const cyclePrice = selectedCycle === 'annual' ? plan.price * 12 * 0.8 : 
                           selectedCycle === 'quarterly' ? plan.price * 3 * 0.95 : 
                           plan.price;
          
          return (
            <Card key={plan.id} className={`p-6 relative ${
              plan.isPopular ? 'border-purple-500 shadow-lg' : ''
            } ${isCurrentPlan ? 'bg-blue-50 border-blue-500' : ''}`}>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-blue-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-3 rounded-full mb-4 ${getPlanColor(plan.type)}`}>
                  {getPlanIcon(plan.type)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 capitalize mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-gray-900">
                  {plan.type === 'free' ? 'Free' : formatCurrency(cyclePrice)}
                  {plan.type !== 'free' && (
                    <span className="text-sm font-normal text-gray-600">
                      /{selectedCycle === 'annual' ? 'year' : selectedCycle === 'quarterly' ? 'quarter' : 'month'}
                    </span>
                  )}
                </div>
                {selectedCycle === 'annual' && plan.type !== 'free' && (
                  <p className="text-sm text-green-600 mt-1">
                    Save {formatCurrency(plan.price * 12 * 0.2)} annually
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">
                    {plan.limits.products === -1 ? 'Unlimited' : plan.limits.products} Products
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">
                    {plan.limits.rfqs === -1 ? 'Unlimited' : plan.limits.rfqs} RFQs/month
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">
                    {plan.limits.orders === -1 ? 'Unlimited' : plan.limits.orders} Orders/month
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">
                    {plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage}GB`} Storage
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                variant={isCurrentPlan ? 'outline' : 'default'}
                disabled={isCurrentPlan || upgrading}
                onClick={() => handleUpgrade(plan.id)}
              >
                {upgrading ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : plan.type === 'free' ? (
                  'Downgrade'
                ) : (
                  'Upgrade'
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Billing History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
        </div>

        <DataTable
          data={billingHistory}
          columns={billingColumns}
          isLoading={false}
        />
      </Card>

      {/* FAQ */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Can I change my plan anytime?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">What happens when I cancel?</h4>
            <p className="text-sm text-gray-600 mt-1">
              You'll continue to have access to premium features until the end of your current billing period. After that, your account will be downgraded to the free plan.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">Are there any setup fees?</h4>
            <p className="text-sm text-gray-600 mt-1">
              No, there are no setup fees or hidden charges. You only pay for your selected plan.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}