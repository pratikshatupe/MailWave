import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Briefcase,
  ChevronDown,
  Loader2,
  CheckCircle2,
  ArrowRight,
  MailCheck,
} from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import Input from '../components/common/Input.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import GoogleButton from '../components/auth/GoogleButton.jsx';
import AuthSideVisual from '../components/auth/AuthSideVisual.jsx';

const roles = ['Business Admin', 'Marketing Manager', 'Viewer Analyst'];

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

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

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    business: '',
    email: '',
    password: '',
    confirm: '',
    role: '',
    phone: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pwScore = useMemo(() => scorePassword(form.password), [form.password]);
  const meta = strengthMeta[Math.max(0, pwScore - 1)] || strengthMeta[0];

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.business.trim()) next.business = 'Business name is required';
    if (!form.email) next.email = 'Work email is required';
    else if (!validateEmail(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    else if (pwScore < 5)
      next.password =
        'Use at least 8 chars with uppercase, lowercase, number & special character';
    if (!form.confirm) next.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) next.confirm = 'Passwords do not match';
    if (!form.role) next.role = 'Please choose a role';
    if (!form.terms) next.terms = 'You must accept the terms to continue';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // TODO: backend integration — POST /api/auth/register
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    setDone(true);
  }

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
              Account created successfully
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Please verify your email to activate your account. We’ve sent a
              verification link to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {form.email}
              </span>
              .
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Next steps
              </div>
              <ol className="mt-2 ml-1 space-y-1.5 list-decimal pl-4">
                <li>Open the email from Mailwave.</li>
                <li>Click the “Verify email” button to activate your account.</li>
                <li>Sign in to set up your first campaign.</li>
              </ol>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/login" className="btn-primary">
                Go to login <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/" className="btn-ghost">
                Back to homepage
              </Link>
            </div>

            <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
              Didn’t receive the email? Check spam, or{' '}
              <button className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                resend verification
              </button>
              .
            </p>
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
        {/* Left: form */}
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
                to="/"
                className="text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← Back home
              </Link>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create your free account
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Start automating your email marketing in minutes. No credit card
              required.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="fullName"
                  label="Full name"
                  placeholder="Jane Cooper"
                  icon={User}
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  name="business"
                  label="Business name"
                  placeholder="Acme Inc."
                  icon={Building2}
                  value={form.business}
                  onChange={(e) => update('business', e.target.value)}
                  error={errors.business}
                />
              </div>

              <Input
                name="email"
                type="email"
                label="Work email"
                placeholder="jane@acme.com"
                icon={Mail}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={errors.email}
              />

              <div>
                <Input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  error={errors.password}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      aria-label="Toggle password visibility"
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
                {form.password && (
                  <div className="mt-2">
                    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full ${meta.color} ${meta.width} transition-all`}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Strength:{' '}
                        <span className="text-slate-900 dark:text-white">{meta.label}</span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Use 8+ chars, Aa, 0-9, !@#
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Input
                name="confirm"
                type={showPw2 ? 'text' : 'password'}
                label="Confirm password"
                placeholder="••••••••"
                icon={Lock}
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                error={errors.confirm}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPw2((v) => !v)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showPw2 ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Your role
                </label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <select
                    value={form.role}
                    onChange={(e) => update('role', e.target.value)}
                    className={`w-full appearance-none rounded-xl border bg-white px-10 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-4 dark:bg-slate-900 ${
                      errors.role
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 text-slate-800 dark:border-rose-500/50 dark:text-white dark:focus:border-rose-400 dark:focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-800 dark:border-slate-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20'
                    } ${!form.role ? 'text-slate-400 dark:text-slate-500' : ''}`}
                  >
                    <option value="" disabled>
                      Select your role…
                    </option>
                    {roles.map((r) => (
                      <option key={r} value={r} className="text-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                </div>
                {errors.role && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.role}
                  </p>
                )}
              </div>

              <Input
                name="phone"
                type="tel"
                label="Phone (optional)"
                placeholder="+1 555 123 4567"
                icon={Phone}
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />

              <div>
                <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => update('terms', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span>
                    I agree to the{' '}
                    <a
                      href="#"
                      className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.terms}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                  </>
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
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

              <GoogleButton>Sign up with Google</GoogleButton>

              <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Right: visual */}
        <AuthSideVisual
          title="Built for marketers. Loved by engineers."
          subtitle="Bring your team, your data, and your favorite email provider — Mailwave wires the rest."
        />
      </div>
    </div>
  );
}
