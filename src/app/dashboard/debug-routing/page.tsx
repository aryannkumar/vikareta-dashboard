'use client';

import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugRoutingPage() {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>🐛 Debug Routing Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Current Route Information:</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Pathname:</strong> {pathname}</p>
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                <p><strong>Page:</strong> Debug Routing Page</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Test Results:</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>✅ This page loaded successfully</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>✅ Next.js routing is working</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>✅ Dashboard layout is rendering</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Instructions:</h3>
              <div className="bg-blue-50 p-4 rounded-lg text-sm">
                <p>If you can see this page, routing is working correctly. The issue might be:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Browser cache - try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)</li>
                  <li>Service worker cache - check DevTools &gt; Application &gt; Storage</li>
                  <li>Next.js cache - the server might need to be restarted</li>
                  <li>Client-side navigation issue - try direct URL access</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}