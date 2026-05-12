/**
 * socialSession.js
 *
 * Frontend-side temporary session for the social signup flow.
 *
 * Real flow:
 *  - Backend completes the OAuth handshake, decides the user is NEW (or has
 *    no verified Contact Number) and replies with a signed `sessionToken`
 *    plus a profile preview. We persist that token + preview here so the
 *    completion page and OTP page can read it.
 *  - Permanent account creation happens server-side only after the OTP
 *    verify endpoint accepts the entered code. The frontend never trusts
 *    this data to grant access — the session is replayed back to the
 *    backend on every call.
 *
 * Mock flow (VITE_ENABLE_MOCK_OAUTH=true):
 *  - The frontend fakes the OAuth handshake by generating a deterministic
 *    "provider profile" and a local sessionToken. The same shape lets the
 *    same UI exercise the full /auth/social-complete -> /auth/verify-mobile-otp
 *    path without a backend.
 */

const STORAGE_KEY = 'mailwave-social-session';
const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

function safeStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function nowMs() {
  return Date.now();
}

function randomId(bytes = 16) {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const buf = new Uint8Array(bytes);
    window.crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function saveSocialSession(session) {
  const store = safeStorage();
  if (!store || !session) return null;
  const expiresAt = session.expiresAt || nowMs() + SESSION_TTL_MS;
  const payload = { ...session, expiresAt };
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  return payload;
}

export function loadSocialSession() {
  const store = safeStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.provider) return null;
    if (parsed.expiresAt && parsed.expiresAt < nowMs()) {
      store.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function patchSocialSession(patch) {
  const current = loadSocialSession();
  if (!current) return null;
  return saveSocialSession({ ...current, ...patch });
}

export function clearSocialSession() {
  const store = safeStorage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Build a deterministic-but-realistic provider profile for the mock
 * flow. Real backends would return this shape (modulo sessionToken)
 * after exchanging the auth code with Google / Facebook.
 */
export function buildMockProviderProfile(provider, accountType) {
  const seed = randomId(4);
  const isFacebook = provider === 'facebook';
  const firstName = isFacebook ? 'Casey' : 'Jordan';
  const lastName = isFacebook ? 'Reyes' : 'Patel';
  const emailHandle = `${firstName}.${lastName}`.toLowerCase();
  const domain = isFacebook ? 'facebook-demo.com' : 'gmail-demo.com';
  return {
    sessionToken: `mock.${provider}.${seed}.${Date.now().toString(36)}`,
    provider,
    providerId: `${provider}-${seed}`,
    emailId: `${emailHandle}@${domain}`,
    emailVerified: true,
    firstName,
    lastName,
    avatar: `https://api.dicebear.com/7.x/initials/svg?backgroundType=gradientLinear&seed=${encodeURIComponent(`${firstName} ${lastName}`)}`,
    accountType: accountType || null,
    needsContactNumber: true,
    expiresAt: nowMs() + SESSION_TTL_MS,
  };
}

export const SOCIAL_SESSION_STORAGE_KEY = STORAGE_KEY;
export const SOCIAL_SESSION_TTL_MS = SESSION_TTL_MS;

export default {
  saveSocialSession,
  loadSocialSession,
  patchSocialSession,
  clearSocialSession,
  buildMockProviderProfile,
};
