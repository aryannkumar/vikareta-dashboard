// App Configuration
export const APP_CONFIG = {
  name: 'Vikareta Dashboard',
  version: '1.0.0',
  description: 'Business dashboard for Vikareta marketplace',
  mainAppUrl: process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://vikareta.com',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.vikareta.com/api',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  dashboard: {
    metrics: '/dashboard/metrics',
    revenueChart: '/dashboard/charts/revenue',
    ordersChart: '/dashboard/charts/orders',
    topProducts: '/dashboard/products/top',
    recentOrders: '/dashboard/orders/recent',
  },
  products: {
    list: '/products',
    create: '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    media: (id: string) => `/products/${id}/media`,
  },
  orders: {
    list: '/orders',
    details: (id: string) => `/orders/${id}`,
    update: (id: string) => `/orders/${id}`,
    cancel: (id: string) => `/orders/${id}/cancel`,
  },
  rfqs: {
    list: '/rfqs',
    create: '/rfqs',
    details: (id: string) => `/rfqs/${id}`,
    quotes: (id: string) => `/rfqs/${id}/quotes`,
  },
  quotes: {
    list: '/quotes',
    create: '/quotes',
    details: (id: string) => `/quotes/${id}`,
    accept: (id: string) => `/quotes/${id}/accept`,
    negotiate: (id: string) => `/quotes/${id}/negotiate`,
  },
  wallet: {
    balance: '/wallet/balance',
    transactions: '/wallet/transactions',
    addMoney: '/wallet/add-money',
    withdraw: '/wallet/withdraw',
    lockAmount: '/wallet/lock-amount',
  },
  deals: {
    list: '/deals',
    details: (id: string) => `/deals/${id}`,
    messages: (id: string) => `/deals/${id}/messages`,
  },
  users: {
    profile: '/users/profile',
    following: '/users/following',
    followers: '/users/followers',
    follow: (id: string) => `/users/${id}/follow`,
  },
} as const;

// Status Options
export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'primary' },
  { value: 'processing', label: 'Processing', color: 'primary' },
  { value: 'shipped', label: 'Shipped', color: 'primary' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
] as const;

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'paid', label: 'Paid', color: 'success' },
  { value: 'failed', label: 'Failed', color: 'error' },
  { value: 'refunded', label: 'Refunded', color: 'secondary' },
] as const;

export const PRODUCT_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'secondary' },
  { value: 'draft', label: 'Draft', color: 'warning' },
] as const;

export const RFQ_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'closed', label: 'Closed', color: 'secondary' },
  { value: 'expired', label: 'Expired', color: 'error' },
] as const;

export const QUOTE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'accepted', label: 'Accepted', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
  { value: 'expired', label: 'Expired', color: 'secondary' },
] as const;

export const DEAL_STATUSES = [
  { value: 'initiated', label: 'Initiated', color: 'primary' },
  { value: 'negotiating', label: 'Negotiating', color: 'warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'success' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
] as const;

export const VERIFICATION_TIERS = [
  { value: 'basic', label: 'Basic', color: 'secondary' },
  { value: 'standard', label: 'Standard', color: 'primary' },
  { value: 'enhanced', label: 'Enhanced', color: 'warning' },
  { value: 'premium', label: 'Premium', color: 'success' },
] as const;

// Time Periods for Charts
export const TIME_PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
] as const;

// Pagination
export const PAGINATION_SIZES = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

// File Upload
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_PRODUCT = 10;

// Currency
export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

// Date Formats
export const DATE_FORMATS = {
  display: 'dd MMM yyyy',
  input: 'yyyy-MM-dd',
  datetime: 'dd MMM yyyy, HH:mm',
  time: 'HH:mm',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[6-9]\d{9}$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
} as const;

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
} as const;

// Dashboard Metrics
export const METRIC_CARDS = [
  {
    key: 'revenue',
    title: 'Total Revenue',
    icon: 'CurrencyRupeeIcon',
    color: 'success',
    format: 'currency',
  },
  {
    key: 'orders',
    title: 'Total Orders',
    icon: 'ShoppingBagIcon',
    color: 'primary',
    format: 'number',
  },
  {
    key: 'products',
    title: 'Total Products',
    icon: 'CubeIcon',
    color: 'warning',
    format: 'number',
  },
  {
    key: 'customers',
    title: 'Total Customers',
    icon: 'UsersIcon',
    color: 'info',
    format: 'number',
  },
] as const;

// Navigation Menu Items
export const SELLER_NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'HomeIcon',
  },
  {
    title: 'Products',
    href: '/products',
    icon: 'CubeIcon',
    children: [
      { title: 'All Products', href: '/products' },
      { title: 'Add Product', href: '/products/new' },
      { title: 'Categories', href: '/products/categories' },
    ],
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: 'ShoppingBagIcon',
  },
  {
    title: 'RFQs & Quotes',
    href: '/rfqs',
    icon: 'DocumentTextIcon',
    children: [
      { title: 'RFQs', href: '/rfqs' },
      { title: 'My Quotes', href: '/quotes' },
    ],
  },
  {
    title: 'Deals',
    href: '/deals',
    icon: 'HandshakeIcon',
  },
  {
    title: 'Wallet',
    href: '/wallet',
    icon: 'WalletIcon',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: 'ChartBarIcon',
  },
] as const;

export const BUYER_NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'HomeIcon',
  },
  {
    title: 'RFQs',
    href: '/rfqs',
    icon: 'DocumentTextIcon',
    children: [
      { title: 'My RFQs', href: '/rfqs' },
      { title: 'Create RFQ', href: '/rfqs/new' },
      { title: 'Received Quotes', href: '/quotes/received' },
    ],
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: 'ShoppingBagIcon',
  },
  {
    title: 'Deals',
    href: '/deals',
    icon: 'HandshakeIcon',
  },
  {
    title: 'Following',
    href: '/following',
    icon: 'HeartIcon',
  },
  {
    title: 'Wallet',
    href: '/wallet',
    icon: 'WalletIcon',
  },
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied.',
  notFound: 'The requested resource was not found.',
  serverError: 'Internal server error. Please try again later.',
  validation: 'Please check your input and try again.',
  timeout: 'Request timeout. Please try again.',
  unknown: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  login: 'Successfully logged in!',
  logout: 'Successfully logged out!',
  profileUpdate: 'Profile updated successfully!',
  productCreated: 'Product created successfully!',
  productUpdated: 'Product updated successfully!',
  productDeleted: 'Product deleted successfully!',
  orderUpdated: 'Order updated successfully!',
  rfqCreated: 'RFQ created successfully!',
  quoteSubmitted: 'Quote submitted successfully!',
  dealCreated: 'Deal created successfully!',
  walletUpdated: 'Wallet updated successfully!',
} as const;