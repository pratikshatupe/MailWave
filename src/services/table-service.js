/**
 * services/table-service.js
 *
 * Frontend-only persistence layer for inline edits made through AppTable.
 *
 * Each successful inline update is stored under a per-tableKey localStorage
 * bucket so refreshes preserve the change while we are running without a
 * backend. A future Axios-backed service is a single file swap; the
 * exported signature does not need to change.
 *
 *   handleInlineUpdate(tableKey, rowId, columnKey, value, validator?)
 *     1. Run the optional validator → return { ok: false, error } on fail.
 *     2. Persist the new value to localStorage under
 *        `mailwave-table-overrides:<tableKey>`.
 *     3. Resolve with the persisted shape so callers can update local state.
 */

import { TABLE_CONFIG } from '../config/table-config.js';

const STORAGE_PREFIX = TABLE_CONFIG.inlineEdit.storageKeyPrefix;

function storageKey(tableKey) {
  return `${STORAGE_PREFIX}:${tableKey}`;
}

function isBrowser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function readAll(tableKey) {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(storageKey(tableKey));
    return raw ? JSON.parse(raw) || {} : {};
  } catch {
    return {};
  }
}

function writeAll(tableKey, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(storageKey(tableKey), JSON.stringify(value));
  } catch {
    /* quota errors are out of scope for the demo */
  }
}

/**
 * Read all persisted overrides for a table — keyed by rowId.
 * Returns: { [rowId]: { [columnKey]: value } }
 */
export function getTableOverrides(tableKey) {
  return readAll(tableKey);
}

/**
 * Apply persisted overrides on top of a fresh row array. Pure — does not
 * touch storage. Use this in module pages so reloading the page keeps any
 * inline edits visible.
 */
export function applyTableOverrides(tableKey, rows, rowKey = 'id') {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  const overrides = getTableOverrides(tableKey);
  if (!overrides || Object.keys(overrides).length === 0) return rows;
  return rows.map((row) => {
    const patch = overrides[row[rowKey]];
    return patch ? { ...row, ...patch } : row;
  });
}

/**
 * Persist an inline edit. Returns { ok, value, error }.
 *
 *   validator: (value) => '' | 'Error message.'
 */
export function handleInlineUpdate(tableKey, rowId, columnKey, value, validator) {
  if (!tableKey || !rowId || !columnKey) {
    return { ok: false, error: 'Missing table identifier.' };
  }
  if (typeof validator === 'function') {
    const err = validator(value);
    if (err) return { ok: false, error: err };
  }
  if (TABLE_CONFIG.inlineEdit.persistToLocalStorage) {
    const all = readAll(tableKey);
    const next = { ...all, [rowId]: { ...(all[rowId] || {}), [columnKey]: value } };
    writeAll(tableKey, next);
  }
  return { ok: true, value };
}

export function resetTableOverrides(tableKey) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(storageKey(tableKey));
  } catch {
    /* ignore */
  }
}

export default {
  handleInlineUpdate,
  applyTableOverrides,
  getTableOverrides,
  resetTableOverrides,
};
