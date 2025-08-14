'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EnhancedDashboard } from '@/components/dashboard/enhanced-dashboard';

export default function DashboardPage() {
  return (
    <DashboardLayout 
      title="Dashboard"
      description="Welcome back! Here's what's happening with your business."
    >
      <EnhancedDashboard />
    </DashboardLayout>
  );
}