/**
 * table-config.js
 *
 * Top-level defaults for AppTable. Any value that should apply to every
 * table in the product belongs here.
 */

import { LABELS } from './labels.js';
import { PAGINATION } from './projectStandards.js';
import { EMPTY_STATES } from './messages.js';
import { COLUMN_PRIORITY } from './table-responsive-config.js';

export const TABLE_CONFIG = {
  pagination: {
    options: PAGINATION.options,
    defaultPageSize: PAGINATION.defaultPageSize,
    defaultPage: PAGINATION.defaultPage,
    showRecordCount: true,
    showPageSizeSelector: true,
    showPageNumbers: true,
  },
  search: {
    enabled: true,
    placeholder: `${LABELS.search}…`,
    debounceMs: 250,
  },
  empty: {
    noRecords: EMPTY_STATES.default,
    noSearchResults: EMPTY_STATES.search,
  },
  columns: {
    defaultPriority: COLUMN_PRIORITY.MEDIUM,
    wrapText: true,
    truncate: true,
    serialNumberLabel: LABELS.serialNumber,
  },
  inlineEdit: {
    enabled: true,
    saveOnEnter: true,
    cancelOnEscape: true,
    showHoverTrigger: true,
    persistToLocalStorage: true,
    storageKeyPrefix: 'mailwave-table-overrides',
  },
  actions: {
    tooltipsEnabled: true,
    destructiveColour: 'danger',
    iconButtonSize: 'sm',
    stickyColumn: true,
  },
  mobileCard: {
    showMoreDetailsAccordion: true,
    actionsAtBottom: true,
  },
  rows: {
    striped: false,
    hoverHighlight: true,
    selectable: false,
  },
};

export default TABLE_CONFIG;
