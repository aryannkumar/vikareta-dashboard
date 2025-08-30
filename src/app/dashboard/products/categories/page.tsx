'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  TrendingUp,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Filter
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  level: number;
  status: 'active' | 'inactive';
  productsCount: number;
  subcategoriesCount: number;
  imageUrl?: string;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalProducts: number;
  averageProductsPerCategory: number;
}

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parentId: '',
    status: 'active',
    seoTitle: '',
    seoDescription: '',
    keywords: ''
  });
  const { toast } = useToast();

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await apiClient.getCategories(params);

      if (response.success && response.data) {
        setCategories(response.data as Category[]);
      } else {
        // Fallback data for development
        const fallbackCategories: Category[] = [
          {
            id: '1',
            name: 'Industrial Equipment',
            description: 'Heavy machinery and industrial equipment for manufacturing',
            slug: 'industrial-equipment',
            level: 0,
            status: 'active',
            productsCount: 156,
            subcategoriesCount: 8,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            children: [
              {
                id: '1-1',
                name: 'Pumps & Compressors',
                description: 'Industrial pumps and air compressors',
                slug: 'pumps-compressors',
                parentId: '1',
                level: 1,
                status: 'active',
                productsCount: 45,
                subcategoriesCount: 3,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-10T14:20:00Z'
              },
              {
                id: '1-2',
                name: 'Generators',
                description: 'Power generators and electrical equipment',
                slug: 'generators',
                parentId: '1',
                level: 1,
                status: 'active',
                productsCount: 32,
                subcategoriesCount: 2,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-12T09:15:00Z'
              }
            ]
          }
        ];
        setCategories(fallbackCategories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);
  const loadStats = useCallback(async () => {
    try {
      // Fallback stats for development
      const fallbackStats: CategoryStats = {
        totalCategories: 24,
        activeCategories: 22,
        totalProducts: 1247,
        averageProductsPerCategory: 52
      };
      setStats(fallbackStats);
    } catch (err) {
      console.error('Failed to load category stats:', err);
    }
  }, []);

  const createCategory = async () => {
    if (!newCategory.name || !newCategory.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      const response = await apiClient.createCategory(newCategory);
      
      if (response.success) {
        setShowCreateDialog(false);
        setNewCategory({
          name: '',
          description: '',
          parentId: '',
          status: 'active',
          seoTitle: '',
          seoDescription: '',
          keywords: ''
        });
        // Refresh categories to show the new category
        await loadCategories();
      } else {
        setError(response.error?.message || 'Failed to create category');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      console.error('Failed to create category:', err);
    }
  };

  const updateCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      const response = await apiClient.updateCategory(selectedCategory.id, newCategory);
      
      if (response.success) {
        setShowEditDialog(false);
        setSelectedCategory(null);
        setNewCategory({
          name: '',
          description: '',
          parentId: '',
          status: 'active',
          seoTitle: '',
          seoDescription: '',
          keywords: ''
        });
        loadCategories();
      }
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await apiClient.deleteCategory(categoryId);
      
      if (response.success) {
        loadCategories();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className="space-y-2">
        <div 
          className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
            selectedCategory?.id === category.id ? 'border-blue-500 bg-blue-50' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FolderTree className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-gray-600">{category.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{category.productsCount} products</span>
                  <span>{category.subcategoriesCount} subcategories</span>
                  <Badge className={category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {category.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedCategory(category);
                  setNewCategory({
                    name: category.name,
                    description: category.description,
                    parentId: category.parentId || '',
                    status: category.status,
                    seoTitle: category.metadata?.seoTitle || '',
                    seoDescription: category.metadata?.seoDescription || '',
                    keywords: category.metadata?.keywords?.join(', ') || ''
                  });
                  setShowEditDialog(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteCategory(category.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  useEffect(() => {
    loadCategories();
    loadStats();
  }, [loadCategories, loadStats]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <p className="text-gray-600">Organize and manage your product catalog structure</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new product category to organize your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Parent Category</label>
                <Select value={newCategory.parentId} onValueChange={(value) => setNewCategory({ ...newCategory, parentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent (Root Category)</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newCategory.status} onValueChange={(value) => setNewCategory({ ...newCategory, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createCategory}>
                  Create Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCategories} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Products/Category</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProductsPerCategory}</div>
              <p className="text-xs text-muted-foreground">
                Products per category
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCategories}</div>
              <p className="text-xs text-muted-foreground">
                Currently visible
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadCategories} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Category Hierarchy</CardTitle>
          <CardDescription>
            {categories.length} categories found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadCategories} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No categories found</p>
              <p className="text-sm text-gray-400">Create your first category to organize products</p>
            </div>
          ) : (
            <div className="space-y-2">
              {renderCategoryTree(categories)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category Name</label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Category description"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={newCategory.status} onValueChange={(value) => setNewCategory({ ...newCategory, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateCategory}>
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}