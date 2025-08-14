/**
 * Enhanced Dashboard Layout with Modern Sidebar and Header
 * Provides responsive layout with navigation and user management
 */
'use client';

import React from 'react';
import { ModernSidebar } from './modern-sidebar';
import { DashboardHeader } from './dashboard-header';
import { useAuthStore } from '@/lib/stores/auth';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ 
  children, 
  title, 
  description, 
  actions 
}: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ModernSidebar />

      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <DashboardHeader 
          title={title}
          description={description}
          actions={actions}
        />

        {/* Page Content */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}