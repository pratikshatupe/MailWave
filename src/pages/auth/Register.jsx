import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Briefcase,
  ChevronDown,
  Loader2,
  CheckCircle2,
  ArrowRight,
  MailCheck,
  Sparkles,
  Check,
  ArrowLeft,
} from 'lucide-react';

import Logo from '../../components/common/Logo.jsx';
import ThemeToggle from '../../components/common/ThemeToggle.jsx';
import GoogleButton from '../../components/auth/GoogleButton.jsx';
import FacebookButton from '../../components/auth/FacebookButton.jsx';
import AuthSideVisual from '../../components/auth/AuthSideVisual.jsx';

import InputField from '../../components/ui/InputField.jsx';
import PasswordField from '../../components/ui/PasswordField.jsx';
import Toast from '../../components/ui/Toast.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';
import { ROLE_CONFIG, ROLES } from '../../config/roles.js';
import { OAUTH_PROVIDERS, PROVIDER_LABELS } from '../../config/oauth.js';
import {
  validateEmailId,
  validateFullName,
  validatePassword,
  validateConfirmPassword,
  validateContactNumber,
  validateRequired,
  validateTerms,
} from '../../utils/validators.js';
import {
  required as requiredMsg,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '../../config/messages.js';

const ORG_ROLE_OPTIONS = [
  ROLES.BUSINESS_ADMIN,
  ROLES.MARKETING_MANAGER,
  ROLES.VIEWER,
].map((key) => ({ value: key, label: ROLE_CONFIG[key].displayName }));

const plans = [
  {
    id: 'trial',
    name: '7-day Free Trial',
    price: 'Free',
    cadence: '7 days',
    blurb: 'No card. Cancel anytime.',
    features: ['1,000 emails', '500 contacts', '2 automations'],
    tone: 'from-slate-500 to-slate-700',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '₹1,499',
    cadence: '/ Month',
    blurb: 'For solo founders & creators.',
    features: ['10k emails', '2,500 contacts', '5 automations'],
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₹6,999',
    cadence: '/ Month',
    blurb: 'For growing teams & brands.',
    features: ['500k emails', '75k contacts', 'Approval workflow'],
    tone: 'from-indigo-500 to-fuchsia-500',
    recommended: true,
  },
];

function scorePassword(v) {
  let s = 0;
  if (!v) return 0;
  if (v.length >= 8) s += 1;
  if (/[a-z]/.test(v)) s += 1;
  if (/[A-Z]/.test(v)) s += 1;
  if (/\d/.test(v)) s += 1;
  if (/[^A-Za-z0-9]/.test(v)) s += 1;
  return s;
}

const strengthMeta = [
  { label: 'Very weak', color: 'bg-rose-500', width: 'w-1/5' },
  { label: 'Weak', color: 'bg-orange-500', width: 'w-2/5' },
  { label: 'Fair', color: 'bg-amber-500', width: 'w-3/5' },
  { label: 'Good', color: 'bg-lime-500', width: 'w-4/5' },
  { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' },
];

export default function Register() {
  const navigate = useNavigate();
  const { startOAuthLogin } = useAuth();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState(null);
  const [planId, setPlanId] = useState('trial');
  const [providerLoading, setProviderLoading] = useState(null);
  const [providerError, setProviderError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    business: '',
    emailId: '',
    password: '',
    confirmPassword: '',
    role: '',
    contactNumber: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pwScore = useMemo(() => scorePassword(form.password), [form.password]);
  const meta = strengthMeta[Math.max(0, pwScore - 1)] || strengthMeta[0];

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }

  function validateField(name, value) {
    switch (name) {
      case 'fullName':
        return validateFullName(value);
      case 'business':
        return accountType === 'organization'
          ? validateRequired(value, LABELS.organisation)
          : '';
      case 'emailId':
        return validateEmailId(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(form.password, value);
      case 'role':
        return accountType === 'organization'
          ? validateRequired(value, 'Role')
          : '';
      case 'contactNumber':
        // Optional in Register; only validate if filled.
        if (!value) return '';
        return validateContactNumber(value, '+91');
      case 'terms':
        return validateTerms(value);
      default:
        return '';
    }
  }

  function handleBlur(name, value) {
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  function validateDetails() {
    const fields = [
      'fullName',
      'business',
      'emailId',
      'password',
      'confirmPassword',
      'role',
      'contactNumber',
      'terms',
    ];
    const next = {};
    fields.forEach((name) => {
      const err = validateField(name, form[name]);
      if (err) next[name] = err;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateDetails()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
  }

  async function runProviderSignup(provider) {
    if (providerLoading) return;
    if (!accountType) {
      // Force account type selection before social signup — the OTP step
      // needs to know which role / workspace to create.
      setStep(1);
      setProviderError('Please choose an account type before continuing with a social signup.');
      return;
    }
    setProviderLoading(provider);
    setProviderError('');
    try {
      const result = await startOAuthLogin(provider, { intent: 'signup', accountType });
      if (result?.mode === 'mock') {
        navigate(`${ROUTES.oauthCallback}?provider=${provider}&mock=1`, { replace: true });
        return;
      }
      // 'redirect' — the browser is on its way to the provider via the
      // backend. Spinner stays up until navigation.
    } catch (err) {
      setProviderLoading(null);
      const label = PROVIDER_LABELS[provider] || 'Provider';
      setProviderError(err?.message || `${label} Sign Up is not configured yet.`);
    }
  }

  const handleGoogleSignup = () => runProviderSignup(OAUTH_PROVIDERS.GOOGLE);
  const handleFacebookSignup = () => runProviderSignup(OAUTH_PROVIDERS.FACEBOOK);

  if (done) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute right-3 top-3 z-30 sm:right-6 sm:top-6">
          <ThemeToggle size="sm" />
        </div>
        <div className="container-x flex min-h-screen items-center justify-center py-16 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-card dark:border-slate-700 dark:bg-slate-900 sm:p-10"
          >
            <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-glow">
              <MailCheck className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              {SUCCESS_MESSAGES.loggedOut ? 'Account created successfully.' : 'Done.'}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Please verify your {LABELS.emailId} to activate your account. We’ve sent a
              verification link to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{form.emailId}</span>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to={ROUTES.login} className="btn-primary cursor-pointer">
                <CheckCircle2 className="h-4 w-4" /> {LABELS.logIn} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={ROUTES.landing} className="btn-ghost cursor-pointer">
                Back to homepage
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute right-3 top-3 z-30 sm:right-6 sm:top-6">
        <ThemeToggle size="sm" />
      </div>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center px-4 pb-8 pt-16 sm:p-10">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <Link
                to={ROUTES.landing}
                className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← Back home
              </Link>
            </div>

            <Stepper step={step} />

            {step === 1 && (
              <StepAccountType
                value={accountType}
                onChange={(v) => {
                  setAccountType(v);
                  if (providerError) setProviderError('');
                }}
                onContinue={() => accountType && setStep(2)}
                providerError={providerError}
              />
            )}

            {step === 2 && (
              <StepPlan
                value={planId}
                onChange={setPlanId}
                onBack={() => setStep(1)}
                onContinue={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <StepDetails
                accountType={accountType}
                form={form}
                errors={errors}
                update={update}
                onBlur={handleBlur}
                pwScore={pwScore}
                meta={meta}
                loading={loading}
                onSubmit={handleSubmit}
                onBack={() => setStep(2)}
                providerLoading={providerLoading}
                providerError={providerError}
                onGoogleSignup={handleGoogleSignup}
                onFacebookSignup={handleFacebookSignup}
              />
            )}
          </motion.div>
        </div>

        <AuthSideVisual
          title="Built for marketers. Loved by engineers."
          subtitle="Bring your team, your data, and your favourite email provider — Mailwave wires the rest."
        />
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const labels = ['Account type', 'Plan', 'Your details'];
  return (
    <div className="mb-6 flex items-center gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-xs font-bold ${
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                  ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </span>
            <span
              className={`hidden text-[11px] font-semibold sm:inline ${
                active
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {label}
            </span>
            {n < labels.length && (
              <span
                className={`h-px flex-1 ${
                  done ? 'bg-emerald-300 dark:bg-emerald-500/50' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepAccountType({ value, onChange, onContinue, providerError }) {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        How will you use Mailwave?
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Pick an account type. You can change this later from {LABELS.settings}.
      </p>

      {providerError && (
        <Toast type="error" message={providerError} className="mt-4" />
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <AccountTypeCard
          selected={value === 'individual'}
          onClick={() => onChange('individual')}
          icon={User}
          title="Individual"
          subtitle="Solo creator, freelancer or side project."
          tone="from-emerald-500 to-teal-500"
          perks={['Personal workspace', 'Starter pricing', 'Referrals']}
        />
        <AccountTypeCard
          selected={value === 'organization'}
          onClick={() => onChange('organization')}
          icon={Building2}
          title="Organisation"
          subtitle="Team, agency or business with multiple users."
          tone="from-indigo-500 to-fuchsia-500"
          perks={['Team & roles', 'Approval workflow', 'Audit logs']}
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!value}
        className="btn-primary mt-6 w-full cursor-pointer"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to={ROUTES.login}
          className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {LABELS.signIn}
        </Link>
      </p>
    </>
  );
}

function AccountTypeCard({ selected, onClick, icon: Icon, title, subtitle, tone, perks }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col items-start gap-3 rounded-2xl border p-5 text-left transition ${
        selected
          ? 'border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-200 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:ring-indigo-500/30'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
      }`}
    >
      <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-glow`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>
      </div>
      <ul className="mt-1 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <Check className="h-3 w-3 text-emerald-500" /> {p}
          </li>
        ))}
      </ul>
      {selected && (
        <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

function StepPlan({ value, onChange, onBack, onContinue }) {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Choose your plan
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Start with the 7-day free trial, or pick a paid plan now. No credit card required.
      </p>

      <div className="mt-6 space-y-3">
        {plans.map((p) => {
          const selected = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-200 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:ring-indigo-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br ${p.tone} text-white shadow-glow`}>
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</span>
                  {p.recommended && (
                    <span className="rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Recommended
                    </span>
                  )}
                  <span className="ml-auto text-sm font-bold text-slate-900 dark:text-white">
                    {p.price}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> {p.cadence}</span>
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{p.blurb}</div>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2">
        <button type="button" onClick={onBack} className="btn-ghost cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button type="button" onClick={onContinue} className="btn-primary flex-1 cursor-pointer">
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

function StepDetails({
  accountType,
  form,
  errors,
  update,
  onBlur,
  pwScore,
  meta,
  loading,
  onSubmit,
  onBack,
  providerLoading,
  providerError,
  onGoogleSignup,
  onFacebookSignup,
}) {
  const blur = (name) => (e) => onBlur?.(name, e.target.value);
  const isOrg = accountType === 'organization';
  const anyProviderLoading = Boolean(providerLoading);
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

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          field="fullName"
          value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          onBlur={blur('fullName')}
          error={errors.fullName}
        />
        {isOrg && (
          <InputField
            name="business"
            label={LABELS.organisation}
            placeholder={`Enter ${LABELS.organisation}`}
            type="text"
            required
            icon={Building2}
            value={form.business}
            onChange={(e) => update('business', e.target.value)}
            onBlur={blur('business')}
            trimOnBlur
            error={errors.business}
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

      {isOrg && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Your role<span className="text-rose-600 dark:text-rose-400">*</span>
          </label>
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              className={`w-full cursor-pointer appearance-none rounded-xl border bg-white px-10 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-4 dark:bg-slate-900 ${
                errors.role
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 text-slate-800 dark:border-rose-500/50 dark:text-white dark:focus:border-rose-400 dark:focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-800 dark:border-slate-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20'
              } ${!form.role ? 'text-slate-400 dark:text-slate-500' : ''}`}
            >
              <option value="" disabled>
                Select your role…
              </option>
              {ORG_ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value} className="text-slate-900">
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          </div>
          {errors.role && (
            <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.role}</p>
          )}
        </div>
      )}

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
            <a href="#" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.terms && (
          <Toast type="error" message={errors.terms} className="mt-2" />
        )}
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

      {providerError && (
        <Toast type="error" message={providerError} className="-mt-1" />
      )}

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
    </form>
  );
}
