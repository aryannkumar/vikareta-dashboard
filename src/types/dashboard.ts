// Dashboard Types for Seller Dashboard

export interface DashboardMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  productsChange: number;
  activeRFQs: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  customerRetentionRate: number;
  productViews: number;
  productViewsChange: number;
  orderFulfillmentRate: number;
  returnRate: number;
  grossMargin: number;
  netProfit: number;
  topSellingCategory: string;
  lowStockProducts: number;
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageShippingTime: number;
  customerSatisfactionScore: number;
  marketplaceFees: number;
  totalCommissions: number;
  walletBalance: number;
  pendingPayments: number;
  lastUpdated: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName: string;
  productImage?: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderDate: string;
  expectedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  brand?: string;
  image?: string;
  price: number;
  compareAtPrice?: number;
  revenue: number;
  quantitySold: number;
  totalOrders: number;
  averageRating: number;
  reviewCount: number;
  stockLevel: number;
  reorderLevel: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  profit: number;
  margin: number;
  views: number;
  conversionRate: number;
  returnRate: number;
  tags: string[];
  trending: boolean;
  featured: boolean;
  lastSoldDate?: string;
  createdDate: string;
  updatedDate: string;
}

export interface WalletBalance {
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
  pendingSettlement: number;
  totalEarnings: number;
  totalWithdrawals: number;
  lastTransactionDate?: string;
  currency: string;
  minimumWithdrawal: number;
  withdrawalFee: number;
  settlementPeriod: string; // e.g., "7 days"
  nextSettlementDate?: string;
  recentTransactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'withdrawal' | 'refund' | 'commission' | 'fee';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  orderId?: string;
  transactionFee?: number;
  netAmount: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  profit: number;
  expenses: number;
  netRevenue: number;
  refunds: number;
  fees: number;
  taxes: number;
  commissions: number;
}

export interface ActivitySummary {
  productsAdded: number;
  ordersProcessed: number;
  rfqsReceived: number;
  rfqsResponded: number;
  customersAcquired: number;
  reviewsReceived: number;
  messagesReceived: number;
  messagesReplied: number;
  inventoryUpdates: number;
  promotionsCreated: number;
  period: string; // e.g., "last 7 days"
  previousPeriodComparison: {
    productsAdded: number;
    ordersProcessed: number;
    rfqsReceived: number;
    customersAcquired: number;
  };
}

export interface NotificationCount {
  unread: number;
  total: number;
  categories: {
    orders: number;
    rfqs: number;
    messages: number;
    inventory: number;
    payments: number;
    reviews: number;
    system: number;
  };
}

export interface BusinessKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changeType: 'percentage' | 'absolute';
  period: string;
  category: 'revenue' | 'orders' | 'customers' | 'inventory' | 'efficiency';
  priority: 'high' | 'medium' | 'low';
  description?: string;
  icon?: string;
  color?: string;
}

export interface SellerAnalytics {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    customerLifetimeValue: number;
    marketShare: number;
  };
  performance: {
    topCategories: CategoryPerformance[];
    topProducts: TopProduct[];
    customerSegments: CustomerSegment[];
    geographicBreakdown: GeographicData[];
  };
  trends: {
    revenueGrowth: TrendData[];
    orderVolume: TrendData[];
    customerAcquisition: TrendData[];
    productViews: TrendData[];
  };
  forecasting: {
    nextMonthRevenue: number;
    nextMonthOrders: number;
    seasonalTrends: SeasonalData[];
    recommendations: string[];
  };
}

export interface CategoryPerformance {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  products: number;
  averageOrderValue: number;
  conversionRate: number;
  growth: number;
  marketShare: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  averageOrderValue: number;
  lifetimeValue: number;
  characteristics: string[];
}

export interface GeographicData {
  region: string;
  city?: string;
  state?: string;
  country: string;
  orders: number;
  revenue: number;
  customers: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface TrendData {
  date: string;
  value: number;
  comparison?: number;
}

export interface SeasonalData {
  period: string;
  expectedGrowth: number;
  confidence: number;
  factors: string[];
}

export interface ProductAnalytics {
  productId: string;
  name: string;
  performance: {
    views: number;
    orders: number;
    revenue: number;
    conversionRate: number;
    averageRating: number;
    returnRate: number;
  };
  trends: {
    views: TrendData[];
    orders: TrendData[];
    revenue: TrendData[];
  };
  competitors: {
    averagePrice: number;
    pricePosition: 'lowest' | 'below_average' | 'average' | 'above_average' | 'highest';
    marketShare: number;
    recommendations: string[];
  };
  optimization: {
    suggestedPrice: number;
    suggestedKeywords: string[];
    suggestedImages: string[];
    performanceScore: number;
  };
}

export interface OrderAnalytics {
  totalOrders: number;
  statusBreakdown: {
    [status: string]: number;
  };
  paymentMethodBreakdown: {
    [method: string]: number;
  };
  shippingMethodBreakdown: {
    [method: string]: number;
  };
  averageOrderValue: number;
  averageProcessingTime: number;
  averageShippingTime: number;
  customerSatisfaction: number;
  returnRate: number;
  cancellationRate: number;
  repeatCustomerRate: number;
  peakOrderTimes: {
    hour: number;
    day: number;
    month: number;
  };
  geographicDistribution: GeographicData[];
  trends: {
    daily: TrendData[];
    weekly: TrendData[];
    monthly: TrendData[];
  };
}

export interface RFQAnalytics {
  totalRFQs: number;
  responseRate: number;
  averageResponseTime: number;
  conversionRate: number;
  statusBreakdown: {
    [status: string]: number;
  };
  categoryBreakdown: {
    [category: string]: number;
  };
  averageOrderValue: number;
  competitiveWinRate: number;
  topBuyerCompanies: {
    name: string;
    rfqCount: number;
    conversionRate: number;
    averageOrderValue: number;
  }[];
  trends: {
    rfqVolume: TrendData[];
    responseRate: TrendData[];
    conversionRate: TrendData[];
  };
  insights: {
    bestPerformingCategories: string[];
    optimalResponseTime: number;
    priceCompetitiveness: number;
    recommendations: string[];
  };
}

export interface CustomerInsights {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerLifetimeValue: number;
  averageOrderFrequency: number;
  churnRate: number;
  topCustomers: {
    id: string;
    name: string;
    company?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    loyaltyScore: number;
  }[];
  customerSegments: CustomerSegment[];
  geographicDistribution: GeographicData[];
  behaviorPatterns: {
    preferredCategories: string[];
    averageSessionDuration: number;
    mostActiveHours: number[];
    devicePreferences: {
      [device: string]: number;
    };
  };
  satisfaction: {
    averageRating: number;
    npsScore: number;
    reviewSentiment: 'positive' | 'neutral' | 'negative';
    commonComplaints: string[];
    commonPraises: string[];
  };
}

export interface InventoryInsights {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  overStockProducts: number;
  totalInventoryValue: number;
  averageStockTurnover: number;
  deadStock: {
    count: number;
    value: number;
    products: {
      id: string;
      name: string;
      daysInStock: number;
      stockValue: number;
    }[];
  };
  fastMovingProducts: TopProduct[];
  slowMovingProducts: TopProduct[];
  stockAlerts: {
    type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
    productId: string;
    productName: string;
    currentStock: number;
    recommendedAction: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }[];
  categoryBreakdown: {
    category: string;
    products: number;
    totalValue: number;
    averageTurnover: number;
  }[];
  optimization: {
    reorderSuggestions: {
      productId: string;
      suggestedQuantity: number;
      estimatedCost: number;
      priority: number;
    }[];
    pricingRecommendations: {
      productId: string;
      currentPrice: number;
      suggestedPrice: number;
      expectedImpact: string;
    }[];
  };
}

export interface FinancialInsights {
  revenue: {
    total: number;
    gross: number;
    net: number;
    recurring: number;
    growth: number;
  };
  expenses: {
    total: number;
    breakdown: {
      [category: string]: number;
    };
    percentageOfRevenue: number;
  };
  profitability: {
    grossMargin: number;
    netMargin: number;
    operatingMargin: number;
    ebitda: number;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    free: number;
  };
  receivables: {
    total: number;
    overdue: number;
    averageCollectionPeriod: number;
  };
  payables: {
    total: number;
    overdue: number;
    averagePaymentPeriod: number;
  };
  taxes: {
    totalTaxLiability: number;
    quarterlyEstimate: number;
    deductibleExpenses: number;
  };
  forecasting: {
    nextQuarterRevenue: number;
    breakEvenPoint: number;
    cashFlowProjection: TrendData[];
  };
  recommendations: {
    costReduction: string[];
    revenueOptimization: string[];
    cashFlowManagement: string[];
    taxOptimization: string[];
  };
}

// Real-time update types
export interface RealtimeUpdate {
  type: 'order' | 'rfq' | 'message' | 'inventory' | 'payment' | 'review';
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Dashboard preferences
export interface DashboardPreferences {
  layout: 'grid' | 'list';
  widgets: string[];
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    categories: string[];
  };
}