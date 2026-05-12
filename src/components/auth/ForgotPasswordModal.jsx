import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Mail,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  RefreshCcw,
  Loader2,
} from 'lucide-react';

import InputField from '../ui/InputField.jsx';
import PasswordField from '../ui/PasswordField.jsx';

import { LABELS } from '../../config/labels.js';
import {
  validateEmailId,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validators.js';
import { SUCCESS_MESSAGES } from '../../config/messages.js';

const steps = [
  { id: 1, label: 'Email', Icon: Mail },
  { id: 2, label: 'Verify OTP', Icon: ShieldCheck },
  { id: 3, label: 'New password', Icon: KeyRound },
];

export default function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpErr, setOtpErr] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pw2Err, setPw2Err] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [done, setDone] = useState(false);
  const [resendIn, setResendIn] = useState(30);
  const otpRefs = useRef([]);

  // Reset state each time the modal opens so reopening clears previous
  // errors — required by the form standards.
  useEffect(() => {
    if (open) {
      setStep(1);
      setEmail('');
      setEmailErr('');
      setOtp(['', '', '', '', '', '']);
      setOtpErr('');
      setPw('');
      setPw2('');
      setPwErr('');
      setPw2Err('');
      setLoading(false);
      setNotice('');
      setDone(false);
      setResendIn(30);
    }
  }, [open]);

  useEffect(() => {
    if (step !== 2) return;
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step, resendIn]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const otpValue = useMemo(() => otp.join(''), [otp]);

  function setOtpDigit(i, v) {
    const ch = v.replace(/\D/g, '').slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[i] = ch;
      return next;
    });
    if (ch && i < 5) otpRefs.current[i + 1]?.focus();
    if (otpErr) setOtpErr('');
  }

  function onOtpKeyDown(e, i) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function onOtpPaste(e) {
    const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!txt) return;
    e.preventDefault();
    const arr = ['', '', '', '', '', ''];
    txt.split('').forEach((c, i) => (arr[i] = c));
    setOtp(arr);
    otpRefs.current[Math.min(txt.length, 5)]?.focus();
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setNotice('');
    const err = validateEmailId(email);
    if (err) {
      setEmailErr(err);
      return;
    }
    setEmailErr('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setNotice(SUCCESS_MESSAGES.emailSent);
    setResendIn(30);
    setStep(2);
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setNotice('');
    if (otpValue.length !== 6) {
      setOtpErr('OTP must be 6 digits.');
      return;
    }
    setOtpErr('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setNotice('Email verified successfully.');
    setStep(3);
  }

  async function handleResend() {
    if (resendIn > 0) return;
    setNotice('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setResendIn(30);
    setNotice('A new OTP was sent to your Email ID.');
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setNotice('');
    const newErr = validatePassword(pw, LABELS.newPassword);
    const confirmErr = validateConfirmPassword(pw, pw2);
    setPwErr(newErr);
    setPw2Err(confirmErr);
    if (newErr || confirmErr) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setDone(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-md dark:bg-black/70 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/60 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900 sm:p-8"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-glow">
                {done ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : step === 1 ? (
                  <Mail className="h-6 w-6" />
                ) : step === 2 ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <KeyRound className="h-6 w-6" />
                )}
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
                {done
                  ? 'All done.'
                  : step === 1
                  ? 'Reset your password.'
                  : step === 2
                  ? 'Verify your Email ID.'
                  : 'Choose a new password.'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                {done
                  ? `${SUCCESS_MESSAGES.passwordReset} Please log in with your new password.`
                  : step === 1
                  ? `Enter your ${LABELS.emailId} and we’ll send you a 6-digit OTP.`
                  : step === 2
                  ? `We sent a code to ${email || `your ${LABELS.emailId}`}. Enter it below.`
                  : 'Make sure it’s strong and at least 8 characters long.'}
              </p>
            </div>

            {!done && (
              <div className="mt-6 flex items-center justify-between gap-1.5 sm:gap-2">
                {steps.map((s, i) => {
                  const isActive = step === s.id;
                  const isDone = step > s.id;
                  return (
                    <div
                      key={s.id}
                      className="flex flex-1 items-center gap-1.5 sm:gap-2"
                    >
                      <div
                        className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-xs font-bold transition sm:h-8 sm:w-8 ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-glow'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : s.id}
                      </div>
                      <div
                        className={`hidden truncate text-[11px] font-semibold uppercase tracking-wider sm:block ${
                          isActive
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {s.label}
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className={`mx-0.5 h-0.5 flex-1 rounded-full sm:mx-1 ${
                            isDone
                              ? 'bg-emerald-400'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {notice && !done && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                {notice}
              </div>
            )}

            {/* Step content */}
            <div className="mt-5">
              {done ? (
                <button
                  onClick={onClose}
                  className="btn-primary w-full"
                  type="button"
                >
                  Back to {LABELS.logIn}
                </button>
              ) : step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                  <InputField
                    field="emailId"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailErr) setEmailErr('');
                    }}
                    onBlur={(e) => setEmailErr(validateEmailId(e.target.value))}
                    error={emailErr}
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP…
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </form>
              ) : step === 2 ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Enter 6-digit OTP<span className="text-rose-600 dark:text-rose-400">*</span>
                    </label>
                    <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={onOtpPaste}>
                      {otp.map((d, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={(e) => setOtpDigit(i, e.target.value)}
                          onKeyDown={(e) => onOtpKeyDown(e, i)}
                          className={`h-11 w-full min-w-0 flex-1 rounded-xl border bg-white text-center text-base font-bold text-slate-900 transition focus:outline-none focus:ring-4 dark:bg-slate-900 dark:text-white sm:h-12 sm:w-11 sm:flex-none sm:text-lg ${
                            otpErr
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/50 dark:focus:border-rose-400 dark:focus:ring-rose-500/20'
                              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20'
                          }`}
                        />
                      ))}
                    </div>
                    {otpErr && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        {otpErr}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendIn > 0 || loading}
                      className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 dark:text-indigo-400 dark:hover:text-indigo-300 dark:disabled:text-slate-500"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      ← Change {LABELS.emailId}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
                  <PasswordField
                    field="newPassword"
                    value={pw}
                    onChange={(e) => {
                      setPw(e.target.value);
                      if (pwErr) setPwErr('');
                    }}
                    onBlur={(e) => setPwErr(validatePassword(e.target.value, LABELS.newPassword))}
                    error={pwErr}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    field="confirmPassword"
                    value={pw2}
                    onChange={(e) => {
                      setPw2(e.target.value);
                      if (pw2Err) setPw2Err('');
                    }}
                    onBlur={(e) => setPw2Err(validateConfirmPassword(pw, e.target.value))}
                    error={pw2Err}
                    autoComplete="new-password"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                      </>
                    ) : (
                      `Update ${LABELS.password}`
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
