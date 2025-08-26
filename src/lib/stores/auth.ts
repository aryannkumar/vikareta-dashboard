/**
 * Dashboard Auth Store - Using Unified Vikareta Auth System
 * Direct implementation with the new vikareta authentication
 */

import { useAuth } from '@/lib/auth/use-auth';

// Re-export the unified auth hook as store for backward compatibility
export const useAuthStore = useAuth;