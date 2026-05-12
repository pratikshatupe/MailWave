import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { findDemoUser, findDemoUserByEmail } from '../config/demoUsers.js';
import { ROLES } from '../config/roles.js';
import { ERROR_MESSAGES } from '../config/messages.js';
import {
  OAUTH_PROVIDERS,
  PROVIDER_LABELS,
  MOCK_OAUTH_ENABLED,
  isOAuthConfigured,
  getProviderStartUrl,
} from '../config/oauth.js';
import {
  generateState,
  consumeState,
  exchangeCodeForSession,
} from '../utils/oauth.js';
import {
  saveSocialSession,
  clearSocialSession,
  buildMockProviderProfile,
} from '../utils/socialSession.js';
import { clearInvalidRememberedLoginData } from '../utils/rememberMe.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'mailwave-auth';

function loadStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && parsed.role && parsed.token) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function persist(user) {
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

function buildUser(record, extras = {}) {
  return {
    id: record.id || record.email,
    email: record.email,
    name: record.name,
    fullName: record.fullName || record.name,
    role: record.role,
    tenantId: record.tenantId,
    plan: record.plan,
    avatarUrl: record.avatarUrl || null,
    provider: record.provider || 'password',
    isAuthenticated: true,
    token: record.token || `demo.${record.role}.${Date.now().toString(36)}`,
    refreshToken: record.refreshToken || null,
    avatarInitials: deriveInitials(record.fullName || record.name),
    mobileVerified: record.mobileVerified ?? false,
    contactNumber: record.contactNumber || null,
    ...extras,
  };
}

export function deriveInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Roles for newly created social accounts. The selected `accountType`
 * is captured before the OAuth handshake (Register flow) and replayed
 * once the OTP step succeeds.
 */
function deriveRoleFromAccountType(accountType) {
  if (accountType === 'organization' || accountType === 'organisation') {
    return ROLES.BUSINESS_ADMIN;
  }
  return ROLES.INDIVIDUAL;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStoredUser());

  useEffect(() => {
    persist(user);
  }, [user]);

  const login = useCallback(async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 500));
    const match = findDemoUser(email, password);
    if (!match) {
      const err = new Error(ERROR_MESSAGES.invalidCredentials);
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }
    const next = buildUser(match);
    setUser(next);
    return next;
  }, []);

  /**
   * Step 1 of the OAuth flow — kicks off the provider handshake.
   *
   * IMPORTANT: this function MUST NOT authenticate the user. Even on the
   * mock path we only stash a temporary social session and ask the caller
   * to navigate to `/auth/oauth-callback`, which then routes the user to
   * profile completion + OTP. Real OAuth never grants the JWT here.
   *
   *  - With mock OAuth enabled (VITE_ENABLE_MOCK_OAUTH=true) we build a
   *    fake provider profile and return { mode: 'mock' }. The caller
   *    navigates to /auth/oauth-callback?provider=<p>&mock=1.
   *  - Without backend config we refuse to fake a redirect and surface a
   *    "not configured yet" error the caller can show in a toast.
   *  - Otherwise we hand off to the backend `/auth/<provider>` endpoint
   *    which owns the client secret and issues the 302 to the provider.
   */
  const startOAuthLogin = useCallback(async (provider, options = {}) => {
    const providerKey = provider === OAUTH_PROVIDERS.FACEBOOK
      ? OAUTH_PROVIDERS.FACEBOOK
      : OAUTH_PROVIDERS.GOOGLE;
    const label = PROVIDER_LABELS[providerKey] || 'Provider';
    const accountType = options.accountType || null;
    const intent = options.intent || 'login'; // 'login' | 'signup'

    if (MOCK_OAUTH_ENABLED) {
      // Mock the provider handshake. We never authenticate here — instead
      // we drop a temp social session and ask the caller to drive the user
      // through /auth/oauth-callback like the real flow.
      const profile = buildMockProviderProfile(providerKey, accountType);
      saveSocialSession({
        ...profile,
        intent,
        accountType,
        existingUser: false,
      });
      return { mode: 'mock', provider: providerKey, intent, accountType };
    }

    if (!isOAuthConfigured()) {
      const err = new Error(`${label} ${intent === 'signup' ? 'Sign Up' : 'Log In'} is not configured yet.`);
      err.code = 'OAUTH_NOT_CONFIGURED';
      throw err;
    }

    const state = generateState(providerKey, { accountType, intent });
    const url = getProviderStartUrl(providerKey, state, { accountType, intent });
    if (!url) {
      const err = new Error(`${label} ${intent === 'signup' ? 'Sign Up' : 'Log In'} is not configured yet.`);
      err.code = 'OAUTH_NOT_CONFIGURED';
      throw err;
    }

    if (typeof window !== 'undefined') {
      window.location.assign(url);
    }
    return { mode: 'redirect', url };
  }, []);

  /**
   * Step 2 — finishes the OAuth flow after the backend redirects back with
   * an auth code (or, for the simple "token-in-query" pattern, the JWT itself).
   * Verifies CSRF state, then POSTs to the backend which:
   *   - exchanges the code with Google/Facebook
   *   - looks up / creates the user
   *   - returns one of:
   *      { status: 'authenticated', token, refreshToken, user }    // existing + verified
   *      { status: 'needs_profile', sessionToken, profile }        // new user OR missing contact
   *
   * The frontend never sees provider tokens or client secrets here.
   */
  const completeOAuthLogin = useCallback(async ({ provider, code, state, token }) => {
    if (state) {
      const expected = consumeState();
      if (!expected || expected.token !== state) {
        const err = new Error('OAuth state mismatch. Please try again.');
        err.code = 'OAUTH_STATE_MISMATCH';
        throw err;
      }
    }

    const data = await exchangeCodeForSession({ provider, code, state, token });
    if (!data) {
      const err = new Error('OAuth response was malformed. Please try again.');
      err.code = 'OAUTH_MALFORMED_RESPONSE';
      throw err;
    }

    // Backend explicitly told us this user is incomplete (new or missing
    // verified Contact Number). Stash the temporary session and tell the
    // caller to navigate to /auth/social-complete.
    if (data.status === 'needs_profile' && data.sessionToken && data.profile) {
      saveSocialSession({
        sessionToken: data.sessionToken,
        provider,
        providerId: data.profile.providerId,
        emailId: data.profile.emailId,
        emailVerified: Boolean(data.profile.emailVerified),
        firstName: data.profile.firstName || '',
        lastName: data.profile.lastName || '',
        avatar: data.profile.avatar || null,
        existingUser: Boolean(data.profile.existingUser),
        accountType: data.profile.accountType || null,
        expiresAt: data.profile.expiresAt || null,
      });
      return { status: 'needs_profile' };
    }

    if (!data.user || !data.token) {
      const err = new Error('OAuth response was malformed. Please try again.');
      err.code = 'OAUTH_MALFORMED_RESPONSE';
      throw err;
    }

    const next = buildUser(
      {
        ...data.user,
        token: data.token,
        refreshToken: data.refreshToken || null,
      },
      { provider }
    );
    setUser(next);
    clearSocialSession();
    return { status: 'authenticated', user: next };
  }, []);

  /**
   * Final step of the social signup flow — invoked from the OTP page after
   * the backend confirmed the code. The backend response is the same shape
   * as `completeOAuthLogin` success: { token, refreshToken, user }. In the
   * mock path we synthesise the user from the temp session + accountType.
   */
  const finalizeSocialSignup = useCallback(({ provider, accountType, profile, token, refreshToken, user: serverUser }) => {
    let record;
    if (serverUser && token) {
      record = {
        ...serverUser,
        token,
        refreshToken: refreshToken || null,
        provider,
      };
    } else {
      const role = deriveRoleFromAccountType(accountType);
      const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() || profile?.emailId || 'New user';
      record = {
        id: profile?.providerId || profile?.emailId,
        email: profile?.emailId,
        name: fullName,
        fullName,
        role,
        tenantId: role === ROLES.BUSINESS_ADMIN ? `tenant-${(profile?.emailId || 'new').split('@')[0]}` : `solo-${(profile?.emailId || 'new').split('@')[0]}`,
        plan: 'Starter',
        avatarUrl: profile?.avatar || null,
        provider,
        mobileVerified: true,
        contactNumber: profile?.contactNumber || null,
        token: token || `social.${provider}.${Date.now().toString(36)}`,
        refreshToken: refreshToken || null,
      };
    }
    const next = buildUser(record, { provider });
    setUser(next);
    clearSocialSession();
    return next;
  }, []);

  const register = useCallback(async (payload) => {
    await new Promise((r) => setTimeout(r, 600));
    // Front-end-only demo registration: never persists a session, just returns ok.
    return { ok: true, email: payload.email };
  }, []);

  const logout = useCallback(() => {
    // Drop the auth session (mailwave-auth is cleared by the persist effect)
    // and any in-flight social signup session. We deliberately keep the
    // `mailwave-remember` entry untouched here: that record only exists
    // when the user explicitly checked Remember Me, and per spec we keep
    // the Email ID for next time. If Remember Me was unchecked at login,
    // there is nothing to keep — and the cleanup below also wipes any
    // legacy demo keys that older builds may have left behind.
    setUser(null);
    clearSocialSession();
    clearInvalidRememberedLoginData();
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      token: user?.token || null,
      isAuthenticated: Boolean(user && user.token),
      login,
      startOAuthLogin,
      completeOAuthLogin,
      finalizeSocialSignup,
      register,
      logout,
      updateUser,
    }),
    [user, login, startOAuthLogin, completeOAuthLogin, finalizeSocialSignup, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
