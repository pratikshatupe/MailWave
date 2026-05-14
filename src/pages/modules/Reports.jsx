/**
 * Reports.jsx
 *
 * Role-aware reports list. Reads from mailwave_reports.
 */

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileBarChart,
  Plus,
  Download,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import {
  canCreate,
  canDelete,
  canExport,
} from '../../config/permissions.js';
import {
  getReports,
  deleteReport,
  exportReportCsv,
  exportReportPdf,
  REPORT_TYPES,
  REPORT_STATUS,
} from '../../services/report-service.js';

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtRange(range) {
  if (!range) return '—';
  if (range.from && range.to) return `${fmtDate(range.from)} – ${fmtDate(range.to)}`;
  if (range.from) return `From ${fmtDate(range.from)}`;
  if (range.to) return `Until ${fmtDate(range.to)}`;
  return '—';
}

const STATUS_TONE = {
  [REPORT_STATUS.READY]: 'emerald',
  [REPORT_STATUS.FAILED]: 'rose',
};

export default function Reports() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isViewer = role === ROLES.VIEWER;
  const allowCreate = !isViewer && canCreate(role, MODULE_KEYS.REPORTS);
  const allowExport = canExport(role, MODULE_KEYS.REPORTS);
  const allowDelete = !isViewer && canDelete(role, MODULE_KEYS.REPORTS);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reports = useMemo(() => getReports({ user, reportType: filterType || undefined }), [user, filterType, tick]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) =>
      [r.reportName, r.reportType, r.createdBy, r.organisationName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [reports, query]);

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function refresh() {
    setTick((t) => t + 1);
  }

  function handleExportAll() {
    if (!allowExport) return;
    if (rows.length === 0) {
      showToast('error', 'No reports to export.');
      return;
    }
    let exported = 0;
    rows.forEach((r) => {
      const res = exportReportCsv(r.id);
      if (res.ok) exported += 1;
    });
    showToast('success', `${exported} report(s) exported successfully.`);
  }

  function handleCsv(row) {
    if (!allowExport) return;
    const res = exportReportCsv(row.id);
    if (res.ok) showToast('success', 'Report exported successfully.');
    else showToast('error', res.error || 'Could not export report.');
  }

  function handlePdf(row) {
    if (!allowExport) return;
    const res = exportReportPdf(row.id);
    showToast(res.available ? 'success' : 'error', res.error || 'PDF export is not available in local mode.');
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteReport(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    showToast('success', 'Report deleted.');
  }

  const columns = useMemo(() => {
    const base = [
      {
        key: 'reportName',
        label: 'Report Name',
        priority: 1,
        truncate: true,
        render: (row) => (
          <Link
            to={`/app/reports/${row.id}`}
            className="font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
          >
            {row.reportName}
          </Link>
        ),
      },
      { key: 'reportType', label: 'Report Type', priority: 2, render: (row) => <Badge tone="indigo">{row.reportType}</Badge> },
      {
        key: '_dateRange',
        label: 'Date Range',
        priority: 3,
        render: (row) => fmtRange(row.dateRange),
      },
      { key: 'createdBy', label: 'Created By', priority: 3, truncate: true },
      { key: 'createdAt', label: 'Created At', priority: 4, width: '140px', render: (row) => fmtDate(row.createdAt) },
      {
        key: 'status',
        label: 'Status',
        priority: 1,
        render: (row) => <Badge tone={STATUS_TONE[row.status] || 'slate'}>{row.status}</Badge>,
      },
    ];
    if (isSuperAdmin) {
      base.splice(2, 0, {
        key: 'organisationName',
        label: 'Organisation',
        priority: 3,
        truncate: true,
        render: (row) => row.organisationName || row.tenantId || '—',
      });
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowExport, allowDelete, isSuperAdmin, navigate]);

  const filtersBar = (
    <div className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search reports…"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <option value="">All types</option>
        {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Create, view and export performance reports."
        icon={FileBarChart}
        eyebrow={isViewer ? 'Read only' : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {allowExport && rows.length > 0 && (
              <Button variant="ghost" onClick={handleExportAll}>
                <Download className="h-4 w-4" /> Export All
              </Button>
            )}
            {allowCreate && (
              <Button onClick={() => navigate('/app/reports/create')}>
                <Plus className="h-4 w-4" /> Create Report
              </Button>
            )}
          </div>
        }
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <AppTable
        rows={rows}
        columns={columns}
        rowKey="id"
        role={role}
        module={MODULE_KEYS.REPORTS}
        searchable={false}
        displayMode="auto"
        showSerial
        actions={['view', 'delete']}
        actionHandlers={{
          view: (row) => navigate(`/app/reports/${row.id}`),
          delete: (row) => setDeleteTarget(row),
        }}
        actionPermissions={{
          view: true,
          delete: allowDelete,
        }}
        filters={filtersBar}
        inlineEditDisabled
        mobileConfig={{
          mobileTitleKey: 'reportName',
          mobileSubtitleKey: 'reportType',
          mobileBadgeKey: 'status',
          mobileDetailKeys: isSuperAdmin
            ? ['organisationName', '_dateRange', 'createdBy', 'createdAt']
            : ['_dateRange', 'createdBy', 'createdAt'],
          mobileActionKeys: ['view', 'delete'],
        }}
        empty="No reports found."
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete report"
        description={deleteTarget ? `Delete ${deleteTarget.reportName}? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
