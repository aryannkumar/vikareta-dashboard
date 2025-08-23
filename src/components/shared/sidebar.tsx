'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useVikaretaAuthContext } from '@/lib/auth/vikareta';
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
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useVikaretaAuthContext();
  // const { sidebarCollapsed, setSidebarCollapsed } = useDashboardStore();
  const sidebarCollapsed = false; // TODO: Implement sidebar collapse functionality
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems = user ? getNavigationMenu((user.userType as 'buyer' | 'seller' | 'both' | 'admin') || 'buyer') : [];

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
      'flex flex-col h-full bg-gradient-to-b from-amber-900 via-amber-950 to-gray-900 border-r border-amber-800/30 transition-all duration-300 flex-shrink-0 relative z-10 shadow-2xl',
      sidebarCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-amber-800/30">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-lg">V</span>
            </motion.div>
            <motion.span 
              className="font-bold text-xl text-amber-100 group-hover:text-amber-200 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Vikareta
            </motion.span>
          </Link>
        )}
        {onClose && (
          <motion.button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-amber-800/30 text-amber-200 hover:text-amber-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const hasChildren = item.children && item.children.length > 0;
          const expanded = isExpanded(item.title);
          const active = isActive(item.href);

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {hasChildren ? (
                <motion.button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                      : 'text-amber-200 hover:bg-amber-800/30 hover:text-amber-100'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      active ? 'text-white' : 'text-amber-300 group-hover:text-amber-200'
                    )} />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <motion.div
                      animate={{ rotate: expanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group',
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                      : 'text-amber-200 hover:bg-amber-800/30 hover:text-amber-100'
                  )}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    active ? 'text-white' : 'text-amber-300 group-hover:text-amber-200'
                  )} />
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </motion.button>
              )}

              {/* Submenu */}
              <AnimatePresence>
                {hasChildren && expanded && !sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-8 mt-2 space-y-1 overflow-hidden"
                  >
                    {item.children?.map((child, childIndex) => (
                      <motion.button
                        key={child.href}
                        onClick={() => handleNavigation(child.href)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer group',
                          isActive(child.href)
                            ? 'bg-amber-600/50 text-amber-100 font-medium shadow-md'
                            : 'text-amber-300 hover:bg-amber-800/20 hover:text-amber-200'
                        )}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: childIndex * 0.03 }}
                        whileHover={{ x: 4 }}
                      >
                        <span className="relative">
                          {child.title}
                          {isActive(child.href) && (
                            <motion.div
                              className="absolute -left-3 top-1/2 w-1 h-4 bg-amber-300 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              style={{ transform: 'translateY(-50%)' }}
                            />
                          )}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </nav>

      {/* User Info */}
      {!sidebarCollapsed && user && (
        <motion.div
          className="p-4 border-t border-amber-800/30 bg-gradient-to-r from-amber-900/50 to-gray-900/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-white text-sm font-bold">
                {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'S'}
              </span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-100 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-amber-300 truncate">
                {user.businessName || user.email}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}