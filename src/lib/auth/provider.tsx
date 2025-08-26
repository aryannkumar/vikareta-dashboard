'use client';

import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';
import { getKeycloakConfig } from './config';

const keycloak = new Keycloak(getKeycloakConfig());

const initOptions = {
  onLoad: 'check-sso' as const,
  silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : undefined,
  pkceMethod: 'S256' as const,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={initOptions}
      LoadingComponent={<div className="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      {children}
    </ReactKeycloakProvider>
  );
}