import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import Input from '../components/common/Input.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import GoogleButton from '../components/auth/GoogleButton.jsx';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal.jsx';
import AuthSideVisual from '../components/auth/AuthSideVisual.jsx';

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    if (serverError) setServerError('');
  }

  function validate() {
    const next = {};
    if (!form.email) next.email = 'Email is required';
    else if (!validateEmail(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    // TODO: backend integration — POST /api/auth/login { email, password, remember }
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 700);
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Global theme toggle on auth pages */}
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
              Welcome back 👋
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Login to your Mailwave dashboard to manage campaigns and automations.
            </p>

            {serverError && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {success && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Login successful — redirecting to your dashboard…</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              <Input
                name="email"
                type="email"
                label="Work email"
                placeholder="you@company.com"
                autoComplete="email"
                icon={Mail}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={errors.email}
              />
              <Input
                name="password"
                type={showPw ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                autoComplete="current-password"
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
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => update('remember', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="btn-primary w-full"
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
                    Sign in <ArrowRight className="h-4 w-4" />
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

              <GoogleButton onClick={() => {}}>Continue with Google</GoogleButton>

              <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Don’t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Create one free
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Right: visual */}
        <AuthSideVisual
          title="Send better email. Grow faster."
          subtitle="Real-time analytics, automation workflows, and a builder your team will actually love — all in one platform."
        />
      </div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
