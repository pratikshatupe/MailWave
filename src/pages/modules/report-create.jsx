/**
 * report-create.jsx
 *
 * Dedicated route for creating a new report. Wraps ReportFormModal and
 * persists the result via createReport() in report-service.js.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileBarChart } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ReportFormModal from '../../components/reports/report-form-modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import { canCreate } from '../../config/permissions.js';
import { createReport } from '../../services/report-service.js';
import {
  getScopedCampaigns,
  getScopedAutomations,
  getScopedContacts,
  getOrganisationOptions,
} from '../../services/analytics-service.js';

export default function ReportCreate() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const allowCreate = canCreate(role, MODULE_KEYS.REPORTS);
  const isViewer = role === ROLES.VIEWER;

  useEffect(() => {
    if (!user) return;
    if (!allowCreate || isViewer) {
      navigate('/app/reports', { replace: true });
    }
  }, [user, allowCreate, isViewer, navigate]);

  const campaigns = useMemo(() => getScopedCampaigns(user), [user]);
  const automations = useMemo(() => getScopedAutomations(user), [user]);
  const segments = useMemo(() => {
    const contacts = getScopedContacts(user);
    return Array.from(new Set(contacts.flatMap((c) => c.segments || []))).sort();
  }, [user]);
  const organisations = useMemo(() => getOrganisationOptions(user), [user]);

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function handleSubmit(payload) {
    setSaving(true);
    try {
      const saved = createReport(payload, user);
      showToast('success', 'Report created successfully.');
      setSaving(false);
      navigate(`/app/reports/${saved.id}`);
    } catch (err) {
      setSaving(false);
      showToast('error', err?.message || 'Could not create report.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Report"
        description="Generate a performance report from your data."
        icon={FileBarChart}
        actions={
          <Button variant="ghost" onClick={() => navigate('/app/reports')}>
            Back to list
          </Button>
        }
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <ReportFormModal
        campaigns={campaigns}
        automations={automations}
        segments={segments}
        organisations={organisations}
        role={role}
        submitting={saving}
        onCancel={() => navigate('/app/reports')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
