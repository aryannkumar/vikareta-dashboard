'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Star,
  Clock,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: 'website' | 'referral' | 'social' | 'advertisement' | 'cold_outreach' | 'trade_show';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score: number;
  estimatedValue: number;
  lastActivity: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  notes?: string;
  createdAt: string;
  convertedAt?: string;
  tags?: string[];
}

interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageLeadValue: number;
  totalPipelineValue: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (sourceFilter !== 'all') params.source = sourceFilter;

      const response = await apiClient.get('/customers/leads', { params });
      
      if (response.success && response.data) {
        const data = response.data as any;
        setLeads(data.leads || []);
        setStats(data.stats || null);
      } else {
        // Fallback data for development
        const fallbackLeads: Lead[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            phone: '+91 98765 43210',
            company: 'TechCorp Industries',
            source: 'website',
            status: 'qualified',
            score: 85,
            estimatedValue: 150000,
            lastActivity: '2024-01-20T10:30:00Z',
            assignedTo: {
              id: 'user-1',
              name: 'Sarah Johnson'
            },
            notes: 'Interested in industrial pumps for new facility',
            createdAt: '2024-01-15T09:00:00Z',
            tags: ['high-value', 'industrial']
          },
          {
            id: '2',
            name: 'Maria Garcia',
            email: 'maria@manufacturing.com',
            phone: '+91 87654 32109',
            company: 'Garcia Manufacturing',
            source: 'referral',
            status: 'proposal',
            score: 92,
            estimatedValue: 250000,
            lastActivity: '2024-01-19T15:45:00Z',
            assignedTo: {
              id: 'user-2',
              name: 'Mike Chen'
            },
            notes: 'Needs complete generator setup for factory expansion',
            createdAt: '2024-01-10T11:20:00Z',
            tags: ['enterprise', 'generators']
          },
          {
            id: '3',
            name: 'David Wilson',
            email: 'david.wilson@startup.io',
            company: 'Wilson Startup',
            source: 'social',
            status: 'new',
            score: 45,
            estimatedValue: 50000,
            lastActivity: '2024-01-21T08:15:00Z',
            notes: 'Small business looking for basic equipment',
            createdAt: '2024-01-21T08:15:00Z',
            tags: ['startup', 'small-business']
          }
        ];

        const fallbackStats: LeadStats = {
          totalLeads: 156,
          newLeads: 23,
          qualifiedLeads: 45,
          conversionRate: 18.5,
          averageLeadValue: 125000,
          totalPipelineValue: 2850000
        };

        setLeads(fallbackLeads);
        setStats(fallbackStats);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sourceFilter]);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/customers/leads/${leadId}`, { status: newStatus });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Lead status updated successfully.',
        });
        loadLeads();
      } else {
        throw new Error('Failed to update lead status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'qualified': return 'bg-green-100 text-green-800 border-green-200';
      case 'proposal': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'won': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'website': return 'bg-blue-50 text-blue-700';
      case 'referral': return 'bg-green-50 text-green-700';
      case 'social': return 'bg-purple-50 text-purple-700';
      case 'advertisement': return 'bg-orange-50 text-orange-700';
      case 'cold_outreach': return 'bg-gray-50 text-gray-700';
      case 'trade_show': return 'bg-indigo-50 text-indigo-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Lead Management
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Track and nurture potential customers through your sales pipeline.
          </motion.p>
        </div>
        
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadLeads}
              disabled={loading}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setShowNewLeadDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            {
              title: "Total Leads",
              value: stats.totalLeads.toString(),
              description: "All time",
              icon: Users,
              color: "blue",
              trend: "stable"
            },
            {
              title: "New Leads",
              value: stats.newLeads.toString(),
              description: "This month",
              icon: UserPlus,
              color: "green",
              trend: "up"
            },
            {
              title: "Qualified",
              value: stats.qualifiedLeads.toString(),
              description: "Ready for proposal",
              icon: Target,
              color: "purple",
              trend: "up"
            },
            {
              title: "Conversion Rate",
              value: `${stats.conversionRate}%`,
              description: "Lead to customer",
              icon: TrendingUp,
              color: "orange",
              trend: "up"
            },
            {
              title: "Avg Lead Value",
              value: formatCurrency(stats.averageLeadValue),
              description: "Expected revenue",
              icon: DollarSign,
              color: "emerald",
              trend: "stable"
            },
            {
              title: "Pipeline Value",
              value: formatCurrency(stats.totalPipelineValue),
              description: "Total potential",
              icon: Star,
              color: "indigo",
              trend: "up"
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-${metric.color}-200/50 hover:shadow-xl transition-all duration-300`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{metric.title}</p>
                      <p className={`text-lg font-bold text-${metric.color}-700 dark:text-${metric.color}-300`}>
                        {metric.value}
                      </p>
                      <p className={`text-xs text-${metric.color}-600 dark:text-${metric.color}-400 mt-1`}>
                        {metric.description}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className={`w-10 h-10 bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <metric.icon className="h-5 w-5 text-white" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                  <Input
                    placeholder="Search leads by name, email, company, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-blue-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-40 border-blue-200">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                    <SelectItem value="trade_show">Trade Show</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={loadLeads} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leads Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-blue-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Leads ({leads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <motion.div 
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-300">Loading leads...</p>
              </motion.div>
            ) : leads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-blue-200/50">
                    <TableHead>Lead</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Estimated Value</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {lead.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            )}
                            {lead.company && (
                              <div className="text-xs text-gray-400">
                                {lead.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className={cn("text-lg font-bold", getScoreColor(lead.score))}>
                            {lead.score}
                          </div>
                          <div className="text-xs text-gray-500">score</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getSourceColor(lead.source))}>
                          {lead.source.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusUpdate(lead.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={cn("text-xs border-0", getStatusColor(lead.status))}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(lead.estimatedValue)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.assignedTo ? (
                          <div className="text-sm">
                            <div className="font-medium">{lead.assignedTo.name}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(lead.lastActivity)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          {lead.status === 'qualified' && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusUpdate(lead.id, 'won')}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Convert
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <motion.div 
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                    ? 'No leads match your current filters. Try adjusting your search criteria.'
                    : 'Start building your sales pipeline by adding your first lead.'
                  }
                </p>
                <Button 
                  onClick={() => setShowNewLeadDialog(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Lead
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}