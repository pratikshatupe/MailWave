/**
 * rememberMe.js
 *
 * Helpers for the Log In page's "Remember Me" feature.
 *
 * Storage shape (localStorage):
 *   mailwave-remember = JSON.stringify({ rememberMe: true, emailId: '<email>' })
 *
 * Rules (enforced here so callers cannot accidentally bypass them):
 *  - We persist ONLY the Email ID, never the Password.
 *  - We treat the storage entry as truthy only when `rememberMe === true` AND
 *    a non-empty Email ID is present. Anything else is treated as "absent".
 *  - Clearing wipes the entry entirely; we don't keep a stale flag around.
 */

const STORAGE_KEY = 'mailwave-remember';

// Legacy / unsafe keys some earlier builds (and ad-hoc demos) wrote into
// localStorage. They are never read by the current Log In page, but if they
// linger they can confuse browser autofill and look like our app is leaking
// demo credentials into the form. We wipe them aggressively on app boot and
// on every logout.
const LEGACY_LOGIN_KEYS = [
  'rememberMe',
  'rememberedEmail',
  'rememberedEmailId',
  'rememberedPassword',
  'email',
  'password',
  'demoEmail',
  'demoPassword',
  'demo-email',
  'demo-password',
  'currentDemoUser',
  'demoUser',
  'demo-user',
];

function safeStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadRememberedLogin() {
  const store = safeStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.rememberMe === true && typeof parsed.emailId === 'string' && parsed.emailId.trim()) {
      return { emailId: parsed.emailId.trim() };
    }
    // Entry exists but is malformed (no flag, no email, or password leaked
    // in) — drop it so it cannot resurface as autofill.
    store.removeItem(STORAGE_KEY);
    return null;
  } catch {
    try { store.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }
}

export function saveRememberedLogin({ emailId }) {
  const store = safeStorage();
  if (!store) return;
  const trimmed = typeof emailId === 'string' ? emailId.trim() : '';
  if (!trimmed) {
    clearRememberedLogin();
    return;
  }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify({ rememberMe: true, emailId: trimmed }));
  } catch {
    /* ignore */
  }
}

export function clearRememberedLogin() {
  const store = safeStorage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Wipes any legacy / unsafe login keys that may have been written by older
 * builds or ad-hoc demos. Also drops the current `mailwave-remember` entry
 * when it does NOT have `rememberMe === true`, so a stale flag-less record
 * can never re-populate the Log In form.
 *
 * Safe to call on every app boot — it is a no-op when nothing is found.
 */
export function clearInvalidRememberedLoginData() {
  const store = safeStorage();
  if (!store) return;

  LEGACY_LOGIN_KEYS.forEach((key) => {
    try { store.removeItem(key); } catch { /* ignore */ }
  });

  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return;
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch { parsed = null; }
    const valid =
      parsed &&
      parsed.rememberMe === true &&
      typeof parsed.emailId === 'string' &&
      parsed.emailId.trim().length > 0;
    if (!valid) {
      store.removeItem(STORAGE_KEY);
      return;
    }
    // Strip any password-shaped fields that older code might have written
    // alongside the Email ID — we never persist passwords.
    if ('password' in parsed || 'rememberedPassword' in parsed) {
      store.setItem(
        STORAGE_KEY,
        JSON.stringify({ rememberMe: true, emailId: parsed.emailId.trim() })
      );
    }
  } catch {
    /* ignore */
  }
}

export const REMEMBER_STORAGE_KEY = STORAGE_KEY;

export default {
  loadRememberedLogin,
  saveRememberedLogin,
  clearRememberedLogin,
  clearInvalidRememberedLoginData,
};
