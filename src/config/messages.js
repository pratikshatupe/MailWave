/**
 * messages.js
 *
 * Central messages: success, error, confirmation, empty state.
 * Every message MUST end with a full stop.
 * Error messages MUST be field-specific.
 */

import { LABELS } from './labels.js';

export const SUCCESS_MESSAGES = {
  recordCreated: 'Record created successfully.',
  recordUpdated: 'Record updated successfully.',
  recordDeleted: 'Record deleted successfully.',
  formSubmitted: 'Form submitted successfully.',
  enquirySubmitted: 'Enquiry submitted successfully.',
  loggedIn: 'Logged in successfully.',
  loggedOut: 'Logged out successfully.',
  passwordChanged: 'Password changed successfully.',
  passwordReset: 'Password reset successfully.',
  emailSent: 'Email sent successfully.',
  settingsSaved: 'Settings saved successfully.',
  profileUpdated: 'Profile updated successfully.',
  copied: 'Copied to clipboard.',
};

export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorised to perform this action.',
  sessionExpired: 'Your session has expired. Please log in again.',
  invalidCredentials: 'Invalid Email ID or Password.',
  invalidEmailId: 'Enter a valid Email ID.',
  invalidContactNumber: 'Enter a valid Contact Number.',
  contactNumberRequired: 'Contact Number is required.',
  passwordRequired: 'Password is required.',
  passwordWeak:
    'Password must contain at least 8 characters with uppercase, lowercase, number, and special character.',
  passwordMismatch: 'Confirm Password must match Password.',
  confirmPasswordMismatch: 'Confirm Password must match Password.',
  newPasswordSame: 'New Password must not be the same as Current Password.',
  newPasswordSameAsCurrent: 'New Password must not be the same as Current Password.',
  termsRequired: 'You must agree to the Terms of Service and Privacy Policy.',
  whitespaceOnly: 'This value cannot be empty.',
  noRecords: 'No records found.',
};

export const EMPTY_STATES = {
  default: 'No records found.',
  search: 'No results match your search.',
  campaigns: 'No campaigns yet. Create your first campaign to get started.',
  templates: 'No templates yet. Create a template to begin.',
  contacts: 'No contacts yet. Import or add contacts to begin.',
  segments: 'No segments yet.',
  automations: 'No automations yet.',
  notifications: 'You are all caught up.',
  reports: 'No reports available.',
};

export const CONFIRM_MESSAGES = {
  delete: (recordName = 'this record') =>
    `Are you sure you want to delete ${recordName}?`,
  archive: (recordName = 'this record') =>
    `Are you sure you want to archive ${recordName}?`,
  logout: 'Are you sure you want to log out?',
  cancelChanges: 'Discard unsaved changes?',
  publish: (recordName = 'this campaign') =>
    `Are you sure you want to publish ${recordName}?`,
};

/* ------------------------ Message generator helpers ------------------------ */

function ensureStop(text) {
  if (!text) return text;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function required(fieldLabel) {
  return ensureStop(`${fieldLabel} is required`);
}

export function invalid(fieldLabel) {
  return ensureStop(`Enter a valid ${fieldLabel}`);
}

export function minLength(fieldLabel, min) {
  return ensureStop(`${fieldLabel} must be at least ${min} characters`);
}

export function maxLength(fieldLabel, max) {
  return ensureStop(`${fieldLabel} must be at most ${max} characters`);
}

export function lettersOnly(fieldLabel) {
  return ensureStop(`${fieldLabel} must contain only letters and spaces`);
}

export function noNumbersOrSpecial(fieldLabel) {
  return lettersOnly(fieldLabel);
}

export function digitsOnly(fieldLabel) {
  return ensureStop(`${fieldLabel} must contain digits only`);
}

export function numericOnly(fieldLabel) {
  return digitsOnly(fieldLabel);
}

export function negativeNotAllowed(fieldLabel) {
  return ensureStop(`${fieldLabel} must be a valid positive number`);
}

export function dropdownRequired(fieldLabel) {
  return ensureStop(`Please select a valid ${fieldLabel}`);
}

export function exactLength(fieldLabel, len) {
  return ensureStop(`${fieldLabel} must be ${len} digits`);
}

export function startsWith(fieldLabel, prefix) {
  return ensureStop(`${fieldLabel} must start with ${prefix}`);
}

export function created(entityName) {
  return ensureStop(`${entityName} created successfully`);
}

export function updated(entityName) {
  return ensureStop(`${entityName} updated successfully`);
}

export function deleted(entityName) {
  return ensureStop(`${entityName} deleted successfully`);
}

export function submitted(entityName) {
  return ensureStop(`${entityName} submitted successfully`);
}

export function deleteConfirm(entityName, recordName) {
  const subject = recordName ? `${entityName} "${recordName}"` : `this ${entityName}`;
  return `Are you sure you want to delete ${subject}?`;
}

/* Common fixed messages used across forms. */
export const invalidEmailId = ERROR_MESSAGES.invalidEmailId;
export const invalidContactNumber = ERROR_MESSAGES.invalidContactNumber;
export const passwordWeak = ERROR_MESSAGES.passwordWeak;
export const confirmPasswordMismatch = ERROR_MESSAGES.confirmPasswordMismatch;
export const newPasswordSame = ERROR_MESSAGES.newPasswordSame;
export const termsRequired = ERROR_MESSAGES.termsRequired;

/* Convenience for the most common required field messages. */
export const REQUIRED = {
  emailId: required(LABELS.emailId),
  password: required(LABELS.password),
  contactNumber: required(LABELS.contactNumber),
  fullName: required(LABELS.fullName),
  firstName: required(LABELS.firstName),
  lastName: required(LABELS.lastName),
  country: required(LABELS.country),
  state: required(LABELS.state),
  city: required(LABELS.city),
  postalCode: required(LABELS.postalCode),
};

export default {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  EMPTY_STATES,
  CONFIRM_MESSAGES,
  REQUIRED,
  required,
  invalid,
  minLength,
  maxLength,
  lettersOnly,
  noNumbersOrSpecial,
  digitsOnly,
  numericOnly,
  negativeNotAllowed,
  dropdownRequired,
  exactLength,
  startsWith,
  created,
  updated,
  deleted,
  submitted,
  deleteConfirm,
  invalidEmailId,
  invalidContactNumber,
  passwordWeak,
  confirmPasswordMismatch,
  newPasswordSame,
  termsRequired,
};
