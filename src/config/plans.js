/**
 * plans.js
 *
 * Central list of subscription plans rendered on the register flow plan
 * picker and reused by Super Admin views. Each entry is self-contained so
 * pages just iterate this list instead of hardcoding pricing copy.
 */

export const PLAN_IDS = {
  TRIAL: 'trial',
  STARTER: 'starter',
  GROWTH: 'growth',
  PROFESSIONAL: 'professional',
  AGENCY: 'agency',
  ENTERPRISE: 'enterprise',
};

export const PLANS = [
  {
    id: PLAN_IDS.TRIAL,
    name: '7-day Free Trial',
    price: 'Free',
    cadence: '7 days',
    blurb: 'No card. Cancel anytime.',
    features: ['1,000 emails', '500 contacts', '2 automations'],
    tone: 'from-slate-500 to-slate-700',
    audience: ['individual', 'organisation'],
  },
  {
    id: PLAN_IDS.STARTER,
    name: 'Starter',
    price: '₹1,499',
    cadence: '/ Month',
    blurb: 'For solo founders & creators.',
    features: ['10k emails', '2,500 contacts', '5 automations'],
    tone: 'from-emerald-500 to-teal-500',
    audience: ['individual', 'organisation'],
  },
  {
    id: PLAN_IDS.GROWTH,
    name: 'Growth',
    price: '₹6,999',
    cadence: '/ Month',
    blurb: 'For growing teams & brands.',
    features: ['500k emails', '75k contacts', 'Approval workflow'],
    tone: 'from-indigo-500 to-fuchsia-500',
    recommended: true,
    audience: ['individual', 'organisation'],
  },
  {
    id: PLAN_IDS.PROFESSIONAL,
    name: 'Professional',
    price: '₹14,999',
    cadence: '/ Month',
    blurb: 'For high-volume senders.',
    features: ['2M emails', '300k contacts', 'Dedicated IP'],
    tone: 'from-blue-500 to-cyan-500',
    audience: ['organisation'],
  },
  {
    id: PLAN_IDS.AGENCY,
    name: 'Agency',
    price: '₹29,999',
    cadence: '/ Month',
    blurb: 'For agencies managing clients.',
    features: ['Multi-client workspaces', 'White-label', 'Priority support'],
    tone: 'from-fuchsia-500 to-pink-500',
    audience: ['organisation'],
  },
  {
    id: PLAN_IDS.ENTERPRISE,
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    blurb: 'SLA, SSO, custom integrations.',
    features: ['Unlimited contacts', 'SSO + SAML', 'Dedicated CSM'],
    tone: 'from-rose-500 to-orange-500',
    audience: ['organisation'],
  },
];

export function getPlanById(id) {
  return PLANS.find((p) => p.id === id) || null;
}

export function getPlanName(id) {
  return getPlanById(id)?.name || 'Starter';
}

export function getPlansForAccountType(accountType) {
  const key = accountType === 'organization' ? 'organisation' : accountType;
  return PLANS.filter((p) => !key || p.audience.includes(key));
}

export default PLANS;
