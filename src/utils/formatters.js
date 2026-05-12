/**
 * formatters.js
 *
 * Formatting helpers wired to project-wide standards.
 *
 * Rules enforced here:
 *  - Currency: ₹2,999 — no space between symbol and value, comma thousands.
 *  - Date: DD/MM/YYYY.
 *  - Time: hh:mm AM/PM (uppercase AM/PM).
 *  - Pricing period labels: "Month" / "Year" (never Mo / Yr).
 */

import { PROJECT, FORMATS } from '../config/projectStandards.js';
import { LABELS } from '../config/labels.js';
import { getRoleLabel } from '../config/roles.js';
import { MODULES } from '../config/modules.js';

function pad(n) {
  return String(n).padStart(2, '0');
}

function toDate(input) {
  if (!input) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return n.toLocaleString('en-IN');
}

export function formatCurrency(value, { symbol = PROJECT.currencySymbol } = {}) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return `${symbol}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatPercentage(value, { decimals = 0 } = {}) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return `${n.toFixed(decimals)}%`;
}

export function formatDate(value) {
  const d = toDate(value);
  if (!d) return '';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatTime(value) {
  const d = toDate(value);
  if (!d) return '';
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${pad(h)}:${m} ${ampm}`;
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return '';
  return `${formatDate(d)}, ${formatTime(d)}`;
}

export function formatRoleName(roleKey) {
  return getRoleLabel(roleKey);
}

export function formatModuleName(moduleKey) {
  return MODULES[moduleKey]?.label || '';
}

/**
 * Pricing period helper. Always returns "Month" or "Year" — never the
 * abbreviated form.
 */
export function formatPricingPeriod(period) {
  const key = String(period || '').toLowerCase();
  if (key.startsWith('y')) return FORMATS.pricingPeriod.year;
  return FORMATS.pricingPeriod.month;
}

/** Convenience: "₹2,999 / Month" */
export function formatPriceWithPeriod(value, period = 'month') {
  return `${formatCurrency(value)} / ${formatPricingPeriod(period)}`;
}

/** Initials helper used in avatars. */
export function formatInitials(name) {
  if (!name) return 'U';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const _LABELS = LABELS; // re-export for convenience in views

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatTime,
  formatDateTime,
  formatRoleName,
  formatModuleName,
  formatPricingPeriod,
  formatPriceWithPeriod,
  formatInitials,
};
