/**
 * automation-create.jsx
 *
 * Five-step wizard for creating or editing an automation. Mirrors the
 * spec exactly — no advanced fields.
 *
 *   1. Basic Details
 *   2. Trigger
 *   3. Audience
 *   4. Workflow Builder
 *   5. Review
 *
 * Save as Draft is available from every step. Activate Automation appears
 * only on the Review step and only when validation passes.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Workflow,
  Save,
  Zap,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import WorkflowBuilder from '../../components/automations/workflow-builder.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import { canCreate, canEdit, isReadOnly } from '../../config/permissions.js';
import {
  getAutomationById,
  createAutomation,
  updateAutomation,
  activateAutomation,
  getEligibleAutomationContacts,
  validateAutomationWorkflow,
  getTagsForTenant,
  getSegmentsForTenant,
  getTemplatesForTenant,
  getCampaignsForTenant,
  getContactsForTenant,
  TRIGGER_TYPES,
  AUDIENCE_TYPES,
  triggerNeedsValue,
  getContactFieldsForTrigger,
  AUTOMATION_STATUS,
} from '../../services/automation-service.js';

const STEPS = [
  { key: 'basic', label: 'Basic Details' },
  { key: 'trigger', label: 'Trigger' },
  { key: 'audience', label: 'Audience' },
  { key: 'workflow', label: 'Workflow' },
  { key: 'review', label: 'Review' },
];

const NAME_MIN = 3;
const NAME_MAX = 100;
const DESCRIPTION_MAX = 300;

function validateBasic(form) {
  const errors = {};
  const name = (form.automationName || '').trim();
  if (!name) errors.automationName = 'Automation Name is required.';
  else if (name.length < NAME_MIN) errors.automationName = `Automation Name minimum ${NAME_MIN} characters.`;
  else if (name.length > NAME_MAX) errors.automationName = `Automation Name maximum ${NAME_MAX} characters.`;
  if ((form.description || '').length > DESCRIPTION_MAX) {
    errors.description = `Description maximum ${DESCRIPTION_MAX} characters.`;
  }
  if ((form.description || '').trim().length === 0 && (form.description || '').length > 0) {
    errors.description = 'Whitespace only input is not allowed.';
  }
  return errors;
}

function validateTrigger(form) {
  const errors = {};
  if (!form.triggerType) errors.triggerType = 'Trigger Type is required.';
  if (form.triggerType && triggerNeedsValue(form.triggerType) && !form.triggerValue) {
    errors.triggerValue = 'Trigger Value is required.';
  }
  return errors;
}

function validateAudience(form) {
  const errors = {};
  if (!form.audienceType) errors.audienceType = 'Audience Type is required.';
  if (form.audienceType === 'Segment' && !form.audienceValue) {
    errors.audienceValue = 'Segment is required.';
  }
  if (form.audienceType === 'Tag Based' && !form.audienceValue) {
    errors.audienceValue = 'Tag is required.';
  }
  if (form.audienceType === 'Selected Contacts' && (!Array.isArray(form.audienceValue) || form.audienceValue.length === 0)) {
    errors.audienceValue = 'Select at least one contact.';
  }
  return errors;
}

const EMPTY_FORM = {
  automationName: '',
  description: '',
  triggerType: '',
  triggerValue: '',
  audienceType: '',
  audienceValue: null,
  workflowSteps: [],
};

export default function AutomationCreate() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);
  const readOnly = role === ROLES.SUPER_ADMIN || role === ROLES.VIEWER || isReadOnly(role, MODULE_KEYS.AUTOMATIONS);

  // Role gating — only allow loading if permitted.
  useEffect(() => {
    if (!user) return;
    const allowed = editing
      ? canEdit(role, MODULE_KEYS.AUTOMATIONS)
      : canCreate(role, MODULE_KEYS.AUTOMATIONS);
    if (!allowed) {
      navigate('/app/automations', { replace: true });
    }
  }, [editing, role, user, navigate]);

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const tenantId = user?.tenantId;

  useEffect(() => {
    if (!editing) return;
    const existing = getAutomationById(id);
    if (existing) {
      setForm({
        automationName: existing.automationName || '',
        description: existing.description || '',
        triggerType: existing.triggerType || '',
        triggerValue: existing.triggerValue ?? '',
        audienceType: existing.audienceType || '',
        audienceValue: existing.audienceValue ?? null,
        workflowSteps: existing.workflowSteps || [],
      });
    }
  }, [editing, id]);

  const tags = useMemo(() => getTagsForTenant(tenantId), [tenantId]);
  const segments = useMemo(() => getSegmentsForTenant(tenantId), [tenantId]);
  const templates = useMemo(() => getTemplatesForTenant(tenantId), [tenantId]);
  const campaigns = useMemo(() => getCampaignsForTenant(tenantId), [tenantId]);
  const tenantContacts = useMemo(() => getContactsForTenant(tenantId), [tenantId]);

  const audienceMetrics = useMemo(
    () =>
      getEligibleAutomationContacts({
        tenantId,
        audienceType: form.audienceType,
        audienceValue: form.audienceValue,
      }),
    [tenantId, form.audienceType, form.audienceValue]
  );

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validateAll() {
    const basic = validateBasic(form);
    const trigger = validateTrigger(form);
    const audience = validateAudience(form);
    const workflow = validateAutomationWorkflow(form.workflowSteps);
    const all = { ...basic, ...trigger, ...audience };
    if (!workflow.ok) all.workflow = workflow.errors[0];
    return all;
  }

  function validateStep(index) {
    if (index === 0) return validateBasic(form);
    if (index === 1) return validateTrigger(form);
    if (index === 2) return validateAudience(form);
    if (index === 3) {
      const res = validateAutomationWorkflow(form.workflowSteps);
      return res.ok ? {} : { workflow: res.errors[0] };
    }
    return {};
  }

  function goNext() {
    const stepErrors = validateStep(stepIndex);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      showToast('error', Object.values(stepErrors)[0]);
      return;
    }
    setErrors({});
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function persist(status) {
    const payload = {
      ...form,
      status,
      tenantId,
      createdBy: user?.email || user?.emailId,
      organisationName:
        user?.accountType === 'organisation' ? user?.fullName : undefined,
    };
    if (editing) {
      return updateAutomation(id, payload);
    }
    return createAutomation(payload);
  }

  function handleSaveDraft() {
    const basic = validateBasic(form);
    if (basic.automationName) {
      setErrors(basic);
      showToast('error', basic.automationName);
      setStepIndex(0);
      return;
    }
    setSaving(true);
    try {
      const saved = persist(AUTOMATION_STATUS.DRAFT);
      showToast('success', 'Automation saved as draft.');
      setSaving(false);
      navigate(`/app/automations/${saved.id}`);
    } catch (err) {
      setSaving(false);
      showToast('error', err?.message || 'Failed to save automation.');
    }
  }

  function handleActivate() {
    const all = validateAll();
    if (Object.keys(all).length > 0) {
      setErrors(all);
      showToast('error', Object.values(all)[0]);
      return;
    }
    setSaving(true);
    try {
      const saved = persist(AUTOMATION_STATUS.DRAFT);
      const activated = activateAutomation(saved.id);
      showToast('success', 'Automation activated successfully.');
      setSaving(false);
      navigate(`/app/automations/${activated.id}`);
    } catch (err) {
      setSaving(false);
      showToast('error', err?.message || 'Failed to activate automation.');
    }
  }

  const stepKey = STEPS[stepIndex].key;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title={editing ? 'Edit Automation' : 'Create Automation'}
        description="Define the trigger, audience and workflow for this automation."
        icon={Workflow}
        eyebrow={readOnly ? 'Read only' : `Step ${stepIndex + 1} of ${STEPS.length}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/app/automations')}>
            Back to list
          </Button>
        }
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStepIndex(i)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  current
                    ? 'border-indigo-300 bg-indigo-600 text-white shadow'
                    : done
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                      : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[10px]">
                  {i + 1}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {stepKey === 'basic' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Basic Details</h2>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Automation Name<span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                value={form.automationName}
                onChange={(e) => setField('automationName', e.target.value)}
                onBlur={() => setErrors((prev) => ({ ...prev, ...validateBasic(form) }))}
                maxLength={NAME_MAX}
                disabled={readOnly}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {errors.automationName && (
                <p className="mt-1 text-xs text-rose-600">{errors.automationName}</p>
              )}
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Description
              </span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                onBlur={() => setErrors((prev) => ({ ...prev, ...validateBasic(form) }))}
                maxLength={DESCRIPTION_MAX}
                disabled={readOnly}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{errors.description || ''}</span>
                <span>{(form.description || '').length}/{DESCRIPTION_MAX}</span>
              </div>
            </label>
          </div>
        )}

        {stepKey === 'trigger' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Trigger</h2>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Trigger Type<span className="text-rose-500">*</span>
              </span>
              <select
                value={form.triggerType}
                onChange={(e) => {
                  setField('triggerType', e.target.value);
                  setField('triggerValue', '');
                }}
                disabled={readOnly}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Select…</option>
                {TRIGGER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.triggerType && <p className="mt-1 text-xs text-rose-600">{errors.triggerType}</p>}
            </label>

            {triggerNeedsValue(form.triggerType) && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Trigger Value<span className="text-rose-500">*</span>
                </span>
                {form.triggerType === 'Tag Added' && (
                  <select
                    value={form.triggerValue || ''}
                    onChange={(e) => setField('triggerValue', e.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Select a tag…</option>
                    {tags.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
                {form.triggerType === 'Segment Joined' && (
                  <select
                    value={form.triggerValue || ''}
                    onChange={(e) => setField('triggerValue', e.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Select a segment…</option>
                    {segments.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                {(form.triggerType === 'Email Opened' || form.triggerType === 'Link Clicked') && (
                  <select
                    value={form.triggerValue || ''}
                    onChange={(e) => setField('triggerValue', e.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Select a campaign…</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.campaignName || c.name || c.id}</option>
                    ))}
                  </select>
                )}
                {form.triggerType === 'Date Based' && (
                  <input
                    type="date"
                    value={form.triggerValue || ''}
                    onChange={(e) => setField('triggerValue', e.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                )}
                {form.triggerType === 'Custom Field Updated' && (
                  <select
                    value={form.triggerValue || ''}
                    onChange={(e) => setField('triggerValue', e.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Select a contact field…</option>
                    {getContactFieldsForTrigger().map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                )}
                {errors.triggerValue && <p className="mt-1 text-xs text-rose-600">{errors.triggerValue}</p>}
              </label>
            )}

            {!triggerNeedsValue(form.triggerType) && form.triggerType && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This trigger does not need an additional value.
              </p>
            )}
          </div>
        )}

        {stepKey === 'audience' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Audience</h2>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Audience Type<span className="text-rose-500">*</span>
              </span>
              <select
                value={form.audienceType}
                onChange={(e) => {
                  setField('audienceType', e.target.value);
                  setField('audienceValue', e.target.value === 'Selected Contacts' ? [] : null);
                }}
                disabled={readOnly}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Select…</option>
                {AUDIENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.audienceType && <p className="mt-1 text-xs text-rose-600">{errors.audienceType}</p>}
            </label>

            {form.audienceType === 'Segment' && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Segment<span className="text-rose-500">*</span>
                </span>
                <select
                  value={form.audienceValue || ''}
                  onChange={(e) => setField('audienceValue', e.target.value)}
                  disabled={readOnly}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Select a segment…</option>
                  {segments.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            )}

            {form.audienceType === 'Tag Based' && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Tag<span className="text-rose-500">*</span>
                </span>
                <select
                  value={form.audienceValue || ''}
                  onChange={(e) => setField('audienceValue', e.target.value)}
                  disabled={readOnly}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Select a tag…</option>
                  {tags.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            )}

            {form.audienceType === 'Selected Contacts' && (
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Selected Contacts<span className="text-rose-500">*</span>
                </span>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  {tenantContacts.length === 0 && (
                    <p className="p-3 text-xs text-slate-500 dark:text-slate-400">
                      No contacts available in this workspace.
                    </p>
                  )}
                  {tenantContacts.map((c) => {
                    const checked = Array.isArray(form.audienceValue) && form.audienceValue.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const list = Array.isArray(form.audienceValue) ? form.audienceValue : [];
                            const next = e.target.checked
                              ? [...list, c.id]
                              : list.filter((x) => x !== c.id);
                            setField('audienceValue', next);
                          }}
                          disabled={readOnly}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 dark:text-slate-100">{c.fullName}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{c.emailId}</div>
                        </div>
                        {c.status !== 'subscribed' && (
                          <Badge tone="rose">{c.status}</Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <AlertCircle className="h-4 w-4" /> Audience summary
              </div>
              <dl className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs sm:grid-cols-4">
                <dt className="text-slate-500 dark:text-slate-400">Total contacts</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100">{audienceMetrics.total}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Eligible</dt>
                <dd className="font-semibold text-emerald-600 dark:text-emerald-300">{audienceMetrics.eligible}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Excluded</dt>
                <dd className="font-semibold text-rose-600 dark:text-rose-300">{audienceMetrics.excluded}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Final audience</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100">{audienceMetrics.finalAudience}</dd>
              </dl>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Only contacts with Subscription Status = Subscribed and Email Consent = true are eligible.
                Unsubscribed, bounced, complained and invalid contacts are excluded.
              </p>
            </div>
            {errors.audienceValue && <p className="text-xs text-rose-600">{errors.audienceValue}</p>}
          </div>
        )}

        {stepKey === 'workflow' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Workflow Builder</h2>
            <WorkflowBuilder
              steps={form.workflowSteps}
              onChange={(steps) => setField('workflowSteps', steps)}
              disabled={readOnly}
              lookups={{ tags, segments, templates, campaigns }}
            />
            {errors.workflow && (
              <p className="text-xs text-rose-600">{errors.workflow}</p>
            )}
          </div>
        )}

        {stepKey === 'review' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Review</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryRow label="Automation Name" value={form.automationName || '—'} />
              <SummaryRow label="Description" value={form.description || '—'} />
              <SummaryRow label="Trigger Type" value={form.triggerType || '—'} />
              <SummaryRow
                label="Trigger Value"
                value={
                  triggerNeedsValue(form.triggerType)
                    ? form.triggerValue || '—'
                    : 'Not required'
                }
              />
              <SummaryRow label="Audience Type" value={form.audienceType || '—'} />
              <SummaryRow
                label="Audience Count"
                value={`${audienceMetrics.finalAudience} eligible / ${audienceMetrics.total} total`}
              />
              <SummaryRow label="Workflow Steps" value={`${form.workflowSteps.length} step(s)`} />
              <SummaryRow
                label="Status"
                value={<Badge tone="slate">{editing ? 'Editing' : AUTOMATION_STATUS.DRAFT}</Badge>}
              />
            </dl>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Steps
              </h3>
              {form.workflowSteps.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">No steps added yet.</p>
              ) : (
                <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
                  {form.workflowSteps.map((s) => (
                    <li key={s.id}>
                      <span className="font-medium">{s.stepType}</span>
                      {s.stepName ? ` — ${s.stepName}` : ''}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {stepIndex > 0 && (
            <Button variant="ghost" onClick={goBack}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!readOnly && (
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
              <Save className="h-4 w-4" /> Save as Draft
            </Button>
          )}
          {!isLast && (
            <Button onClick={goNext}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {isLast && !readOnly && (
            <Button onClick={handleActivate} disabled={saving}>
              <Zap className="h-4 w-4" /> Activate Automation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}
