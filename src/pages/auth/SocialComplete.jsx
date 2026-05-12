import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  Mail,
  User as UserIcon,
  Phone,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

import Logo from '../../components/common/Logo.jsx';
import ThemeToggle from '../../components/common/ThemeToggle.jsx';
import AuthSideVisual from '../../components/auth/AuthSideVisual.jsx';
import InputField from '../../components/ui/InputField.jsx';
import Toast from '../../components/ui/Toast.jsx';

import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';
import { PROVIDER_LABELS } from '../../config/oauth.js';
import {
  validateFirstName,
  validateLastName,
  validateContactNumber,
  validateTerms,
} from '../../utils/validators.js';
import {
  loadSocialSession,
  patchSocialSession,
} from '../../utils/socialSession.js';
import { sendSocialOtp, completeSocialProfile } from '../../utils/otp.js';

/**
 * Country codes shown in the dropdown. Indian numbers are validated with
 * REGEX.contactNumberIndia; for any other dial code we accept the broader
 * international format (handled inside validateContactNumber).
 */
const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'United States / Canada (+1)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+971', label: 'United Arab Emirates (+971)' },
  { code: '+65', label: 'Singapore (+65)' },
];

function initialsFromProfile(profile) {
  const first = (profile?.firstName || '').trim();
  const last = (profile?.lastName || '').trim();
  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U';
  }
  const email = (profile?.emailId || '').trim();
  if (!email) return 'U';
  return email.charAt(0).toUpperCase();
}

export default function SocialComplete() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => loadSocialSession());

  const [form, setForm] = useState(() => {
    const s = loadSocialSession();
    return {
      firstName: s?.firstName || '',
      lastName: s?.lastName || '',
      countryCode: s?.countryCode || '+91',
      contactNumber: s?.contactNumber || '',
      terms: false,
    };
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate(ROUTES.login, {
        replace: true,
        state: { oauthError: 'Your social session has expired. Please start again.' },
      });
    }
  }, [session, navigate]);

  const providerLabel = useMemo(
    () => (session ? PROVIDER_LABELS[session.provider] || 'Provider' : 'Provider'),
    [session]
  );

  const greetingName = useMemo(() => {
    if (!session) return '';
    const first = (session.firstName || '').trim();
    if (first) return first;
    if (session.emailId) return session.emailId.split('@')[0];
    return 'there';
  }, [session]);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    if (serverError) setServerError('');
  }

  function validateField(name, value) {
    switch (name) {
      case 'firstName':
        return validateFirstName(value);
      case 'lastName':
        return validateLastName(value);
      case 'contactNumber':
        return validateContactNumber(value, form.countryCode);
      case 'terms':
        return validateTerms(value);
      default:
        return '';
    }
  }

  function handleBlur(name, value) {
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  function validate() {
    const next = {};
    ['firstName', 'lastName', 'contactNumber', 'terms'].forEach((name) => {
      const err = validateField(name, form[name]);
      if (err) next[name] = err;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session) return;
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      // Persist the user's edits back into the temp session so the OTP
      // page can show the same values and the backend can pick them up
      // when it eventually creates the permanent user.
      const updated = patchSocialSession({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        countryCode: form.countryCode,
        contactNumber: form.contactNumber.trim(),
        termsAccepted: true,
      });
      setSession(updated);

      // Echo the profile to the backend (real mode). Mock mode is a no-op
      // that just confirms the payload shape.
      await completeSocialProfile({
        sessionToken: updated.sessionToken,
        firstName: updated.firstName,
        lastName: updated.lastName,
        emailId: updated.emailId,
        countryCode: updated.countryCode,
        contactNumber: updated.contactNumber,
        accountType: updated.accountType || null,
        termsAccepted: true,
      });

      await sendSocialOtp({
        sessionToken: updated.sessionToken,
        contactNumber: updated.contactNumber,
        countryCode: updated.countryCode,
      });

      navigate(ROUTES.verifyMobileOtp, { replace: true });
    } catch (err) {
      setServerError(err?.message || 'We could not start verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) return null;

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
                <ShieldCheck className="h-3.5 w-3.5" /> {providerLabel} Verified
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              {session.avatar ? (
                <img
                  src={session.avatar}
                  alt=""
                  className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-glow ring-2 ring-indigo-200 dark:ring-indigo-500/30"
                />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 text-xl font-extrabold text-white shadow-glow">
                  {initialsFromProfile(session)}
                </span>
              )}
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Welcome, {greetingName}.
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                A new Mailwave account will be created for the {LABELS.emailId}{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{session.emailId}</span>.
              </p>
            </div>

            {serverError && (
              <Toast type="error" message={serverError} className="mt-5" />
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  field="firstName"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  onBlur={(e) => handleBlur('firstName', e.target.value)}
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                <InputField
                  field="lastName"
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  onBlur={(e) => handleBlur('lastName', e.target.value)}
                  error={errors.lastName}
                  autoComplete="family-name"
                />
              </div>

              <InputField
                field="emailId"
                label={LABELS.emailId}
                icon={Mail}
                value={session.emailId}
                onChange={() => {}}
                readOnly
                required={false}
                autoComplete="email"
                className="opacity-90"
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {LABELS.contactNumber}
                  <span className="required-marker text-rose-600 dark:text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative w-32">
                    <select
                      value={form.countryCode}
                      onChange={(e) => update('countryCode', e.target.value)}
                      aria-label="Country code"
                      className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-8 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code} className="text-slate-900">
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <InputField
                      name="contactNumber"
                      label=""
                      type="tel"
                      icon={Phone}
                      required
                      placeholder={`Enter ${LABELS.contactNumber}`}
                      inputMode="numeric"
                      allowOnly="digits"
                      maxLength={form.countryCode === '+91' ? 10 : 15}
                      value={form.contactNumber}
                      onChange={(e) => update('contactNumber', e.target.value)}
                      onBlur={(e) => handleBlur('contactNumber', e.target.value)}
                      error={errors.contactNumber}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => update('terms', e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span>
                    I accept the{' '}
                    <a href="#" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                      Terms
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.terms}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP…
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  to={ROUTES.login}
                  className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {LABELS.logIn}.
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        <AuthSideVisual
          title="One last step before you launch."
          subtitle="Verify your Contact Number and we’ll set up your Mailwave workspace — automations, analytics, and templates ready to go."
        />
      </div>
    </div>
  );
}
