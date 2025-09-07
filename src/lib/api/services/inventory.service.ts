import { apiClient } from '../client';

export interface InventoryItem {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  location?: string;
  warehouse?: string;
  supplier?: string;
  costPrice: number;
  sellingPrice: number;
  lastRestocked?: string;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemData {
  productId: string;
  sku: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  location?: string;
  warehouse?: string;
  supplier?: string;
  costPrice: number;
  sellingPrice: number;
  expiryDate?: string;
}

export interface UpdateInventoryItemData {
  quantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  location?: string;
  warehouse?: string;
  supplier?: string;
  costPrice?: number;
  sellingPrice?: number;
  expiryDate?: string;
  status?: 'active' | 'inactive' | 'low_stock' | 'out_of_stock';
}

export class InventoryService {
  // Get all inventory items for a business
  static async getInventory(businessId: string, filters?: {
    status?: string;
    location?: string;
    warehouse?: string;
    page?: number;
    limit?: number;
  }): Promise<{ inventory: InventoryItem[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/inventory', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch inventory');
    }
    return response.data as { inventory: InventoryItem[]; total: number; page: number; totalPages: number; };
  }

  // Get inventory item by ID
  static async getInventoryItemById(id: string): Promise<InventoryItem> {
    const response = await apiClient.get(`/inventory/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch inventory item');
    }
    return response.data as InventoryItem;
  }

  // Create inventory item
  static async createInventoryItem(itemData: CreateInventoryItemData): Promise<InventoryItem> {
    const response = await apiClient.post('/inventory', itemData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create inventory item');
    }
    return response.data as InventoryItem;
  }

  // Update inventory item
  static async updateInventoryItem(id: string, itemData: UpdateInventoryItemData): Promise<InventoryItem> {
    const response = await apiClient.put(`/inventory/${id}`, itemData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update inventory item');
    }
    return response.data as InventoryItem;
  }

  // Delete inventory item
  static async deleteInventoryItem(id: string): Promise<void> {
    const response = await apiClient.delete(`/inventory/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete inventory item');
    }
  }

  // Adjust inventory quantity
  static async adjustInventory(id: string, adjustment: { quantity: number; reason: string; }): Promise<InventoryItem> {
    const response = await apiClient.post(`/inventory/${id}/adjust`, adjustment);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to adjust inventory');
    }
    return response.data as InventoryItem;
  }

  // Bulk adjust inventory
  static async bulkAdjustInventory(adjustments: Array<{ id: string; quantity: number; reason: string; }>): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/inventory/bulk-adjust', { adjustments });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk adjust inventory');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Get low stock alerts
  static async getLowStockAlerts(businessId: string): Promise<InventoryItem[]> {
    const response = await apiClient.get('/inventory/low-stock', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch low stock alerts');
    }
    return response.data as InventoryItem[];
  }

  // Bulk actions for inventory
  static async bulkInventoryAction(actionData: { itemIds: string[]; action: 'activate' | 'deactivate' | 'delete'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/inventory/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export inventory
  static async exportInventory(filters?: { businessId?: string; status?: string; location?: string; warehouse?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/inventory/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export inventory');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}