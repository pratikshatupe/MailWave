/**
 * campaign-status.js
 *
 * Central campaign status + type definitions. Drives the badge tones,
 * the wizard, filters and the action button gating on every campaign
 * surface (list, details, analytics).
 */

export const CAMPAIGN_STATUSES = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  SCHEDULED: 'Scheduled',
  SENDING: 'Sending',
  SENT: 'Sent',
  PAUSED: 'Paused',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

export const CAMPAIGN_STATUS_LIST = Object.values(CAMPAIGN_STATUSES);

export const CAMPAIGN_TYPES = {
  REGULAR: 'Regular',
  SCHEDULED: 'Scheduled',
  AB_TEST: 'A/B Test',
  DRIP: 'Drip',
  TRANSACTIONAL: 'Transactional',
};

export const CAMPAIGN_TYPE_LIST = Object.values(CAMPAIGN_TYPES);

export const CAMPAIGN_STATUS_TONES = {
  [CAMPAIGN_STATUSES.DRAFT]: 'slate',
  [CAMPAIGN_STATUSES.PENDING_APPROVAL]: 'amber',
  [CAMPAIGN_STATUSES.APPROVED]: 'indigo',
  [CAMPAIGN_STATUSES.SCHEDULED]: 'indigo',
  [CAMPAIGN_STATUSES.SENDING]: 'fuchsia',
  [CAMPAIGN_STATUSES.SENT]: 'emerald',
  [CAMPAIGN_STATUSES.PAUSED]: 'amber',
  [CAMPAIGN_STATUSES.CANCELLED]: 'rose',
  [CAMPAIGN_STATUSES.FAILED]: 'rose',
};

export const AUDIENCE_TYPES = {
  ALL_CONTACTS: 'all_contacts',
  SEGMENT: 'segment',
  SELECTED_CONTACTS: 'selected_contacts',
  UPLOAD_LIST: 'upload_list',
};

export const AUDIENCE_TYPE_LABELS = {
  [AUDIENCE_TYPES.ALL_CONTACTS]: 'All Contacts',
  [AUDIENCE_TYPES.SEGMENT]: 'Segment',
  [AUDIENCE_TYPES.SELECTED_CONTACTS]: 'Selected Contacts',
  [AUDIENCE_TYPES.UPLOAD_LIST]: 'Upload List',
};

export const SCHEDULE_OPTIONS = {
  DRAFT: 'draft',
  SEND_NOW: 'send_now',
  SCHEDULE_LATER: 'schedule_later',
  SUBMIT_FOR_APPROVAL: 'submit_for_approval',
};

export const APPROVAL_STATUSES = {
  NONE: 'none',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/* -------------------------- Action gating rules ------------------------- */

const A = {
  VIEW: 'view',
  EDIT: 'edit',
  DUPLICATE: 'duplicate',
  SEND_NOW: 'sendNow',
  SCHEDULE: 'schedule',
  PAUSE: 'pause',
  RESUME: 'resume',
  CANCEL: 'cancel',
  DELETE: 'delete',
  ANALYTICS: 'analytics',
  APPROVE: 'approve',
  REJECT: 'reject',
  RETRY: 'retry',
};

export const ACTION_KEYS = A;

export const STATUS_ACTIONS = {
  [CAMPAIGN_STATUSES.DRAFT]: [A.VIEW, A.EDIT, A.DUPLICATE, A.SEND_NOW, A.SCHEDULE, A.DELETE],
  [CAMPAIGN_STATUSES.PENDING_APPROVAL]: [A.VIEW, A.APPROVE, A.REJECT, A.CANCEL, A.DUPLICATE],
  [CAMPAIGN_STATUSES.APPROVED]: [A.VIEW, A.SEND_NOW, A.SCHEDULE, A.EDIT, A.DELETE, A.DUPLICATE],
  [CAMPAIGN_STATUSES.SCHEDULED]: [A.VIEW, A.PAUSE, A.CANCEL, A.DUPLICATE],
  [CAMPAIGN_STATUSES.SENDING]: [A.VIEW, A.PAUSE, A.CANCEL],
  [CAMPAIGN_STATUSES.PAUSED]: [A.VIEW, A.RESUME, A.CANCEL],
  [CAMPAIGN_STATUSES.SENT]: [A.VIEW, A.ANALYTICS, A.DUPLICATE],
  [CAMPAIGN_STATUSES.CANCELLED]: [A.VIEW, A.DUPLICATE, A.DELETE],
  [CAMPAIGN_STATUSES.FAILED]: [A.VIEW, A.RETRY, A.DUPLICATE, A.DELETE],
};

export function getStatusActions(status) {
  return STATUS_ACTIONS[status] || [A.VIEW];
}

export function getStatusTone(status) {
  return CAMPAIGN_STATUS_TONES[status] || 'slate';
}

export default CAMPAIGN_STATUSES;
