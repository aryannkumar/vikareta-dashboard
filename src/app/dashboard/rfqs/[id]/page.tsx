'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Package, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  FileText, 
  Download,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface RFQDetail {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deliveryTimeline: string;
  deliveryLocation: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  createdAt: string;
  expiresAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    rating: number;
    totalOrders: number;
  };
  specifications?: Array<{
    key: string;
    value: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
  }>;
  bids?: Array<{
    id: string;
    supplier: {
      id: string;
      name: string;
      rating: number;
      responseTime: string;
    };
    price: number;
    deliveryTime: number;
    deliveryTimeUnit: 'days' | 'weeks' | 'months';
    description: string;
    status: 'pending' | 'accepted' | 'rejected';
    submittedAt: string;
  }>;
}

export default function RFQDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;
  
  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDeliveryTime, setBidDeliveryTime] = useState('');
  const [bidDeliveryUnit, setBidDeliveryUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [bidDescription, setBidDescription] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    loadRFQDetails();
  }, [rfqId]);

  const loadRFQDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRFQ(rfqId);
      
      if (response.success && response.data) {
        setRfq((response.data as any) || null);
      } else {
        // Fallback data for development
        const fallbackRFQ: RFQDetail = {
          id: rfqId,
          title: 'Industrial Pumps for Manufacturing Plant',
          description: 'We are looking for high-quality industrial pumps for our new manufacturing facility. The pumps should be capable of handling corrosive chemicals and have a minimum flow rate of 500 GPM. We need pumps that are reliable, energy-efficient, and come with comprehensive warranty coverage.',
          category: {
            id: 'pumps',
            name: 'Pumps & Compressors'
          },
          subcategory: {
            id: 'industrial-pumps',
            name: 'Industrial Pumps'
          },
          quantity: 5,
          budgetMin: 50000,
          budgetMax: 100000,
          deliveryTimeline: 'Within 45 days',
          deliveryLocation: 'Mumbai, Maharashtra, India',
          status: 'published',
          createdAt: '2024-01-15T10:30:00Z',
          expiresAt: '2024-02-15T10:30:00Z',
          buyer: {
            id: 'buyer-1',
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            phone: '+91 98765 43210',
            company: 'TechCorp Industries',
            rating: 4.8,
            totalOrders: 156
          },
          specifications: [
            { key: 'Flow Rate', value: 'Minimum 500 GPM' },
            { key: 'Material', value: 'Stainless Steel 316L' },
            { key: 'Pressure Rating', value: '150 PSI' },
            { key: 'Temperature Range', value: '-10°C to 80°C' },
            { key: 'Power Supply', value: '415V, 3 Phase, 50Hz' },
            { key: 'Certification', value: 'ISO 9001, CE Marked' }
          ],
          attachments: [
            {
              id: 'att-1',
              name: 'Technical Specifications.pdf',
              url: '/attachments/tech-specs.pdf',
              size: 2048576
            },
            {
              id: 'att-2',
              name: 'Site Layout Drawing.dwg',
              url: '/attachments/site-layout.dwg',
              size: 5242880
            }
          ],
          bids: [
            {
              id: 'bid-1',
              supplier: {
                id: 'sup-1',
                name: 'Industrial Equipment Co.',
                rating: 4.6,
                responseTime: '2 hours'
              },
              price: 75000,
              deliveryTime: 30,
              deliveryTimeUnit: 'days',
              description: 'We can provide high-quality stainless steel pumps that meet all your specifications. Our pumps come with 2-year warranty and 24/7 support.',
              status: 'pending',
              submittedAt: '2024-01-16T14:20:00Z'
            },
            {
              id: 'bid-2',
              supplier: {
                id: 'sup-2',
                name: 'Pump Solutions Ltd.',
                rating: 4.9,
                responseTime: '1 hour'
              },
              price: 85000,
              deliveryTime: 25,
              deliveryTimeUnit: 'days',
              description: 'Premium quality industrial pumps with advanced features. Includes installation and commissioning services.',
              status: 'pending',
              submittedAt: '2024-01-17T09:15:00Z'
            }
          ]
        };
        
        setRfq(fallbackRFQ);
      }
    } catch (error) {
      console.error('Error loading RFQ details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load RFQ details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || !bidDeliveryTime || !bidDescription) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingBid(true);
      
      const bidData = {
        price: parseFloat(bidAmount),
        deliveryTime: parseInt(bidDeliveryTime),
        deliveryTimeUnit: bidDeliveryUnit,
        description: bidDescription
      };

      const response = await apiClient.submitBid(rfqId, bidData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Your bid has been submitted successfully.',
        });
        
        // Reset form
        setBidAmount('');
        setBidDeliveryTime('');
        setBidDescription('');
        
        // Reload RFQ details to show the new bid
        loadRFQDetails();
      } else {
        throw new Error('Failed to submit bid');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit bid. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingBid(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      case 'awarded': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">RFQ Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The RFQ you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => router.push('/dashboard/rfqs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to RFQs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/rfqs')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to RFQs
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{rfq.title}</h1>
              <p className="text-muted-foreground">
                RFQ ID: {rfq.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-sm", getStatusColor(rfq.status))}>
              {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* RFQ Details */}
            <Card>
              <CardHeader>
                <CardTitle>RFQ Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {rfq.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Category</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {rfq.category.name}
                      {rfq.subcategory && ` > ${rfq.subcategory.name}`}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Quantity</h4>
                    <p className="text-gray-600 dark:text-gray-400">{rfq.quantity} units</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Budget Range</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(rfq.budgetMin)} - {formatCurrency(rfq.budgetMax)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Delivery Timeline</h4>
                    <p className="text-gray-600 dark:text-gray-400">{rfq.deliveryTimeline}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Delivery Location</h4>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {rfq.deliveryLocation}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Expires On</h4>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(rfq.expiresAt)}
                    </p>
                  </div>
                </div>

                {/* Specifications */}
                {rfq.specifications && rfq.specifications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Technical Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rfq.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="font-medium">{spec.key}:</span>
                          <span className="text-gray-600 dark:text-gray-400">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {rfq.attachments && rfq.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Attachments</h4>
                    <div className="space-y-2">
                      {rfq.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{attachment.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(attachment.size)}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bids Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Received Bids ({rfq.bids?.length || 0})</span>
                  <Badge variant="outline">{rfq.bids?.filter(bid => bid.status === 'pending').length || 0} Pending</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rfq.bids && rfq.bids.length > 0 ? (
                  <div className="space-y-4">
                    {rfq.bids.map((bid) => (
                      <div key={bid.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-medium">{bid.supplier.name}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>Rating: {bid.supplier.rating}/5</span>
                                <span>•</span>
                                <span>Response time: {bid.supplier.responseTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(bid.price)}
                            </div>
                            <Badge className={cn("text-xs", getBidStatusColor(bid.status))}>
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-500">Delivery Time:</span>
                            <p className="font-medium">{bid.deliveryTime} {bid.deliveryTimeUnit}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Submitted:</span>
                            <p className="font-medium">{formatDate(bid.submittedAt)}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Description:</span>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">{bid.description}</p>
                        </div>
                        
                        {bid.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept Bid
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Negotiate
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Bids Yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Suppliers haven't submitted any bids for this RFQ yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buyer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Buyer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{rfq.buyer.name}</h4>
                      {rfq.buyer.company && (
                        <p className="text-sm text-gray-500">{rfq.buyer.company}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{rfq.buyer.email}</span>
                    </div>
                    {rfq.buyer.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{rfq.buyer.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Rating:</span>
                      <span className="font-medium">{rfq.buyer.rating}/5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Orders:</span>
                      <span className="font-medium">{rfq.buyer.totalOrders}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Bid */}
            {rfq.status === 'published' && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Bid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bid Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Enter your bid amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Time</label>
                      <Input
                        type="number"
                        placeholder="Time"
                        value={bidDeliveryTime}
                        onChange={(e) => setBidDeliveryTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit</label>
                      <select
                        value={bidDeliveryUnit}
                        onChange={(e) => setBidDeliveryUnit(e.target.value as 'days' | 'weeks' | 'months')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      placeholder="Describe your offer, terms, and any additional services..."
                      value={bidDescription}
                      onChange={(e) => setBidDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitBid}
                    disabled={submittingBid}
                    className="w-full"
                  >
                    {submittingBid ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Bid
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* RFQ Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">RFQ Published</p>
                      <p className="text-xs text-gray-500">{formatDate(rfq.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Accepting Bids</p>
                      <p className="text-xs text-gray-500">Until {formatDate(rfq.expiresAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bid Evaluation</p>
                      <p className="text-xs text-gray-400">Pending</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Award Contract</p>
                      <p className="text-xs text-gray-400">Pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}