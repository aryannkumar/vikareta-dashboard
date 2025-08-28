"use client";

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Package, 
  Wrench, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle,
  DollarSign,
  Clock
} from 'lucide-react';

interface Bid {
  id: string;
  rfqId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  deliveryTime: number;
  deliveryTimeUnit: 'days' | 'weeks' | 'months';
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  createdAt: string;
}

interface RFQ {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'service';
  budgetMin?: number;
  budgetMax?: number;
  deliveryLocation?: string;
  requirements?: string;
  createdAt: string;
}

interface OrderConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: Bid;
  rfq: RFQ;
  onOrderCreated: (orderId: string) => void;
}

export default function OrderConversionModal({
  isOpen,
  onClose,
  bid,
  rfq,
  onOrderCreated
}: OrderConversionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'review' | 'details' | 'payment' | 'success'>('review');
  const [orderId, setOrderId] = useState<string | null>(null);

  // Order details form
  const [shippingAddress, setShippingAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleConvertToOrder = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (rfq.type === 'product' && !shippingAddress.trim()) {
      setError('Shipping address is required for product orders');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        shippingAddress: shippingAddress.trim() || undefined,
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod,
      };

      const response = await apiClient.convertBidToOrder(bid.id, orderData);

      if (response.success && response.data) {
        const orderData = response.data as { orderId: string };
        setOrderId(orderData.orderId);
        setStep('success');
        onOrderCreated(orderData.orderId);
      } else {
        throw new Error(response.error?.message || 'Failed to create order');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('review');
    setError(null);
    setOrderId(null);
    setShippingAddress('');
    setSpecialInstructions('');
    setPaymentMethod('credit_card');
    setAgreedToTerms(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
        <p className="text-muted-foreground">
          Your bid has been accepted. Let's convert it to an order.
        </p>
      </div>

      {/* RFQ Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {rfq.type === 'product' ? <Package className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
            {rfq.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{rfq.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant={rfq.type === 'product' ? 'default' : 'secondary'}>
              {rfq.type}
            </Badge>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${bid.price}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {bid.deliveryTime} {bid.deliveryTimeUnit}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Bid Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Winning Bid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Price:</span>
              <div className="text-lg font-bold text-green-600">${bid.price}</div>
            </div>
            <div>
              <span className="font-medium">Delivery Time:</span>
              <div>{bid.deliveryTime} {bid.deliveryTimeUnit}</div>
            </div>
          </div>
          <Separator />
          <div>
            <span className="font-medium">Description:</span>
            <p className="text-muted-foreground mt-1">{bid.description}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={() => setStep('details')} className="flex-1">
          Continue to Order Details
        </Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Order Details</h3>
      </div>

      {rfq.type === 'product' && (
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Shipping Address *
          </label>
          <Textarea
            placeholder="Enter your complete shipping address..."
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows={3}
            required
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Special Instructions
        </label>
        <Textarea
          placeholder={
            rfq.type === 'product' 
              ? "Any special delivery instructions, packaging requirements, etc."
              : "Any specific requirements, timeline preferences, or additional details..."
          }
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment Method
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="credit_card">Credit Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="paypal">PayPal</option>
          <option value="wallet">Wallet Balance</option>
        </select>
      </div>

      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground">
          I agree to the{' '}
          <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
            Terms and Conditions
          </a>{' '}
          and understand that this will create a binding order with the seller.
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('review')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleConvertToOrder} 
          disabled={loading || !agreedToTerms}
          className="flex-1"
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Order Created Successfully!</h3>
        <p className="text-muted-foreground">
          Your order has been created and the seller has been notified.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Order ID</div>
            <div className="text-lg font-mono font-bold">{orderId}</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You can track your order progress in the Orders section of your dashboard.
        </p>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Close
          </Button>
          <Button 
            onClick={() => window.open(`/dashboard/orders/${orderId}`, '_blank')} 
            className="flex-1"
          >
            View Order
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'review' && 'Bid Accepted - Create Order'}
            {step === 'details' && 'Order Details'}
            {step === 'success' && 'Order Created'}
          </DialogTitle>
          <DialogDescription>
            {step === 'review' && 'Review the details and proceed to create your order'}
            {step === 'details' && 'Provide the necessary details for your order'}
            {step === 'success' && 'Your order has been successfully created'}
          </DialogDescription>
        </DialogHeader>

        {step === 'review' && renderReviewStep()}
        {step === 'details' && renderDetailsStep()}
        {step === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}