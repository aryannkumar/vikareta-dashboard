import { DashboardLayout } from '@/components/shared/layout';

// Import dev helpers in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/dev-helpers');
}

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}