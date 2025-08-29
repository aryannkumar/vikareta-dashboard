'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users,
  Eye, 
  UserPlus,
  Phone,
  Mail,
  RefreshCw,
  Search,
  Filter,
  Star,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Target,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface CustomerLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'converted' | 'lost';
  source: 'website' | 'referral' | 'social_media' | 'advertisement' | 'trade_show' | 'cold_outreach' | 'other';
  score: number; // Lead scoring 0-100
  estimatedValue: number;
  currency: string;
  interests: string[];
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  activities: Array<{
    id: string;
    type: 'email' | 'call' | 'meeting' | 'note';
    description: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  daysSinceCreated: number;
  daysSinceLastContact: number;
}

interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageLeadScore: number;
  totalEstimatedValue: number;
  averageTimeToConversion: number;
}

export default function CustomerLeadsPage() {
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadLeads = useCallback(async (p = 1, searchT = searchTerm, statusF = statusFilter, sourceF = sourceFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        page: p, 
        limit: 20 
      };
      
      if (searchT.trim()) params.search = searchT.trim();
      if (statusF !== 'all' && statusF) params.status = statusF;
      if (sourceF !== 'all' && sourceF) params.source = sourceF;

      const response = await apiClient.getCustomerLeads(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setLeads(data);
          setPages(1);
          setTotal(data.length);
        } else {
          setLeads(data.leads || data.data || []);
          setPages(data.pagination?.pages || 0);
          setTotal(data.pagination?.total || 0);
        }
      } else {
        setLeads([]);
        setPages(0);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load leads:', err);
      setError(err?.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sourceFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getLeadStats();
      
      if (response.success && response.data) {
        setStats(response.data as LeadStats);
      } else {
        // Calculate stats from current leads if API doesn't exist
        const newLeads = leads.filter(l => l.status === 'new').length;
        const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
        const convertedLeads = leads.filter(l => l.status === 'converted').length;
        const lostLeads = leads.filter(l => l.status === 'lost').length;
        const totalEstimatedValue = leads.reduce((sum, l) => sum + l.estimatedValue, 0);
        const averageLeadScore = leads.length > 0 
          ? leads.reduce((sum, l) => sum + l.score, 0) / leads.length 
          : 0;
        const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;
        
        setStats({
          totalLeads: leads.length,
          newLeads,
          qualifiedLeads,
          convertedLeads,
          lostLeads,
          conversionRate,
          averageLeadScore,
          totalEstimatedValue,
          averageTimeToConversion: 14.5 // Default value in days
        });
      }
    } catch (err) {
      console.error('Failed to load lead stats:', err);
      // Use fallback stats
      setStats({
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        convertedLeads: 0,
        lostLeads: 0,
        conversionRate: 0,
        averageLeadScore: 0,
        totalEstimatedValue: 0,
        averageTimeToConversion: 0
      });
    }
  }, [leads]);

  const handleLeadAction = async (leadId: string, action: string) => {
    try {
      let response;
      if (action === 'convert') {
        response = await apiClient.convertLeadToCustomer(leadId, {});
      } else {
        response = await apiClient.updateLeadStatus(leadId, action);
      }
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Lead ${action} successfully.`,
        });
        loadLeads();
        loadStats();
      } else {
        throw new Error(response.error?.message || `Failed to ${action} lead`);
      }
    } catch (error: any) {
      console.error(`Failed to ${action} lead:`, error);
      toast({
        title: 'Error',
        description: error?.message || `Failed to ${action} lead. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadLeads(1, searchTerm, statusFilter, sourceFilter);
  };

  const handleRefresh = () => {
    loadLeads(page, searchTerm, statusFilter, sourceFilter);
    loadStats();
  };

  useEffect(() => {
    loadLeads(1);
  }, [loadLeads]);

  useEffect(() => {
    if (leads.length > 0) {
      loadStats();
    }
  }, [leads, loadStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal_sent': return 'bg-purple-100 text-purple-800';
      case 'negotiating': return 'bg-orange-100 text-orange-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website': return '🌐';
      case 'referral': return '👥';
      case 'social_media': return '📱';
      case 'advertisement': return '📢';
      case 'trade_show': return '🏢';
      case 'cold_outreach': return '📞';
      default: return '📋';
    }
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
          ? 'No leads match your current filters. Try adjusting your search criteria.'
          : 'You don\'t have any leads yet. Start generating leads through marketing campaigns.'
        }
      </p>
      {(searchTerm || statusFilter !== 'all' || sourceFilter !== 'all') && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setSourceFilter('all');
            setPage(1);
            loadLeads(1, '', 'all', 'all');
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Users className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to Load Leads</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Customer Leads</h1>
          <p className="text-muted-foreground">
            Manage and nurture your sales leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/customers">
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              All Customers
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalLeads}</div>
                  <div className="text-sm text-muted-foreground">Total Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
                  <div className="text-sm text-muted-foreground">Qualified</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalEstimatedValue)}</div>
                  <div className="text-sm text-muted-foreground">Est. Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, company, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="negotiating">Negotiating</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
              
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="advertisement">Advertisement</option>
                <option value="trade_show">Trade Show</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="other">Other</option>
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Leads ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && leads.length === 0 ? (
            renderLoadingState()
          ) : error && leads.length === 0 ? (
            renderErrorState()
          ) : leads.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{lead.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{lead.email}</span>
                            {lead.company && <span>{lead.company}</span>}
                            <span>{getSourceIcon(lead.source)} {lead.source.replace('_', ' ')}</span>
                            <span>Created {lead.daysSinceCreated} days ago</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm mt-1">
                            <span className={`font-medium ${getScoreColor(lead.score)}`}>
                              Score: {lead.score}/100
                            </span>
                            <span className="text-muted-foreground">
                              Est. Value: {formatCurrency(lead.estimatedValue)}
                            </span>
                            {lead.lastContactDate && (
                              <span className="text-muted-foreground">
                                Last contact: {formatDate(lead.lastContactDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/dashboard/customers/leads/${lead.id}`} className="flex items-center w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              Make Call
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {lead.status !== 'converted' && lead.status !== 'lost' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleLeadAction(lead.id, 'qualified')}
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  Mark Qualified
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleLeadAction(lead.id, 'convert')}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Convert to Customer
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} leads
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1 || loading} 
              onClick={() => { 
                const np = page - 1; 
                setPage(np); 
                loadLeads(np, searchTerm, statusFilter, sourceFilter); 
              }}
            >
              Previous
            </Button>
            <div className="text-sm px-3 py-2">
              Page {page} of {pages}
            </div>
            <Button 
              variant="outline" 
              disabled={page >= pages || loading} 
              onClick={() => { 
                const np = page + 1; 
                setPage(np); 
                loadLeads(np, searchTerm, statusFilter, sourceFilter); 
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}