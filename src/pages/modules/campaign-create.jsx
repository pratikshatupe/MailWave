/**
 * campaign-create.jsx
 *
 * Hosts the campaign wizard in create / edit mode. Reads / writes
 * through the campaign service so the entire flow persists to
 * localStorage and survives a refresh.
 *
 * Routes:
 *   /app/campaigns/create
 *   /app/campaigns/:id/edit
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Toast from '../../components/ui/Toast.jsx';
import CampaignWizard from '../../components/campaigns/campaign-wizard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import {
  CAMPAIGN_STATUSES,
  SCHEDULE_OPTIONS,
} from '../../config/campaign-status.js';
import {
  getCampaignById,
  createCampaign,
  updateCampaign,
  sendCampaignNow,
  scheduleCampaign,
  submitForApproval,
} from '../../services/campaign-service.js';

const APPROVAL_WORKFLOW_KEY = 'mailwave_approval_workflow_enabled';
function approvalEnabled() {
  try {
    return window.localStorage.getItem(APPROVAL_WORKFLOW_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function CampaignCreate() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = useMemo(() => (id ? getCampaignById(id) : null), [id]);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && !editing) {
      // Campaign was deleted in another tab — redirect to the list.
      navigate('/app/campaigns', { replace: true });
    }
  }, [id, editing, navigate]);

  if (id && !editing) return null;

  // Editing is only allowed for Draft, Approved and Failed campaigns per
  // spec; anything else we redirect back to the details page.
  const editableStatuses = new Set([
    CAMPAIGN_STATUSES.DRAFT,
    CAMPAIGN_STATUSES.APPROVED,
    CAMPAIGN_STATUSES.FAILED,
  ]);
  if (editing && !editableStatuses.has(editing.status)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cannot edit campaign"
          description="Cancel or pause the campaign before editing it."
          icon={Mail}
        />
        <button
          type="button"
          onClick={() => navigate(`/app/campaigns/${editing.id}`)}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
        >
          Back to campaign
        </button>
      </div>
    );
  }

  const tenantId = user?.tenantId;
  const organisationName =
    user?.tenantId === 'platform' ? 'Platform' : user?.organisationName || '';

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function buildInitial() {
    if (!editing) return null;
    // Map the persisted record back onto the wizard's shape.
    const scheduleOption = editing.scheduledAt
      ? SCHEDULE_OPTIONS.SCHEDULE_LATER
      : SCHEDULE_OPTIONS.DRAFT;
    return {
      ...editing,
      scheduleOption,
      scheduledAt: editing.scheduledAt
        ? new Date(editing.scheduledAt).toISOString().slice(0, 16)
        : '',
    };
  }

  async function handleSaveDraft(values) {
    setSaving(true);
    const payload = {
      ...values,
      status: CAMPAIGN_STATUSES.DRAFT,
      scheduledAt: null,
      tenantId,
      organisationName,
      createdBy: user?.email || user?.emailId,
    };
    let result;
    if (editing) {
      result = updateCampaign(editing.id, payload);
      showToast('success', 'Campaign updated successfully.');
    } else {
      result = createCampaign(payload, { tenantId, organisationName, createdBy: payload.createdBy });
      showToast('success', 'Campaign created successfully.');
    }
    setSaving(false);
    if (result) navigate(`/app/campaigns/${result.id}`);
  }

  async function handleSendNow(values) {
    setSaving(true);
    const payload = {
      ...values,
      status: CAMPAIGN_STATUSES.APPROVED,
      scheduledAt: null,
      tenantId,
      organisationName,
      createdBy: user?.email || user?.emailId,
    };
    let saved;
    if (editing) saved = updateCampaign(editing.id, payload);
    else
      saved = createCampaign(payload, { tenantId, organisationName, createdBy: payload.createdBy });
    if (!saved) {
      setSaving(false);
      return;
    }
    showToast('success', editing ? 'Campaign updated successfully.' : 'Campaign created successfully.');
    try {
      await sendCampaignNow(saved.id);
      showToast('success', 'Campaign sent successfully.');
    } catch {
      showToast('error', 'Failed to send campaign.');
    }
    setSaving(false);
    navigate(`/app/campaigns/${saved.id}`);
  }

  async function handleSchedule(values) {
    setSaving(true);
    const scheduledIso = new Date(values.scheduledAt).toISOString();
    const payload = {
      ...values,
      status: CAMPAIGN_STATUSES.APPROVED,
      scheduledAt: scheduledIso,
      tenantId,
      organisationName,
      createdBy: user?.email || user?.emailId,
    };
    let saved;
    if (editing) saved = updateCampaign(editing.id, payload);
    else
      saved = createCampaign(payload, { tenantId, organisationName, createdBy: payload.createdBy });
    if (!saved) {
      setSaving(false);
      return;
    }
    showToast('success', editing ? 'Campaign updated successfully.' : 'Campaign created successfully.');
    // Local demo behaviour: if scheduled time is within the next minute,
    // auto-send so the user sees the simulation. Otherwise mark as
    // Scheduled.
    const inMinute = new Date(scheduledIso).getTime() - Date.now() < 60 * 1000;
    if (inMinute) {
      try {
        await sendCampaignNow(saved.id);
        showToast('success', 'Campaign sent successfully.');
      } catch {
        showToast('error', 'Failed to send campaign.');
      }
    } else {
      scheduleCampaign(saved.id, scheduledIso);
      showToast('success', 'Campaign scheduled successfully.');
    }
    setSaving(false);
    navigate(`/app/campaigns/${saved.id}`);
  }

  async function handleSubmitForApproval(values) {
    setSaving(true);
    const payload = {
      ...values,
      status: CAMPAIGN_STATUSES.DRAFT,
      scheduledAt:
        values.scheduleOption === SCHEDULE_OPTIONS.SCHEDULE_LATER
          ? new Date(values.scheduledAt).toISOString()
          : null,
      tenantId,
      organisationName,
      createdBy: user?.email || user?.emailId,
    };
    let saved;
    if (editing) saved = updateCampaign(editing.id, payload);
    else
      saved = createCampaign(payload, { tenantId, organisationName, createdBy: payload.createdBy });
    if (!saved) {
      setSaving(false);
      return;
    }
    submitForApproval(saved.id);
    showToast('success', 'Campaign submitted for approval.');
    setSaving(false);
    navigate(`/app/campaigns/${saved.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={editing ? `Edit campaign — ${editing.campaignName}` : 'Create campaign'}
        description={
          editing
            ? 'Update campaign details, audience, template or schedule.'
            : 'Walk through five steps to set up a new email campaign.'
        }
        icon={Mail}
      />

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <CampaignWizard
        initial={buildInitial() || undefined}
        tenantId={tenantId}
        role={role}
        approvalWorkflowEnabled={approvalEnabled() && role === ROLES.MARKETING_MANAGER}
        saving={saving}
        onCancel={() => navigate('/app/campaigns')}
        onSaveDraft={handleSaveDraft}
        onSendNow={handleSendNow}
        onSchedule={handleSchedule}
        onSubmitForApproval={handleSubmitForApproval}
      />
    </div>
  );
}
