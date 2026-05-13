import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ScrollText } from 'lucide-react';

/**
 * Mailwave Terms and Conditions modal.
 *
 * Used by the Register flow. Body scrolls inside the panel so the underlying
 * page never gets a janky double scrollbar. `I Agree` ticks the calling
 * page's Terms checkbox.
 */
const SECTIONS = [
  {
    title: '1. Introduction',
    body:
      'Welcome to Mailwave Email Marketing Automation. By creating an account or using any part of the platform you agree to be bound by these Terms and Conditions. Read them carefully — they describe the rules that keep Mailwave a safe and reliable place to send email.',
  },
  {
    title: '2. Account Registration',
    body:
      'You must provide accurate Full Name, Email ID and Contact Number details when registering. Each Email ID can be used to create only one Mailwave account. You are responsible for keeping your Password confidential and for all activity that happens under your account.',
  },
  {
    title: '3. User Responsibilities',
    body:
      'You agree to use Mailwave only for lawful purposes and in line with applicable email marketing regulations such as GDPR, CAN-SPAM and India IT Rules. You will not share login credentials with unauthorised users and will report any suspected misuse of your account immediately.',
  },
  {
    title: '4. Email Marketing Compliance',
    body:
      'You confirm that every recipient on your contact list has given clear, recorded permission to receive email from you. Mailwave does not allow purchased lists, scraped lists or any contacts who have not explicitly opted in. Repeated complaints may result in suspension.',
  },
  {
    title: '5. Contact Data and Consent',
    body:
      'You retain ownership of the contact data you upload. Mailwave processes that data only to deliver the services you use. You are solely responsible for ensuring that your data collection and consent practices comply with the privacy laws that apply to your business.',
  },
  {
    title: '6. Unsubscribe and Opt-Out Policy',
    body:
      'Every campaign sent through Mailwave must include a clear, working unsubscribe link. Once a contact unsubscribes, Mailwave will block further sends to that recipient. You must not attempt to bypass this policy by re-importing unsubscribed contacts.',
  },
  {
    title: '7. Prohibited Content',
    body:
      'You will not use Mailwave to send content that is illegal, deceptive, defamatory, sexually explicit, hateful, or that infringes another party\'s rights. Phishing, malware distribution, get-rich-quick schemes, and impersonation are strictly prohibited.',
  },
  {
    title: '8. Subscription and Billing',
    body:
      'Paid plans are billed in advance on a recurring basis. By selecting a paid plan you authorise Mailwave to charge the payment method on file at each renewal until you cancel. Taxes are added where applicable. Plans can be upgraded or downgraded at any time from the Billing page.',
  },
  {
    title: '9. Free Trial',
    body:
      'The 7-day Free Trial lets you evaluate Mailwave with no card required. Trial accounts are subject to lower sending limits and may be paused for review if unusual activity is detected. The trial converts to a paid plan only after you add a payment method.',
  },
  {
    title: '10. Coupon and Referral Usage',
    body:
      'Coupon and referral codes are personal, single-use unless stated otherwise, and cannot be combined or transferred. Mailwave reserves the right to revoke any code that has been obtained or used in a fraudulent manner.',
  },
  {
    title: '11. Data Privacy',
    body:
      'Mailwave processes personal data in line with our Privacy Policy. We use industry-standard encryption in transit and at rest, restrict employee access on a need-to-know basis, and do not sell personal data to third parties.',
  },
  {
    title: '12. Platform Availability',
    body:
      'We aim for 99.9% uptime but do not guarantee uninterrupted availability. Scheduled maintenance, third-party outages and force-majeure events may temporarily affect access. Status updates are posted to the Mailwave status page.',
  },
  {
    title: '13. Account Suspension',
    body:
      'Mailwave may suspend or terminate accounts that violate these terms, generate excessive spam complaints, exceed deliverability thresholds, or threaten platform stability. Where reasonable, we will notify you and provide a chance to resolve the issue first.',
  },
  {
    title: '14. Limitation of Liability',
    body:
      'To the maximum extent permitted by law, Mailwave is not liable for indirect, incidental or consequential damages arising from use of the platform. Our total liability for any claim is capped at the fees you paid in the preceding three months.',
  },
  {
    title: '15. Changes to Terms',
    body:
      'We may update these Terms from time to time. Material changes will be notified by email or in-app announcement at least 14 days before they take effect. Continued use of Mailwave after that date constitutes acceptance of the updated terms.',
  },
  {
    title: '16. Contact Information',
    body:
      'Questions about these Terms? Reach the Mailwave team at support@mailwave.com. For privacy and data requests, write to privacy@mailwave.com. Postal address and grievance officer details are listed on the Mailwave website footer.',
  },
];

export default function TermsModal({ open, onClose, onAgree }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
            style={{ maxHeight: 'min(90vh, 720px)' }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-glow">
                  <ScrollText className="h-5 w-5" />
                </span>
                <div>
                  <h2
                    id="terms-modal-title"
                    className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg"
                  >
                    Mailwave Terms and Conditions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Please review the policy before agreeing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div
              className="flex-1 overflow-y-auto px-5 py-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:px-6"
              tabIndex={0}
            >
              <p className="mb-4 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Last updated: May 2026
              </p>
              <div className="space-y-5">
                {SECTIONS.map((s) => (
                  <section key={s.title}>
                    <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {s.title}
                    </h3>
                    <p>{s.body}</p>
                  </section>
                ))}
              </div>
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onAgree?.();
                  onClose?.();
                }}
                className="btn-primary cursor-pointer"
              >
                <Check className="h-4 w-4" /> I Agree
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
