/**
 * table-utils.js
 *
 * Central helpers for the AppTable system. The display-mode decision
 * lives here so every place in the project that needs to ask "should
 * this render as a table or as cards?" gets the same answer.
 *
 * Rules (from the product spec):
 *   - Mobile / tablet always renders cards.
 *   - Laptop and desktop render the table only when the available
 *     container width fits the required table width.
 *   - If there are more than 7 visible columns and the viewport is
 *     below 1440px, render cards (avoid cramming columns into a row).
 *   - Sidebar-open / narrow container automatically forces cards because
 *     we measure the container, not the viewport.
 */

import {
  TABLE_BREAKPOINTS,
  COLUMN_PRIORITY,
  getBreakpoint,
} from '../config/table-responsive-config.js';

const DEFAULT_MIN_COLUMN_WIDTH = 140;
const DEFAULT_ACTIONS_WIDTH = 140;
const DEFAULT_SERIAL_WIDTH = 64;
const DEFAULT_SELECT_WIDTH = 44;

/**
 * Parse a width style value ('160px', 160, '8rem', '15%') into pixels.
 * Falls back to defaultWidth when the value cannot be parsed (e.g. '%').
 */
export function parseWidthPx(value, defaultWidth = DEFAULT_MIN_COLUMN_WIDTH) {
  if (value === null || value === undefined) return defaultWidth;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const str = String(value).trim();
  if (str.endsWith('px')) {
    const n = Number.parseFloat(str);
    return Number.isFinite(n) ? n : defaultWidth;
  }
  if (str.endsWith('rem')) {
    const n = Number.parseFloat(str);
    return Number.isFinite(n) ? n * 16 : defaultWidth;
  }
  const n = Number.parseFloat(str);
  return Number.isFinite(n) ? n : defaultWidth;
}

/**
 * Estimate the natural width a column needs. Honours explicit width,
 * minWidth, and falls back to a per-priority default. Used by
 * shouldRenderCards to compare against the available container width.
 */
export function estimateColumnWidth(column) {
  if (!column) return DEFAULT_MIN_COLUMN_WIDTH;
  if (column.width) return parseWidthPx(column.width);
  if (column.minWidth) return parseWidthPx(column.minWidth);
  switch (column.priority) {
    case COLUMN_PRIORITY.CRITICAL:
      return 180;
    case COLUMN_PRIORITY.HIGH:
      return 150;
    case COLUMN_PRIORITY.LOW:
      return 110;
    default:
      return 140;
  }
}

/**
 * Sum up the natural required width of a column set, including any
 * structural columns (selection checkbox, serial number, actions).
 */
export function computeRequiredTableWidth(columns = [], extras = {}) {
  const {
    includeSelection = false,
    includeSerial = false,
    actionsCount = 0,
  } = extras;
  let total = 0;
  if (includeSelection) total += DEFAULT_SELECT_WIDTH;
  if (includeSerial) total += DEFAULT_SERIAL_WIDTH;
  for (const c of columns) total += estimateColumnWidth(c);
  if (actionsCount > 0) {
    total += Math.max(DEFAULT_ACTIONS_WIDTH, actionsCount * 36 + 24);
  }
  return total;
}

/**
 * Single source of truth for the table-vs-cards decision.
 *
 *   containerWidth   measured width of the table wrapper (ResizeObserver)
 *   viewportWidth    window.innerWidth, used for breakpoint checks
 *   requiredWidth    output of computeRequiredTableWidth
 *   visibleColumns   used for the >7 cols + < 1440px rule
 *   displayMode      'auto' (default), 'table', or 'cards'
 *
 * Returns true → render the card grid, false → render the table.
 */
export function shouldRenderCards({
  containerWidth,
  viewportWidth,
  requiredWidth,
  visibleColumns = [],
  displayMode = 'auto',
} = {}) {
  if (displayMode === 'cards') return true;
  if (displayMode === 'table') return false;

  const vw = Number.isFinite(viewportWidth) ? viewportWidth : 0;
  const cw = Number.isFinite(containerWidth) ? containerWidth : 0;
  const rw = Number.isFinite(requiredWidth) ? requiredWidth : 0;

  // Mobile + tablet: always cards.
  if (vw > 0 && vw < TABLE_BREAKPOINTS.laptop.min) return true;

  // Many columns on a narrow viewport: cards.
  if (vw > 0 && vw < 1440 && visibleColumns.length > 7) return true;

  // Container too narrow to host the table: cards.
  if (cw > 0 && rw > 0 && cw < rw) return true;

  return false;
}

export function getCurrentBreakpoint(viewportWidth) {
  return getBreakpoint(Number.isFinite(viewportWidth) ? viewportWidth : 0);
}

export const TABLE_UTIL_DEFAULTS = {
  DEFAULT_MIN_COLUMN_WIDTH,
  DEFAULT_ACTIONS_WIDTH,
  DEFAULT_SERIAL_WIDTH,
  DEFAULT_SELECT_WIDTH,
};

export default {
  parseWidthPx,
  estimateColumnWidth,
  computeRequiredTableWidth,
  shouldRenderCards,
  getCurrentBreakpoint,
  TABLE_UTIL_DEFAULTS,
};
