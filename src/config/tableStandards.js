/**
 * tableStandards.js
 *
 * Central standards every data table must follow. DataTable reads these
 * defaults so changing one value here updates the whole product.
 */

import { LABELS, actionColumnLabel } from './labels.js';
import { PAGINATION } from './projectStandards.js';
import { EMPTY_STATES } from './messages.js';

export const TABLE = {
  pagination: {
    options: PAGINATION.options,
    defaultPageSize: PAGINATION.defaultPageSize,
    defaultPage: PAGINATION.defaultPage,
    showPageSizeSelector: true,
    showPageInfo: true,
    showRecordCount: true,
  },
  search: {
    enabled: true,
    placeholder: `${LABELS.search}…`,
    showClearIcon: true,
    debounceMs: 250,
  },
  empty: {
    noRecordsMessage: EMPTY_STATES.default,
    noSearchResultsMessage: EMPTY_STATES.search,
  },
  columns: {
    wrapText: true,
    sortable: true,
    serialNumberLabel: LABELS.serialNumber,
    actionColumn: actionColumnLabel,
  },
  actions: {
    tooltipsEnabled: true,
    destructiveColour: 'danger',
    iconButtonSize: 'sm',
  },
  rows: {
    striped: false,
    hoverHighlight: true,
    selectable: false,
  },
  dashboardStatCards: {
    clickable: true,
  },
};

export default TABLE;
