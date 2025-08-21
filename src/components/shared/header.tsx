'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <motion.header 
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-amber-200/50 dark:border-amber-800/30 px-4 lg:px-6 py-4 shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Search */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile Menu Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30"
              onClick={onMenuClick}
            >
              <Bars3Icon className="w-5 h-5" />
            </Button>
          </motion.div>
          
          {/* Search */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" />
                <Input
                  type="search"
                  placeholder="Search products, orders, RFQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/70 dark:bg-gray-800/70"
                />
              </motion.div>
            </form>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30"
            >
              <BellIcon className="w-5 h-5" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="w-5 h-5 text-xs p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600"
                >
                  3
                </Badge>
              </motion.div>
            </Button>
          </motion.div>

          {/* User Menu */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30"
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
                  </span>
                </motion.div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-amber-200 dark:border-amber-800/50 rounded-xl shadow-xl z-50"
              >
                <div className="p-4 border-b border-amber-200 dark:border-amber-800/50">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400">
                      {user?.verificationTier ? user.verificationTier.charAt(0).toUpperCase() + user.verificationTier.slice(1) : 'Basic'}
                    </Badge>
                    {user?.isVerified && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="py-2">
                  <motion.button
                    onClick={() => {
                      router.push('/profile');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <UserCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-gray-700 dark:text-gray-300">Profile</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      router.push('/settings');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-gray-700 dark:text-gray-300">Settings</span>
                  </motion.button>
                </div>
                
                <div className="border-t border-amber-200 dark:border-amber-800/50 py-2">
                  <motion.button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Sign Out</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </motion.header>
  );
}