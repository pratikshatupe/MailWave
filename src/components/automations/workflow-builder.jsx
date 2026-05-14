/**
 * workflow-builder.jsx
 *
 * Mobile-friendly workflow editor used by the Automation wizard.
 *
 * Step types supported (only these — no advanced extras):
 *   Send Email, Wait / Delay, Condition, Add Tag, Remove Tag,
 *   Update Contact Field, Exit Workflow.
 *
 * Each step card shows step type + summary + edit / delete / move
 * controls. New steps open an inline editor inside the card so the
 * builder fits a phone screen with no horizontal scroll.
 */

import { useState } from 'react';
import {
  Mail,
  Clock,
  GitBranch,
  Tag as TagIcon,
  TagsIcon,
  RefreshCcw,
  LogOut,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Check,
  X,
} from 'lucide-react';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import {
  WORKFLOW_STEP_TYPES,
  DURATION_TYPES,
  CONDITION_TYPES,
  UPDATE_CONTACT_FIELDS,
  conditionNeedsValue,
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

function newStepId() {
  return `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function blankStep(stepType) {
  const id = newStepId();
  switch (stepType) {
    case 'Send Email':
      return { id, stepType, stepName: '', config: { templateId: '' } };
    case 'Wait / Delay':
      return { id, stepType, stepName: '', config: { durationType: 'Days', durationValue: 1 } };
    case 'Condition':
      return { id, stepType, stepName: '', config: { conditionType: '', conditionValue: '' } };
    case 'Add Tag':
      return { id, stepType, stepName: '', config: { tag: '' } };
    case 'Remove Tag':
      return { id, stepType, stepName: '', config: { tag: '' } };
    case 'Update Contact Field':
      return { id, stepType, stepName: '', config: { field: '', value: '' } };
    case 'Exit Workflow':
      return { id, stepType, stepName: 'Exit', config: {} };
    default:
      return { id, stepType, stepName: '', config: {} };
  }
}

function summariseStep(step, lookups) {
  const cfg = step.config || {};
  switch (step.stepType) {
    case 'Send Email': {
      const tpl = (lookups.templates || []).find((t) => t.id === cfg.templateId);
      return tpl ? `Template: ${tpl.name}` : 'Template not selected';
    }
    case 'Wait / Delay':
      return cfg.durationValue
        ? `Wait ${cfg.durationValue} ${cfg.durationType || ''}`.trim()
        : 'Duration not set';
    case 'Condition':
      return cfg.conditionType
        ? `If ${cfg.conditionType}${cfg.conditionValue ? ` = ${cfg.conditionValue}` : ''}`
        : 'Condition not set';
    case 'Add Tag':
      return cfg.tag ? `Add tag: ${cfg.tag}` : 'Tag not selected';
    case 'Remove Tag':
      return cfg.tag ? `Remove tag: ${cfg.tag}` : 'Tag not selected';
    case 'Update Contact Field':
      return cfg.field ? `Set ${cfg.field} = ${cfg.value ?? ''}` : 'Field not set';
    case 'Exit Workflow':
      return 'Exit the workflow';
    default:
      return '';
  }
}

function StepEditor({ step, onChange, lookups }) {
  const cfg = step.config || {};
  function setCfg(patch) {
    onChange({ ...step, config: { ...cfg, ...patch } });
  }

  if (step.stepType === 'Send Email') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Step Name
          </span>
          <input
            type="text"
            value={step.stepName || ''}
            onChange={(e) => onChange({ ...step, stepName: e.target.value })}
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Template<span className="text-rose-500">*</span>
          </span>
          <select
            value={cfg.templateId || ''}
            onChange={(e) => setCfg({ templateId: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select a template…</option>
            {(lookups.templates || []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  if (step.stepType === 'Wait / Delay') {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Step Name
          </span>
          <input
            type="text"
            value={step.stepName || ''}
            onChange={(e) => onChange({ ...step, stepName: e.target.value })}
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Duration Type<span className="text-rose-500">*</span>
          </span>
          <select
            value={cfg.durationType || ''}
            onChange={(e) => setCfg({ durationType: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select…</option>
            {DURATION_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Duration Value<span className="text-rose-500">*</span>
          </span>
          <input
            type="number"
            min="1"
            value={cfg.durationValue ?? ''}
            onChange={(e) => setCfg({ durationValue: e.target.value === '' ? '' : Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
      </div>
    );
  }

  if (step.stepType === 'Condition') {
    const needsValue = conditionNeedsValue(cfg.conditionType);
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Step Name
          </span>
          <input
            type="text"
            value={step.stepName || ''}
            onChange={(e) => onChange({ ...step, stepName: e.target.value })}
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Condition Type<span className="text-rose-500">*</span>
          </span>
          <select
            value={cfg.conditionType || ''}
            onChange={(e) => setCfg({ conditionType: e.target.value, conditionValue: '' })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select…</option>
            {CONDITION_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        {needsValue && (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Condition Value<span className="text-rose-500">*</span>
            </span>
            {cfg.conditionType === 'Tag Exists' ? (
              <select
                value={cfg.conditionValue || ''}
                onChange={(e) => setCfg({ conditionValue: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Select tag…</option>
                {(lookups.tags || []).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            ) : cfg.conditionType === 'Segment Match' ? (
              <select
                value={cfg.conditionValue || ''}
                onChange={(e) => setCfg({ conditionValue: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Select segment…</option>
                {(lookups.segments || []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : cfg.conditionType === 'Link Clicked' ? (
              <select
                value={cfg.conditionValue || ''}
                onChange={(e) => setCfg({ conditionValue: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Select campaign…</option>
                {(lookups.campaigns || []).map((c) => <option key={c.id} value={c.id}>{c.campaignName || c.name}</option>)}
              </select>
            ) : cfg.conditionType === 'Subscription Status' ? (
              <select
                value={cfg.conditionValue || ''}
                onChange={(e) => setCfg({ conditionValue: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Select status…</option>
                {['subscribed', 'unsubscribed', 'bounced', 'complained', 'invalid'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={cfg.conditionValue || ''}
                onChange={(e) => setCfg({ conditionValue: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            )}
          </label>
        )}
      </div>
    );
  }

  if (step.stepType === 'Add Tag' || step.stepType === 'Remove Tag') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Step Name
          </span>
          <input
            type="text"
            value={step.stepName || ''}
            onChange={(e) => onChange({ ...step, stepName: e.target.value })}
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Tag<span className="text-rose-500">*</span>
          </span>
          {lookups.tags && lookups.tags.length > 0 ? (
            <select
              value={cfg.tag || ''}
              onChange={(e) => setCfg({ tag: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Select…</option>
              {lookups.tags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : (
            <input
              type="text"
              value={cfg.tag || ''}
              onChange={(e) => setCfg({ tag: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          )}
        </label>
      </div>
    );
  }

  if (step.stepType === 'Update Contact Field') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Step Name
          </span>
          <input
            type="text"
            value={step.stepName || ''}
            onChange={(e) => onChange({ ...step, stepName: e.target.value })}
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Field<span className="text-rose-500">*</span>
          </span>
          <select
            value={cfg.field || ''}
            onChange={(e) => setCfg({ field: e.target.value, value: '' })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select…</option>
            {UPDATE_CONTACT_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Value<span className="text-rose-500">*</span>
          </span>
          <input
            type="text"
            value={cfg.value ?? ''}
            onChange={(e) => setCfg({ value: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
      </div>
    );
  }

  // Exit Workflow has no extra fields.
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Exit Workflow ends this automation for the current contact.
    </p>
  );
}

export default function WorkflowBuilder({
  steps = [],
  onChange,
  disabled = false,
  lookups = {},
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  function commitSteps(next) {
    onChange?.(next);
  }

  function startEditingNew(stepType) {
    const s = blankStep(stepType);
    setEditingId(s.id);
    setDraft(s);
    setPickerOpen(false);
  }

  function startEditingExisting(step) {
    setEditingId(step.id);
    setDraft({ ...step, config: { ...(step.config || {}) } });
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft(null);
  }

  function saveEditing() {
    if (!draft) return;
    const exists = steps.some((s) => s.id === draft.id);
    const next = exists
      ? steps.map((s) => (s.id === draft.id ? draft : s))
      : [...steps, draft];
    commitSteps(next);
    setEditingId(null);
    setDraft(null);
  }

  function removeStep(id) {
    commitSteps(steps.filter((s) => s.id !== id));
    if (editingId === id) cancelEditing();
  }

  function moveStep(id, direction) {
    const idx = steps.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= steps.length) return;
    const next = steps.slice();
    [next[idx], next[target]] = [next[target], next[idx]];
    commitSteps(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Workflow Steps
        </h3>
        {!disabled && (
          <Button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            variant={pickerOpen ? 'ghost' : 'primary'}
          >
            <Plus className="h-4 w-4" /> Add Step
          </Button>
        )}
      </div>

      {pickerOpen && !disabled && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
            Pick a step type
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW_STEP_TYPES.map((type) => {
              const Icon = STEP_ICONS[type] || GitBranch;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => startEditingNew(type)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-200"
                >
                  <Icon className="h-4 w-4 text-indigo-500" /> {type}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {steps.length === 0 && !editingId && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No steps yet. Click <strong>Add Step</strong> to start building your workflow.
        </div>
      )}

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.stepType] || GitBranch;
          const isEditing = editingId === step.id;
          return (
            <li
              key={step.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="indigo">Step {index + 1}</Badge>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {step.stepType}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {step.stepName ? step.stepName + ' · ' : ''}
                    {summariseStep(step, lookups)}
                  </p>
                </div>
                {!disabled && !isEditing && (
                  <div className="ml-auto flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={index === 0}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      aria-label="Move up"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={index === steps.length - 1}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      aria-label="Move down"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditingExisting(step)}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      aria-label="Edit step"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10"
                      aria-label="Delete step"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {isEditing && draft && (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/5">
                  <StepEditor step={draft} onChange={setDraft} lookups={lookups} />
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={cancelEditing}>
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                    <Button type="button" onClick={saveEditing}>
                      <Check className="h-4 w-4" /> Save Step
                    </Button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Inline editor for a brand new step (not yet committed to steps) */}
      {!disabled && draft && !steps.some((s) => s.id === draft.id) && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="indigo">New step</Badge>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {draft.stepType}
            </span>
          </div>
          <StepEditor step={draft} onChange={setDraft} lookups={lookups} />
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={cancelEditing}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button type="button" onClick={saveEditing}>
              <Check className="h-4 w-4" /> Save Step
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
