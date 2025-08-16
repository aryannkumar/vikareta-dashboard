import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Custom hook for consistent navigation throughout the dashboard
 * Prevents page reloads and uses Next.js router for SPA navigation
 */
export function useNavigation() {
  const router = useRouter();

  const navigateTo = useCallback((path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if router fails
      window.location.href = path;
    }
  }, [router]);

  const goBack = useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('Navigation back error:', error);
      // Fallback to history.back()
      window.history.back();
    }
  }, [router]);

  const refresh = useCallback(() => {
    try {
      router.refresh();
    } catch (error) {
      console.error('Navigation refresh error:', error);
      // Fallback to window.location.reload()
      window.location.reload();
    }
  }, [router]);

  const replace = useCallback((path: string) => {
    try {
      router.replace(path);
    } catch (error) {
      console.error('Navigation replace error:', error);
      // Fallback to window.location.replace()
      window.location.replace(path);
    }
  }, [router]);

  return {
    navigateTo,
    goBack,
    refresh,
    replace,
    router
  };
}