'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowTrendingUpIcon,
  FireIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  ArrowUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function TrendingPage() {
  const trendingProducts = [
    {
      name: 'Smart Industrial Sensors',
      category: 'Electronics',
      price: '$45.99',
      growth: '+45%',
      views: '12.5K',
      rating: 4.8,
      supplier: 'TechCorp Industries',
      timeframe: '24h'
    },
    {
      name: 'Eco-Friendly Packaging Materials',
      category: 'Materials',
      price: '$23.50',
      growth: '+38%',
      views: '9.8K',
      rating: 4.6,
      supplier: 'GreenPack Solutions',
      timeframe: '24h'
    },
    {
      name: 'Automated Assembly Line Components',
      category: 'Machinery',
      price: '$1,299.00',
      growth: '+32%',
      views: '7.2K',
      rating: 4.9,
      supplier: 'AutoMech Ltd',
      timeframe: '24h'
    },
    {
      name: 'Medical Grade Protective Equipment',
      category: 'Healthcare',
      price: '$89.99',
      growth: '+28%',
      views: '15.3K',
      rating: 4.7,
      supplier: 'MedSafe Corp',
      timeframe: '24h'
    },
  ];

  const trendingCategories = [
    { name: 'Renewable Energy', growth: '+52%', products: 1234 },
    { name: 'Smart Manufacturing', growth: '+41%', products: 987 },
    { name: 'Sustainable Materials', growth: '+35%', products: 756 },
    { name: 'IoT Devices', growth: '+29%', products: 654 },
    { name: 'Safety Equipment', growth: '+24%', products: 543 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
            <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" />
            <span>Trending Now</span>
          </h1>
          <p className="text-muted-foreground">Discover the hottest products and categories in B2B marketplace</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            <ClockIcon className="h-3 w-3 mr-1" />
            Updated hourly
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trending Products</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <FireIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hot Categories</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">156K</p>
              </div>
              <EyeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Growth</p>
                <p className="text-2xl font-bold text-green-600">+34%</p>
              </div>
              <ArrowUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trending Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FireIcon className="h-5 w-5 text-red-500" />
              <span>Hottest Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingProducts.map((product, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="aspect-square w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">IMG</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category} • {product.supplier}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-muted-foreground">({product.rating})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{product.views} views</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{product.price}</p>
                    <Badge variant="outline" className="text-green-600 border-green-200 mt-1">
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      {product.growth}
                    </Badge>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <HeartIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-orange-500" />
              <span>Hot Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.products.toLocaleString()} products
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {category.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Insights */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Trending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Peak Hours</h4>
              <p className="text-2xl font-bold text-blue-600">2-4 PM</p>
              <p className="text-sm text-muted-foreground">Highest activity</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Top Region</h4>
              <p className="text-2xl font-bold text-green-600">Asia</p>
              <p className="text-sm text-muted-foreground">45% of trends</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Fastest Growing</h4>
              <p className="text-2xl font-bold text-orange-600">IoT</p>
              <p className="text-sm text-muted-foreground">+67% this week</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Most Searched</h4>
              <p className="text-2xl font-bold text-purple-600">Sensors</p>
              <p className="text-sm text-muted-foreground">12K searches</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}