/**
 * report-details.jsx
 *
 * Read-only view of a single report. Renders the summary cards, a data
 * table (AppTable, dynamic columns based on report type) and CSV/PDF
 * export buttons.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileBarChart, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import ReportSummaryCards from '../../components/reports/report-summary-cards.jsx';
import ReportExportButtons from '../../components/reports/report-export-buttons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import { canDelete, canExport } from '../../config/permissions.js';
import {
  getReportById,
  deleteReport,
  getReportHeaders,
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

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isViewer = role === ROLES.VIEWER;
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const allowDelete = !isViewer && canDelete(role, MODULE_KEYS.REPORTS);
  const allowExport = canExport(role, MODULE_KEYS.REPORTS);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => getReportById(id), [id, tick]);

  useEffect(() => {
    if (!report) return;
    if (!isSuperAdmin && report.tenantId && report.tenantId !== user?.tenantId) {
      navigate('/app/reports', { replace: true });
    }
  }, [report, isSuperAdmin, user, navigate]);

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function confirmDelete() {
    if (!report) return;
    deleteReport(report.id);
    setDeleteOpen(false);
    showToast('success', 'Report deleted.');
    navigate('/app/reports');
  }

  const columns = useMemo(() => {
    if (!report) return [];
    const headers = getReportHeaders(report.reportType);
    return headers.map((h, idx) => ({
      key: h.key,
      label: h.label,
      priority: idx < 2 ? 1 : idx < 4 ? 2 : idx < 6 ? 3 : 4,
      truncate: h.key === 'campaignName' || h.key === 'automationName' || h.key === 'fullName' || h.key === 'emailId',
      tooltip: h.key === 'emailId',
      render: (row) => {
        const v = row[h.key];
        if (v === null || v === undefined || v === '') return '—';
        if (typeof v === 'number') return v.toLocaleString();
        if (Array.isArray(v)) return v.join(', ');
        return String(v);
      },
    }));
  }, [report]);

  if (!report) {
    return (
      <div className="space-y-6">
        <PageHeader title="Report not found" icon={FileBarChart} />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          The report could not be found or you do not have access to it.
          <div className="mt-4">
            <Button onClick={() => navigate('/app/reports')}>Back to list</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.reportName}
        description={`${report.reportType} report.`}
        icon={FileBarChart}
        eyebrow={report.status}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ReportExportButtons reportId={report.id} allowExport={allowExport} />
            {allowDelete && (
              <Button variant="ghost" onClick={() => setDeleteOpen(true)} className="text-rose-600">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/app/reports')}>
              Back to list
            </Button>
          </div>
        }
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailRow label="Report Type" value={<Badge tone="indigo">{report.reportType}</Badge>} />
          <DetailRow label="Date Range" value={fmtRange(report.dateRange)} />
          <DetailRow label="Created By" value={report.createdBy} />
          <DetailRow label="Created At" value={fmtDate(report.createdAt)} />
          <DetailRow label="Status" value={<Badge tone={STATUS_TONE[report.status] || 'slate'}>{report.status}</Badge>} />
          {isSuperAdmin && (
            <DetailRow label="Organisation" value={report.organisationName || report.tenantId || '—'} />
          )}
        </dl>
      </section>

      <ReportSummaryCards summary={report.summary} />

      <AppTable
        rows={report.rows || []}
        columns={columns}
        rowKey="__row"
        role={role}
        module={MODULE_KEYS.REPORTS}
        searchable={false}
        showSerial
        actions={[]}
        inlineEditDisabled
        empty="No records found."
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete report"
        description={`Delete ${report.reportName}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800 dark:text-slate-100">{value || '—'}</dd>
    </div>
  );
}
