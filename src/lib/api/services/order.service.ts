import { apiClient } from '../client';

export interface Order {
  id: string;
  orderNumber: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  totalAmount: number;
  currency: string;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod?: PaymentMethod;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  taxAmount: number;
  variant?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'wallet' | 'cod';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  accountNumber?: string;
}

export interface CreateOrderData {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
    variant?: Record<string, any>;
    metadata?: Record<string, any>;
  }>;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateOrderData {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface OrderFilter {
  businessId?: string;
  customerId?: string;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export class OrderService {
  // Get orders with filtering
  static async getOrders(filters: OrderFilter = {}): Promise<{ orders: Order[]; total: number; }> {
    const response = await apiClient.get('/orders', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch orders');
    }
    return response.data as { orders: Order[]; total: number; };
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch order');
    }
    return response.data as Order;
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber: string): Promise<Order> {
    const response = await apiClient.get(`/orders/number/${orderNumber}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch order');
    }
    return response.data as Order;
  }

  // Create order
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await apiClient.post('/orders', orderData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create order');
    }
    return response.data as Order;
  }

  // Update order
  static async updateOrder(id: string, orderData: UpdateOrderData): Promise<Order> {
    const response = await apiClient.put(`/orders/${id}`, orderData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update order');
    }
    return response.data as Order;
  }

  // Delete order
  static async deleteOrder(id: string): Promise<void> {
    const response = await apiClient.delete(`/orders/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete order');
    }
  }

  // Cancel order
  static async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${id}/cancel`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel order');
    }
    return response.data as Order;
  }

  // Confirm order
  static async confirmOrder(id: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${id}/confirm`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to confirm order');
    }
    return response.data as Order;
  }

  // Process order
  static async processOrder(id: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${id}/process`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to process order');
    }
    return response.data as Order;
  }

  // Ship order
  static async shipOrder(id: string, trackingNumber?: string, carrier?: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${id}/ship`, { trackingNumber, carrier });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to ship order');
    }
    return response.data as Order;
  }

  // Deliver order
  static async deliverOrder(id: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${id}/deliver`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to deliver order');
    }
    return response.data as Order;
  }

  // Refund order
  static async refundOrder(id: string, amount?: number, reason?: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${id}/refund`, { amount, reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to refund order');
    }
    return response.data as Order;
  }

  // Get order items
  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const response = await apiClient.get(`/orders/${orderId}/items`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch order items');
    }
    return response.data as OrderItem[];
  }

  // Add item to order
  static async addOrderItem(orderId: string, itemData: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
    variant?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<OrderItem> {
    const response = await apiClient.post(`/orders/${orderId}/items`, itemData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add item to order');
    }
    return response.data as OrderItem;
  }

  // Update order item
  static async updateOrderItem(orderId: string, itemId: string, itemData: {
    quantity?: number;
    unitPrice?: number;
    discountAmount?: number;
    variant?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<OrderItem> {
    const response = await apiClient.put(`/orders/${orderId}/items/${itemId}`, itemData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update order item');
    }
    return response.data as OrderItem;
  }

  // Remove item from order
  static async removeOrderItem(orderId: string, itemId: string): Promise<void> {
    const response = await apiClient.delete(`/orders/${orderId}/items/${itemId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove item from order');
    }
  }

  // Get order history
  static async getOrderHistory(orderId: string): Promise<Array<{
    id: string;
    orderId: string;
    action: string;
    oldValue?: any;
    newValue?: any;
    performedBy: string;
    performedAt: string;
    notes?: string;
  }>> {
    const response = await apiClient.get(`/orders/${orderId}/history`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch order history');
    }
    return response.data as Array<{
      id: string;
      orderId: string;
      action: string;
      oldValue?: any;
      newValue?: any;
      performedBy: string;
      performedAt: string;
      notes?: string;
    }>;
  }

  // Get order analytics
  static async getOrderAnalytics(businessId?: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    revenueByStatus: Record<string, number>;
    topProducts: Array<{ productId: string; productName: string; quantity: number; revenue: number; }>;
    ordersByDate: Array<{ date: string; orders: number; revenue: number; }>;
    customerRetention: number;
    repeatPurchaseRate: number;
  }> {
    const response = await apiClient.get('/orders/analytics', { businessId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch order analytics');
    }
    return response.data as {
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      ordersByStatus: Record<string, number>;
      revenueByStatus: Record<string, number>;
      topProducts: Array<{ productId: string; productName: string; quantity: number; revenue: number; }>;
      ordersByDate: Array<{ date: string; orders: number; revenue: number; }>;
      customerRetention: number;
      repeatPurchaseRate: number;
    };
  }

  // Export orders
  static async exportOrders(filters: OrderFilter = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/orders/export', { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export orders');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Bulk update orders
  static async bulkUpdateOrders(orderIds: string[], updates: UpdateOrderData): Promise<{ updated: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.put('/orders/bulk', { orderIds, updates });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk update orders');
    }
    return response.data as { updated: number; failed: number; errors?: string[]; };
  }

  // Bulk cancel orders
  static async bulkCancelOrders(orderIds: string[], reason?: string): Promise<{ cancelled: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/orders/bulk-cancel', { orderIds, reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk cancel orders');
    }
    return response.data as { cancelled: number; failed: number; errors?: string[]; };
  }

  // Get order invoice
  static async getOrderInvoice(orderId: string): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.get(`/orders/${orderId}/invoice`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch order invoice');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Send order confirmation
  static async sendOrderConfirmation(orderId: string): Promise<{ success: boolean; }> {
    const response = await apiClient.post(`/orders/${orderId}/send-confirmation`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send order confirmation');
    }
    return response.data as { success: boolean; };
  }

  // Get order tracking information
  static async getOrderTracking(orderId: string): Promise<{
    trackingNumber?: string;
    carrier?: string;
    status: string;
    estimatedDelivery?: string;
    trackingUrl?: string;
    events: Array<{
      status: string;
      description: string;
      location?: string;
      timestamp: string;
    }>;
  }> {
    const response = await apiClient.get(`/orders/${orderId}/tracking`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch order tracking');
    }
    return response.data as {
      trackingNumber?: string;
      carrier?: string;
      status: string;
      estimatedDelivery?: string;
      trackingUrl?: string;
      events: Array<{
        status: string;
        description: string;
        location?: string;
        timestamp: string;
      }>;
    };
  }

  // Search orders
  static async searchOrders(query: string, filters: OrderFilter = {}): Promise<{ orders: Order[]; total: number; }> {
    const response = await apiClient.get('/orders/search', { query, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to search orders');
    }
    return response.data as { orders: Order[]; total: number; };
  }

  // Get customer orders
  static async getCustomerOrders(customerId: string, filters: Omit<OrderFilter, 'customerId'> = {}): Promise<{ orders: Order[]; total: number; }> {
    const response = await apiClient.get(`/orders/customer/${customerId}`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch customer orders');
    }
    return response.data as { orders: Order[]; total: number; };
  }

  // Duplicate order
  static async duplicateOrder(orderId: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${orderId}/duplicate`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to duplicate order');
    }
    return response.data as Order;
  }

  // Get order fulfillment status
  static async getOrderFulfillmentStatus(orderId: string): Promise<{
    orderId: string;
    overallStatus: string;
    items: Array<{
      itemId: string;
      productId: string;
      productName: string;
      quantity: number;
      fulfilledQuantity: number;
      status: string;
      estimatedFulfillmentDate?: string;
    }>;
  }> {
    const response = await apiClient.get(`/orders/${orderId}/fulfillment`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch order fulfillment status');
    }
    return response.data as {
      orderId: string;
      overallStatus: string;
      items: Array<{
        itemId: string;
        productId: string;
        productName: string;
        quantity: number;
        fulfilledQuantity: number;
        status: string;
        estimatedFulfillmentDate?: string;
      }>;
    };
  }
}