'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QuestionMarkCircleIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Center</h1>
          <p className="text-muted-foreground">Get help and support for your business needs</p>
        </div>
        <Button>
          <TicketIcon className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <TicketIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">2h</p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
              <QuestionMarkCircleIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>How can we help you?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <TicketIcon className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-medium mb-2">Submit a Ticket</h3>
                <p className="text-sm text-muted-foreground">Get technical support for your account</p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-medium mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Chat with our support team</p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <QuestionMarkCircleIcon className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-medium mb-2">FAQ</h3>
                <p className="text-sm text-muted-foreground">Find answers to common questions</p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <PhoneIcon className="h-8 w-8 text-orange-500 mb-3" />
                <h3 className="font-medium mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground">Call us for urgent issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: '#12345', subject: 'Payment Issue', status: 'Open', priority: 'High' },
                { id: '#12344', subject: 'Account Access', status: 'In Progress', priority: 'Medium' },
                { id: '#12343', subject: 'Product Listing', status: 'Resolved', priority: 'Low' },
              ].map((ticket, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{ticket.id}</p>
                    <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={ticket.status === 'Resolved' ? 'default' : 'outline'}
                      className={
                        ticket.status === 'Open' ? 'text-red-600 border-red-200' :
                        ticket.status === 'In Progress' ? 'text-yellow-600 border-yellow-200' :
                        'text-green-600 border-green-200'
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-6 w-6 text-blue-500" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@vikareta.com</p>
                <p className="text-xs text-muted-foreground">Response within 2 hours</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                <p className="text-xs text-muted-foreground">Mon-Fri, 9 AM - 6 PM EST</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-500" />
              <div>
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
                <p className="text-xs text-muted-foreground">Average wait time: 2 minutes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}