import { apiClient } from '../client';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, any>;
  available: boolean;
  maxQuantity?: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
  variantId?: string;
  specifications?: Record<string, any>;
}

export interface UpdateCartItemData {
  quantity: number;
  specifications?: Record<string, any>;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  total: number;
}

export interface CartAvailability {
  available: boolean;
  maxQuantity: number;
  estimatedDelivery: string;
}

export interface CartCoupon {
  discount: number;
  total: number;
  coupon: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
}

export interface CartRecommendation {
  id: string;
  name: string;
  image: string;
  price: number;
  reason: string;
}

export class CartService {
  // Get user's cart
  static async getCart(): Promise<Cart> {
    const response = await apiClient.getCart();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch cart');
    }
    return response.data as Cart;
  }

  // Add item to cart
  static async addItem(data: AddToCartData): Promise<CartItem> {
    const response = await apiClient.addCartItem(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add item to cart');
    }
    return response.data as CartItem;
  }

  // Update cart item
  static async updateItem(itemId: string, data: UpdateCartItemData): Promise<CartItem> {
    const response = await apiClient.updateCartItem(itemId, data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update cart item');
    }
    return response.data as CartItem;
  }

  // Remove item from cart
  static async removeItem(itemId: string): Promise<void> {
    const response = await apiClient.removeCartItem(itemId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove item from cart');
    }
  }

  // Clear cart
  static async clearCart(): Promise<void> {
    const response = await apiClient.clearCart();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to clear cart');
    }
  }

  // Get cart summary
  static async getCartSummary(): Promise<CartSummary> {
    const response = await apiClient.getCartSummary();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch cart summary');
    }
    return response.data as CartSummary;
  }

  // Check item availability
  static async checkAvailability(productId: string, quantity: number, variantId?: string): Promise<CartAvailability> {
    const response = await apiClient.checkCartAvailability(productId, quantity, variantId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to check availability');
    }
    return response.data as CartAvailability;
  }

  // Apply coupon to cart
  static async applyCoupon(code: string): Promise<CartCoupon> {
    const response = await apiClient.applyCartCoupon(code);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to apply coupon');
    }
    return response.data as CartCoupon;
  }

  // Remove coupon from cart
  static async removeCoupon(): Promise<void> {
    const response = await apiClient.removeCartCoupon();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove coupon');
    }
  }

  // Bulk update cart items
  static async bulkUpdate(updates: Array<{
    itemId: string;
    quantity: number;
  }>): Promise<Cart> {
    const response = await apiClient.bulkUpdateCart(updates);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update cart items');
    }
    return response.data as Cart;
  }

  // Move item to wishlist
  static async moveToWishlist(itemId: string): Promise<void> {
    const response = await apiClient.moveCartItemToWishlist(itemId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to move item to wishlist');
    }
  }

  // Get cart recommendations
  static async getRecommendations(): Promise<CartRecommendation[]> {
    const response = await apiClient.getCartRecommendations();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch recommendations');
    }
    return response.data as CartRecommendation[];
  }

  // Get cart statistics for dashboard
  static async getCartStats(): Promise<{
    totalCarts: number;
    activeCarts: number;
    abandonedCarts: number;
    conversionRate: number;
    averageCartValue: number;
    totalRevenue: number;
  }> {
    const response = await apiClient.getCartStats();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch cart stats');
    }
    return response.data as {
      totalCarts: number;
      activeCarts: number;
      abandonedCarts: number;
      conversionRate: number;
      averageCartValue: number;
      totalRevenue: number;
    };
  }

  // Get abandoned carts
  static async getAbandonedCarts(params?: {
    page?: number;
    limit?: number;
    daysSince?: number;
  }): Promise<{
    carts: Array<{
      id: string;
      userId: string;
      userEmail: string;
      items: CartItem[];
      subtotal: number;
      total: number;
      lastActivity: string;
      daysSinceAbandoned: number;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.getAbandonedCarts(params);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch abandoned carts');
    }
    return response.data as {
      carts: Array<{
        id: string;
        userId: string;
        userEmail: string;
        items: CartItem[];
        subtotal: number;
        total: number;
        lastActivity: string;
        daysSinceAbandoned: number;
      }>;
      total: number;
      page: number;
      limit: number;
    };
  }

  // Send abandoned cart reminder
  static async sendAbandonedCartReminder(cartId: string): Promise<void> {
    const response = await apiClient.sendAbandonedCartReminder(cartId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send reminder');
    }
  }

  // Bulk send abandoned cart reminders
  static async bulkSendReminders(cartIds: string[]): Promise<{
    sent: number;
    failed: number;
    results: Array<{
      cartId: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    const response = await apiClient.bulkSendCartReminders(cartIds);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send bulk reminders');
    }
    return response.data as {
      sent: number;
      failed: number;
      results: Array<{
        cartId: string;
        success: boolean;
        error?: string;
      }>;
    };
  }
}