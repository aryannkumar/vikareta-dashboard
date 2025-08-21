/**
 * Dashboard Auth Store - Using Unified Vikareta Auth System
 * Direct implementation with the new vikareta authentication
 */

import { useVikaretaAuth } from '@/lib/auth/vikareta';

// Re-export the unified auth hook as store for backward compatibility
export const useAuthStore = useVikaretaAuth;

// Export the types we need
export type { UseVikaretaAuthReturn } from '@/lib/auth/vikareta';