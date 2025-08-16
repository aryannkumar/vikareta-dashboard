import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Custom hook for consistent navigation throughout the dashboard
 * Prevents page reloads and uses Next.js router for SPA navigation
 */
export function useNavigation() {
  const router = useRouter();

  const navigateTo = useCallback((path: string) => {
    console.log('🚀 Navigating to:', path);
    try {
      router.push(path);
      console.log('✅ Navigation successful');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback to window.location if router fails
      console.log('🔄 Falling back to window.location');
      window.location.href = path;
    }
  }, [router]);

  const goBack = useCallback(() => {
    console.log('🔙 Going back');
    try {
      router.back();
    } catch (error) {
      console.error('❌ Navigation back error:', error);
      // Fallback to history.back()
      window.history.back();
    }
  }, [router]);

  const refresh = useCallback(() => {
    console.log('🔄 Refreshing page');
    try {
      router.refresh();
    } catch (error) {
      console.error('❌ Navigation refresh error:', error);
      // Fallback to window.location.reload()
      window.location.reload();
    }
  }, [router]);

  const replace = useCallback((path: string) => {
    console.log('🔄 Replacing with:', path);
    try {
      router.replace(path);
    } catch (error) {
      console.error('❌ Navigation replace error:', error);
      // Fallback to window.location.replace()
      window.location.replace(path);
    }
  }, [router]);

  const openInNewTab = useCallback((path: string) => {
    console.log('🔗 Opening in new tab:', path);
    window.open(path, '_blank', 'noopener,noreferrer');
  }, []);

  const navigateToExternal = useCallback((url: string) => {
    console.log('🌐 Navigating to external URL:', url);
    window.location.href = url;
  }, []);

  return {
    navigateTo,
    goBack,
    refresh,
    replace,
    openInNewTab,
    navigateToExternal,
    router
  };
}