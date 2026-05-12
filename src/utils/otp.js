/**
 * otp.js
 *
 * Contact-Number OTP plumbing for the social signup flow.
 *
 * Real flow (with backend):
 *   POST /auth/social/send-otp     { sessionToken, contactNumber, countryCode }
 *      -> { otpId, expiresAt, resendAvailableAt, attemptsLeft }
 *   POST /auth/social/verify-otp   { sessionToken, otpId, code }
 *      -> { token, refreshToken, user }   // backend creates / links user only here
 *
 * The frontend NEVER stores the OTP. The backend stores a HASH (e.g. bcrypt
 * or HMAC-SHA256) keyed on the session and Contact Number with the rate-limit
 * rules below.
 *
 * Mock flow (VITE_ENABLE_MOCK_OAUTH=true):
 *   We persist an in-memory + sessionStorage state that mirrors the same API
 *   so the UI can be exercised end-to-end. The demo code is always 123456.
 *   We still hash before storing so we exercise the same code path.
 */

import { API_BASE_URL, MOCK_OAUTH_ENABLED } from '../config/oauth.js';

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MS = 5 * 60 * 1000;          // 5 minutes
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;     // 30 seconds
export const OTP_MAX_ATTEMPTS = 5;
export const MOCK_OTP_CODE = '123456';

const STORAGE_KEY = 'mailwave-otp-state';

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

/**
 * Tiny non-cryptographic hash, kept purely so the mock flow never persists
 * the raw OTP. Real backends MUST replace this with bcrypt / scrypt / HMAC.
 */
async function hashOtp(value, salt) {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const enc = new TextEncoder();
    const bytes = enc.encode(`${salt}:${value}`);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h = 5381;
  const s = `${salt}:${value}`;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return `fallback-${(h >>> 0).toString(16)}`;
}

function readMockState() {
  const store = safeStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeMockState(state) {
  const store = safeStorage();
  if (!store) return;
  try {
    if (state) store.setItem(STORAGE_KEY, JSON.stringify(state));
    else store.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearOtpState() {
  writeMockState(null);
}

/**
 * Public helper for the OTP UI: how many seconds until the next resend is
 * allowed for *this* mock state. Real backend returns this directly.
 */
export function getResendCooldownSeconds() {
  const state = readMockState();
  if (!state || !state.resendAvailableAt) return 0;
  const diff = state.resendAvailableAt - nowMs();
  return diff > 0 ? Math.ceil(diff / 1000) : 0;
}

export function getOtpExpirySeconds() {
  const state = readMockState();
  if (!state || !state.expiresAt) return 0;
  const diff = state.expiresAt - nowMs();
  return diff > 0 ? Math.ceil(diff / 1000) : 0;
}

/* --------------------------------- Real API -------------------------------- */

async function postJson(path, body) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const err = new Error(data?.message || 'OTP request failed. Please try again.');
    err.status = res.status;
    err.code = data?.code || 'OTP_REQUEST_FAILED';
    throw err;
  }
  return data;
}

/* --------------------------------- Mock API -------------------------------- */

async function mockSendOtp({ sessionToken, contactNumber, countryCode }) {
  const existing = readMockState();
  if (existing && existing.resendAvailableAt && existing.resendAvailableAt > nowMs() && existing.contactNumber === contactNumber) {
    const wait = Math.ceil((existing.resendAvailableAt - nowMs()) / 1000);
    const err = new Error(`Please wait ${wait} seconds before requesting a new OTP.`);
    err.code = 'OTP_RESEND_COOLDOWN';
    throw err;
  }
  const otpId = `mock-otp-${Date.now().toString(36)}`;
  const salt = otpId;
  const codeHash = await hashOtp(MOCK_OTP_CODE, salt);
  const state = {
    sessionToken,
    contactNumber,
    countryCode: countryCode || '+91',
    otpId,
    salt,
    codeHash,
    attemptsLeft: OTP_MAX_ATTEMPTS,
    expiresAt: nowMs() + OTP_EXPIRY_MS,
    resendAvailableAt: nowMs() + OTP_RESEND_COOLDOWN_MS,
  };
  writeMockState(state);
  return {
    otpId,
    expiresAt: state.expiresAt,
    resendAvailableAt: state.resendAvailableAt,
    attemptsLeft: state.attemptsLeft,
    mock: true,
    debugCode: MOCK_OTP_CODE,
  };
}

async function mockVerifyOtp({ sessionToken, code }) {
  const state = readMockState();
  if (!state || state.sessionToken !== sessionToken) {
    const err = new Error('OTP session not found. Please request a new OTP.');
    err.code = 'OTP_NOT_FOUND';
    throw err;
  }
  if (state.expiresAt < nowMs()) {
    writeMockState(null);
    const err = new Error('OTP has expired. Please request a new OTP.');
    err.code = 'OTP_EXPIRED';
    throw err;
  }
  if (state.attemptsLeft <= 0) {
    writeMockState(null);
    const err = new Error('Too many attempts. Please request a new OTP.');
    err.code = 'OTP_LOCKED';
    throw err;
  }
  const guessHash = await hashOtp(String(code), state.salt);
  if (guessHash !== state.codeHash) {
    const next = { ...state, attemptsLeft: state.attemptsLeft - 1 };
    writeMockState(next);
    const err = new Error('Invalid OTP.');
    err.code = 'OTP_INVALID';
    err.attemptsLeft = next.attemptsLeft;
    throw err;
  }
  writeMockState(null);
  return { verified: true };
}

/* --------------------------------- Public --------------------------------- */

/**
 * Ask the backend (or the mock layer) to send a one-time code to the
 * Contact Number tied to this social session. Returns the OTP metadata
 * so the UI can show countdowns; the actual code is never returned in prod.
 */
export async function sendSocialOtp({ sessionToken, contactNumber, countryCode }) {
  if (!sessionToken) {
    const err = new Error('Social session is missing. Please sign in again.');
    err.code = 'NO_SESSION';
    throw err;
  }
  if (MOCK_OAUTH_ENABLED || !API_BASE_URL) {
    return mockSendOtp({ sessionToken, contactNumber, countryCode });
  }
  return postJson('/auth/social/send-otp', { sessionToken, contactNumber, countryCode });
}

/**
 * Verify the OTP. In production this returns { token, refreshToken, user }
 * the moment verification succeeds — that is the ONLY way a new social
 * user becomes a permanent user. In mock mode we return { verified: true }
 * and the caller is responsible for issuing the local mock JWT.
 */
export async function verifySocialOtp({ sessionToken, code }) {
  if (!sessionToken) {
    const err = new Error('Social session is missing. Please sign in again.');
    err.code = 'NO_SESSION';
    throw err;
  }
  if (!code || String(code).length !== OTP_LENGTH) {
    const err = new Error(`OTP must be ${OTP_LENGTH} digits.`);
    err.code = 'OTP_INVALID';
    throw err;
  }
  if (MOCK_OAUTH_ENABLED || !API_BASE_URL) {
    return mockVerifyOtp({ sessionToken, code });
  }
  return postJson('/auth/social/verify-otp', { sessionToken, code });
}

/**
 * Submit the social completion profile. In production the backend creates
 * the permanent user record only after this AND OTP verification have
 * succeeded. Returns { token, refreshToken, user }.
 */
export async function completeSocialProfile(payload) {
  if (MOCK_OAUTH_ENABLED || !API_BASE_URL) {
    // Mock layer is a no-op — we just echo the payload so the caller can
    // hold onto it until OTP verifies.
    return { ok: true, mock: true, profile: payload };
  }
  return postJson('/auth/social/complete-profile', payload);
}

export default {
  OTP_LENGTH,
  OTP_EXPIRY_MS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_MAX_ATTEMPTS,
  MOCK_OTP_CODE,
  sendSocialOtp,
  verifySocialOtp,
  completeSocialProfile,
  getResendCooldownSeconds,
  getOtpExpirySeconds,
  clearOtpState,
};
