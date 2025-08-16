'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TestNavigationPage() {
  const router = useRouter();

  const testRoutes = [
    { path: '/dashboard', label: 'Dashboard Home' },
    { path: '/dashboard/orders', label: 'Orders' },
    { path: '/dashboard/products', label: 'Products' },
    { path: '/dashboard/analytics', label: 'Analytics' },
    { path: '/dashboard/wallet', label: 'Wallet' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>This page tests if navigation is working properly. Try clicking the links below:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testRoutes.map((route) => (
                <div key={route.path} className="space-y-2">
                  <h3 className="font-medium">{route.label}</h3>
                  <div className="flex gap-2">
                    <Link href={route.path}>
                      <Button variant="outline" size="sm">
                        Link Navigation
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log('Programmatic navigation to:', route.path);
                        router.push(route.path);
                      }}
                    >
                      Router Navigation
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Debug Information:</h3>
              <ul className="text-sm space-y-1">
                <li>• Check browser console for click events</li>
                <li>• Try both Link and Router navigation</li>
                <li>• Check if sidebar navigation works</li>
                <li>• Verify no JavaScript errors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}