'use client';

import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-warning-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact your administrator 
            or check if you're using the correct account.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Go Back
            </Button>
            
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Contact support at{' '}
              <a 
                href="mailto:support@vikareta.com" 
                className="text-primary hover:underline"
              >
                support@vikareta.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}