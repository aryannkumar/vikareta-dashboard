'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  GlobeAltIcon, 
  MagnifyingGlassIcon,
  FireIcon,
  StarIcon,
  TagIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug indicator */}
      <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
        <p className="text-blue-800 font-medium">🛒 Marketplace page loaded successfully!</p>
        <p className="text-blue-600 text-sm">This is the marketplace overview page.</p>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Discover products and services from verified suppliers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10 w-64" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">12,456</p>
              </div>
              <GlobeAltIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <TagIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trending</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <StarIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FireIcon className="h-5 w-5 text-orange-500" />
              <span>Trending Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Industrial Machinery', category: 'Manufacturing', trending: '+25%' },
                { name: 'Electronic Components', category: 'Electronics', trending: '+18%' },
                { name: 'Raw Materials', category: 'Materials', trending: '+15%' },
                { name: 'Safety Equipment', category: 'Safety', trending: '+12%' },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {product.trending}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Electronics', count: 2456 },
                { name: 'Machinery', count: 1890 },
                { name: 'Textiles', count: 1234 },
                { name: 'Chemicals', count: 987 },
                { name: 'Automotive', count: 756 },
                { name: 'Food & Beverage', count: 654 },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}