import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

import Logo from '../../components/common/Logo.jsx';
import ThemeToggle from '../../components/common/ThemeToggle.jsx';
import GoogleButton from '../../components/auth/GoogleButton.jsx';
import FacebookButton from '../../components/auth/FacebookButton.jsx';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal.jsx';
import AuthSideVisual from '../../components/auth/AuthSideVisual.jsx';

import InputField from '../../components/ui/InputField.jsx';
import PasswordField from '../../components/ui/PasswordField.jsx';
import Toast from '../../components/ui/Toast.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';
import { SUCCESS_MESSAGES } from '../../config/messages.js';
import { OAUTH_PROVIDERS, PROVIDER_LABELS } from '../../config/oauth.js';
import {
  validateEmailId,
  validateRequired,
} from '../../utils/validators.js';
import {
  loadRememberedLogin,
  saveRememberedLogin,
  clearRememberedLogin,
  clearInvalidRememberedLoginData,
} from '../../utils/rememberMe.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, startOAuthLogin } = useAuth();

  // Default state must be empty — fields are only pre-filled when the user
  // previously checked Remember Me, in which case we restore JUST the Email
  // ID. Password is never persisted, so it always starts empty.
  //
  // We also wipe any legacy/unsafe login keys (rememberMe, rememberedEmailId,
  // rememberedPassword, email, password, demoEmail, …) before deciding what
  // to restore — old builds may have left stale data behind that browser
  // autofill would otherwise resurface as a "demo value".
  const [form, setForm] = useState(() => {
    clearInvalidRememberedLoginData();
    const remembered = loadRememberedLogin();
    const emailId = remembered?.emailId || '';
    return {
      emailId,
      password: '',
      remember: emailId.length > 0,
    };
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(null); // 'google' | 'facebook' | null
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  // Surface cancellation / error messages relayed back from the OAuth callback
  // page so the user lands on /login with a clear reason instead of a blank form.
  useEffect(() => {
    const flash = location.state?.oauthError;
    if (flash) {
      setServerError(flash);
      // Strip the flash from history so a refresh does not re-show it.
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    // Typing in either credential field (or toggling Remember Me) clears
    // any lingering OAuth / server error toast — see acceptance criteria.
    if (serverError && (name === 'emailId' || name === 'password' || name === 'remember')) {
      setServerError('');
    }
    // Unchecking Remember Me drops the saved Email ID immediately AND wipes
    // any legacy login keys, so nothing can be resurrected as autofill.
    if (name === 'remember' && value === false) {
      clearRememberedLogin();
      clearInvalidRememberedLoginData();
    }
  }

  function validateOne(name, value) {
    if (name === 'emailId') return validateEmailId(value);
    if (name === 'password') return validateRequired(value, LABELS.password);
    return '';
  }

  function handleBlur(name, value) {
    const err = validateOne(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  function validate() {
    const next = {};
    const emailErr = validateOne('emailId', form.emailId);
    if (emailErr) next.emailId = emailErr;
    const pwErr = validateOne('password', form.password);
    if (pwErr) next.password = pwErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function redirectAfterLogin() {
    const to = location.state?.from?.pathname || ROUTES.dashboard;
    navigate(to, { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await login({ email: form.emailId, password: form.password });
      // Persist Email ID only — Password is never saved to localStorage.
      // Browser autofill (via autoComplete="current-password") is the
      // only legitimate way to restore the password.
      if (form.remember) {
        saveRememberedLogin({ emailId: form.emailId.trim() });
      } else {
        clearRememberedLogin();
      }
      setSuccess(true);
      setTimeout(redirectAfterLogin, 500);
    } catch (err) {
      setServerError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function runProviderLogin(provider) {
    if (providerLoading) return;
    setProviderLoading(provider);
    setServerError('');
    try {
      const result = await startOAuthLogin(provider, { intent: 'login' });
      if (result?.mode === 'mock') {
        // Mock path — startOAuthLogin saved a temp social session. Forward
        // to the OAuth callback page so the same routing logic the real
        // backend triggers takes over (no direct dashboard shortcut).
        navigate(`${ROUTES.oauthCallback}?provider=${provider}&mock=1`, { replace: true });
        return;
      }
      // result.mode === 'redirect' — the browser is on its way to the
      // provider via the backend. Keep the spinner up until navigation;
      // we deliberately do NOT call redirectAfterLogin here.
    } catch (err) {
      setProviderLoading(null);
      const label = PROVIDER_LABELS[provider] || 'Provider';
      setServerError(err?.message || `${label} Log In is not configured yet.`);
    }
  }

  const handleGoogleLogin = () => runProviderLogin(OAUTH_PROVIDERS.GOOGLE);
  const handleFacebookLogin = () => runProviderLogin(OAUTH_PROVIDERS.FACEBOOK);

  const anyProviderLoading = Boolean(providerLoading);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute right-3 top-3 z-30 sm:right-6 sm:top-6">
        <ThemeToggle size="sm" />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center px-4 pb-8 pt-16 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <Link
                to={ROUTES.landing}
                className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← Back home
              </Link>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back 👋
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {`Sign in to your Mailwave workspace to manage campaigns and automations.`}
            </p>

            {serverError && (
              <Toast
                type="error"
                message={serverError}
                onClose={() => setServerError('')}
                className="mt-5"
              />
            )}

            {success && (
              <Toast
                type="success"
                message={`${SUCCESS_MESSAGES.loggedIn} Redirecting…`}
                className="mt-5"
              />
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              <InputField
                field="emailId"
                value={form.emailId}
                onChange={(e) => update('emailId', e.target.value)}
                onBlur={(e) => handleBlur('emailId', e.target.value)}
                error={errors.emailId}
                autoComplete="username"
              />
              <PasswordField
                field="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => update('remember', e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  {LABELS.rememberMe}
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="cursor-pointer text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {LABELS.forgotPassword}?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || success || anyProviderLoading}
                className="btn-primary w-full cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Signed in
                  </>
                ) : (
                  <>
                    {LABELS.logIn} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-950 dark:text-slate-500">
                    or
                  </span>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <GoogleButton
                  onClick={handleGoogleLogin}
                  loading={providerLoading === OAUTH_PROVIDERS.GOOGLE}
                  disabled={loading || (anyProviderLoading && providerLoading !== OAUTH_PROVIDERS.GOOGLE)}
                />
                <FacebookButton
                  onClick={handleFacebookLogin}
                  loading={providerLoading === OAUTH_PROVIDERS.FACEBOOK}
                  disabled={loading || (anyProviderLoading && providerLoading !== OAUTH_PROVIDERS.FACEBOOK)}
                />
              </div>

              <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Don’t have an account?{' '}
                <Link
                  to={ROUTES.register}
                  className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Create one free
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        <AuthSideVisual
          title="Send better email. Grow faster."
          subtitle="Real-time analytics, automation workflows, and a builder your team will actually love — all in one platform."
        />
      </div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
