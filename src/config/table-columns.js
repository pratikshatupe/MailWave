/**
 * table-columns.js
 *
 * Central column registry. Every module-level table reads its column
 * configuration from here so behaviour changes (priority, inline edit,
 * mobile visibility, validators) propagate to all tables at once.
 *
 * Column shape:
 *   key, label, type, width, minWidth, priority,
 *   sortable, filterable, searchable, editable,
 *   editType, options, validator,
 *   showOnMobile, showOnTablet, showOnDesktop,
 *   truncate, wrap, tooltip, badgeMap, permissionRequired
 *
 * Each module also exports a `mobile` config (title / subtitle / badge /
 * detail keys) so card layout stays consistent.
 */

import { LABELS } from './labels.js';
import { COLUMN_PRIORITY } from './table-responsive-config.js';

const STATUS_TONES = {
  Active: 'emerald',
  Inactive: 'slate',
  Suspended: 'rose',
  Invited: 'amber',
  Trial: 'indigo',
  'Past Due': 'rose',
  Pending: 'amber',
  Approved: 'emerald',
  Rejected: 'rose',
  Live: 'emerald',
  Draft: 'slate',
  Retired: 'rose',
  Paid: 'emerald',
  Failed: 'rose',
  Refunded: 'amber',
  Sent: 'emerald',
  Scheduled: 'indigo',
  Running: 'fuchsia',
  Paused: 'amber',
  Completed: 'emerald',
  Subscribed: 'emerald',
  Unsubscribed: 'rose',
  Bounced: 'amber',
  Complained: 'fuchsia',
  Invalid: 'slate',
  'Opted In': 'emerald',
  'Opted Out': 'rose',
  Expired: 'rose',
  Disabled: 'slate',
  Enabled: 'emerald',
  Delivered: 'emerald',
  Read: 'indigo',
  Replied: 'fuchsia',
};

export const SHARED_BADGE_TONES = STATUS_TONES;

/* ------------------------------- Contacts ------------------------------- */

const CONTACT_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.CRITICAL, width: '60px', sortable: false, searchable: false },
    { key: 'fullName', label: LABELS.fullName, type: 'text', priority: COLUMN_PRIORITY.CRITICAL, sortable: true, searchable: true, editable: true, editType: 'text', validator: 'fullName', truncate: true },
    { key: 'emailId', label: LABELS.emailId, type: 'email', priority: COLUMN_PRIORITY.CRITICAL, sortable: true, searchable: true, editable: true, editType: 'email', validator: 'emailId', truncate: true, tooltip: true },
    { key: 'contactNumber', label: LABELS.contactNumber, type: 'text', priority: COLUMN_PRIORITY.HIGH, width: '140px', searchable: true, editable: true, editType: 'contactNumber', validator: 'contactNumber' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'contactStatus', sortable: true },
    { key: 'tags', label: 'Tags', type: 'tags', priority: COLUMN_PRIORITY.HIGH, wrap: true, searchable: true, editable: true, editType: 'multiselect' },
    { key: 'source', label: 'Source', type: 'text', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'contactSource' },
    { key: 'segments', label: 'Segment', type: 'tags', priority: COLUMN_PRIORITY.LOW, wrap: true, editable: true, editType: 'multiselect' },
    { key: 'engagementScore', label: 'Engagement', type: 'number', priority: COLUMN_PRIORITY.LOW, width: '110px' },
    { key: 'organisationName', label: LABELS.organisation, type: 'text', priority: COLUMN_PRIORITY.LOW, truncate: true },
    { key: 'createdAt', label: LABELS.createdAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
  ],
  mobile: {
    mobileTitleKey: 'fullName',
    mobileSubtitleKey: 'emailId',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['contactNumber', 'tags', 'segments', 'source', 'engagementScore', 'organisationName', 'createdAt'],
    mobileActionKeys: ['view', 'delete'],
  },
  search: {
    keys: ['fullName', 'emailId', 'contactNumber', 'city', 'source', 'organisationName', 'tags'],
    placeholder: 'Search contacts…',
  },
};

/* --------------------------------- Users -------------------------------- */

const USER_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'fullName', label: LABELS.fullName, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'emailId', label: LABELS.emailId, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true, tooltip: true },
    { key: 'contactNumber', label: LABELS.contactNumber, priority: COLUMN_PRIORITY.MEDIUM, width: '140px' },
    { key: 'roleLabel', label: 'Role', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'role' },
    { key: 'accountType', label: 'Account Type', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'selectedPlan', label: 'Plan', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'tenantId', label: 'Tenant ID', priority: COLUMN_PRIORITY.LOW, truncate: true },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'userStatus' },
    { key: 'createdAt', label: LABELS.createdAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
  ],
  mobile: {
    mobileTitleKey: 'fullName',
    mobileSubtitleKey: 'emailId',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['roleLabel', 'accountType', 'selectedPlan', 'contactNumber', 'tenantId', 'createdAt'],
    mobileActionKeys: ['view', 'edit', 'delete'],
  },
  search: {
    keys: ['fullName', 'emailId', 'roleLabel', 'selectedPlan', 'tenantId'],
    placeholder: 'Search users…',
  },
};

/* -------------------------------- Tenants ------------------------------- */

const TENANT_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'organisationName', label: 'Organisation Name', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'ownerName', label: 'Owner Name', priority: COLUMN_PRIORITY.HIGH, searchable: true, truncate: true },
    { key: 'ownerEmailId', label: LABELS.emailId, priority: COLUMN_PRIORITY.HIGH, searchable: true, truncate: true, tooltip: true },
    { key: 'accountType', label: 'Account Type', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'selectedPlan', label: 'Plan', priority: COLUMN_PRIORITY.MEDIUM, editable: true, editType: 'select', options: 'plan' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'tenantStatus' },
    { key: 'createdAt', label: LABELS.createdAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
  ],
  mobile: {
    mobileTitleKey: 'organisationName',
    mobileSubtitleKey: 'ownerEmailId',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['ownerName', 'accountType', 'selectedPlan', 'createdAt'],
    mobileActionKeys: ['view', 'edit', 'delete'],
  },
  search: {
    keys: ['organisationName', 'ownerName', 'ownerEmailId', 'selectedPlan'],
    placeholder: 'Search organisations…',
  },
};

/* --------------------------------- Plans -------------------------------- */

const PLAN_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'name', label: LABELS.planName, priority: COLUMN_PRIORITY.CRITICAL, searchable: true },
    { key: 'price', label: LABELS.price, priority: COLUMN_PRIORITY.HIGH },
    { key: 'emails', label: 'Email Quota', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'contacts', label: 'Contact Quota', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'tenants', label: 'Tenants', priority: COLUMN_PRIORITY.LOW },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'planStatus' },
  ],
  mobile: {
    mobileTitleKey: 'name',
    mobileSubtitleKey: 'price',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['emails', 'contacts', 'tenants'],
    mobileActionKeys: ['view', 'edit', 'delete'],
  },
  search: {
    keys: ['name', 'price', 'status'],
    placeholder: 'Search plans…',
  },
};

/* ----------------------------- Subscriptions ---------------------------- */

const SUBSCRIPTION_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'organisationName', label: LABELS.organisation, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'planName', label: LABELS.planName, priority: COLUMN_PRIORITY.HIGH, searchable: true },
    { key: 'amount', label: 'Amount', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'subscriptionStatus' },
    { key: 'startDate', label: 'Start Date', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
    { key: 'renewalDate', label: 'Renewal Date', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
  ],
  mobile: {
    mobileTitleKey: 'organisationName',
    mobileSubtitleKey: 'planName',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['amount', 'startDate', 'renewalDate'],
    mobileActionKeys: ['view', 'edit'],
  },
  search: {
    keys: ['organisationName', 'planName', 'status'],
    placeholder: 'Search subscriptions…',
  },
};

/* -------------------------------- Payments ------------------------------- */

const PAYMENT_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'invoiceId', label: 'Invoice', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'organisationName', label: LABELS.organisation, priority: COLUMN_PRIORITY.HIGH, searchable: true, truncate: true },
    { key: 'amount', label: 'Amount', priority: COLUMN_PRIORITY.HIGH },
    { key: 'method', label: 'Method', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'paymentStatus' },
    { key: 'paidAt', label: 'Paid At', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
  ],
  mobile: {
    mobileTitleKey: 'invoiceId',
    mobileSubtitleKey: 'organisationName',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['amount', 'method', 'paidAt'],
    mobileActionKeys: ['view', 'download'],
  },
  search: {
    keys: ['invoiceId', 'organisationName', 'method', 'status'],
    placeholder: 'Search payments…',
  },
};

/* -------------------------------- Campaigns ------------------------------ */

const CAMPAIGN_COLUMNS = {
  columns: [
    { key: 'name', label: LABELS.campaignName, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'sent', label: 'Recipients', priority: COLUMN_PRIORITY.HIGH, width: '110px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'campaignStatus' },
    { key: 'open', label: 'Open Rate', priority: COLUMN_PRIORITY.HIGH, width: '110px' },
    { key: 'click', label: 'Click Rate', priority: COLUMN_PRIORITY.MEDIUM, width: '110px' },
    { key: 'date', label: 'Created At', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
    { key: 'audience', label: 'Audience', priority: COLUMN_PRIORITY.LOW, truncate: true },
  ],
  mobile: {
    mobileTitleKey: 'name',
    mobileSubtitleKey: 'audience',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['sent', 'open', 'click', 'date'],
    mobileActionKeys: ['view', 'edit', 'sendNow', 'pause', 'resume', 'delete'],
  },
  search: {
    keys: ['name', 'audience', 'status'],
    placeholder: 'Search campaigns…',
  },
};

/* ---------------------------- WhatsApp Campaigns ------------------------- */

const WHATSAPP_CAMPAIGN_COLUMNS = {
  columns: [
    { key: 'name', label: LABELS.campaignName, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'audience', label: 'Audience', priority: COLUMN_PRIORITY.HIGH, truncate: true },
    { key: 'delivered', label: 'Delivered', priority: COLUMN_PRIORITY.MEDIUM, width: '110px' },
    { key: 'read', label: 'Read', priority: COLUMN_PRIORITY.MEDIUM, width: '90px' },
    { key: 'replied', label: 'Replied', priority: COLUMN_PRIORITY.LOW, width: '100px' },
    { key: 'date', label: LABELS.date, priority: COLUMN_PRIORITY.LOW, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'campaignStatus' },
  ],
  mobile: {
    mobileTitleKey: 'name',
    mobileSubtitleKey: 'audience',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['delivered', 'read', 'replied', 'date'],
    mobileActionKeys: ['view', 'edit', 'sendNow', 'pause', 'resume', 'delete'],
  },
  search: {
    keys: ['name', 'audience', 'status'],
    placeholder: 'Search WhatsApp campaigns…',
  },
};

/* -------------------------------- Templates ------------------------------ */

const TEMPLATE_COLUMNS = {
  columns: [
    { key: 'name', label: LABELS.templateName, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'category', label: 'Category', priority: COLUMN_PRIORITY.HIGH },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'templateStatus' },
    { key: 'updatedAt', label: LABELS.updatedAt, type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
    { key: 'usageCount', label: 'Usage', priority: COLUMN_PRIORITY.LOW, width: '90px' },
  ],
  mobile: {
    mobileTitleKey: 'name',
    mobileSubtitleKey: 'category',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['updatedAt', 'usageCount'],
    mobileActionKeys: ['view', 'edit', 'duplicate', 'delete'],
  },
  search: {
    keys: ['name', 'category', 'status'],
    placeholder: 'Search templates…',
  },
};

/* -------------------------------- Segments ------------------------------- */

const SEGMENT_COLUMNS = {
  columns: [
    { key: 'name', label: 'Segment Name', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'description', label: 'Description', priority: COLUMN_PRIORITY.MEDIUM, truncate: true },
    { key: 'contactsCount', label: 'Contacts', priority: COLUMN_PRIORITY.HIGH, width: '110px' },
    { key: 'rulesCount', label: 'Rules', priority: COLUMN_PRIORITY.LOW, width: '90px' },
    { key: 'updatedAt', label: LABELS.updatedAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'segmentStatus' },
  ],
  mobile: {
    mobileTitleKey: 'name',
    mobileSubtitleKey: 'description',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['contactsCount', 'rulesCount', 'updatedAt'],
    mobileActionKeys: ['view', 'edit', 'duplicate', 'delete'],
  },
  search: {
    keys: ['name', 'description', 'status'],
    placeholder: 'Search segments…',
  },
};

/* ------------------------------- Automations ----------------------------- */

const AUTOMATION_COLUMNS = {
  columns: [
    { key: 'automationName', label: 'Automation Name', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'triggerType', label: 'Trigger', priority: COLUMN_PRIORITY.HIGH },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'automationStatus' },
    { key: 'audienceType', label: 'Audience', priority: COLUMN_PRIORITY.HIGH },
    { key: 'createdAt', label: 'Created At', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '140px' },
  ],
  mobile: {
    mobileTitleKey: 'automationName',
    mobileSubtitleKey: 'triggerType',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['audienceType', 'createdAt'],
    mobileActionKeys: ['view', 'edit', 'duplicate', 'pause', 'resume', 'delete'],
  },
  search: {
    keys: ['automationName', 'triggerType', 'audienceType', 'status'],
    placeholder: 'Search automations…',
  },
};

/* --------------------------------- Reports ------------------------------- */

const REPORT_COLUMNS = {
  columns: [
    { key: 'name', label: 'Report Name', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'period', label: 'Period', priority: COLUMN_PRIORITY.HIGH },
    { key: 'metric', label: 'Metric', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'value', label: 'Value', priority: COLUMN_PRIORITY.MEDIUM, width: '110px' },
    { key: 'updatedAt', label: LABELS.updatedAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
  ],
  mobile: {
    mobileTitleKey: 'name',
    mobileSubtitleKey: 'period',
    mobileDetailKeys: ['metric', 'value', 'updatedAt'],
    mobileActionKeys: ['view', 'export'],
  },
  search: {
    keys: ['name', 'period', 'metric'],
    placeholder: 'Search reports…',
  },
};

/* ----------------------------- Analytics report tables ------------------- */

const ANALYTICS_COLUMNS = {
  columns: [
    { key: 'campaign', label: 'Campaign', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'sent', label: 'Sent', priority: COLUMN_PRIORITY.HIGH, width: '90px' },
    { key: 'opens', label: 'Opens', priority: COLUMN_PRIORITY.HIGH, width: '90px' },
    { key: 'clicks', label: 'Clicks', priority: COLUMN_PRIORITY.MEDIUM, width: '90px' },
    { key: 'bounces', label: 'Bounces', priority: COLUMN_PRIORITY.LOW, width: '100px' },
    { key: 'unsubscribes', label: 'Unsubs', priority: COLUMN_PRIORITY.LOW, width: '90px' },
  ],
  mobile: {
    mobileTitleKey: 'campaign',
    mobileDetailKeys: ['sent', 'opens', 'clicks', 'bounces', 'unsubscribes'],
    mobileActionKeys: ['view'],
  },
  search: {
    keys: ['campaign'],
    placeholder: 'Search analytics…',
  },
};

/* ------------------------------ Notifications ---------------------------- */

const NOTIFICATION_COLUMNS = {
  columns: [
    { key: 'title', label: 'Title', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'category', label: 'Category', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'recipient', label: 'Recipient', priority: COLUMN_PRIORITY.MEDIUM, truncate: true },
    { key: 'createdAt', label: LABELS.createdAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'notificationStatus' },
  ],
  mobile: {
    mobileTitleKey: 'title',
    mobileSubtitleKey: 'recipient',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['category', 'createdAt'],
    mobileActionKeys: ['view', 'delete'],
  },
  search: {
    keys: ['title', 'category', 'recipient'],
    placeholder: 'Search notifications…',
  },
};

/* ------------------------------ Announcements ---------------------------- */

const ANNOUNCEMENT_COLUMNS = {
  columns: [
    { key: 'title', label: 'Title', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'type', label: 'Type', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'announcementType' },
    { key: 'audience', label: 'Audience', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'publishedAt', label: 'Published At', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'announcementStatus' },
  ],
  mobile: {
    mobileTitleKey: 'title',
    mobileSubtitleKey: 'audience',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['type', 'publishedAt'],
    mobileActionKeys: ['view', 'edit', 'delete'],
  },
  search: {
    keys: ['title', 'type', 'audience'],
    placeholder: 'Search announcements…',
  },
};

/* --------------------------------- Coupons ------------------------------- */

const COUPON_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'code', label: LABELS.couponCode, priority: COLUMN_PRIORITY.CRITICAL, searchable: true },
    { key: 'discount', label: 'Discount', priority: COLUMN_PRIORITY.HIGH, width: '110px' },
    { key: 'usage', label: 'Usage', priority: COLUMN_PRIORITY.MEDIUM, width: '110px' },
    { key: 'expiresAt', label: 'Expires At', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'couponStatus' },
  ],
  mobile: {
    mobileTitleKey: 'code',
    mobileSubtitleKey: 'discount',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['usage', 'expiresAt'],
    mobileActionKeys: ['view', 'edit', 'delete'],
  },
  search: {
    keys: ['code', 'discount', 'status'],
    placeholder: 'Search coupons…',
  },
};

/* ------------------------------- Referrals ------------------------------- */

const REFERRAL_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'referrer', label: 'Referrer', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'referee', label: 'Referee', priority: COLUMN_PRIORITY.HIGH, searchable: true, truncate: true },
    { key: 'code', label: LABELS.referralCode, priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'reward', label: 'Reward', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'createdAt', label: LABELS.createdAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'referralStatus' },
  ],
  mobile: {
    mobileTitleKey: 'referrer',
    mobileSubtitleKey: 'referee',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['code', 'reward', 'createdAt'],
    mobileActionKeys: ['view', 'delete'],
  },
  search: {
    keys: ['referrer', 'referee', 'code'],
    placeholder: 'Search referrals…',
  },
};

/* ----------------------------- API Integrations -------------------------- */

const API_INTEGRATION_COLUMNS = {
  columns: [
    { key: 'name', label: 'Integration', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'provider', label: 'Provider', priority: COLUMN_PRIORITY.HIGH },
    { key: 'environment', label: 'Environment', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'lastSyncAt', label: 'Last Sync', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'integrationStatus' },
  ],
  mobile: {
    mobileTitleKey: 'name',
    mobileSubtitleKey: 'provider',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['environment', 'lastSyncAt'],
    mobileActionKeys: ['view', 'edit', 'delete'],
  },
  search: {
    keys: ['name', 'provider', 'environment'],
    placeholder: 'Search integrations…',
  },
};

/* ------------------------------- Audit Logs ------------------------------ */

const AUDIT_LOG_COLUMNS = {
  columns: [
    { key: 'occurredAt', label: 'Occurred At', type: 'date', priority: COLUMN_PRIORITY.CRITICAL, width: '160px' },
    { key: 'actor', label: 'Actor', priority: COLUMN_PRIORITY.HIGH, searchable: true, truncate: true },
    { key: 'action', label: 'Action', priority: COLUMN_PRIORITY.HIGH, searchable: true },
    { key: 'entity', label: 'Entity', priority: COLUMN_PRIORITY.MEDIUM, truncate: true },
    { key: 'ipAddress', label: 'IP Address', priority: COLUMN_PRIORITY.LOW, width: '140px' },
  ],
  mobile: {
    mobileTitleKey: 'action',
    mobileSubtitleKey: 'actor',
    mobileDetailKeys: ['entity', 'ipAddress', 'occurredAt'],
    mobileActionKeys: ['view'],
  },
  search: {
    keys: ['actor', 'action', 'entity', 'ipAddress'],
    placeholder: 'Search audit logs…',
  },
};

/* ----------------------------- Team Members ----------------------------- */

const TEAM_MEMBER_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'fullName', label: LABELS.fullName, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'emailId', label: LABELS.emailId, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true, tooltip: true },
    { key: 'roleLabel', label: 'Role', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'role' },
    { key: 'lastActiveAt', label: 'Last Active', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.HIGH, editable: true, editType: 'select', options: 'userStatus' },
  ],
  mobile: {
    mobileTitleKey: 'fullName',
    mobileSubtitleKey: 'emailId',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['roleLabel', 'lastActiveAt'],
    mobileActionKeys: ['view', 'edit', 'delete'],
  },
  search: {
    keys: ['fullName', 'emailId', 'roleLabel'],
    placeholder: 'Search team members…',
  },
};

/* -------------------------------- Billing -------------------------------- */

const BILLING_INVOICE_COLUMNS = {
  columns: [
    { key: 'srNo', label: LABELS.serialNumber, priority: COLUMN_PRIORITY.LOW, width: '64px' },
    { key: 'invoiceId', label: 'Invoice', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'period', label: 'Period', priority: COLUMN_PRIORITY.HIGH },
    { key: 'amount', label: 'Amount', priority: COLUMN_PRIORITY.HIGH, width: '110px' },
    { key: 'dueDate', label: 'Due Date', type: 'date', priority: COLUMN_PRIORITY.MEDIUM, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'paymentStatus' },
  ],
  mobile: {
    mobileTitleKey: 'invoiceId',
    mobileSubtitleKey: 'period',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['amount', 'dueDate'],
    mobileActionKeys: ['view', 'download'],
  },
  search: {
    keys: ['invoiceId', 'period', 'status'],
    placeholder: 'Search invoices…',
  },
};

/* ----------------------------- Email Tracking ---------------------------- */

const EMAIL_TRACKING_COLUMNS = {
  columns: [
    { key: 'recipient', label: 'Recipient', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true, tooltip: true },
    { key: 'campaign', label: 'Campaign', priority: COLUMN_PRIORITY.HIGH, searchable: true, truncate: true },
    { key: 'opened', label: 'Opened', priority: COLUMN_PRIORITY.MEDIUM, width: '90px' },
    { key: 'clicked', label: 'Clicked', priority: COLUMN_PRIORITY.MEDIUM, width: '90px' },
    { key: 'lastEventAt', label: 'Last Event', type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.HIGH },
  ],
  mobile: {
    mobileTitleKey: 'recipient',
    mobileSubtitleKey: 'campaign',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['opened', 'clicked', 'lastEventAt'],
    mobileActionKeys: ['view'],
  },
  search: {
    keys: ['recipient', 'campaign'],
    placeholder: 'Search email tracking…',
  },
};

/* ---------------------------- WhatsApp Templates ------------------------- */

const WHATSAPP_TEMPLATE_COLUMNS = {
  columns: [
    { key: 'name', label: LABELS.templateName, priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'language', label: 'Language', priority: COLUMN_PRIORITY.HIGH, width: '110px' },
    { key: 'category', label: 'Category', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'updatedAt', label: LABELS.updatedAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'templateStatus' },
  ],
  mobile: {
    mobileTitleKey: 'name',
    mobileSubtitleKey: 'category',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['language', 'updatedAt'],
    mobileActionKeys: ['view', 'edit', 'duplicate', 'delete'],
  },
  search: {
    keys: ['name', 'language', 'category'],
    placeholder: 'Search WhatsApp templates…',
  },
};

/* ----------------------------- WhatsApp Opt-Ins -------------------------- */

const WHATSAPP_OPT_IN_COLUMNS = {
  columns: [
    { key: 'contactName', label: 'Contact', priority: COLUMN_PRIORITY.CRITICAL, searchable: true, truncate: true },
    { key: 'contactNumber', label: LABELS.contactNumber, priority: COLUMN_PRIORITY.HIGH, width: '140px' },
    { key: 'source', label: 'Source', priority: COLUMN_PRIORITY.MEDIUM },
    { key: 'updatedAt', label: LABELS.updatedAt, type: 'date', priority: COLUMN_PRIORITY.LOW, width: '120px' },
    { key: 'status', label: LABELS.status, type: 'badge', priority: COLUMN_PRIORITY.CRITICAL, editable: true, editType: 'select', options: 'whatsappOptInStatus' },
  ],
  mobile: {
    mobileTitleKey: 'contactName',
    mobileSubtitleKey: 'contactNumber',
    mobileBadgeKey: 'status',
    mobileDetailKeys: ['source', 'updatedAt'],
    mobileActionKeys: ['view', 'edit'],
  },
  search: {
    keys: ['contactName', 'contactNumber', 'source'],
    placeholder: 'Search WhatsApp opt-ins…',
  },
};

/* --------------------- Central registry by tableKey --------------------- */

export const TABLE_COLUMNS = {
  contacts: CONTACT_COLUMNS,
  users: USER_COLUMNS,
  tenants: TENANT_COLUMNS,
  plans: PLAN_COLUMNS,
  subscriptions: SUBSCRIPTION_COLUMNS,
  payments: PAYMENT_COLUMNS,
  campaigns: CAMPAIGN_COLUMNS,
  whatsappCampaigns: WHATSAPP_CAMPAIGN_COLUMNS,
  templates: TEMPLATE_COLUMNS,
  segments: SEGMENT_COLUMNS,
  automations: AUTOMATION_COLUMNS,
  reports: REPORT_COLUMNS,
  analytics: ANALYTICS_COLUMNS,
  notifications: NOTIFICATION_COLUMNS,
  announcements: ANNOUNCEMENT_COLUMNS,
  coupons: COUPON_COLUMNS,
  referrals: REFERRAL_COLUMNS,
  apiIntegrations: API_INTEGRATION_COLUMNS,
  auditLogs: AUDIT_LOG_COLUMNS,
  teamMembers: TEAM_MEMBER_COLUMNS,
  billingInvoices: BILLING_INVOICE_COLUMNS,
  emailTracking: EMAIL_TRACKING_COLUMNS,
  whatsappTemplates: WHATSAPP_TEMPLATE_COLUMNS,
  whatsappOptIns: WHATSAPP_OPT_IN_COLUMNS,
};

/* ----------------------- Inline edit option lists ----------------------- */

export const TABLE_OPTION_SETS = {
  contactStatus: [
    { value: 'subscribed', label: 'Subscribed', tone: 'emerald' },
    { value: 'unsubscribed', label: 'Unsubscribed', tone: 'rose' },
    { value: 'bounced', label: 'Bounced', tone: 'amber' },
    { value: 'complained', label: 'Complained', tone: 'fuchsia' },
    { value: 'invalid', label: 'Invalid', tone: 'slate' },
  ],
  contactSource: [
    { value: 'Manual', label: 'Manual' },
    { value: 'CSV Import', label: 'CSV Import' },
    { value: 'API', label: 'API' },
    { value: 'Website Form', label: 'Website Form' },
    { value: 'Referral', label: 'Referral' },
    { value: 'WhatsApp', label: 'WhatsApp' },
    { value: 'Google Form', label: 'Google Form' },
  ],
  role: [
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Business Admin', label: 'Business Admin' },
    { value: 'Marketing Manager', label: 'Marketing Manager' },
    { value: 'Viewer / Analyst', label: 'Viewer / Analyst' },
    { value: 'Individual User', label: 'Individual User' },
  ],
  userStatus: [
    { value: 'Active', label: 'Active', tone: 'emerald' },
    { value: 'Invited', label: 'Invited', tone: 'amber' },
    { value: 'Suspended', label: 'Suspended', tone: 'rose' },
  ],
  tenantStatus: [
    { value: 'Active', label: 'Active', tone: 'emerald' },
    { value: 'Trial', label: 'Trial', tone: 'indigo' },
    { value: 'Past Due', label: 'Past Due', tone: 'rose' },
    { value: 'Suspended', label: 'Suspended', tone: 'rose' },
  ],
  plan: [
    { value: 'Starter', label: 'Starter' },
    { value: 'Growth', label: 'Growth' },
    { value: 'Professional', label: 'Professional' },
    { value: 'Scale', label: 'Scale' },
  ],
  planStatus: [
    { value: 'Live', label: 'Live', tone: 'emerald' },
    { value: 'Draft', label: 'Draft', tone: 'slate' },
    { value: 'Retired', label: 'Retired', tone: 'rose' },
  ],
  subscriptionStatus: [
    { value: 'Active', label: 'Active', tone: 'emerald' },
    { value: 'Trial', label: 'Trial', tone: 'indigo' },
    { value: 'Past Due', label: 'Past Due', tone: 'rose' },
    { value: 'Cancelled', label: 'Cancelled', tone: 'slate' },
  ],
  paymentStatus: [
    { value: 'Succeeded', label: 'Succeeded', tone: 'emerald' },
    { value: 'Paid', label: 'Paid', tone: 'emerald' },
    { value: 'Pending', label: 'Pending', tone: 'amber' },
    { value: 'Failed', label: 'Failed', tone: 'rose' },
    { value: 'Refunded', label: 'Refunded', tone: 'amber' },
  ],
  campaignStatus: [
    { value: 'Draft', label: 'Draft', tone: 'slate' },
    { value: 'Scheduled', label: 'Scheduled', tone: 'indigo' },
    { value: 'Running', label: 'Running', tone: 'fuchsia' },
    { value: 'Sent', label: 'Sent', tone: 'emerald' },
    { value: 'Paused', label: 'Paused', tone: 'amber' },
  ],
  templateStatus: [
    { value: 'Live', label: 'Live', tone: 'emerald' },
    { value: 'Draft', label: 'Draft', tone: 'slate' },
    { value: 'Archived', label: 'Archived', tone: 'rose' },
  ],
  segmentStatus: [
    { value: 'Active', label: 'Active', tone: 'emerald' },
    { value: 'Inactive', label: 'Inactive', tone: 'slate' },
  ],
  automationStatus: [
    { value: 'Draft', label: 'Draft', tone: 'slate' },
    { value: 'Active', label: 'Active', tone: 'emerald' },
    { value: 'Paused', label: 'Paused', tone: 'amber' },
    { value: 'Completed', label: 'Completed', tone: 'indigo' },
    { value: 'Failed', label: 'Failed', tone: 'rose' },
  ],
  notificationStatus: [
    { value: 'Unread', label: 'Unread', tone: 'indigo' },
    { value: 'Read', label: 'Read', tone: 'slate' },
  ],
  announcementType: [
    { value: 'Info', label: 'Info' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Release', label: 'Release' },
    { value: 'Alert', label: 'Alert' },
  ],
  announcementStatus: [
    { value: 'Published', label: 'Published', tone: 'emerald' },
    { value: 'Draft', label: 'Draft', tone: 'slate' },
    { value: 'Archived', label: 'Archived', tone: 'rose' },
  ],
  couponStatus: [
    { value: 'Active', label: 'Active', tone: 'emerald' },
    { value: 'Scheduled', label: 'Scheduled', tone: 'indigo' },
    { value: 'Expired', label: 'Expired', tone: 'rose' },
    { value: 'Disabled', label: 'Disabled', tone: 'slate' },
    { value: 'Draft', label: 'Draft', tone: 'amber' },
  ],
  referralStatus: [
    { value: 'Pending', label: 'Pending', tone: 'amber' },
    { value: 'Approved', label: 'Approved', tone: 'emerald' },
    { value: 'Rejected', label: 'Rejected', tone: 'rose' },
  ],
  integrationStatus: [
    { value: 'Enabled', label: 'Enabled', tone: 'emerald' },
    { value: 'Disabled', label: 'Disabled', tone: 'slate' },
    { value: 'Failed', label: 'Failed', tone: 'rose' },
  ],
  whatsappOptInStatus: [
    { value: 'opted_in', label: 'Opted In', tone: 'emerald' },
    { value: 'opted_out', label: 'Opted Out', tone: 'rose' },
    { value: 'pending', label: 'Pending', tone: 'amber' },
  ],
};

export function getTableConfig(tableKey) {
  return TABLE_COLUMNS[tableKey] || null;
}

export function getColumnOptions(optionKey) {
  if (!optionKey) return [];
  if (Array.isArray(optionKey)) return optionKey;
  return TABLE_OPTION_SETS[optionKey] || [];
}

export function getBadgeTone(value) {
  if (!value) return 'slate';
  return STATUS_TONES[value] || 'slate';
}

export default TABLE_COLUMNS;
