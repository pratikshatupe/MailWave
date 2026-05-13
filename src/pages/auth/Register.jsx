import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import Logo from '../../components/common/Logo.jsx';
import ThemeToggle from '../../components/common/ThemeToggle.jsx';
import AuthSideVisual from '../../components/auth/AuthSideVisual.jsx';

import AccountTypeStep from '../../components/auth/account-type-step.jsx';
import PlanSelectionStep from '../../components/auth/plan-selection-step.jsx';
import RegisterDetailsStep from '../../components/auth/register-details-step.jsx';
import RegisterSuccess from './register-success.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';
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
import { registerUser, isEmailAlreadyRegistered } from '../../services/local-auth-service.js';
import { ERROR_MESSAGES } from '../../config/messages.js';

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
    organisationName: '',
    emailId: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pwScore = useMemo(() => scorePassword(form.password), [form.password]);
  const meta = strengthMeta[Math.max(0, pwScore - 1)] || strengthMeta[0];

  const isOrg = accountType === 'organisation' || accountType === 'organization';

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    if (serverError) setServerError('');
  }

  function validateField(name, value) {
    switch (name) {
      case 'fullName':
        return validateFullName(value);
      case 'organisationName':
        return isOrg ? validateRequired(value, LABELS.organisation) : '';
      case 'emailId': {
        const err = validateEmailId(value);
        if (err) return err;
        if (isEmailAlreadyRegistered(value)) return ERROR_MESSAGES.emailAlreadyRegistered;
        return '';
      }
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(form.password, value);
      case 'contactNumber':
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
      'organisationName',
      'emailId',
      'password',
      'confirmPassword',
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
    setServerError('');
    if (!validateDetails()) return;
    setLoading(true);
    try {
      // Local frontend simulation — small artificial delay so the spinner is
      // visible. Backend is intentionally not called.
      await new Promise((r) => setTimeout(r, 400));
      registerUser({
        fullName: form.fullName.trim(),
        emailId: form.emailId.trim(),
        password: form.password,
        contactNumber: form.contactNumber,
        accountType: isOrg ? 'organisation' : 'individual',
        organisationName: form.organisationName,
        selectedPlan: planId,
      });
      setDone(true);
    } catch (err) {
      if (err?.code === 'EMAIL_EXISTS') {
        setErrors((prev) => ({ ...prev, emailId: ERROR_MESSAGES.emailAlreadyRegistered }));
      } else {
        setServerError(err?.message || ERROR_MESSAGES.generic);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runProviderSignup(provider) {
    if (providerLoading) return;
    if (!accountType) {
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
    } catch (err) {
      setProviderLoading(null);
      const label = PROVIDER_LABELS[provider] || 'Provider';
      setProviderError(err?.message || `${label} Sign Up is not configured yet.`);
    }
  }

  const handleGoogleSignup = () => runProviderSignup(OAUTH_PROVIDERS.GOOGLE);
  const handleFacebookSignup = () => runProviderSignup(OAUTH_PROVIDERS.FACEBOOK);

  if (done) return <RegisterSuccess emailId={form.emailId} />;

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
              <AccountTypeStep
                value={accountType === 'organization' ? 'organisation' : accountType}
                onChange={(v) => {
                  setAccountType(v);
                  if (providerError) setProviderError('');
                }}
                onContinue={() => accountType && setStep(2)}
                providerError={providerError}
              />
            )}

            {step === 2 && (
              <PlanSelectionStep
                accountType={accountType}
                value={planId}
                onChange={setPlanId}
                onBack={() => setStep(1)}
                onContinue={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <RegisterDetailsStep
                accountType={accountType}
                selectedPlanId={planId}
                form={form}
                errors={errors}
                update={update}
                onBlur={handleBlur}
                pwScore={pwScore}
                meta={meta}
                loading={loading}
                serverError={serverError}
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
