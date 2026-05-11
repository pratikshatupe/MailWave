import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';

const faqs = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. Every plan starts with a 14-day free trial — no credit card required. Bring up to 1,000 contacts and start sending immediately.',
  },
  {
    q: 'Which email providers do you support?',
    a: 'Mailwave sends through SendGrid and Amazon SES out of the box. Bring your own keys, or use our managed sending pool.',
  },
  {
    q: 'How is deliverability handled?',
    a: 'Our Redis-backed queue paces sends, retries failed deliveries, and isolates senders. We also auto-clean bounces and manage suppression lists for you.',
  },
  {
    q: 'Can I personalize emails per contact?',
    a: 'Yes. Use variables like {{name}}, {{company}} or any custom field. Combine with segments and conditions to send truly 1:1 emails at scale.',
  },
  {
    q: 'Do you support role-based access?',
    a: 'Yes — Business Admin, Marketing Manager and Viewer/Analyst roles ship by default. Custom roles and SSO are available on Scale.',
  },
  {
    q: 'When is the AI subject line generator launching?',
    a: 'Beta is rolling out now to Growth and Scale customers. Generate, A/B test and pick the highest-converting subject in seconds.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section-pad bg-slate-50 dark:bg-slate-900">
      <div className="container-x">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          description="Still curious? Reach out to our team — we typically reply in under an hour."
        />

        <div className="mx-auto mt-8 max-w-3xl space-y-3 sm:mt-10 lg:mt-12">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border bg-white shadow-soft transition dark:bg-slate-800 ${
                  isOpen
                    ? 'border-indigo-200 dark:border-indigo-500/40'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${
                      isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:px-5 sm:pb-5">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
