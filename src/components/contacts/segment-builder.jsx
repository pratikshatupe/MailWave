/**
 * segment-builder.jsx
 *
 * Rules builder used inside the Create / Edit Segment modal. Supports a
 * list of rules (field / operator / value) combined with AND / OR.
 * Renders a live preview count when `previewCount` is provided.
 */

import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button.jsx';
import IconButton from '../ui/IconButton.jsx';
import { SEGMENT_FIELDS, SEGMENT_OPERATORS } from '../../config/contact-fields.js';

const EMPTY_RULE = { field: 'status', operator: 'equals', value: '' };

export default function SegmentBuilder({
  rules = [],
  combinator = 'AND',
  onChange,
  previewCount,
}) {
  function update(next) {
    onChange?.({ rules: next.rules ?? rules, combinator: next.combinator ?? combinator });
  }

  function setRule(idx, patch) {
    const next = rules.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    update({ rules: next });
  }

  function addRule() {
    update({ rules: [...rules, { ...EMPTY_RULE }] });
  }

  function removeRule(idx) {
    update({ rules: rules.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Rules
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold dark:border-slate-700">
          {['AND', 'OR'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => update({ combinator: c })}
              className={`cursor-pointer px-3 py-1 transition ${
                combinator === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {rules.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No rules yet. Add a rule to define this segment.
          </div>
        )}
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
          >
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Field
              </span>
              <select
                value={rule.field}
                onChange={(e) => setRule(idx, { field: e.target.value })}
                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {SEGMENT_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Operator
              </span>
              <select
                value={rule.operator}
                onChange={(e) => setRule(idx, { operator: e.target.value })}
                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {SEGMENT_OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Value
              </span>
              <input
                type="text"
                value={rule.value || ''}
                onChange={(e) => setRule(idx, { value: e.target.value })}
                placeholder="Enter value"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <IconButton
              icon={Trash2}
              tooltip="Remove rule"
              variant="danger"
              onClick={() => removeRule(idx)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={addRule}>
          <Plus className="h-4 w-4" /> Add rule
        </Button>
        {typeof previewCount === 'number' && (
          <div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            Matches {previewCount} contact{previewCount === 1 ? '' : 's'}.
          </div>
        )}
      </div>
    </div>
  );
}
