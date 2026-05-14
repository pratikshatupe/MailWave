/**
 * automation-details.jsx
 *
 * Read-only view of a single automation with its steps, audience and
 * lifecycle history. Action buttons render only if the role allows them.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Workflow,
  Pencil,
  Copy,
  Pause,
  Play,
  Trash2,
  Zap,
  BarChart3,
  Mail,
  Clock,
  GitBranch,
  Tag as TagIcon,
  TagsIcon,
  RefreshCcw,
  LogOut,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import { canEdit, canDelete, canManage } from '../../config/permissions.js';
import {
  getAutomationById,
  activateAutomation,
  pauseAutomation,
  resumeAutomation,
  duplicateAutomation,
  deleteAutomation,
  getEligibleAutomationContacts,
  AUTOMATION_STATUS,
} from '../../services/automation-service.js';

const STEP_ICONS = {
  'Send Email': Mail,
  'Wait / Delay': Clock,
  Condition: GitBranch,
  'Add Tag': TagIcon,
  'Remove Tag': TagsIcon,
  'Update Contact Field': RefreshCcw,
  'Exit Workflow': LogOut,
};

const STATUS_TONE = {
  Draft: 'slate',
  Active: 'emerald',
  Paused: 'amber',
  Completed: 'indigo',
  Failed: 'rose',
};

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AutomationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const automation = useMemo(() => getAutomationById(id), [id, tick]);

  // Tenant isolation: hide automations not in the user's tenant unless
  // Super Admin.
  useEffect(() => {
    if (!automation) return;
    if (role !== ROLES.SUPER_ADMIN && automation.tenantId !== user?.tenantId) {
      navigate('/app/automations', { replace: true });
    }
  }, [automation, role, user, navigate]);

  const audience = useMemo(() => {
    if (!automation) return null;
    return getEligibleAutomationContacts({
      tenantId: automation.tenantId,
      audienceType: automation.audienceType,
      audienceValue: automation.audienceValue,
    });
  }, [automation]);

  if (!automation) {
    return (
      <div className="space-y-6">
        <PageHeader title="Automation not found" icon={Workflow} />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          The automation could not be found or you do not have access to it.
          <div className="mt-4">
            <Button onClick={() => navigate('/app/automations')}>Back to list</Button>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isViewer = role === ROLES.VIEWER;
  const allowEdit = !isSuperAdmin && !isViewer && canEdit(role, MODULE_KEYS.AUTOMATIONS);
  const allowDelete = !isSuperAdmin && !isViewer && canDelete(role, MODULE_KEYS.AUTOMATIONS);
  const allowManage = !isSuperAdmin && !isViewer && canManage(role, MODULE_KEYS.AUTOMATIONS);

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function refresh() {
    setTick((t) => t + 1);
  }

  function handleActivate() {
    try {
      activateAutomation(automation.id);
      refresh();
      showToast('success', 'Automation activated successfully.');
    } catch (err) {
      showToast('error', err?.message || 'Could not activate automation.');
    }
  }
  function handlePause() {
    pauseAutomation(automation.id);
    refresh();
    showToast('success', 'Automation paused.');
  }
  function handleResume() {
    resumeAutomation(automation.id);
    refresh();
    showToast('success', 'Automation resumed.');
  }
  function handleDuplicate() {
    const copy = duplicateAutomation(automation.id);
    if (copy) {
      showToast('success', 'Automation duplicated.');
      navigate(`/app/automations/${copy.id}`);
    }
  }
  function handleDelete() {
    deleteAutomation(automation.id);
    setDeleteOpen(false);
    showToast('success', 'Automation deleted.');
    navigate('/app/automations');
  }

  const metrics = automation.metrics || {
    entered: 0,
    emailsSent: 0,
    opened: 0,
    clicked: 0,
    completed: 0,
    openRate: 0,
    clickRate: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={automation.automationName}
        description={automation.description || 'No description.'}
        icon={Workflow}
        eyebrow={automation.status}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/app/automations/${automation.id}/analytics`)}
            >
              <BarChart3 className="h-4 w-4" /> Analytics
            </Button>
            {allowEdit && (
              <Button
                variant="outline"
                onClick={() => navigate(`/app/automations/${automation.id}/edit`)}
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}
            {allowManage && automation.status === AUTOMATION_STATUS.DRAFT && (
              <Button onClick={handleActivate}>
                <Zap className="h-4 w-4" /> Activate
              </Button>
            )}
            {allowManage && automation.status === AUTOMATION_STATUS.ACTIVE && (
              <Button variant="outline" onClick={handlePause}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
            {allowManage && automation.status === AUTOMATION_STATUS.PAUSED && (
              <Button onClick={handleResume}>
                <Play className="h-4 w-4" /> Resume
              </Button>
            )}
            {allowEdit && (
              <Button variant="ghost" onClick={handleDuplicate}>
                <Copy className="h-4 w-4" /> Duplicate
              </Button>
            )}
            {allowDelete && (
              <Button
                variant="ghost"
                onClick={() => setDeleteOpen(true)}
                className="text-rose-600"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        }
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard Icon={Workflow} label="Contacts Entered" value={metrics.entered.toLocaleString()} tone="from-indigo-500 to-blue-500" />
        <StatCard Icon={Mail} label="Emails Sent" value={metrics.emailsSent.toLocaleString()} tone="from-fuchsia-500 to-pink-500" />
        <StatCard Icon={BarChart3} label="Open Rate" value={`${metrics.openRate}%`} tone="from-emerald-500 to-teal-500" />
        <StatCard Icon={BarChart3} label="Click Rate" value={`${metrics.clickRate}%`} tone="from-amber-500 to-orange-500" />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Trigger</h2>
          <dl className="mt-3 grid grid-cols-1 gap-y-2 text-sm">
            <DetailRow label="Type" value={automation.triggerType} />
            <DetailRow label="Value" value={automation.triggerValue || '—'} />
          </dl>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Audience</h2>
          <dl className="mt-3 grid grid-cols-1 gap-y-2 text-sm">
            <DetailRow label="Type" value={automation.audienceType} />
            <DetailRow
              label="Eligible / Total"
              value={audience ? `${audience.eligible} / ${audience.total}` : '—'}
            />
            <DetailRow
              label="Excluded"
              value={audience ? String(audience.excluded) : '—'}
            />
          </dl>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workflow Steps</h2>
        {(!automation.workflowSteps || automation.workflowSteps.length === 0) && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            No steps configured.
          </p>
        )}
        <ol className="mt-3 space-y-2">
          {(automation.workflowSteps || []).map((step, index) => {
            const Icon = STEP_ICONS[step.stepType] || GitBranch;
            return (
              <li
                key={step.id || index}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="indigo">Step {index + 1}</Badge>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {step.stepType}
                    </span>
                  </div>
                  {step.stepName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{step.stepName}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Activity</h2>
        <dl className="mt-3 grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
          <DetailRow label="Status" value={<Badge tone={STATUS_TONE[automation.status] || 'slate'}>{automation.status}</Badge>} />
          <DetailRow label="Created at" value={formatDate(automation.createdAt)} />
          <DetailRow label="Updated at" value={formatDate(automation.updatedAt)} />
          <DetailRow label="Activated at" value={formatDate(automation.activatedAt)} />
          <DetailRow label="Paused at" value={formatDate(automation.pausedAt)} />
          <DetailRow label="Last run at" value={formatDate(automation.lastRunAt)} />
          <DetailRow label="Created by" value={automation.createdBy || '—'} />
          {isSuperAdmin && (
            <DetailRow label="Organisation" value={automation.organisationName || automation.tenantId || '—'} />
          )}
        </dl>
      </section>

      <ConfirmModal
        open={deleteOpen}
        title="Delete automation"
        description={`Delete ${automation.automationName}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 items-start gap-3 sm:grid-cols-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="col-span-2 text-sm text-slate-800 dark:text-slate-100 sm:col-span-1">
        {value || '—'}
      </dd>
    </div>
  );
}
