/**
 * Enhanced Dashboard Layout with Modern Sidebar and Header
 * Provides responsive layout with navigation and user management
 */
'use client';

import React from 'react';
import { ModernSidebar } from './modern-sidebar';
import { DashboardHeader } from './dashboard-header';
import { useVikaretaAuthContext } from '@/lib/auth/vikareta';
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
  const { isAuthenticated } = useVikaretaAuthContext();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
  redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <ModernSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <DashboardHeader 
          title={title}
          description={description}
          actions={actions}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}