/**
 * oauth.js
 *
 * Central OAuth configuration. Driven by Vite env variables so secrets stay
 * server-side. The frontend never sees GOOGLE_CLIENT_SECRET / FACEBOOK_APP_SECRET —
 * those live only on the backend.
 *
 * Required env (frontend):
 *   VITE_API_BASE_URL=http://localhost:5000/api/v1
 *   VITE_ENABLE_MOCK_OAUTH=false
 *
 * Required env (backend, NEVER imported here):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
 *   FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_CALLBACK_URL
 */

export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
};

export const PROVIDER_LABELS = {
  [OAUTH_PROVIDERS.GOOGLE]: 'Google',
  [OAUTH_PROVIDERS.FACEBOOK]: 'Facebook',
};

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const API_BASE_URL = (env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const MOCK_OAUTH_ENABLED =
  String(env.VITE_ENABLE_MOCK_OAUTH || '').toLowerCase() === 'true';

/**
 * Returns true when the frontend has enough configuration to start a real
 * OAuth handshake. Without an API base URL we cannot hit the backend that
 * owns the client secret, so we must refuse to fake a redirect.
 */
export function isOAuthConfigured() {
  return Boolean(API_BASE_URL);
}

/**
 * The backend endpoint that begins the provider handshake. The backend
 * issues the 302 to Google / Facebook with the correct client_id, scopes
 * and signed state — the frontend never builds the provider URL itself.
 */
export function getProviderStartUrl(provider, state, extras = {}) {
  if (!API_BASE_URL) return null;
  const params = new URLSearchParams();
  if (state) params.set('state', state);
  if (extras && extras.intent) params.set('intent', extras.intent);
  if (extras && extras.accountType) params.set('accountType', extras.accountType);
  const qs = params.toString();
  return `${API_BASE_URL}/auth/${provider}${qs ? `?${qs}` : ''}`;
}

export default {
  OAUTH_PROVIDERS,
  PROVIDER_LABELS,
  API_BASE_URL,
  MOCK_OAUTH_ENABLED,
  isOAuthConfigured,
  getProviderStartUrl,
};
