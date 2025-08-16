'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function SuppliersPage() {
  const suppliers = [
    {
      id: '1',
      name: 'TechCorp Industries',
      category: 'Electronics',
      location: 'Shenzhen, China',
      rating: 4.8,
      reviews: 245,
      products: 156,
      verified: true,
      favorite: false,
      email: 'contact@techcorp.com',
      phone: '+86 755 1234 5678',
      description: 'Leading manufacturer of electronic components and industrial sensors'
    },
    {
      id: '2',
      name: 'GreenPack Solutions',
      category: 'Packaging',
      location: 'Mumbai, India',
      rating: 4.6,
      reviews: 189,
      products: 89,
      verified: true,
      favorite: true,
      email: 'info@greenpack.in',
      phone: '+91 22 9876 5432',
      description: 'Eco-friendly packaging materials and sustainable solutions'
    },
    {
      id: '3',
      name: 'AutoMech Ltd',
      category: 'Machinery',
      location: 'Detroit, USA',
      rating: 4.9,
      reviews: 312,
      products: 234,
      verified: true,
      favorite: false,
      email: 'sales@automech.com',
      phone: '+1 313 555 0123',
      description: 'Automated assembly line components and industrial machinery'
    },
    {
      id: '4',
      name: 'MedSafe Corp',
      category: 'Healthcare',
      location: 'Berlin, Germany',
      rating: 4.7,
      reviews: 156,
      products: 67,
      verified: true,
      favorite: true,
      email: 'contact@medsafe.de',
      phone: '+49 30 1234 5678',
      description: 'Medical grade protective equipment and healthcare supplies'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier relationships and discover new partners</p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
              </div>
              <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {suppliers.filter(s => s.verified).length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold text-red-600">
                  {suppliers.filter(s => s.favorite).length}
                </p>
              </div>
              <HeartIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">4.7</p>
              </div>
              <StarIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Suppliers</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search suppliers..." className="pl-10 w-64" />
              </div>
              <select className="border rounded-md px-3 py-2">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Machinery</option>
                <option>Healthcare</option>
                <option>Packaging</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{supplier.name}</h3>
                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {supplier.verified && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={supplier.favorite ? 'text-red-500' : ''}
                      >
                        <HeartIcon className={`h-4 w-4 ${supplier.favorite ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4">{supplier.description}</p>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(supplier.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm font-medium">{supplier.rating}</span>
                      <span className="text-sm text-muted-foreground">({supplier.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {supplier.products} products available
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm">
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing 1-{suppliers.length} of {suppliers.length} suppliers
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}