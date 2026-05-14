/**
 * merge-tag-helper.jsx
 *
 * Compact list of supported merge tags. Clicking a tag invokes `onInsert`
 * with the `{{tag}}` string so the parent can paste it into the currently
 * focused text field. Used inside the builder right-panel and the HTML
 * editor sidebar.
 */

import { Sparkles, Plus } from 'lucide-react';
import { MERGE_TAGS } from '../../services/template-service.js';

export default function MergeTagHelper({ onInsert, compact = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        <Sparkles className="h-4 w-4 text-fuchsia-500" /> Merge Tags
      </div>
      {!compact && (
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Click a tag to insert it into the focused text field. They will be
          replaced with the recipient&apos;s data at send time.
        </p>
      )}
      <ul className="flex flex-wrap gap-2">
        {MERGE_TAGS.map((m) => (
          <li key={m.tag}>
            <button
              type="button"
              onClick={() => onInsert?.(`{{${m.tag}}}`)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              title={`Inserts {{${m.tag}}} (sample: ${m.sample})`}
            >
              <Plus className="h-3 w-3" />
              {m.tag}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
