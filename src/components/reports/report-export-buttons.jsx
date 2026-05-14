/**
 * report-export-buttons.jsx
 *
 * CSV + PDF buttons. PDF shows a placeholder when no library is bundled.
 */

import { useState } from 'react';
import { Download, FileDown } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Toast from '../ui/Toast.jsx';
import {
  exportReportCsv,
  exportReportPdf,
} from '../../services/report-service.js';

export default function ReportExportButtons({ reportId, allowExport = true }) {
  const [toast, setToast] = useState(null);

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function handleCsv() {
    if (!allowExport) return;
    const res = exportReportCsv(reportId);
    if (res.ok) showToast('success', 'Report exported successfully.');
    else showToast('error', res.error || 'Could not export report.');
  }

  function handlePdf() {
    if (!allowExport) return;
    const res = exportReportPdf(reportId);
    showToast(res.available ? 'success' : 'error', res.error || 'PDF export is not available in local mode.');
  }

  if (!allowExport) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <Button variant="outline" onClick={handleCsv}>
        <Download className="h-4 w-4" /> Export CSV
      </Button>
      <Button variant="ghost" onClick={handlePdf}>
        <FileDown className="h-4 w-4" /> Export PDF
      </Button>
    </div>
  );
}
