/**
 * table-utils.js
 *
 * Central helpers for the AppTable system. The display-mode decision
 * lives here so every place in the project that needs to ask "should
 * this render as a table or as cards?" gets the same answer.
 *
 * Rules (single source of truth — all tables in the product follow this):
 *   - Mobile and tablet (viewport < laptop breakpoint) → cards.
 *   - Laptop, desktop and large desktop → table. ALWAYS.
 *   - On laptop/desktop, wide tables fit by hiding lower-priority columns
 *     and compacting padding — not by switching to cards.
 *   - Sidebar-open / narrow container does NOT force cards. Desktop and
 *     laptop must show a table even when their measured container is
 *     narrower than the natural table width.
 */
import {
  TABLE_BREAKPOINTS,
  COLUMN_PRIORITY,
  getBreakpoint,
  isColumnVisible,
  getVisiblePriorities,
} from '../config/table-responsive-config.js';

const DEFAULT_MIN_COLUMN_WIDTH = 140;
const DEFAULT_ACTIONS_WIDTH = 120;
const DEFAULT_SERIAL_WIDTH = 64;
const DEFAULT_SELECT_WIDTH = 44;

/**
 * Parse a width style value ('160px', 160, '8rem', '15%') into pixels.
 * Falls back to defaultWidth when the value cannot be parsed.
 */
export function parseWidthPx(value, defaultWidth = DEFAULT_MIN_COLUMN_WIDTH) {
  if (value === null || value === undefined) return defaultWidth;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

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
 * Estimate the natural width a column needs.
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
 * Sum up the required table width, including selection, serial and actions.
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

  for (const column of columns) {
    total += estimateColumnWidth(column);
  }

  if (actionsCount > 0) {
    total += Math.max(DEFAULT_ACTIONS_WIDTH, actionsCount * 36 + 24);
  }

  return total;
}

/**
 * Single source of truth for table vs cards decision.
 *
 * Returns true  = render cards.
 * Returns false = render table.
 *
 * Cards are rendered ONLY when the viewport is below the laptop
 * breakpoint (true mobile / tablet). Desktop and laptop always render
 * the table — wide tables are made to fit by hiding lower-priority
 * columns and compacting padding, never by switching to cards.
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

  // Mobile and tablet only should use cards.
  if (vw > 0 && vw < TABLE_BREAKPOINTS.laptop.min) {
    return true;
  }

  // Desktop and laptop should always use table.
  return false;
}

export function getCurrentBreakpoint(viewportWidth) {
  return getBreakpoint(Number.isFinite(viewportWidth) ? viewportWidth : 0);
}

/**
 * Given a list of columns and the current viewport, return the subset
 * that should actually render in the desktop/laptop table. Drops columns
 * whose priority falls outside the breakpoint's visible-priority set so
 * the table fits the container without horizontal scroll and without
 * having to flip to a card layout.
 */
export function getVisibleColumnsForBreakpoint(columns = [], viewportWidth) {
  if (!Array.isArray(columns) || columns.length === 0) return [];
  const bp = getBreakpoint(Number.isFinite(viewportWidth) ? viewportWidth : 0);
  return columns.filter((c) => isColumnVisible(c, bp));
}

export { getVisiblePriorities };

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
  getVisibleColumnsForBreakpoint,
  TABLE_UTIL_DEFAULTS,
};
