/**
 * Modern Sidebar Navigation with Enhanced UI
 * Features collapsible design, icons, and active states
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Megaphone,
  Wallet,
  Settings,
  User,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  FileText,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVikaretaAuthContext } from '@/lib/auth/vikareta';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: Package,
    children: [
      { name: 'All Products', href: '/dashboard/products', icon: Package },
      { name: 'Add Product', href: '/dashboard/products/new', icon: Package },
      { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    ],
  },
  {
    name: 'Services',
    href: '/dashboard/services',
    icon: FileText,
    children: [
      { name: 'All Services', href: '/dashboard/services', icon: FileText },
      { name: 'Add Service', href: '/dashboard/services/new', icon: FileText },
    ],
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    badge: '12',
    children: [
      { name: 'All Orders', href: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Pending', href: '/dashboard/orders/pending', icon: ShoppingCart },
      { name: 'Completed', href: '/dashboard/orders/completed', icon: ShoppingCart },
    ],
  },
  {
    name: 'RFQs',
    href: '/dashboard/rfqs',
    icon: MessageSquare,
    badge: '5',
    children: [
      { name: 'Received RFQs', href: '/dashboard/rfqs', icon: MessageSquare },
      { name: 'My Quotes', href: '/dashboard/quotes', icon: MessageSquare },
    ],
  },
  {
    name: 'Shipments',
    href: '/dashboard/shipments',
    icon: Package,
  },
  {
    name: 'Advertisements',
    href: '/dashboard/advertisements',
    icon: Megaphone,
    children: [
      { name: 'All Campaigns', href: '/dashboard/advertisements', icon: Megaphone },
      { name: 'Create Campaign', href: '/dashboard/advertisements/new', icon: Megaphone },
      { name: 'Analytics', href: '/dashboard/advertisements/analytics', icon: BarChart3 },
    ],
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    children: [
      { name: 'Sales Analytics', href: '/dashboard/analytics/sales', icon: BarChart3 },
      { name: 'Product Performance', href: '/dashboard/analytics/products', icon: BarChart3 },
    ],
  },
  {
    name: 'Wallet',
    href: '/dashboard/wallet',
    icon: Wallet,
    children: [
      { name: 'Balance', href: '/dashboard/wallet', icon: Wallet },
      { name: 'Transactions', href: '/dashboard/wallet/transactions', icon: FileText },
      { name: 'Withdraw', href: '/dashboard/wallet/withdraw', icon: Wallet },
    ],
  },
];

const bottomNavigation: NavigationItem[] = [
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    children: [
      { name: 'Business Profile', href: '/dashboard/settings/business', icon: Settings },
      { name: 'Account', href: '/dashboard/settings/account', icon: Settings },
      { name: 'Security', href: '/dashboard/settings/security', icon: Settings },
      { name: 'Notifications', href: '/dashboard/settings/notifications', icon: Settings },
    ],
  },
  {
    name: 'Support',
    href: '/dashboard/support',
    icon: HelpCircle,
  },
];

interface ModernSidebarProps {
  className?: string;
}

export function ModernSidebar({ className = '' }: ModernSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, logout } = useVikaretaAuthContext();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const NavItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href);

    return (
      <div>
        <div className={`group relative flex items-center ${level > 0 ? 'pl-6' : ''}`}>
          <Link
            href={item.href}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              } ${isCollapsed && level === 0 ? 'justify-center' : ''}`}
            onClick={() => setIsMobileOpen(false)}
          >
            <item.icon className={`flex-shrink-0 ${isCollapsed && level === 0 ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
            {(!isCollapsed || level > 0) && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpanded(item.name);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronLeft className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </>
            )}
          </Link>
        </div>
        {hasChildren && isExpanded && (!isCollapsed || level > 0) && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavItem key={child.name} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-lg">Vikareta</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
        <Separator className="my-4" />
        {bottomNavigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          onClick={() => logout()}
        >
          <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:bg-background lg:border-r lg:shadow-sm transition-all duration-300 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'
          } ${className}`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-background border shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}