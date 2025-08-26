import { useKeycloak } from '@react-keycloak/web';
import { useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  roles: string[];
}

export function useAuth() {
  const { keycloak, initialized } = useKeycloak();

  const user: User | null = keycloak.authenticated ? {
    id: keycloak.tokenParsed?.sub || '',
    email: keycloak.tokenParsed?.email || '',
    name: keycloak.tokenParsed?.name || '',
    username: keycloak.tokenParsed?.preferred_username || '',
    roles: keycloak.tokenParsed?.realm_access?.roles || []
  } : null;

  const login = useCallback(() => {
    keycloak.login({
      redirectUri: 'https://vikareta.com/login'
    });
  }, [keycloak]);

  const logout = useCallback(() => {
    keycloak.logout({
      redirectUri: 'https://vikareta.com'
    });
  }, [keycloak]);

  const hasRole = useCallback((role: string) => {
    return user?.roles.includes(role) || false;
  }, [user]);

  return {
    isInitialized: initialized,
    isAuthenticated: keycloak.authenticated || false,
    isLoading: !initialized,
    user,
    token: keycloak.token,
    login,
    logout,
    hasRole,
    keycloak
  };
}