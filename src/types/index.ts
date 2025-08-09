// User and Auth Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  gstin?: string;
  verificationTier: 'basic' | 'standard' | 'enhanced' | 'premium';
  isVerified: boolean;
  avatar?: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  price: number;
  currency: string;
  stockQuantity: number;
  minOrderQuantity: number;
  isService: boolean;
  status: 'active' | 'inactive' | 'draft';
  media: ProductMedia[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  priceAdjustment: number;
  stockQuantity: number;
}

export interface ProductMedia {
  id: string;
  productId: string;
  mediaType: 'image' | 'video' | 'document';
  url: string;
  altText?: string;
  sortOrder: number;
}

// Order Types
export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  orderNumber: string;
  orderType: 'product' | 'service';
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

// RFQ Types
export interface RFQ {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deliveryTimeline: string;
  deliveryLocation: string;
  status: 'active' | 'closed' | 'expired';
  expiresAt: string;
  quotes: Quote[];
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  rfqId: string;
  sellerId: string;
  totalPrice: number;
  deliveryTimeline: string;
  termsConditions: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

// Deal Types
export interface Deal {
  id: string;
  buyerId: string;
  sellerId: string;
  rfqId?: string;
  quoteId?: string;
  orderId?: string;
  dealValue: number;
  status: 'initiated' | 'negotiating' | 'confirmed' | 'completed' | 'cancelled';
  milestone: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  lockedBalance: number;
  negativeBalance: number;
  transactions: WalletTransaction[];
  lockedAmounts: LockedAmount[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  transactionType: 'credit' | 'debit' | 'lock' | 'unlock';
  amount: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  cashfreeTransactionId?: string;
  description: string;
  createdAt: string;
}

export interface LockedAmount {
  id: string;
  walletId: string;
  amount: number;
  lockReason: string;
  referenceId: string;
  lockedUntil: string;
  status: 'active' | 'released' | 'expired';
  createdAt: string;
}

export interface WalletBalance {
  availableBalance: number;
  lockedBalance: number;
  negativeBalance: number;
  totalBalance: number;
}

export interface WalletAnalytics {
  totalInflow: number;
  totalOutflow: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  transactionCount: number;
  averageTransactionAmount: number;
  inflowChange: number;
  outflowChange: number;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: 'savings' | 'current';
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  walletId: string;
  bankAccountId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  cashfreePayoutId?: string;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  planName: string;
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  cashfreeSubscriptionId?: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'basic' | 'premium' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  limits: {
    products: number;
    rfqs: number;
    orders: number;
    storage: number; // in GB
  };
  isPopular?: boolean;
}

export interface BillingHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
  cashfreePaymentId?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  activeCustomers: number;
  activeRFQs: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface ProductFormData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  price: number;
  stockQuantity: number;
  minOrderQuantity: number;
  isService: boolean;
  media: File[];
  variants: Omit<ProductVariant, 'id' | 'productId'>[];
}

export interface RFQFormData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deliveryTimeline: string;
  deliveryLocation: string;
  attachments: File[];
}

// Filter and Search Types
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  status?: string;
  search?: string;
  sortBy?: 'price' | 'created' | 'updated' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'created' | 'updated' | 'total';
  sortOrder?: 'asc' | 'desc';
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

// Table Types
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowSelection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Advertisement Types
export interface AdCampaign {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  campaignType: 'product' | 'service' | 'brand';
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected';
  budget: number;
  dailyBudget?: number;
  spentAmount: number;
  lockedAmountId?: string;
  bidAmount: number;
  biddingStrategy: 'cpc' | 'cpm' | 'cpa';
  startDate: string;
  endDate?: string;
  targetingConfig: AdTargetingConfig;
  ads: Advertisement[];
  analytics?: AdAnalytics[];
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  adType: 'banner' | 'native' | 'video' | 'carousel';
  adFormat: 'image' | 'video' | 'html';
  content: AdContent;
  callToAction: string;
  destinationUrl: string;
  priority: number;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface AdContent {
  images?: string[];
  videos?: string[];
  html?: string;
}

export interface AdTargetingConfig {
  demographics?: {
    ageRange?: [number, number];
    gender?: 'male' | 'female' | 'all';
    interests?: string[];
  };
  location?: {
    countries?: string[];
    states?: string[];
    cities?: string[];
    radius?: number;
  };
  behavior?: {
    deviceTypes?: string[];
    platforms?: string[];
    timeOfDay?: string[];
    dayOfWeek?: string[];
  };
}

export interface AdAnalytics {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number; // click-through rate
  cpc: number; // cost per click
  cpm: number; // cost per mille
  roas: number; // return on ad spend
  createdAt: string;
  updatedAt: string;
}

export interface CampaignReport {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  topPerformingAds: Advertisement[];
  audienceInsights: AudienceData;
}

export interface AudienceData {
  demographics: {
    ageGroups: { range: string; percentage: number }[];
    genderDistribution: { gender: string; percentage: number }[];
  };
  locations: { location: string; percentage: number }[];
  devices: { device: string; percentage: number }[];
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  campaignType: 'product' | 'service' | 'brand';
  budget: number;
  dailyBudget?: number;
  bidAmount: number;
  biddingStrategy: 'cpc' | 'cpm' | 'cpa';
  startDate: string;
  endDate?: string;
  targetingConfig: AdTargetingConfig;
  ads: CreateAdRequest[];
}

export interface CreateAdRequest {
  title: string;
  description: string;
  adType: 'banner' | 'native' | 'video' | 'carousel';
  adFormat: 'image' | 'video' | 'html';
  content: AdContent;
  callToAction: string;
  destinationUrl: string;
  priority?: number;
}

export interface AdCampaignFilters {
  status?: string;
  campaignType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'created' | 'updated' | 'spend' | 'performance';
  sortOrder?: 'asc' | 'desc';
}

export interface AdvertisementMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageROAS: number;
  spendChange: number;
  impressionsChange: number;
  clicksChange: number;
  conversionsChange: number;
}

// Settings Types
export interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showContactInfo: boolean;
    allowMessages: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    theme: 'light' | 'dark' | 'system';
  };
}