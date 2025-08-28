"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type RFQ } from '@/lib/api/services/rfq.service';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, DollarSign, Clock, Package, Wrench } from 'lucide-react';

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
  updatedAt: string;
}

interface Negotiation {
  id: string;
  bidId: string;
  fromSeller: boolean;
  message: string;
  proposedPrice?: number;
  proposedDeliveryTime?: number;
  createdAt: string;
}

export default function RFQDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [negotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingBid, setSubmittingBid] = useState(false);

  // Bid form state
  const [bidPrice, setBidPrice] = useState('');
  const [bidDeliveryTime, setBidDeliveryTime] = useState('');
  const [bidDeliveryUnit, setBidDeliveryUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [bidDescription, setBidDescription] = useState('');

  // Negotiation form state
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [negotiationDeliveryTime, setNegotiationDeliveryTime] = useState('');
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);

  const loadRFQDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load RFQ details
      const rfqResponse = await apiClient.getRFQ(rfqId);
      if (rfqResponse.success && rfqResponse.data) {
        setRfq(rfqResponse.data as RFQ);
      }

      // Load existing bids
      const bidsResponse = await apiClient.getRFQBids(rfqId);
      if (bidsResponse.success && bidsResponse.data) {
        setBids(bidsResponse.data as Bid[]);
      }

      // Load negotiations for user's bids (commented out for now)
      // const negotiationsResponse = await apiClient.getRFQNegotiations(rfqId);
      // if (negotiationsResponse.success && negotiationsResponse.data) {
      //   setNegotiations(negotiationsResponse.data);
      // }
    } catch (err: any) {
      setError(err?.message || 'Failed to load RFQ details');
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async () => {
    if (!bidPrice || !bidDeliveryTime || !bidDescription) {
      setError('Please fill in all bid fields');
      return;
    }

    try {
      setSubmittingBid(true);
      setError(null);

      const response = await apiClient.submitBid(rfqId, {
        price: parseFloat(bidPrice),
        deliveryTime: parseInt(bidDeliveryTime),
        deliveryTimeUnit: bidDeliveryUnit,
        description: bidDescription,
      });

      if (response.success) {
        // Reset form
        setBidPrice('');
        setBidDeliveryTime('');
        setBidDescription('');
        
        // Reload data
        await loadRFQDetails();
      } else {
        throw new Error(response.error?.message || 'Failed to submit bid');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const sendNegotiation = async () => {
    if (!selectedBidId || !negotiationMessage) {
      setError('Please select a bid and enter a message');
      return;
    }

    try {
      setError(null);

      const response = await apiClient.sendNegotiation(selectedBidId, {
        message: negotiationMessage,
        proposedPrice: negotiationPrice ? parseFloat(negotiationPrice) : undefined,
        proposedDeliveryTime: negotiationDeliveryTime ? parseInt(negotiationDeliveryTime) : undefined,
      });

      if (response.success) {
        // Reset form
        setNegotiationMessage('');
        setNegotiationPrice('');
        setNegotiationDeliveryTime('');
        setSelectedBidId(null);
        
        // Reload data
        await loadRFQDetails();
      } else {
        throw new Error(response.error?.message || 'Failed to send negotiation');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send negotiation');
    }
  };

  useEffect(() => {
    if (rfqId) {
      loadRFQDetails();
    }
  }, [rfqId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div>Loading RFQ details...</div>
      </div>
    );
  }

  if (error && !rfq) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>RFQ not found</div>
      </div>
    );
  }

  const userBids = bids.filter(bid => bid.sellerId === 'current-user'); // TODO: Get actual user ID
  const otherBids = bids.filter(bid => bid.sellerId !== 'current-user');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{rfq.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={rfq.type === 'product' ? 'default' : 'secondary'}>
              {rfq.type === 'product' ? <Package className="h-3 w-3 mr-1" /> : <Wrench className="h-3 w-3 mr-1" />}
              {rfq.type}
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(rfq.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFQ Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{rfq.description}</p>
              </div>
              
              {rfq.budgetMin && rfq.budgetMax && (
                <div>
                  <h4 className="font-medium mb-2">Budget Range</h4>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>${rfq.budgetMin} - ${rfq.budgetMax}</span>
                  </div>
                </div>
              )}

              {rfq.requirements && (
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <p className="text-muted-foreground">{rfq.requirements}</p>
                </div>
              )}

              {rfq.deliveryLocation && (
                <div>
                  <h4 className="font-medium mb-2">Delivery Location</h4>
                  <p className="text-muted-foreground">{rfq.deliveryLocation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Bid */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Bid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price ($)</label>
                  <Input
                    type="number"
                    placeholder="Enter your price"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Delivery Time</label>
                  <Input
                    type="number"
                    placeholder="Enter time"
                    value={bidDeliveryTime}
                    onChange={(e) => setBidDeliveryTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Unit</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={bidDeliveryUnit}
                    onChange={(e) => setBidDeliveryUnit(e.target.value as 'days' | 'weeks' | 'months')}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Bid Description</label>
                <Textarea
                  placeholder="Describe your proposal, experience, and why you're the best choice..."
                  value={bidDescription}
                  onChange={(e) => setBidDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={submitBid} disabled={submittingBid} className="w-full">
                {submittingBid ? 'Submitting...' : 'Submit Bid'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bids & Negotiations */}
        <div className="space-y-6">
          {/* Your Bids */}
          {userBids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Bids</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userBids.map((bid) => (
                  <div key={bid.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={
                        bid.status === 'accepted' ? 'default' :
                        bid.status === 'rejected' ? 'destructive' :
                        bid.status === 'negotiating' ? 'secondary' : 'outline'
                      }>
                        {bid.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div><strong>Price:</strong> ${bid.price}</div>
                      <div><strong>Delivery:</strong> {bid.deliveryTime} {bid.deliveryTimeUnit}</div>
                      <div><strong>Description:</strong> {bid.description}</div>
                    </div>
                    
                    {bid.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => setSelectedBidId(bid.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Start Negotiation
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Negotiation Panel */}
          {selectedBidId && (
            <Card>
              <CardHeader>
                <CardTitle>Send Negotiation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Enter your negotiation message..."
                    value={negotiationMessage}
                    onChange={(e) => setNegotiationMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">New Price ($)</label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={negotiationPrice}
                      onChange={(e) => setNegotiationPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">New Delivery (days)</label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={negotiationDeliveryTime}
                      onChange={(e) => setNegotiationDeliveryTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={sendNegotiation} className="flex-1">
                    Send
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedBidId(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competition Info */}
          <Card>
            <CardHeader>
              <CardTitle>Competition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {otherBids.length} other bid{otherBids.length !== 1 ? 's' : ''} submitted
              </div>
              {otherBids.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Price range: ${Math.min(...otherBids.map(b => b.price))} - ${Math.max(...otherBids.map(b => b.price))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}