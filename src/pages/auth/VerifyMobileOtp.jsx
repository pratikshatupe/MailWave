import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, ShieldCheck, RefreshCcw, Pencil } from 'lucide-react';

import Logo from '../../components/common/Logo.jsx';
import ThemeToggle from '../../components/common/ThemeToggle.jsx';
import AuthSideVisual from '../../components/auth/AuthSideVisual.jsx';
import Toast from '../../components/ui/Toast.jsx';

import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  loadSocialSession,
  clearSocialSession,
} from '../../utils/socialSession.js';
import {
  sendSocialOtp,
  verifySocialOtp,
  OTP_LENGTH,
  OTP_EXPIRY_MS,
  OTP_RESEND_COOLDOWN_MS,
  MOCK_OTP_CODE,
  clearOtpState,
} from '../../utils/otp.js';
import { MOCK_OAUTH_ENABLED } from '../../config/oauth.js';
import { getRoleDashboardRoute } from '../../config/roles.js';

const BOX_REFS = new Array(OTP_LENGTH);

export default function VerifyMobileOtp() {
  const navigate = useNavigate();
  const { finalizeSocialSignup } = useAuth();
  const [session, setSession] = useState(() => loadSocialSession());

  const [digits, setDigits] = useState(() => new Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [serverError, setServerError] = useState('');
  const [info, setInfo] = useState('');

  const [expiresAt, setExpiresAt] = useState(() => Date.now() + OTP_EXPIRY_MS);
  const [resendAt, setResendAt] = useState(() => Date.now() + OTP_RESEND_COOLDOWN_MS);
  const [now, setNow] = useState(() => Date.now());

  const inputsRef = useRef(BOX_REFS.slice());

  useEffect(() => {
    if (!session || !session.contactNumber) {
      navigate(ROUTES.socialComplete, { replace: true });
      return;
    }
    // Focus the first OTP box on entry. The container guarantees the ref is
    // populated by then.
    if (inputsRef.current[0]) inputsRef.current[0].focus();
  }, [session, navigate]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const secondsToExpiry = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const secondsToResend = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const expired = secondsToExpiry === 0;
  const canResend = secondsToResend === 0;

  const expiryLabel = useMemo(() => {
    const m = Math.floor(secondsToExpiry / 60);
    const s = secondsToExpiry % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [secondsToExpiry]);

  const fullCode = digits.join('');

  function clearAllErrors() {
    setServerError('');
    setInfo('');
  }

  function setDigit(i, value) {
    const v = value.replace(/\D/g, '').slice(0, 1);
    setDigits((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });
    if (v && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
    clearAllErrors();
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = new Array(OTP_LENGTH).fill('').map((_, i) => text[i] || '');
    setDigits(next);
    const lastIdx = Math.min(text.length, OTP_LENGTH) - 1;
    inputsRef.current[lastIdx]?.focus();
    clearAllErrors();
  }

  async function handleResend() {
    if (!session) return;
    if (!canResend) return;
    clearAllErrors();
    try {
      const res = await sendSocialOtp({
        sessionToken: session.sessionToken,
        contactNumber: session.contactNumber,
        countryCode: session.countryCode,
      });
      setDigits(new Array(OTP_LENGTH).fill(''));
      setExpiresAt(res?.expiresAt || Date.now() + OTP_EXPIRY_MS);
      setResendAt(res?.resendAvailableAt || Date.now() + OTP_RESEND_COOLDOWN_MS);
      setInfo(`A new OTP has been sent to ${session.countryCode}${session.contactNumber}.`);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setServerError(err?.message || 'Could not resend OTP. Please try again.');
    }
  }

  function handleChangeNumber() {
    clearOtpState();
    navigate(ROUTES.socialComplete, { replace: true });
  }

  async function handleVerify(e) {
    e?.preventDefault?.();
    if (!session) return;
    clearAllErrors();
    if (fullCode.length !== OTP_LENGTH) {
      setServerError(`OTP must be ${OTP_LENGTH} digits.`);
      return;
    }
    if (expired) {
      setServerError('OTP has expired. Please request a new OTP.');
      return;
    }
    setVerifying(true);
    try {
      const res = await verifySocialOtp({
        sessionToken: session.sessionToken,
        code: fullCode,
      });
      // Real backend returns { token, refreshToken, user }; mock returns
      // { verified: true } and the frontend mints a local mock JWT.
      const next = finalizeSocialSignup({
        provider: session.provider,
        accountType: session.accountType,
        profile: session,
        token: res?.token,
        refreshToken: res?.refreshToken,
        user: res?.user,
      });
      const route = getRoleDashboardRoute(next.role);
      clearSocialSession();
      clearOtpState();
      navigate(route, { replace: true });
    } catch (err) {
      if (err?.code === 'OTP_EXPIRED') {
        setServerError('OTP has expired. Please request a new OTP.');
      } else if (err?.code === 'OTP_INVALID') {
        const left = err.attemptsLeft;
        if (typeof left === 'number') {
          setServerError(`Invalid OTP. ${left} attempt${left === 1 ? '' : 's'} left.`);
        } else {
          setServerError('Invalid OTP.');
        }
      } else if (err?.code === 'OTP_LOCKED') {
        setServerError('Too many attempts. Please request a new OTP.');
      } else {
        setServerError(err?.message || 'Could not verify OTP. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  }

  if (!session) return null;

  const maskedNumber = `${session.countryCode || '+91'}${session.contactNumber || ''}`;

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
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                <ShieldCheck className="h-3.5 w-3.5" /> {LABELS.contactNumber} OTP
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Verify Contact Number
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Enter the OTP sent to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{maskedNumber}</span>.
            </p>

            {MOCK_OAUTH_ENABLED && (
              <Toast
                type="info"
                message={`Demo mode is on. Use OTP ${MOCK_OTP_CODE} to verify.`}
                className="mt-5"
              />
            )}
            {info && <Toast type="info" message={info} className="mt-5" />}
            {serverError && (
              <Toast type="error" message={serverError} className="mt-5" />
            )}

            <form onSubmit={handleVerify} className="mt-6 space-y-5" noValidate>
              <div
                className="flex items-center justify-between gap-2"
                onPaste={handlePaste}
              >
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    aria-label={`OTP digit ${i + 1}`}
                    className={`h-14 w-12 rounded-xl border bg-white text-center text-xl font-bold text-slate-900 shadow-sm transition focus:outline-none focus:ring-4 dark:bg-slate-900 dark:text-white ${
                      serverError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/50 dark:focus:border-rose-400 dark:focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20'
                    } ${expired ? 'opacity-60' : ''}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${expired ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {expired ? 'OTP expired.' : `Expires in ${expiryLabel}`}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend}
                  className="inline-flex cursor-pointer items-center gap-1 font-semibold text-indigo-600 transition hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {canResend ? 'Resend OTP' : `Resend in ${secondsToResend}s`}
                </button>
              </div>

              <button
                type="submit"
                disabled={verifying || fullCode.length !== OTP_LENGTH}
                className="btn-primary w-full cursor-pointer"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    Verify OTP <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Change {LABELS.contactNumber}
                </button>
                <Link
                  to={ROUTES.login}
                  className="cursor-pointer font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Cancel.
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        <AuthSideVisual
          title="Almost there."
          subtitle="Verifying your Contact Number keeps your account secure and helps your team reach you for critical alerts."
        />
      </div>
    </div>
  );
}
