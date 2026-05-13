import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, Building2, Sparkles, BadgeCheck } from 'lucide-react';

import InputField from '../ui/InputField.jsx';
import PasswordField from '../ui/PasswordField.jsx';
import Toast from '../ui/Toast.jsx';
import GoogleButton from './GoogleButton.jsx';
import FacebookButton from './FacebookButton.jsx';
import TermsModal from './terms-modal.jsx';

import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';
import { OAUTH_PROVIDERS } from '../../config/oauth.js';
import { getPlanById } from '../../config/plans.js';

/**
 * Step 3 of the register flow — captures Full Name / Email ID / Password /
 * Confirm Password / Contact Number / Terms checkbox. The Terms link in the
 * checkbox opens the central TermsModal; the modal's `I Agree` button ticks
 * the checkbox automatically.
 */
export default function RegisterDetailsStep({
  accountType,
  selectedPlanId,
  form,
  errors,
  update,
  onBlur,
  pwScore,
  meta,
  loading,
  serverError,
  onSubmit,
  onBack,
  providerLoading,
  providerError,
  onGoogleSignup,
  onFacebookSignup,
}) {
  const blur = (name) => (e) => onBlur?.(name, e.target.value);
  const isOrg = accountType === 'organisation' || accountType === 'organization';
  const anyProviderLoading = Boolean(providerLoading);
  const [termsOpen, setTermsOpen] = useState(false);
  const plan = getPlanById(selectedPlanId);

  function openTerms(e) {
    if (e?.preventDefault) e.preventDefault();
    setTermsOpen(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Tell us about you
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {isOrg
          ? 'A few details to set up your organisation workspace.'
          : 'A few details to set up your personal workspace.'}
      </p>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/60">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
          <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
          {isOrg ? LABELS.organisation : 'Individual'}
        </span>
        {plan && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            {plan.name}
          </span>
        )}
      </div>

      {serverError && <Toast type="error" message={serverError} className="-mb-2" />}

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          field="fullName"
          value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          onBlur={blur('fullName')}
          error={errors.fullName}
          autoComplete="name"
        />
        {isOrg && (
          <InputField
            name="organisationName"
            label={LABELS.organisation}
            placeholder={`Enter ${LABELS.organisation}`}
            type="text"
            required
            icon={Building2}
            value={form.organisationName}
            onChange={(e) => update('organisationName', e.target.value)}
            onBlur={blur('organisationName')}
            trimOnBlur
            error={errors.organisationName}
            autoComplete="organization"
          />
        )}
      </div>

      <InputField
        field="emailId"
        value={form.emailId}
        onChange={(e) => update('emailId', e.target.value)}
        onBlur={blur('emailId')}
        error={errors.emailId}
        autoComplete="email"
      />

      <div>
        <PasswordField
          field="password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          onBlur={blur('password')}
          error={errors.password}
          autoComplete="new-password"
        />
        {form.password && (
          <div className="mt-2">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-full ${meta.color} ${meta.width} transition-all`} />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Strength: <span className="text-slate-900 dark:text-white">{meta.label}</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400">8+ chars, Aa, 0-9, !@#</span>
            </div>
          </div>
        )}
      </div>

      <PasswordField
        field="confirmPassword"
        value={form.confirmPassword}
        onChange={(e) => update('confirmPassword', e.target.value)}
        onBlur={blur('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <InputField
        field="contactNumber"
        label={`${LABELS.contactNumber} (Optional)`}
        required={false}
        value={form.contactNumber}
        onChange={(e) => update('contactNumber', e.target.value)}
        onBlur={blur('contactNumber')}
        error={errors.contactNumber}
        autoComplete="tel"
      />

      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => update('terms', e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
          />
          <span>
            I agree to the{' '}
            <button
              type="button"
              onClick={openTerms}
              className="cursor-pointer font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={openTerms}
              className="cursor-pointer font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
            >
              Privacy Policy
            </button>
            .
          </span>
        </label>
        {errors.terms && <Toast type="error" message={errors.terms} className="mt-2" />}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="btn-ghost cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 cursor-pointer">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            <>
              {LABELS.create} account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

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

      {providerError && <Toast type="error" message={providerError} className="-mt-1" />}

      <div className="grid gap-2 sm:grid-cols-2">
        <GoogleButton
          onClick={onGoogleSignup}
          loading={providerLoading === OAUTH_PROVIDERS.GOOGLE}
          disabled={loading || (anyProviderLoading && providerLoading !== OAUTH_PROVIDERS.GOOGLE)}
        >
          {LABELS.signUp} with Google
        </GoogleButton>
        <FacebookButton
          onClick={onFacebookSignup}
          loading={providerLoading === OAUTH_PROVIDERS.FACEBOOK}
          disabled={loading || (anyProviderLoading && providerLoading !== OAUTH_PROVIDERS.FACEBOOK)}
        >
          {LABELS.signUp} with Facebook
        </FacebookButton>
      </div>

      <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to={ROUTES.login}
          className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {LABELS.signIn}
        </Link>
      </p>

      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAgree={() => update('terms', true)}
      />
    </form>
  );
}
