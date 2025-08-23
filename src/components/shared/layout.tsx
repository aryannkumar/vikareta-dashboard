'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useVikaretaAuthContext } from '@/lib/auth/vikareta';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { AuthErrorHandler } from '@/components/auth/auth-error-handler';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useVikaretaAuthContext();

  const redirectToLogin = () => {
    const mainAppUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/auth/login'
      : 'https://vikareta.com/auth/login';
    window.location.href = mainAppUrl;
  };

  // The auth system automatically handles authentication check
  // We just need to redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated && !authLoading) {
      redirectToLogin();
    }
  }, [authLoading, isAuthenticated, isHydrated]);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);

    // Clean up any URL parameters (no longer needed with HttpOnly cookies)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('token') || urlParams.has('redirect') || urlParams.has('source')) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  // Only redirect to dashboard if explicitly requested via URL parameter
  useEffect(() => {
    if (isAuthenticated && user && pathname === '/') {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldRedirectToDashboard = urlParams.get('redirect') === 'dashboard';

      if (shouldRedirectToDashboard) {
        console.log('Dashboard: Redirecting to /dashboard as requested');
        window.location.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, pathname]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-amber-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
          </div>
          <Loading size="lg" text="Loading..." />
        </motion.div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-amber-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">V</span>
            </div>
          </div>
          <Loading size="lg" text="Authenticating..." />
          <p className="text-amber-600 dark:text-amber-400 mt-2 text-sm">
            Verifying your credentials...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show loading or login prompt if not authenticated
  if (!isAuthenticated || !user) {
    if (isHydrated && !authLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-amber-950">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200 dark:border-amber-800"
          >
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">V</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Welcome to Vikareta
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please log in to access your seller dashboard and manage your business.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={redirectToLogin} 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-xl shadow-lg"
              >
                Continue to Login
              </Button>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-amber-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loading size="lg" text="Checking authentication..." />
        </motion.div>
      </div>
    );
  }

  // Don't show layout on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-amber-950 dark:to-orange-950">
      {/* Auth Error Handler */}
      <AuthErrorHandler />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-50 h-full lg:hidden"
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </motion.div>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:block"
      >
        <Sidebar />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
        </motion.div>

        {/* Page Content */}
        <main className={cn(
          'flex-1 overflow-y-auto p-4 lg:p-6',
          className
        )}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}