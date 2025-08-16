'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TicketIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function SupportTicketsPage() {
  const tickets = [
    {
      id: '#12345',
      subject: 'Payment Processing Issue',
      description: 'Unable to process payment for order #ORD-2024-001',
      status: 'Open',
      priority: 'High',
      category: 'Payment',
      created: '2024-01-15',
      updated: '2024-01-15',
      assignee: 'Sarah Johnson'
    },
    {
      id: '#12344',
      subject: 'Account Access Problem',
      description: 'Cannot login to dashboard after password reset',
      status: 'In Progress',
      priority: 'Medium',
      category: 'Account',
      created: '2024-01-14',
      updated: '2024-01-15',
      assignee: 'Mike Wilson'
    },
    {
      id: '#12343',
      subject: 'Product Listing Not Visible',
      description: 'My product listing is not showing in search results',
      status: 'Resolved',
      priority: 'Low',
      category: 'Products',
      created: '2024-01-13',
      updated: '2024-01-14',
      assignee: 'John Smith'
    },
    {
      id: '#12342',
      subject: 'API Integration Help',
      description: 'Need assistance with API integration for inventory sync',
      status: 'Open',
      priority: 'Medium',
      category: 'Technical',
      created: '2024-01-12',
      updated: '2024-01-13',
      assignee: 'Lisa Chen'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'In Progress':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'Resolved':
        return 'text-green-600 border-green-200 bg-green-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 border-red-200';
      case 'Medium':
        return 'text-yellow-600 border-yellow-200';
      case 'Low':
        return 'text-green-600 border-green-200';
      default:
        return 'text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and track your support requests</p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
              <TicketIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.status === 'Open').length}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'In Progress').length}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'Resolved').length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tickets</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." className="pl-10 w-64" />
              </div>
              <select className="border rounded-md px-3 py-2">
                <option>All Status</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{ticket.id}</h3>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">
                        {ticket.category}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-lg mb-1">{ticket.subject}</h4>
                    <p className="text-muted-foreground text-sm mb-3">{ticket.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Created: {ticket.created}</span>
                      <span>•</span>
                      <span>Updated: {ticket.updated}</span>
                      <span>•</span>
                      <span>Assignee: {ticket.assignee}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing 1-{tickets.length} of {tickets.length} tickets
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}