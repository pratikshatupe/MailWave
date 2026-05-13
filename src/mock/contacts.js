/**
 * mock/contacts.js
 *
 * Deterministic seed of 100+ sample contacts. Spread across the demo
 * tenants used by Mailwave so each role's filtered view is meaningful:
 *   - tenant-acme       (Business Admin / Marketing Manager / Viewer)
 *   - tenant-northwind  (a second organisation, only Super Admin sees)
 *   - tenant-aurora     (a third organisation, only Super Admin sees)
 *   - individual-marco  (Individual User)
 *
 * Never imported directly by pages — the service layer seeds these into
 * localStorage on first read.
 */

import {
  CONTACT_STATUSES,
  WHATSAPP_OPT_IN_STATUSES,
  CONTACT_SOURCES,
} from '../config/contact-fields.js';

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya', 'Krishna',
  'Meera', 'Neha', 'Priya', 'Rahul', 'Riya', 'Rohan', 'Sanya', 'Siddharth',
  'Sneha', 'Tanvi', 'Vikram', 'Yash', 'Alex', 'Daniel', 'Emma', 'Isabella',
  'Liam', 'Mia', 'Noah', 'Olivia', 'Sophia', 'William', 'Amelia', 'James',
  'Benjamin', 'Charlotte', 'Henry', 'Lucas', 'Harper', 'Mason', 'Ella',
  'Jackson', 'Aiden', 'Lily', 'Ethan', 'Madison', 'Jacob', 'Avery', 'Logan',
  'Scarlett', 'Carter', 'Grace',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Nair', 'Iyer',
  'Mehta', 'Gupta', 'Chopra', 'Joshi', 'Kapoor', 'Malhotra', 'Bose', 'Das',
  'Pillai', 'Sinha', 'Khanna', 'Bhatt', 'Anderson', 'Brown', 'Davis',
  'Garcia', 'Johnson', 'Jones', 'Martinez', 'Miller', 'Rodriguez', 'Smith',
  'Taylor', 'Thomas', 'Wilson', 'Moore', 'Clark', 'Lewis', 'Lee', 'Walker',
  'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill',
];

const ORGANISATIONS = [
  { tenantId: 'tenant-acme', name: 'Acme Corp' },
  { tenantId: 'tenant-northwind', name: 'Northwind Traders' },
  { tenantId: 'tenant-aurora', name: 'Aurora Labs' },
  { tenantId: 'individual-marco', name: 'Marco Studio' },
];

const LOCATIONS = [
  { country: 'India', state: 'Maharashtra', city: 'Pune', postalCode: '411001' },
  { country: 'India', state: 'Maharashtra', city: 'Mumbai', postalCode: '400001' },
  { country: 'India', state: 'Karnataka', city: 'Bengaluru', postalCode: '560001' },
  { country: 'India', state: 'Delhi', city: 'New Delhi', postalCode: '110001' },
  { country: 'India', state: 'Tamil Nadu', city: 'Chennai', postalCode: '600001' },
  { country: 'India', state: 'Gujarat', city: 'Ahmedabad', postalCode: '380001' },
  { country: 'India', state: 'Telangana', city: 'Hyderabad', postalCode: '500001' },
  { country: 'India', state: 'West Bengal', city: 'Kolkata', postalCode: '700001' },
  { country: 'United States', state: 'California', city: 'San Francisco', postalCode: '941010' },
  { country: 'United States', state: 'New York', city: 'New York City', postalCode: '100010' },
  { country: 'United Kingdom', state: 'England', city: 'London', postalCode: 'SW1A1A' },
];

const SAMPLE_TAGS = [
  'Interested', 'VIP', 'Customer', 'Trial', 'Newsletter', 'Lead',
  'High Value', 'Promo', 'Event', 'Webinar',
];

const SAMPLE_SEGMENTS = [
  'Active Subscribers',
  'Recent Buyers',
  'High Engagement',
  'Inactive 30d',
  'WhatsApp Audience',
];

const STATUSES = [
  CONTACT_STATUSES.SUBSCRIBED,
  CONTACT_STATUSES.SUBSCRIBED,
  CONTACT_STATUSES.SUBSCRIBED,
  CONTACT_STATUSES.SUBSCRIBED,
  CONTACT_STATUSES.UNSUBSCRIBED,
  CONTACT_STATUSES.BOUNCED,
  CONTACT_STATUSES.COMPLAINED,
  CONTACT_STATUSES.INVALID,
];

const WHATSAPP_STATES = [
  WHATSAPP_OPT_IN_STATUSES.OPTED_IN,
  WHATSAPP_OPT_IN_STATUSES.OPTED_IN,
  WHATSAPP_OPT_IN_STATUSES.PENDING,
  WHATSAPP_OPT_IN_STATUSES.OPTED_OUT,
];

/**
 * Lightweight deterministic PRNG so the seed is stable across reloads.
 */
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

function indianMobile(rand) {
  const first = '6789'[Math.floor(rand() * 4)];
  let rest = '';
  for (let i = 0; i < 9; i += 1) rest += Math.floor(rand() * 10);
  return `${first}${rest}`;
}

function isoDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function buildContact(index, rand) {
  const first = pick(rand, FIRST_NAMES);
  const last = pick(rand, LAST_NAMES);
  const org = pick(rand, ORGANISATIONS);
  const loc = pick(rand, LOCATIONS);
  const status = pick(rand, STATUSES);
  const tagsCount = Math.floor(rand() * 3);
  const tags = [];
  for (let i = 0; i < tagsCount; i += 1) {
    const t = pick(rand, SAMPLE_TAGS);
    if (!tags.includes(t)) tags.push(t);
  }
  const segmentsCount = Math.floor(rand() * 2);
  const segments = [];
  for (let i = 0; i < segmentsCount; i += 1) {
    const s = pick(rand, SAMPLE_SEGMENTS);
    if (!segments.includes(s)) segments.push(s);
  }
  const createdDaysAgo = Math.floor(rand() * 180);
  const updatedDaysAgo = Math.max(0, createdDaysAgo - Math.floor(rand() * 30));
  const lastActivityDaysAgo = Math.max(0, updatedDaysAgo - Math.floor(rand() * 10));
  const emailLocal = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '');
  const domain = org.tenantId === 'individual-marco'
    ? 'gmail.com'
    : `${org.name.toLowerCase().replace(/[^a-z]/g, '')}.com`;

  return {
    id: `c-${String(index + 1).padStart(4, '0')}`,
    tenantId: org.tenantId,
    organisationName: org.name,
    fullName: `${first} ${last}`,
    emailId: `${emailLocal}${index}@${domain}`,
    contactNumber: indianMobile(rand),
    country: loc.country,
    state: loc.state,
    city: loc.city,
    postalCode: loc.postalCode,
    tags,
    segments,
    source: pick(rand, CONTACT_SOURCES),
    status,
    emailConsent: status === CONTACT_STATUSES.SUBSCRIBED,
    whatsappConsent: rand() > 0.4,
    whatsappOptInStatus: pick(rand, WHATSAPP_STATES),
    engagementScore: Math.floor(rand() * 100),
    notes: '',
    unsubscribeReason: status === CONTACT_STATUSES.UNSUBSCRIBED
      ? pick(rand, ['Too many emails', 'Not relevant', 'Did not sign up', 'Other'])
      : '',
    unsubscribedAt: status === CONTACT_STATUSES.UNSUBSCRIBED ? isoDate(updatedDaysAgo) : null,
    createdAt: isoDate(createdDaysAgo),
    updatedAt: isoDate(updatedDaysAgo),
    lastActivityAt: isoDate(lastActivityDaysAgo),
  };
}

export function buildSampleContacts(count = 110) {
  const rand = makeRng(20260513);
  const list = [];
  for (let i = 0; i < count; i += 1) {
    list.push(buildContact(i, rand));
  }
  return list;
}

export const SAMPLE_CONTACTS = buildSampleContacts();

export const SAMPLE_TAGS_SEED = [
  { id: 'tag-1', name: 'Interested', colour: 'indigo', description: 'Showed interest in product.', createdAt: '2025-12-01T09:00:00Z' },
  { id: 'tag-2', name: 'VIP', colour: 'fuchsia', description: 'High-value account.', createdAt: '2025-12-04T11:00:00Z' },
  { id: 'tag-3', name: 'Customer', colour: 'emerald', description: 'Paying customer.', createdAt: '2025-12-08T15:00:00Z' },
  { id: 'tag-4', name: 'Trial', colour: 'amber', description: 'Currently on trial.', createdAt: '2025-12-15T14:30:00Z' },
  { id: 'tag-5', name: 'Newsletter', colour: 'cyan', description: 'Subscribed to weekly newsletter.', createdAt: '2026-01-02T12:00:00Z' },
  { id: 'tag-6', name: 'Lead', colour: 'slate', description: 'Inbound lead.', createdAt: '2026-01-10T10:00:00Z' },
];

export const SAMPLE_SEGMENTS_SEED = [
  {
    id: 'seg-1',
    name: 'Active Subscribers',
    description: 'All subscribed contacts that engaged in the last 30 days.',
    rules: [
      { field: 'status', operator: 'equals', value: 'subscribed' },
      { field: 'engagementScore', operator: 'greater_than', value: '50' },
    ],
    combinator: 'AND',
    status: 'active',
    createdAt: '2025-12-01T08:00:00Z',
  },
  {
    id: 'seg-2',
    name: 'WhatsApp Audience',
    description: 'Contacts who opted into WhatsApp.',
    rules: [
      { field: 'whatsappOptInStatus', operator: 'equals', value: 'opted_in' },
    ],
    combinator: 'AND',
    status: 'active',
    createdAt: '2025-12-12T13:00:00Z',
  },
  {
    id: 'seg-3',
    name: 'Pune Customers',
    description: 'Contacts in Pune marked as Customer.',
    rules: [
      { field: 'city', operator: 'equals', value: 'Pune' },
      { field: 'tag', operator: 'equals', value: 'Customer' },
    ],
    combinator: 'AND',
    status: 'active',
    createdAt: '2026-01-05T10:00:00Z',
  },
];

export default SAMPLE_CONTACTS;
