/**
 * contact-fields.js
 *
 * Central configuration for the Contact Management module:
 *  - Contact statuses
 *  - Contact sources
 *  - WhatsApp opt-in statuses
 *  - Country / state / city dropdown data (light seed; long lists get search)
 *  - Tag colour palette
 *  - Activity types
 *
 * Used by forms, filter bar, importer and detail page so any change here
 * propagates everywhere.
 */

export const CONTACT_STATUSES = {
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  BOUNCED: 'bounced',
  COMPLAINED: 'complained',
  INVALID: 'invalid',
};

export const CONTACT_STATUS_OPTIONS = [
  { value: CONTACT_STATUSES.SUBSCRIBED, label: 'Subscribed', tone: 'emerald' },
  { value: CONTACT_STATUSES.UNSUBSCRIBED, label: 'Unsubscribed', tone: 'rose' },
  { value: CONTACT_STATUSES.BOUNCED, label: 'Bounced', tone: 'amber' },
  { value: CONTACT_STATUSES.COMPLAINED, label: 'Complained', tone: 'fuchsia' },
  { value: CONTACT_STATUSES.INVALID, label: 'Invalid', tone: 'slate' },
];

export function getStatusTone(status) {
  return CONTACT_STATUS_OPTIONS.find((s) => s.value === status)?.tone || 'slate';
}

export function getStatusLabel(status) {
  return CONTACT_STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
}

export const CONTACT_SOURCES = [
  'Manual',
  'CSV Import',
  'API',
  'Website Form',
  'Referral',
  'WhatsApp',
  'Google Form',
];

export const CONTACT_SOURCE_OPTIONS = CONTACT_SOURCES.map((s) => ({
  value: s,
  label: s,
}));

export const WHATSAPP_OPT_IN_STATUSES = {
  OPTED_IN: 'opted_in',
  OPTED_OUT: 'opted_out',
  PENDING: 'pending',
};

export const WHATSAPP_OPT_IN_OPTIONS = [
  { value: WHATSAPP_OPT_IN_STATUSES.OPTED_IN, label: 'Opted In', tone: 'emerald' },
  { value: WHATSAPP_OPT_IN_STATUSES.OPTED_OUT, label: 'Opted Out', tone: 'rose' },
  { value: WHATSAPP_OPT_IN_STATUSES.PENDING, label: 'Pending', tone: 'amber' },
];

export function getWhatsappLabel(value) {
  return WHATSAPP_OPT_IN_OPTIONS.find((o) => o.value === value)?.label || 'Pending';
}

export function getWhatsappTone(value) {
  return WHATSAPP_OPT_IN_OPTIONS.find((o) => o.value === value)?.tone || 'slate';
}

export const COUNTRIES = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Germany', label: 'Germany' },
];

export const STATES_BY_COUNTRY = {
  India: [
    'Maharashtra',
    'Karnataka',
    'Tamil Nadu',
    'Delhi',
    'Gujarat',
    'Telangana',
    'West Bengal',
    'Kerala',
    'Rajasthan',
    'Uttar Pradesh',
  ],
  'United States': ['California', 'New York', 'Texas', 'Washington', 'Illinois'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
  Australia: ['New South Wales', 'Victoria', 'Queensland'],
  Singapore: ['Central', 'East', 'North', 'West'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  Germany: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse'],
};

export const CITIES_BY_STATE = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangalore', 'Hubli'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  Delhi: ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  Telangana: ['Hyderabad', 'Warangal', 'Secunderabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
  Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'],
  Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Ghaziabad', 'Kanpur'],
  California: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose'],
  'New York': ['New York City', 'Buffalo', 'Rochester'],
  Texas: ['Austin', 'Dallas', 'Houston'],
  Washington: ['Seattle', 'Bellevue', 'Tacoma'],
  Illinois: ['Chicago', 'Springfield'],
  England: ['London', 'Manchester', 'Birmingham'],
  Scotland: ['Edinburgh', 'Glasgow'],
  Wales: ['Cardiff', 'Swansea'],
  'Northern Ireland': ['Belfast'],
  Ontario: ['Toronto', 'Ottawa'],
  Quebec: ['Montreal', 'Quebec City'],
  'British Columbia': ['Vancouver', 'Victoria'],
  Alberta: ['Calgary', 'Edmonton'],
  'New South Wales': ['Sydney', 'Newcastle'],
  Victoria: ['Melbourne', 'Geelong'],
  Queensland: ['Brisbane', 'Gold Coast'],
  Central: ['Singapore'],
  East: ['Bedok', 'Tampines'],
  North: ['Yishun', 'Woodlands'],
  West: ['Jurong'],
  Dubai: ['Dubai'],
  'Abu Dhabi': ['Abu Dhabi'],
  Sharjah: ['Sharjah'],
  Bavaria: ['Munich', 'Nuremberg'],
  Berlin: ['Berlin'],
  Hamburg: ['Hamburg'],
  Hesse: ['Frankfurt'],
};

export const TAG_COLOURS = [
  { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { value: 'emerald', label: 'Emerald', hex: '#10b981' },
  { value: 'amber', label: 'Amber', hex: '#f59e0b' },
  { value: 'rose', label: 'Rose', hex: '#f43f5e' },
  { value: 'fuchsia', label: 'Fuchsia', hex: '#d946ef' },
  { value: 'cyan', label: 'Cyan', hex: '#06b6d4' },
  { value: 'slate', label: 'Slate', hex: '#64748b' },
];

export const ACTIVITY_TYPES = {
  CONTACT_CREATED: 'contact_created',
  CONTACT_IMPORTED: 'contact_imported',
  TAG_ADDED: 'tag_added',
  CAMPAIGN_SENT: 'campaign_sent',
  EMAIL_OPENED: 'email_opened',
  EMAIL_CLICKED: 'email_clicked',
  EMAIL_BOUNCED: 'email_bounced',
  UNSUBSCRIBED: 'unsubscribed',
  WHATSAPP_DELIVERED: 'whatsapp_delivered',
  WHATSAPP_READ: 'whatsapp_read',
  WHATSAPP_REPLIED: 'whatsapp_replied',
};

export const ACTIVITY_LABELS = {
  [ACTIVITY_TYPES.CONTACT_CREATED]: 'Contact created',
  [ACTIVITY_TYPES.CONTACT_IMPORTED]: 'Contact imported',
  [ACTIVITY_TYPES.TAG_ADDED]: 'Tag added',
  [ACTIVITY_TYPES.CAMPAIGN_SENT]: 'Campaign sent',
  [ACTIVITY_TYPES.EMAIL_OPENED]: 'Email opened',
  [ACTIVITY_TYPES.EMAIL_CLICKED]: 'Email clicked',
  [ACTIVITY_TYPES.EMAIL_BOUNCED]: 'Email bounced',
  [ACTIVITY_TYPES.UNSUBSCRIBED]: 'Unsubscribed',
  [ACTIVITY_TYPES.WHATSAPP_DELIVERED]: 'WhatsApp message delivered',
  [ACTIVITY_TYPES.WHATSAPP_READ]: 'WhatsApp message read',
  [ACTIVITY_TYPES.WHATSAPP_REPLIED]: 'WhatsApp replied',
};

export const SEGMENT_FIELDS = [
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'country', label: 'Country' },
  { value: 'tag', label: 'Tag' },
  { value: 'status', label: 'Status' },
  { value: 'source', label: 'Source' },
  { value: 'engagementScore', label: 'Engagement Score' },
  { value: 'openedLastCampaign', label: 'Opened Last Campaign' },
  { value: 'clickedPricingLink', label: 'Clicked Pricing Link' },
  { value: 'inactiveDays', label: 'Inactive for Days' },
  { value: 'whatsappOptInStatus', label: 'WhatsApp Opt-In Status' },
];

export const SEGMENT_OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
];

/**
 * Contact CSV import column targets. Used by the import modal mapper.
 *
 * `aliases` are case-insensitive header names auto-mapper will accept in
 * addition to `key` and `label`. Keep this in sync with the downloadable
 * template header (utils inside the import modal).
 */
export const CONTACT_IMPORT_FIELDS = [
  { key: 'fullName', label: 'Full Name', required: true, aliases: ['full name', 'name'] },
  { key: 'emailId', label: 'Email ID', required: true, aliases: ['email', 'emailid', 'email address'] },
  { key: 'contactNumber', label: 'Contact Number', aliases: ['mobile', 'phone number'] },
  { key: 'countryCode', label: 'Country Code', aliases: ['country_code', 'dial code', 'dialcode'] },
  { key: 'phone', label: 'Phone', aliases: ['national phone', 'national number'] },
  { key: 'company', label: 'Company', aliases: ['company name'] },
  { key: 'organisationName', label: 'Organisation', aliases: ['organization', 'org', 'organisation'] },
  { key: 'jobTitle', label: 'Job Title', aliases: ['title', 'designation'] },
  { key: 'country', label: 'Country' },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'postalCode', label: 'Postal Code', aliases: ['zip', 'zip code', 'postcode'] },
  { key: 'source', label: 'Source' },
  { key: 'tags', label: 'Tags' },
  { key: 'status', label: 'Status' },
  { key: 'emailConsent', label: 'Email Consent', aliases: ['email_consent'] },
  { key: 'whatsappConsent', label: 'WhatsApp Consent', aliases: ['whatsapp_consent'] },
  { key: 'whatsappOptInStatus', label: 'WhatsApp Opt-In Status', aliases: ['whatsapp_opt_in_status', 'whatsapp optin', 'whatsapp opt in'] },
  { key: 'notes', label: 'Notes', aliases: ['note', 'remarks'] },
  { key: 'segments', label: 'Segments' },
];

/**
 * Allowed values for boolean-style consent CSV columns.
 */
export const CONSENT_TRUE_VALUES = new Set(['true', '1', 'yes', 'y']);
export const CONSENT_FALSE_VALUES = new Set(['false', '0', 'no', 'n', '']);

export default {
  CONTACT_STATUSES,
  CONTACT_STATUS_OPTIONS,
  CONTACT_SOURCES,
  CONTACT_SOURCE_OPTIONS,
  WHATSAPP_OPT_IN_STATUSES,
  WHATSAPP_OPT_IN_OPTIONS,
  COUNTRIES,
  STATES_BY_COUNTRY,
  CITIES_BY_STATE,
  TAG_COLOURS,
  ACTIVITY_TYPES,
  ACTIVITY_LABELS,
  SEGMENT_FIELDS,
  SEGMENT_OPERATORS,
  CONTACT_IMPORT_FIELDS,
  CONSENT_TRUE_VALUES,
  CONSENT_FALSE_VALUES,
};
