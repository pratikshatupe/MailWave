/**
 * campaign-details.jsx
 *
 * Single campaign detail view. Shows the metadata, audience summary,
 * template preview, schedule and activity timeline. Action buttons are
 * gated by the central role + status rules in
 * components/campaigns/campaign-action-buttons.jsx so they stay aligned
 * with the list page.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Users,
  CalendarClock,
  ClipboardCheck,
  LayoutTemplate,
  BarChart3,
  Activity,
} from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import Toast from '../../components/ui/Toast.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import CampaignStatusBadge from '../../components/campaigns/campaign-status-badge.jsx';
import CampaignActionButtons from '../../components/campaigns/campaign-action-buttons.jsx';
import CampaignMetrics from '../../components/campaigns/campaign-metrics.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import {
  AUDIENCE_TYPE_LABELS,
  ACTION_KEYS,
  CAMPAIGN_STATUSES,
} from '../../config/campaign-status.js';
import { canDelete } from '../../config/permissions.js';
import { MODULE_KEYS } from '../../config/modules.js';

import {
  getCampaignById,
  getTemplatesForTenant,
  getCampaignAuditLogs,
  deleteCampaign,
  duplicateCampaign,
  sendCampaignNow,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  approveCampaign,
  rejectCampaign,
  retryCampaign,
} from '../../services/campaign-service.js';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Mail },
  { key: 'audience', label: 'Audience', icon: Users },
  { key: 'template', label: 'Template', icon: LayoutTemplate },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'activity', label: 'Activity', icon: Activity },
];

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Row({ label, value, className = '' }) {
  return (
    <div className={`grid gap-1 sm:grid-cols-3 ${className}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="sm:col-span-2 text-sm text-slate-800 dark:text-slate-200">
        {value || <span className="text-slate-400 dark:text-slate-500">—</span>}
      </div>
    </div>
  );
}

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const campaign = useMemo(() => getCampaignById(id), [id, tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const templates = useMemo(
    () => getTemplatesForTenant(campaign?.tenantId),
    [campaign?.tenantId, tick]
  );
  const template = useMemo(
    () => templates.find((t) => t.id === campaign?.templateId) || null,
    [templates, campaign?.templateId]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const auditLogs = useMemo(
    () => getCampaignAuditLogs(campaign?.tenantId).filter((l) => l.entity === `campaign:${id}`),
    [id, campaign?.tenantId, tick]
  );

  useEffect(() => {
    if (!campaign) {
      navigate('/app/campaigns', { replace: true });
    }
  }, [campaign, navigate]);

  if (!campaign) return null;

  const allowDeleteOption = canDelete(role, MODULE_KEYS.CAMPAIGNS);

  function refresh() {
    setTick((t) => t + 1);
  }
  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  async function handleAction(key, c) {
    if (key === ACTION_KEYS.VIEW) return;
    if (key === ACTION_KEYS.EDIT) {
      navigate(`/app/campaigns/${c.id}/edit`);
      return;
    }
    if (key === ACTION_KEYS.ANALYTICS) {
      navigate(`/app/campaigns/${c.id}/analytics`);
      return;
    }
    if (key === ACTION_KEYS.DUPLICATE) {
      const copy = duplicateCampaign(c.id);
      refresh();
      if (copy) {
        showToast('success', 'Campaign duplicated successfully.');
        navigate(`/app/campaigns/${copy.id}`);
      }
      return;
    }
    if (key === ACTION_KEYS.SEND_NOW) {
      try {
        await sendCampaignNow(c.id);
        showToast('success', 'Campaign sent successfully.');
      } catch {
        showToast('error', 'Failed to send campaign.');
      }
      refresh();
      return;
    }
    if (key === ACTION_KEYS.SCHEDULE) {
      navigate(`/app/campaigns/${c.id}/edit`);
      return;
    }
    if (key === ACTION_KEYS.PAUSE) {
      pauseCampaign(c.id);
      refresh();
      showToast('success', 'Campaign paused successfully.');
      return;
    }
    if (key === ACTION_KEYS.RESUME) {
      const result = resumeCampaign(c.id);
      if (result instanceof Promise) await result;
      refresh();
      showToast('success', 'Campaign resumed successfully.');
      return;
    }
    if (key === ACTION_KEYS.CANCEL) {
      cancelCampaign(c.id);
      refresh();
      showToast('success', 'Campaign cancelled successfully.');
      return;
    }
    if (key === ACTION_KEYS.DELETE) {
      setDeleteOpen(true);
      return;
    }
    if (key === ACTION_KEYS.RETRY) {
      retryCampaign(c.id);
      refresh();
      showToast('success', 'Campaign moved back to Draft. Update and retry.');
      return;
    }
    if (key === ACTION_KEYS.APPROVE) {
      approveCampaign(c.id, '', user?.email || user?.emailId);
      refresh();
      showToast('success', 'Campaign approved successfully.');
      return;
    }
    if (key === ACTION_KEYS.REJECT) {
      setRejectOpen(true);
    }
  }

  function confirmDelete() {
    deleteCampaign(campaign.id);
    setDeleteOpen(false);
    showToast('success', 'Campaign deleted successfully.');
    navigate('/app/campaigns');
  }
  function confirmReject() {
    rejectCampaign(campaign.id, '', user?.email || user?.emailId);
    setRejectOpen(false);
    refresh();
    showToast('success', 'Campaign rejected successfully.');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/app/campaigns')}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to campaigns
        </button>
      </div>

      <PageHeader
        title={campaign.campaignName}
        description={campaign.subjectLine}
        icon={Mail}
        actions={
          <CampaignActionButtons
            campaign={campaign}
            role={role}
            onAction={handleAction}
            options={{ canDelete: allowDeleteOption }}
            size="md"
          />
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <CampaignStatusBadge status={campaign.status} />
        <Badge tone="indigo">{campaign.campaignType}</Badge>
        {campaign.approvalStatus && campaign.approvalStatus !== 'none' && (
          <Badge tone="amber">
            <ClipboardCheck className="h-3 w-3" /> Approval: {campaign.approvalStatus}
          </Badge>
        )}
        {campaign.organisationName && (
          <Badge tone="slate">{campaign.organisationName}</Badge>
        )}
      </div>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Sender details">
            <Row label="Sender Name" value={campaign.senderName} />
            <Row label="Sender Email ID" value={campaign.senderEmailId} />
            <Row label="Reply To Email ID" value={campaign.replyToEmailId} />
            <Row label="Preview Text" value={campaign.previewText} />
          </Section>
          <Section title="Schedule">
            <Row label="Schedule" value={fmtDate(campaign.scheduledAt)} />
            <Row label="Sent At" value={fmtDate(campaign.sentAt)} />
            <Row label="Created At" value={fmtDate(campaign.createdAt)} />
            <Row label="Updated At" value={fmtDate(campaign.updatedAt)} />
          </Section>
          {campaign.approvalStatus && campaign.approvalStatus !== 'none' && (
            <Section title="Approval">
              <Row label="Approval Status" value={campaign.approvalStatus} />
              <Row label="Approved By" value={campaign.approvedBy} />
              <Row label="Comment" value={campaign.approvalComment} />
            </Section>
          )}
          {campaign.status === CAMPAIGN_STATUSES.SENT && campaign.metrics && (
            <Section title="Quick metrics" className="lg:col-span-2">
              <CampaignMetrics metrics={campaign.metrics} layout="compact" />
            </Section>
          )}
        </div>
      )}

      {tab === 'audience' && (
        <Section title="Audience details">
          <Row label="Audience Type" value={AUDIENCE_TYPE_LABELS[campaign.audienceType]} />
          {campaign.selectedSegmentName && (
            <Row label="Segment" value={campaign.selectedSegmentName} />
          )}
          <Row label="Recipients" value={(campaign.recipientCount || 0).toLocaleString()} />
          <Row label="Excluded" value={(campaign.excludedContactIds?.length || 0).toLocaleString()} />
          {campaign.selectedContactIds?.length > 0 && (
            <Row
              label="Selected contacts"
              value={`${campaign.selectedContactIds.length} contact(s) chosen`}
            />
          )}
        </Section>
      )}

      {tab === 'template' && (
        <Section title="Template preview">
          {template ? (
            <>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {template.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {template.category || 'Custom'} · {template.status || 'draft'}
              </div>
              {template.subject && (
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold uppercase tracking-wide text-slate-400">
                    Subject:
                  </span>{' '}
                  {template.subject}
                </div>
              )}
              <div className="mt-4 max-h-[500px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {template.htmlContent ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: template.htmlContent }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">
                    {template.textContent || 'This template has no content yet.'}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No template attached to this campaign yet.
            </p>
          )}
        </Section>
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          {campaign.status === CAMPAIGN_STATUSES.SENT ? (
            <>
              <CampaignMetrics metrics={campaign.metrics} />
              <div className="flex justify-end">
                <Button
                  onClick={() => navigate(`/app/campaigns/${campaign.id}/analytics`)}
                  type="button"
                >
                  <BarChart3 className="h-4 w-4" /> Open full analytics
                </Button>
              </div>
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Analytics will appear after the campaign is sent.
            </p>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <Section title="Activity timeline" icon={CalendarClock}>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No activity recorded yet.
            </p>
          ) : (
            <ol className="space-y-3">
              {auditLogs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                    {log.action}
                  </div>
                  <div className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                    {log.actor || 'system'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {fmtDate(log.occurredAt)}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Section>
      )}

      <ConfirmModal
        open={deleteOpen}
        title="Delete campaign"
        description={`Are you sure you want to delete campaign ${campaign.campaignName}?`}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

      <ConfirmModal
        open={rejectOpen}
        title="Reject campaign"
        description={`Reject ${campaign.campaignName}? It will move back to Draft.`}
        confirmLabel="Reject"
        variant="danger"
        onCancel={() => setRejectOpen(false)}
        onConfirm={confirmReject}
      />
    </div>
  );
}

function Section({ title, icon: Icon, className = '', children }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
