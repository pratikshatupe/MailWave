/**
 * projectStandards.js
 *
 * Single source of truth for project-wide standards (Mailwave SaaS).
 * Change a value here and it propagates everywhere it is consumed.
 *
 * British English spellings ONLY: Organisation, Colour, Centre, Authorised,
 * Behaviour, Favourite, Cancelled, Analyse, Optimise, Customise, Initialise,
 * Licence, Programme. "Program" is used only for computer software.
 */

export const PROJECT = {
  name: 'Mailwave',
  fullName: 'Mailwave Email Marketing Automation',
  tagline: 'Send better email. Grow faster.',
  supportEmail: 'support@mailwave.com',
  copyrightHolder: 'Mailwave Technologies',
  locale: 'en-GB',
  currency: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata',
};

export const LANGUAGE = {
  spellingVariant: 'en-GB',
  notes:
    'Use Organisation, Colour, Centre, Authorised, Behaviour, Favourite, Cancelled, Analyse, Optimise, Customise, Initialise, Licence, Programme. Use Program only for software.',
};

export const FORMATS = {
  date: 'DD/MM/YYYY',
  dateLong: 'DD MMM YYYY',
  time: 'hh:mm A',
  dateTime: 'DD/MM/YYYY, hh:mm A',
  ampm: 'uppercase',
  currency: '₹{value}',
  percentage: '{value}%',
  pricingPeriod: { month: 'Month', year: 'Year' },
};

export const REQUIRED_FIELD_MARKER = '*';

export const PAGINATION = {
  options: [10, 20, 50, 100],
  defaultPageSize: 10,
  defaultPage: 1,
};

export const TABLE_STANDARDS = {
  pagination: PAGINATION,
  showSearch: true,
  showClearSearchIcon: true,
  showRecordCount: true,
  noRecordsMessage: 'No records found.',
  actionColumnLabelSingle: 'Action',
  actionColumnLabelMultiple: 'Actions',
  destructiveActionColour: 'danger',
  wrapColumnText: true,
  tooltipOnActionIcons: true,
};

export const FORM_STANDARDS = {
  requiredAsteriskColour: '#ef4444',
  requiredAsteriskNoSpace: true,
  showErrorBelowField: true,
  rejectWhitespaceOnly: true,
  endAllMessagesWithFullStop: true,
};

export const UI_STANDARDS = {
  pointerCursorOnClickable: true,
  visibleButtonBorder: true,
  hoverEffectOnButtons: true,
  stickyHeader: true,
  highlightActiveNav: true,
  scrollToTopButton: true,
  faqSingleOpen: true,
  footerCopyrightMarker: '©',
  footerIncludesAllRightsReserved: true,
  noBrowserAlertOrConfirm: true,
  noHorizontalScrollOnDesktop: true,
};

export const DARK_MODE_STANDARDS = {
  enabled: true,
  default: 'light',
  storageKey: 'mailwave-theme',
  toastCloseIconVisibleInDark: true,
  iconsVisibleInDark: true,
};

export const BUTTON_LABELS = {
  save: 'Save',
  update: 'Update',
  cancel: 'Cancel',
  delete: 'Delete',
  confirm: 'Confirm',
  submit: 'Submit',
  create: 'Create',
  edit: 'Edit',
  view: 'View',
  export: 'Export',
  search: 'Search',
  close: 'Close',
  back: 'Back',
  next: 'Next',
  reset: 'Reset',
  apply: 'Apply',
  send: 'Send',
};

export const ACTION_LABELS = {
  view: 'View',
  edit: 'Edit',
  delete: 'Delete',
  duplicate: 'Duplicate',
  archive: 'Archive',
  restore: 'Restore',
  approve: 'Approve',
  reject: 'Reject',
  export: 'Export',
  download: 'Download',
};

export const MESSAGE_FORMAT = {
  successSuffix: '.',
  errorSuffix: '.',
  templates: {
    created: '{entity} created successfully.',
    updated: '{entity} updated successfully.',
    deleted: '{entity} deleted successfully.',
    saved: '{entity} saved successfully.',
    submitted: '{entity} submitted successfully.',
    required: '{field} is required.',
    invalid: 'Invalid {field}.',
    deleteConfirm: 'Are you sure you want to delete {recordName}?',
  },
};

export default {
  PROJECT,
  LANGUAGE,
  FORMATS,
  REQUIRED_FIELD_MARKER,
  PAGINATION,
  TABLE_STANDARDS,
  FORM_STANDARDS,
  UI_STANDARDS,
  DARK_MODE_STANDARDS,
  BUTTON_LABELS,
  ACTION_LABELS,
  MESSAGE_FORMAT,
};
