/**
 * table-responsive-config.js
 *
 * Single source of truth for the responsive table system. Any breakpoint,
 * priority or column visibility rule used by AppTable lives here so all
 * tables in the project respond to one change.
 */

export const TABLE_BREAKPOINTS = {
  mobile: { min: 0, max: 639 },
  tablet: { min: 640, max: 1023 },
  laptop: { min: 1024, max: 1365 },
  desktop: { min: 1366, max: 1919 },
  largeDesktop: { min: 1920, max: Infinity },
};

export const COLUMN_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];

/**
 * Which priorities are shown at each breakpoint. Anything outside the list
 * collapses into the "More Details" accordion.
 */
export const VISIBLE_PRIORITIES = {
  mobile: ['critical'],
  tablet: ['critical', 'high'],
  laptop: ['critical', 'high', 'medium'],
  desktop: ['critical', 'high', 'medium', 'low'],
  largeDesktop: ['critical', 'high', 'medium', 'low'],
};

export const TABLE_LAYOUT = {
  mobile: 'card',
  tablet: 'card',
  laptop: 'card',   // sidebar + laptop viewport → cards prevent horizontal scroll
  desktop: 'table',
  largeDesktop: 'table',
};

export function getBreakpoint(width) {
  if (width < TABLE_BREAKPOINTS.mobile.max + 1) return 'mobile';
  if (width <= TABLE_BREAKPOINTS.tablet.max) return 'tablet';
  if (width <= TABLE_BREAKPOINTS.laptop.max) return 'laptop';
  if (width <= TABLE_BREAKPOINTS.desktop.max) return 'desktop';
  return 'largeDesktop';
}

export function getLayoutForBreakpoint(bp) {
  return TABLE_LAYOUT[bp] || 'table';
}

export function getVisiblePriorities(bp) {
  return VISIBLE_PRIORITIES[bp] || VISIBLE_PRIORITIES.desktop;
}

/**
 * Decide whether a column should render at the current breakpoint, given
 * its `priority` and optional explicit `showOnMobile`/`showOnTablet`/
 * `showOnDesktop` overrides.
 */
export function isColumnVisible(column, breakpoint) {
  if (!column) return false;
  if (breakpoint === 'mobile' && column.showOnMobile === false) return false;
  if (breakpoint === 'mobile' && column.showOnMobile === true) return true;
  if (breakpoint === 'tablet' && column.showOnTablet === false) return false;
  if (breakpoint === 'tablet' && column.showOnTablet === true) return true;
  if (
    (breakpoint === 'laptop' ||
      breakpoint === 'desktop' ||
      breakpoint === 'largeDesktop') &&
    column.showOnDesktop === false
  ) {
    return false;
  }
  const allowed = getVisiblePriorities(breakpoint);
  return allowed.includes(column.priority || COLUMN_PRIORITY.MEDIUM);
}

export default {
  TABLE_BREAKPOINTS,
  COLUMN_PRIORITY,
  PRIORITY_ORDER,
  VISIBLE_PRIORITIES,
  TABLE_LAYOUT,
  getBreakpoint,
  getLayoutForBreakpoint,
  getVisiblePriorities,
  isColumnVisible,
};