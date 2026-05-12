/**
 * validators.js
 *
 * Reusable validation functions. Every function returns either an empty
 * string (valid) or a field-specific error message ending with a full stop.
 *
 * Pulls labels from labels.js and message generators from messages.js.
 */

import { LABELS } from '../config/labels.js';
import { REGEX, RULES } from '../config/validationRules.js';
import {
  required,
  invalid,
  minLength as minLenMsg,
  maxLength as maxLenMsg,
  lettersOnly,
  digitsOnly,
  negativeNotAllowed,
  dropdownRequired,
  exactLength,
  startsWith,
  ERROR_MESSAGES,
} from '../config/messages.js';

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

const SEQUENTIAL_DIGITS = '1234567890';

function isAllSameDigit(v) {
  return /^(\d)\1+$/.test(v);
}

function isSequentialContact(v) {
  // Reject 1234567890 and 0123456789 and the basic sequential test patterns.
  if (SEQUENTIAL_DIGITS.startsWith(v) || SEQUENTIAL_DIGITS.endsWith(v)) return true;
  if ('0123456789'.includes(v)) return true;
  return false;
}

/* ----------------------------- Primitive validators ---------------------------- */

export function validateRequired(value, label) {
  if (isBlank(value)) return required(label);
  return '';
}

export function validateEmailId(value) {
  const label = LABELS.emailId;
  if (isBlank(value)) return required(label);
  const v = String(value).trim();
  if (!REGEX.emailId.test(v)) return invalid(label);
  return '';
}
// Back-compat alias.
export const validateEmailID = validateEmailId;

export function validateContactNumber(value, countryCode = '+91') {
  const label = LABELS.contactNumber;
  if (isBlank(value)) return required(label);
  const v = String(value).trim();
  if (!/^[0-9]+$/.test(v)) return digitsOnly(label);

  if (countryCode === '+91') {
    if (v.length !== 10) return exactLength(label, 10);
    if (!/^[6-9]/.test(v)) return startsWith(label, '6, 7, 8, or 9');
    if (isAllSameDigit(v)) return ERROR_MESSAGES.invalidContactNumber;
    if (isSequentialContact(v)) return ERROR_MESSAGES.invalidContactNumber;
    if (!REGEX.contactNumberIndia.test(v)) return ERROR_MESSAGES.invalidContactNumber;
    return '';
  }
  if (!REGEX.contactNumberInternational.test(v)) return ERROR_MESSAGES.invalidContactNumber;
  return '';
}

export function validateName(value, label = LABELS.fullName) {
  if (isBlank(value)) return required(label);
  const v = String(value).trim();
  if (v.length < 2) return minLenMsg(label, 2);
  if (v.length > 60) return maxLenMsg(label, 60);
  if (!/^[A-Za-z ]+$/.test(v)) return lettersOnly(label);
  return '';
}

export function validateFullName(value) {
  return validateName(value, LABELS.fullName);
}

export function validateFirstName(value) {
  return validateName(value, LABELS.firstName);
}

export function validateLastName(value) {
  return validateName(value, LABELS.lastName);
}

export function validatePassword(value, label = LABELS.password) {
  if (isBlank(value)) return required(label);
  const v = String(value);
  if (v.length < RULES.password.minLength) return ERROR_MESSAGES.passwordWeak;
  if (v.length > RULES.password.maxLength) return maxLenMsg(label, RULES.password.maxLength);
  if (!REGEX.passwordStrong.test(v)) return ERROR_MESSAGES.passwordWeak;
  return '';
}

export function validateConfirmPassword(password, confirmPassword) {
  if (isBlank(confirmPassword)) return required(LABELS.confirmPassword);
  if (password !== confirmPassword) return ERROR_MESSAGES.confirmPasswordMismatch;
  return '';
}

export function validateNewPassword(currentPassword, newPassword) {
  const baseError = validatePassword(newPassword, LABELS.newPassword);
  if (baseError) return baseError;
  if (currentPassword && currentPassword === newPassword) {
    return ERROR_MESSAGES.newPasswordSame;
  }
  return '';
}

export function validateNumber(value, label) {
  if (isBlank(value)) return required(label);
  if (!REGEX.numericOnly.test(String(value))) return digitsOnly(label);
  return '';
}

export function validatePrice(value, label = LABELS.price) {
  if (isBlank(value)) return required(label);
  const str = String(value).trim();
  if (str.startsWith('-')) return negativeNotAllowed(label);
  if (!/^\d+(\.\d{1,2})?$/.test(str)) return negativeNotAllowed(label);
  const v = Number(str);
  if (Number.isNaN(v)) return negativeNotAllowed(label);
  if (v < 0) return negativeNotAllowed(label);
  return '';
}

export function validateDate(value, label = LABELS.date) {
  if (isBlank(value)) return required(label);
  if (!REGEX.dateDDMMYYYY.test(String(value))) {
    return `${label} must be in DD/MM/YYYY format.`;
  }
  return '';
}

export function validateDropdown(value, label) {
  if (isBlank(value)) return dropdownRequired(label);
  return '';
}

export function validateMessage(
  value,
  label = LABELS.message,
  minLen = 5,
  maxLen = RULES.message.maxLength
) {
  if (isBlank(value)) return required(label);
  const v = String(value).trim();
  if (v.length < minLen) return minLenMsg(label, minLen);
  if (v.length > maxLen) return maxLenMsg(label, maxLen);
  return '';
}

export function validatePostalCode(value, label = LABELS.postalCode) {
  if (isBlank(value)) return required(label);
  if (!REGEX.postalCodeIndia.test(String(value).trim())) return invalid(label);
  return '';
}

export function validateCheckbox(value, label) {
  if (!value) return required(label);
  return '';
}

export function validateTerms(value) {
  if (!value) return ERROR_MESSAGES.termsRequired;
  return '';
}

/* ------------------------------- Form runner ------------------------------ */

/**
 * Validate a whole form. `fieldConfig` should be an object mapping field
 * names to entries from config/formFields.js (or a subset). Returns an
 * object of { fieldName: errorMessage } — empty when valid.
 */
export function validateForm(values = {}, fieldConfig = {}) {
  const errors = {};

  Object.entries(fieldConfig).forEach(([name, cfg]) => {
    if (!cfg) return;
    const value = values[name];
    const label = cfg.label || name;
    const rule = cfg.validationRule;

    let err = '';
    switch (rule) {
      case 'emailId':
      case 'senderEmailId':
        err = validateEmailId(value);
        break;
      case 'contactNumber':
        if (!cfg.required && isBlank(value)) {
          err = '';
        } else {
          err = validateContactNumber(value, values.countryCode);
        }
        break;
      case 'fullName':
        err = validateFullName(value);
        break;
      case 'firstName':
        err = validateFirstName(value);
        break;
      case 'lastName':
        err = validateLastName(value);
        break;
      case 'senderName':
        err = validateName(value, label);
        break;
      case 'password':
        err = validatePassword(value, label);
        break;
      case 'confirmPassword':
        err = validateConfirmPassword(values.password || values.newPassword, value);
        break;
      case 'newPassword':
        err = validateNewPassword(values.currentPassword, value);
        break;
      case 'currentPassword':
        err = validateRequired(value, label);
        break;
      case 'country':
      case 'state':
      case 'city':
        err = validateDropdown(value, label);
        break;
      case 'postalCode':
        err = validatePostalCode(value, label);
        break;
      case 'date':
        err = validateDate(value, label);
        break;
      case 'price':
        err = validatePrice(value, label);
        break;
      case 'message':
      case 'description':
        if (cfg.required) {
          err = validateMessage(value, label, cfg.minLength || 5, cfg.maxLength);
        } else if (!isBlank(value) && cfg.maxLength && String(value).length > cfg.maxLength) {
          err = maxLenMsg(label, cfg.maxLength);
        }
        break;
      case 'terms':
        err = validateTerms(value);
        break;
      case 'campaignName':
      case 'templateName':
      case 'subjectLine':
      case 'couponCode':
      case 'referralCode':
      case 'planName':
      default: {
        if (cfg.required) {
          err = validateRequired(value, label);
          if (!err && cfg.minLength && String(value).trim().length < cfg.minLength) {
            err = minLenMsg(label, cfg.minLength);
          }
          if (!err && cfg.maxLength && String(value).trim().length > cfg.maxLength) {
            err = maxLenMsg(label, cfg.maxLength);
          }
        }
      }
    }
    if (err) errors[name] = err;
  });

  return errors;
}

/* ------------------------------- Single-field runner --------------------------- */

/**
 * Run the appropriate validator for a single field name + value pair.
 * Used by onBlur handlers to validate live.
 */
export function validateField(name, value, cfg = {}, allValues = {}) {
  const config = { ...cfg, validationRule: cfg.validationRule || name };
  const result = validateForm({ ...allValues, [name]: value }, { [name]: config });
  return result[name] || '';
}

export default {
  validateRequired,
  validateEmailId,
  validateEmailID,
  validateContactNumber,
  validateName,
  validateFullName,
  validateFirstName,
  validateLastName,
  validatePassword,
  validateConfirmPassword,
  validateNewPassword,
  validateNumber,
  validatePrice,
  validateDate,
  validateDropdown,
  validateMessage,
  validatePostalCode,
  validateCheckbox,
  validateTerms,
  validateForm,
  validateField,
};
