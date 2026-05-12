/**
 * oauth.js
 *
 * Frontend helpers for the OAuth handshake:
 *   - generateState(): CSRF token persisted in sessionStorage for callback verification
 *   - consumeState(): one-shot read + clear, used by the callback page
 *   - readCallbackParams(): pulls code/state/error from current URL
 *
 * Tokens issued by the backend (app JWT, refresh token) are persisted in
 * localStorage by the AuthContext — provider tokens are never stored on
 * the frontend.
 */

import { API_BASE_URL } from '../config/oauth.js';

const STATE_KEY = 'mailwave-oauth-state';

function safeStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function randomToken(bytes = 24) {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const buf = new Uint8Array(bytes);
    window.crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function generateState(provider, extras = {}) {
  const store = safeStorage();
  const token = randomToken();
  const payload = { token, provider, createdAt: Date.now(), ...extras };
  if (store) {
    try {
      store.setItem(STATE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }
  return token;
}

export function consumeState() {
  const store = safeStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(STATE_KEY);
    if (!raw) return null;
    store.removeItem(STATE_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readCallbackParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get('code') || '',
    state: params.get('state') || '',
    token: params.get('token') || '',
    error: params.get('error') || '',
    errorDescription: params.get('error_description') || '',
    provider: params.get('provider') || '',
  };
}

/**
 * POST the provider auth code (or token) to the backend so it can verify
 * with the provider, look up / create the user, and return the app JWT.
 * The frontend NEVER calls Google / Facebook directly with a secret.
 */
export async function exchangeCodeForSession({ provider, code, state, token }) {
  if (!API_BASE_URL) {
    const err = new Error(
      `${provider === 'facebook' ? 'Facebook' : 'Google'} login is not configured yet.`
    );
    err.code = 'OAUTH_NOT_CONFIGURED';
    throw err;
  }
  const res = await fetch(`${API_BASE_URL}/auth/${provider}/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code, state, token }),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message || '';
    } catch {
      /* ignore */
    }
    const err = new Error(detail || 'OAuth verification failed. Please try again.');
    err.code = 'OAUTH_BACKEND_ERROR';
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export default {
  generateState,
  consumeState,
  readCallbackParams,
  exchangeCodeForSession,
};
