'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TagIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const categories = [
    {
      name: 'Electronics & Electrical',
      subcategories: 12,
      products: 2456,
      trending: true,
      description: 'Electronic components, electrical equipment, and consumer electronics'
    },
    {
      name: 'Machinery & Industrial Equipment',
      subcategories: 8,
      products: 1890,
      trending: true,
      description: 'Industrial machinery, manufacturing equipment, and tools'
    },
    {
      name: 'Textiles & Apparel',
      subcategories: 15,
      products: 1234,
      trending: false,
      description: 'Fabrics, clothing, accessories, and textile materials'
    },
    {
      name: 'Chemicals & Materials',
      subcategories: 6,
      products: 987,
      trending: true,
      description: 'Raw chemicals, construction materials, and specialty compounds'
    },
    {
      name: 'Automotive & Transportation',
      subcategories: 10,
      products: 756,
      trending: false,
      description: 'Auto parts, vehicles, and transportation equipment'
    },
    {
      name: 'Food & Beverage',
      subcategories: 9,
      products: 654,
      trending: false,
      description: 'Food products, beverages, and food processing equipment'
    },
    {
      name: 'Healthcare & Medical',
      subcategories: 7,
      products: 543,
      trending: true,
      description: 'Medical devices, pharmaceuticals, and healthcare equipment'
    },
    {
      name: 'Construction & Real Estate',
      subcategories: 11,
      products: 432,
      trending: false,
      description: 'Building materials, construction equipment, and real estate services'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Categories</h1>
          <p className="text-muted-foreground">Explore products organized by industry categories</p>
        </div>
        <Button>
          <TagIcon className="h-4 w-4 mr-2" />
          Suggest Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <TagIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => sum + cat.products, 0).toLocaleString()}
                </p>
              </div>
              <EyeIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trending Categories</p>
                <p className="text-2xl font-bold">
                  {categories.filter(cat => cat.trending).length}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TagIcon className="h-5 w-5 text-primary" />
                  <span>{category.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {category.trending && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{category.products.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{category.subcategories}</p>
                    <p className="text-xs text-muted-foreground">Subcategories</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.products.toLocaleString()} products
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {category.trending && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      +15%
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}