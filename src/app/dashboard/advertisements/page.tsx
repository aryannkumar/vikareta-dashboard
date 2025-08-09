'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAdvertisements } from '@/lib/hooks/use-advertisements';
import {
  Target,
  RefreshCw
} from 'lucide-react';

export default function AdvertisementsPage() {
  const {
    advertisements,
    loading,
    error,
    pagination,
    refresh
  } = useAdvertisements({
    autoLoad: true
  });

  if (loading && !advertisements.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading advertisements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Target className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Advertisements</h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Advertisements</h1>
            <p className="text-muted-foreground">Manage your advertising campaigns</p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns ({pagination?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {advertisements.length === 0 ? (
              <div className="text-center py-16">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground">Create your first advertising campaign to start promoting your products.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {advertisements.map((ad) => (
                  <div key={ad.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{ad.title}</h4>
                    <p className="text-sm text-muted-foreground">{ad.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}