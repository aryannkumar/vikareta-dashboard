'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  WalletIcon,
  ChartBarIcon,
  HeartIcon,
  MegaphoneIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  UserCircleIcon,
  UsersIcon,
  PresentationChartLineIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  TagIcon,
  GiftIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  KeyIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  InboxIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  FireIcon,
  SparklesIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  WrenchIcon,
  CogIcon,
  AdjustmentsHorizontalIcon,
  QueueListIcon,
  ChartBarSquareIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  ShieldExclamationIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth';
import { getNavigationMenu } from '@/lib/routing';

const iconMap = {
  // Main navigation icons
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  WalletIcon,
  ChartBarIcon,
  HeartIcon,
  MegaphoneIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  
  // User and profile icons
  UserCircleIcon,
  UsersIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  
  // Analytics and reporting icons
  PresentationChartLineIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ChartBarSquareIcon,
  
  // Communication icons
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  BellIcon,
  InboxIcon,
  PaperAirplaneIcon,
  
  // Commerce icons
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  TagIcon,
  GiftIcon,
  
  // Management icons
  ClipboardDocumentListIcon,
  FolderIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  QueueListIcon,
  
  // Settings and configuration
  Cog6ToothIcon,
  CogIcon,
  AdjustmentsHorizontalIcon,
  WrenchIcon,
  KeyIcon,
  
  // Status and feedback icons
  StarIcon,
  BookmarkIcon,
  FireIcon,
  SparklesIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  
  // Location and mapping
  MapPinIcon,
  GlobeAltIcon,
  
  // Time and scheduling
  ClockIcon,
  CalendarIcon,
  
  // Visibility and security
  EyeIcon,
  ShieldExclamationIcon,
  
  // Generic utility icons
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  
  // Navigation and arrows
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDoubleRightIcon,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  // const { sidebarCollapsed, setSidebarCollapsed } = useDashboardStore();
  const sidebarCollapsed = false; // TODO: Implement sidebar collapse functionality
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems = user ? getNavigationMenu((user.role as 'buyer' | 'seller' | 'both' | 'admin') || 'buyer') : [];

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (title: string) => expandedItems.includes(title);

  const handleNavigation = (href: string, event?: React.MouseEvent) => {
    console.log('🚀 Navigation triggered:', href);
    console.log('📍 Current pathname:', pathname);
    console.log('🔧 Router object:', router);
    
    // Prevent default link behavior if we're handling it programmatically
    if (event) {
      event.preventDefault();
    }
    
    // Don't navigate if we're already on the target page
    if (pathname === href) {
      console.log('⚠️ Already on target page, skipping navigation');
      return;
    }
    
    // Use router.push for reliable navigation
    try {
      console.log('🔄 Attempting router.push...');
      router.push(href);
      console.log('✅ Router.push executed successfully');
      
      // Add a small delay to check if navigation worked
      setTimeout(() => {
        if (window.location.pathname !== href) {
          console.warn('⚠️ URL did not change after router.push, trying window.location');
          window.location.href = href;
        } else {
          console.log('✅ Navigation successful, URL updated');
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Router.push failed:', error);
      // Fallback to window.location
      console.log('🔄 Falling back to window.location');
      window.location.href = href;
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0 relative z-10',
      sidebarCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">Vikareta</span>
          </Link>
        )}
        <button
          onClick={() => {/* TODO: Implement sidebar collapse */}}
          className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
        >
          {sidebarCollapsed ? (
            <Bars3Icon className="w-5 h-5" />
          ) : (
            <XMarkIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const hasChildren = item.children && item.children.length > 0;
          const expanded = isExpanded(item.title);
          const active = isActive(item.href);

          return (
            <div key={item.title}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDownIcon 
                      className={cn(
                        'w-4 h-4 transition-transform',
                        expanded && 'transform rotate-180'
                      )} 
                    />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </button>
              )}

              {/* Submenu */}
              {hasChildren && expanded && !sidebarCollapsed && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.children?.map((child) => (
                    <button
                      key={child.href}
                      onClick={() => handleNavigation(child.href)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
                        isActive(child.href)
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      {child.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      {!sidebarCollapsed && user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user.businessName || user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}