// Dashboard routing configuration with role-based access control

export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  allowedRoles: ('buyer' | 'seller' | 'both' | 'admin')[];
  icon?: string;
  children?: RouteConfig[];
  hidden?: boolean;
  badge?: string | number;
}

export const DASHBOARD_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Overview of your business metrics and activities',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'HomeIcon',
  },
  {
    path: '/dashboard/products',
    title: 'Products',
    description: 'Manage your product listings',
    allowedRoles: ['seller', 'both'],
    icon: 'CubeIcon',
    children: [
      {
        path: '/dashboard/products',
        title: 'All Products',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/products/new',
        title: 'Add Product',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/products/categories',
        title: 'Categories',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/products/inventory',
        title: 'Inventory Management',
        allowedRoles: ['seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/services',
    title: 'Services',
    description: 'Manage your service offerings',
    allowedRoles: ['seller', 'both'],
    icon: 'WrenchScrewdriverIcon',
    children: [
      {
        path: '/dashboard/services',
        title: 'All Services',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/services/new',
        title: 'Add Service',
        allowedRoles: ['seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/orders',
    title: 'Orders',
    description: 'Track and manage your orders',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'ShoppingBagIcon',
    children: [
      {
        path: '/dashboard/orders',
        title: 'All Orders',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/orders/pending',
        title: 'Pending Orders',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/orders/completed',
        title: 'Completed Orders',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/shipments',
    title: 'Shipments',
    description: 'Manage order shipments and tracking',
    allowedRoles: ['seller', 'both'],
    icon: 'TruckIcon',
    children: [
      {
        path: '/dashboard/shipments',
        title: 'All Shipments',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/shipments/create',
        title: 'Create Shipment',
        allowedRoles: ['seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/rfqs',
    title: 'RFQs & Quotes',
    description: 'Manage requests for quotes and quotations',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'DocumentTextIcon',
    children: [
      {
        path: '/dashboard/rfqs',
        title: 'My RFQs',
        allowedRoles: ['buyer', 'both'],
      },
      {
        path: '/dashboard/rfqs/new',
        title: 'Create RFQ',
        allowedRoles: ['buyer', 'both'],
      },
      {
        path: '/dashboard/rfqs/received',
        title: 'Received RFQs',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/quotes',
        title: 'My Quotes',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/quotes/received',
        title: 'Received Quotes',
        allowedRoles: ['buyer', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/deals',
    title: 'Deals & Communication',
    description: 'Track deals and communicate with partners',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'ClipboardDocumentListIcon',
    children: [
      {
        path: '/dashboard/deals',
        title: 'All Deals',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/deals/active',
        title: 'Active Deals',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/deals/completed',
        title: 'Completed Deals',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/following',
    title: 'Following',
    description: 'Manage your followed sellers and buyers',
    allowedRoles: ['buyer', 'both'],
    icon: 'HeartIcon',
    children: [
      {
        path: '/dashboard/following',
        title: 'Following',
        allowedRoles: ['buyer', 'both'],
      },
      {
        path: '/dashboard/followers',
        title: 'Followers',
        allowedRoles: ['seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/advertisements',
    title: 'Advertisements',
    description: 'Create and manage your advertisement campaigns',
    allowedRoles: ['seller', 'both'],
    icon: 'MegaphoneIcon',
    children: [
      {
        path: '/dashboard/advertisements',
        title: 'All Campaigns',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/advertisements/new',
        title: 'Create Campaign',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/advertisements/analytics',
        title: 'Analytics',
        allowedRoles: ['seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/wallet',
    title: 'Wallet & Payments',
    description: 'Manage your wallet, payments, and transactions',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'WalletIcon',
    children: [
      {
        path: '/dashboard/wallet',
        title: 'Wallet Overview',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/wallet/transactions',
        title: 'Transaction History',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/wallet/locked-amounts',
        title: 'Locked Amounts',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/wallet/subscription',
        title: 'Subscription',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/wallet/add-money',
        title: 'Add Money',
        allowedRoles: ['buyer', 'seller', 'both'],
        hidden: true,
      },
      {
        path: '/dashboard/wallet/withdraw',
        title: 'Withdraw',
        allowedRoles: ['buyer', 'seller', 'both'],
        hidden: true,
      },
    ],
  },
  {
    path: '/dashboard/analytics',
    title: 'Analytics & Reports',
    description: 'View detailed analytics and generate reports',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'PresentationChartLineIcon',
    children: [
      {
        path: '/dashboard/analytics',
        title: 'Overview',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/analytics/sales',
        title: 'Sales Analytics',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/analytics/products',
        title: 'Product Performance',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/analytics/customers',
        title: 'Customer Insights',
        allowedRoles: ['seller', 'both'],
      },
    ],
  },
  {
    path: '/profile',
    title: 'Profile & Settings',
    description: 'Manage your profile and account settings',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'UserCircleIcon',
    hidden: true, // Hidden from main navigation
    children: [
      {
        path: '/profile',
        title: 'Profile',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/profile/business',
        title: 'Business Information',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/profile/verification',
        title: 'Verification',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/settings',
        title: 'Settings',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/settings/notifications',
        title: 'Notification Settings',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/settings/security',
        title: 'Security Settings',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
    ],
  },
  
  // Additional important sections for a complete B2B dashboard
  {
    path: '/dashboard/customers',
    title: 'Customers',
    description: 'Manage your customer relationships',
    allowedRoles: ['seller', 'both'],
    icon: 'UsersIcon',
    children: [
      {
        path: '/dashboard/customers',
        title: 'All Customers',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/customers/leads',
        title: 'Leads',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/customers/segments',
        title: 'Customer Segments',
        allowedRoles: ['seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/suppliers',
    title: 'Suppliers',
    description: 'Manage your supplier relationships',
    allowedRoles: ['buyer', 'both'],
    icon: 'BuildingOfficeIcon',
    children: [
      {
        path: '/dashboard/suppliers',
        title: 'All Suppliers',
        allowedRoles: ['buyer', 'both'],
      },
      {
        path: '/dashboard/suppliers/favorites',
        title: 'Favorite Suppliers',
        allowedRoles: ['buyer', 'both'],
      },
      {
        path: '/dashboard/suppliers/performance',
        title: 'Supplier Performance',
        allowedRoles: ['buyer', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/inventory',
    title: 'Inventory',
    description: 'Manage your inventory and stock levels',
    allowedRoles: ['seller', 'both'],
    icon: 'ArchiveBoxIcon',
    children: [
      {
        path: '/dashboard/inventory',
        title: 'Stock Overview',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/inventory/low-stock',
        title: 'Low Stock Alerts',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/inventory/movements',
        title: 'Stock Movements',
        allowedRoles: ['seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/reports',
    title: 'Reports',
    description: 'Generate and view business reports',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'DocumentDuplicateIcon',
    children: [
      {
        path: '/dashboard/reports',
        title: 'All Reports',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/reports/sales',
        title: 'Sales Reports',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/reports/purchase',
        title: 'Purchase Reports',
        allowedRoles: ['buyer', 'both'],
      },
      {
        path: '/dashboard/reports/financial',
        title: 'Financial Reports',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/communications',
    title: 'Communications',
    description: 'Manage messages and communications',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'ChatBubbleLeftRightIcon',
    children: [
      {
        path: '/dashboard/communications/messages',
        title: 'Messages',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/communications/notifications',
        title: 'Notifications',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/communications/announcements',
        title: 'Announcements',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/marketplace',
    title: 'Marketplace',
    description: 'Browse and discover products and services',
    allowedRoles: ['buyer', 'both'],
    icon: 'GlobeAltIcon',
    children: [
      {
        path: '/dashboard/marketplace/browse',
        title: 'Browse Products',
        allowedRoles: ['buyer', 'both'],
      },
      {
        path: '/dashboard/marketplace/categories',
        title: 'Categories',
        allowedRoles: ['buyer', 'both'],
      },
      {
        path: '/dashboard/marketplace/trending',
        title: 'Trending',
        allowedRoles: ['buyer', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/support',
    title: 'Support',
    description: 'Get help and support',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'QuestionMarkCircleIcon',
    children: [
      {
        path: '/dashboard/support/tickets',
        title: 'Support Tickets',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/support/faq',
        title: 'FAQ',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/support/contact',
        title: 'Contact Support',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
    ],
  },
  {
    path: '/dashboard/settings',
    title: 'Settings',
    description: 'Configure your account and preferences',
    allowedRoles: ['buyer', 'seller', 'both'],
    icon: 'Cog6ToothIcon',
    children: [
      {
        path: '/dashboard/settings/account',
        title: 'Account Settings',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/settings/business',
        title: 'Business Settings',
        allowedRoles: ['seller', 'both'],
      },
      {
        path: '/dashboard/settings/notifications',
        title: 'Notification Preferences',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/settings/security',
        title: 'Security Settings',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
      {
        path: '/dashboard/settings/integrations',
        title: 'Integrations',
        allowedRoles: ['buyer', 'seller', 'both'],
      },
    ],
  },

];

// Helper functions for route management
export function getRoutesForRole(role: 'buyer' | 'seller' | 'both' | 'admin'): RouteConfig[] {
  return DASHBOARD_ROUTES.filter(route => 
    !route.hidden && (route.allowedRoles.includes(role) || role === 'both' || role === 'admin')
  );
}

export function getRouteByPath(path: string): RouteConfig | undefined {
  function findRoute(routes: RouteConfig[]): RouteConfig | undefined {
    for (const route of routes) {
      if (route.path === path) {
        return route;
      }
      if (route.children) {
        const found = findRoute(route.children);
        if (found) return found;
      }
    }
    return undefined;
  }
  
  return findRoute(DASHBOARD_ROUTES);
}

export function hasRouteAccess(path: string, userRole: 'buyer' | 'seller' | 'both' | 'admin'): boolean {
  const route = getRouteByPath(path);
  if (!route) return false;
  
  return userRole === 'both' || userRole === 'admin' || route.allowedRoles.includes(userRole);
}

export function getBreadcrumbs(path: string): { title: string; path: string }[] {
  const breadcrumbs: { title: string; path: string }[] = [];
  
  function findBreadcrumbs(routes: RouteConfig[], currentPath: string[]): boolean {
    for (const route of routes) {
      const newPath = [...currentPath, route.path];
      
      if (route.path === path) {
        breadcrumbs.push(...newPath.map((p) => {
          const routeAtPath = getRouteByPath(p);
          return {
            title: routeAtPath?.title || 'Unknown',
            path: p,
          };
        }));
        return true;
      }
      
      if (route.children && findBreadcrumbs(route.children, newPath)) {
        return true;
      }
    }
    return false;
  }
  
  findBreadcrumbs(DASHBOARD_ROUTES, []);
  return breadcrumbs;
}

// Navigation menu configuration
export function getNavigationMenu(userRole: 'buyer' | 'seller' | 'both' | 'admin') {
  const routes = getRoutesForRole(userRole);
  
  return routes.map(route => ({
    title: route.title,
    href: route.path,
    icon: route.icon,
    badge: route.badge,
    children: route.children?.filter(child => 
      userRole === 'both' || userRole === 'admin' || child.allowedRoles.includes(userRole)
    ).map(child => ({
      title: child.title,
      href: child.path,
    })),
  }));
}