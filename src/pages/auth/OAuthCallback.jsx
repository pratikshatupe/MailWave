import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

import Logo from '../../components/common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../config/routes.js';
import { LABELS } from '../../config/labels.js';
import { OAUTH_PROVIDERS, PROVIDER_LABELS, MOCK_OAUTH_ENABLED } from '../../config/oauth.js';
import { readCallbackParams } from '../../utils/oauth.js';
import { loadSocialSession } from '../../utils/socialSession.js';
import { getRoleDashboardRoute } from '../../config/roles.js';

/**
 * OAuth landing page. The backend redirects here after the provider
 * handshake, e.g.:
 *
 *   /auth/google/callback?code=...&state=...
 *   /auth/facebook/callback?code=...&state=...
 *
 * or, when the backend already produced an app JWT:
 *
 *   /auth/oauth-callback?provider=google&token=...
 *
 * When mock OAuth is enabled the social button drops us here with ?mock=1
 * and a pre-populated temporary social session — we just need to forward
 * the user to /auth/social-complete.
 *
 * Cancellation is surfaced as ?error=access_denied (or provider-specific).
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { completeOAuthLogin } = useAuth();
  const ranRef = useRef(false);
  const [status, setStatus] = useState('working'); // 'working' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const callback = readCallbackParams();
    const provider =
      params.provider ||
      callback.provider ||
      (location.pathname.includes('/facebook') ? OAUTH_PROVIDERS.FACEBOOK : OAUTH_PROVIDERS.GOOGLE);
    const label = PROVIDER_LABELS[provider] || 'Provider';

    function bail(message) {
      setStatus('error');
      setErrorMessage(message);
      setTimeout(() => {
        navigate(ROUTES.login, { replace: true, state: { oauthError: message } });
      }, 1200);
    }

    if (callback.error) {
      const cancelled =
        callback.error === 'access_denied' ||
        /cancel/i.test(callback.error) ||
        /cancel/i.test(callback.errorDescription);
      bail(
        cancelled
          ? `${label} ${LABELS.logIn} was cancelled.`
          : callback.errorDescription
          ? `${label} ${LABELS.logIn} failed: ${callback.errorDescription}.`
          : `${label} ${LABELS.logIn} failed. Please try again.`
      );
      return;
    }

    // Mock path — startOAuthLogin already stashed a temp social session.
    // We never have a code/token here, so just forward to completion.
    const isMock = new URLSearchParams(location.search).get('mock') === '1';
    if (isMock || MOCK_OAUTH_ENABLED) {
      const session = loadSocialSession();
      if (!session) {
        bail(`${label} ${LABELS.logIn} session was lost. Please try again.`);
        return;
      }
      navigate(ROUTES.socialComplete, { replace: true });
      return;
    }

    if (!callback.code && !callback.token) {
      bail(`${label} ${LABELS.logIn} failed. Please try again.`);
      return;
    }

    completeOAuthLogin({
      provider,
      code: callback.code,
      state: callback.state,
      token: callback.token,
    })
      .then((result) => {
        if (result?.status === 'needs_profile') {
          // New social user (or missing Contact Number) — funnel through the
          // completion + OTP flow before issuing the app session.
          navigate(ROUTES.socialComplete, { replace: true });
          return;
        }
        // Existing verified user — the backend already issued the app JWT.
        // Land them on their role-specific dashboard.
        const route = result?.user?.role ? getRoleDashboardRoute(result.user.role) : ROUTES.dashboard;
        navigate(route, { replace: true });
      })
      .catch((err) => {
        bail(err?.message || `${label} ${LABELS.logIn} failed. Please try again.`);
      });
    // The effect should only run once on mount — the auth code in the URL
    // is single-use and re-running would trigger duplicate backend calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 px-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {status === 'working' && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-500" aria-hidden />
            <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Finishing sign in…
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Verifying your account with the provider. This should only take a moment.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" aria-hidden />
            <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Sign in could not be completed.
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {errorMessage} Redirecting you back to the {LABELS.logIn} page…
            </p>
          </>
        )}
      </div>
    </div>
  );
}
