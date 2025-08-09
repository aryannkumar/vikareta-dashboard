// Development helpers - only for testing purposes

export function simulateAdminUser() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Get the current auth store state
    const authStore = localStorage.getItem('dashboard-auth-storage');
    if (authStore) {
      try {
        const parsed = JSON.parse(authStore);
        if (parsed.state && parsed.state.user) {
          // Temporarily change user role to admin
          parsed.state.user.role = 'admin';
          localStorage.setItem('dashboard-auth-storage', JSON.stringify(parsed));
          console.log('🔧 Development: User role changed to admin');
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to simulate admin user:', error);
      }
    }
  }
}

export function resetUserRole() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Get the current auth store state
    const authStore = localStorage.getItem('dashboard-auth-storage');
    if (authStore) {
      try {
        const parsed = JSON.parse(authStore);
        if (parsed.state && parsed.state.user) {
          // Reset user role to both (default)
          parsed.state.user.role = 'both';
          localStorage.setItem('dashboard-auth-storage', JSON.stringify(parsed));
          console.log('🔧 Development: User role reset to both');
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to reset user role:', error);
      }
    }
  }
}

// Make these available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).simulateAdminUser = simulateAdminUser;
  (window as any).resetUserRole = resetUserRole;
}