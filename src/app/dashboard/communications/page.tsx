'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  InboxIcon,
  BellIcon,
  SpeakerWaveIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function CommunicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Communications</h1>
          <p className="text-muted-foreground">Manage messages, notifications, and announcements</p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <EnvelopeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <BellIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Announcements</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <SpeakerWaveIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <InboxIcon className="h-5 w-5" />
              <span>Recent Messages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  sender: 'John Smith', 
                  subject: 'Order #12345 Inquiry', 
                  time: '2 hours ago', 
                  unread: true,
                  type: 'order'
                },
                { 
                  sender: 'Sarah Johnson', 
                  subject: 'Product Availability Question', 
                  time: '5 hours ago', 
                  unread: true,
                  type: 'product'
                },
                { 
                  sender: 'Mike Wilson', 
                  subject: 'Payment Confirmation', 
                  time: '1 day ago', 
                  unread: false,
                  type: 'payment'
                },
              ].map((message, index) => (
                <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${message.unread ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className={`font-medium ${message.unread ? 'text-blue-900' : ''}`}>
                        {message.sender}
                      </p>
                      <p className="text-sm text-muted-foreground">{message.subject}</p>
                      <p className="text-xs text-muted-foreground">{message.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {message.unread && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        New
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5" />
              <span>Recent Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  title: 'New Order Received', 
                  message: 'Order #12346 has been placed', 
                  time: '1 hour ago',
                  type: 'order',
                  icon: InboxIcon
                },
                { 
                  title: 'Payment Processed', 
                  message: 'Payment for Order #12345 completed', 
                  time: '3 hours ago',
                  type: 'payment',
                  icon: EnvelopeIcon
                },
                { 
                  title: 'Low Stock Alert', 
                  message: 'Product ABC is running low on stock', 
                  time: '6 hours ago',
                  type: 'inventory',
                  icon: BellIcon
                },
              ].map((notification, index) => {
                const IconComponent = notification.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}