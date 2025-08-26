export const KEYCLOAK_CONFIG = {
  url: 'https://auths.vikareta.com',
  realm: 'vikareta',
  clientId: 'vikareta-dashboard'
};

export const getKeycloakConfig = () => ({
  url: KEYCLOAK_CONFIG.url,
  realm: KEYCLOAK_CONFIG.realm,
  clientId: KEYCLOAK_CONFIG.clientId,
});