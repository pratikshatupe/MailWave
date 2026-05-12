/**
 * validationRules.js
 *
 * Central validation rule definitions for every common field type.
 * Pair these with utils/validators.js to produce field-specific errors.
 */

import { LABELS } from './labels.js';

/* ----------------------------- Regex library ----------------------------- */

export const REGEX = {
  emailId: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  contactNumberIndia: /^[6-9]\d{9}$/,
  contactNumberInternational: /^\+?[1-9]\d{7,14}$/,
  nameOnly: /^[A-Za-z][A-Za-z\s'.-]{0,}$/,
  numericOnly: /^[0-9]+$/,
  decimal: /^\d+(\.\d{1,2})?$/,
  postalCodeIndia: /^[1-9][0-9]{5}$/,
  // 8+ chars, at least one upper, one lower, one number, one special.
  passwordStrong:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  dateDDMMYYYY: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
};

/* ----------------------------- Rule presets ------------------------------ */

export const RULES = {
  emailId: {
    required: true,
    rejectWhitespace: true,
    minLength: 5,
    maxLength: 100,
    pattern: REGEX.emailId,
    label: LABELS.emailId,
  },
  contactNumber: {
    required: true,
    rejectWhitespace: true,
    pattern: REGEX.contactNumberIndia,
    minLength: 10,
    maxLength: 15,
    label: LABELS.contactNumber,
    onlyDigits: true,
  },
  postalCode: {
    required: true,
    pattern: REGEX.postalCodeIndia,
    minLength: 6,
    maxLength: 6,
    onlyDigits: true,
    label: LABELS.postalCode,
  },
  fullName: {
    required: true,
    rejectWhitespace: true,
    pattern: REGEX.nameOnly,
    minLength: 2,
    maxLength: 60,
    rejectNumbers: true,
    rejectSpecialChars: true,
    label: LABELS.fullName,
  },
  password: {
    required: true,
    rejectWhitespace: true,
    minLength: 8,
    maxLength: 64,
    pattern: REGEX.passwordStrong,
    label: LABELS.password,
  },
  confirmPassword: {
    required: true,
    rejectWhitespace: true,
    matchField: 'password',
    label: LABELS.confirmPassword,
  },
  newPassword: {
    required: true,
    rejectWhitespace: true,
    minLength: 8,
    maxLength: 64,
    pattern: REGEX.passwordStrong,
    notSameAsField: 'currentPassword',
    label: LABELS.newPassword,
  },
  currentPassword: {
    required: true,
    label: LABELS.currentPassword,
  },
  country: {
    required: true,
    dropdown: true,
    label: LABELS.country,
  },
  state: {
    required: true,
    dropdown: true,
    label: LABELS.state,
  },
  city: {
    required: true,
    dropdown: true,
    label: LABELS.city,
  },
  date: {
    required: true,
    pattern: REGEX.dateDDMMYYYY,
    label: LABELS.date,
  },
  numeric: {
    required: false,
    pattern: REGEX.numericOnly,
    onlyDigits: true,
  },
  price: {
    required: true,
    pattern: REGEX.decimal,
    nonNegative: true,
    label: LABELS.price,
  },
  message: {
    required: false,
    maxLength: 1000,
    label: LABELS.message,
    maxRows: 8,
  },
  description: {
    required: false,
    maxLength: 2000,
    label: LABELS.description,
    maxRows: 10,
  },
  campaignName: {
    required: true,
    rejectWhitespace: true,
    minLength: 3,
    maxLength: 80,
    label: LABELS.campaignName,
  },
  templateName: {
    required: true,
    rejectWhitespace: true,
    minLength: 3,
    maxLength: 80,
    label: LABELS.templateName,
  },
  subjectLine: {
    required: true,
    rejectWhitespace: true,
    minLength: 3,
    maxLength: 150,
    label: LABELS.subjectLine,
  },
  senderName: {
    required: true,
    rejectWhitespace: true,
    minLength: 2,
    maxLength: 60,
    label: LABELS.senderName,
  },
  senderEmailId: {
    required: true,
    rejectWhitespace: true,
    pattern: REGEX.emailId,
    label: LABELS.senderEmailId,
  },
  couponCode: {
    required: true,
    minLength: 4,
    maxLength: 30,
    label: LABELS.couponCode,
  },
  referralCode: {
    required: true,
    minLength: 4,
    maxLength: 30,
    label: LABELS.referralCode,
  },
  planName: {
    required: true,
    minLength: 3,
    maxLength: 60,
    label: LABELS.planName,
  },
};

export default RULES;
