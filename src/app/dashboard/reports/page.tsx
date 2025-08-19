'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DocumentDuplicateIcon, 
  PlusIcon, 
  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const reportTypes = [
    {
      title: 'Sales Report',
      description: 'Comprehensive sales performance analysis',
      icon: ChartBarIcon,
      color: 'bg-blue-100 text-blue-600',
      lastGenerated: '2024-01-15',
    },
    {
      title: 'Financial Report',
      description: 'Revenue, expenses, and profit analysis',
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 text-green-600',
      lastGenerated: '2024-01-14',
    },
    {
      title: 'Order Report',
      description: 'Order trends and fulfillment metrics',
      icon: ShoppingBagIcon,
      color: 'bg-blue-100 text-blue-600',
      lastGenerated: '2024-01-13',
    },
    {
      title: 'Monthly Summary',
      description: 'Complete monthly business overview',
      icon: CalendarIcon,
      color: 'bg-purple-100 text-purple-600',
      lastGenerated: '2024-01-01',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">Generate and view comprehensive business reports</p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <DocumentDuplicateIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportTypes.map((report, index) => {
                const IconComponent = report.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${report.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last generated: {report.lastGenerated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm">Generate</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Q4 Sales Report', type: 'Sales', date: '2024-01-15', status: 'Ready' },
                { name: 'December Financial', type: 'Financial', date: '2024-01-14', status: 'Processing' },
                { name: 'Order Analysis', type: 'Orders', date: '2024-01-13', status: 'Ready' },
                { name: 'Customer Insights', type: 'Analytics', date: '2024-01-12', status: 'Ready' },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.type} • {report.date}</p>
                  </div>
                  <Badge 
                    variant={report.status === 'Ready' ? 'default' : 'secondary'}
                    className={report.status === 'Ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {report.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}