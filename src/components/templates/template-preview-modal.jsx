/**
 * template-preview-modal.jsx
 *
 * Full-screen preview modal. Fetches a server-rendered preview when
 * possible and falls back to the local renderer if the API is offline.
 *
 * Tabs:
 *   - Desktop / Mobile rendered HTML inside a sandboxed iframe.
 *   - Raw HTML view for engineers debugging output.
 *   - Editable merge-tag sample data form.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Monitor,
  Smartphone,
  Code2,
  Eye,
  RotateCcw,
} from 'lucide-react';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import InputField from '../ui/InputField.jsx';
import { MERGE_TAGS, previewTemplate, localPreview } from '../../services/template-service.js';
import { DEFAULT_SAMPLE_DATA } from '../../utils/template-renderer.js';

export default function TemplatePreviewModal({
  open,
  template,
  onClose,
}) {
  const [sample, setSample] = useState(DEFAULT_SAMPLE_DATA);
  const [viewport, setViewport] = useState('desktop');
  const [showRaw, setShowRaw] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !template) return;
    let cancelled = false;
    setLoading(true);
    // If the template is a draft just created locally (no id yet) we can
    // still preview via the local renderer.
    const run = async () => {
      try {
        let result;
        if (template.id) {
          result = await previewTemplate(template.id, sample);
        }
        if (!result) result = localPreview(template, sample);
        if (!cancelled) setPreview(result);
      } catch {
        if (!cancelled) setPreview(localPreview(template, sample));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [open, template, sample]);

  const frameWidth = viewport === 'mobile' ? 360 : 640;

  function setSampleField(key, value) {
    setSample((p) => ({ ...p, [key]: value }));
  }

  function resetSample() {
    setSample(DEFAULT_SAMPLE_DATA);
  }

  if (!open || !template) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-stretch justify-center p-2 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
        style={{ maxHeight: '92vh' }}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                Preview — {template.name || 'Untitled template'}
              </h3>
              <Badge
                tone={
                  template.status === 'published'
                    ? 'emerald'
                    : template.status === 'archived'
                    ? 'rose'
                    : 'slate'
                }
              >
                {template.status || 'draft'}
              </Badge>
              <Badge tone="indigo">{template.editorMode || 'drag_drop'}</Badge>
            </div>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {preview?.subject || template.subject}
            </p>
            {preview?.previewText || template.previewText ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {preview?.previewText || template.previewText}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                viewport === 'desktop'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                viewport === 'mobile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>
          <Button variant="ghost" onClick={() => setShowRaw((v) => !v)}>
            <Code2 className="h-4 w-4" /> {showRaw ? 'Hide HTML' : 'Raw HTML'}
          </Button>
          <Button variant="ghost" onClick={resetSample}>
            <RotateCcw className="h-4 w-4" /> Reset sample data
          </Button>
          {loading && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Rendering preview…
            </span>
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="overflow-auto bg-slate-100/60 p-6 dark:bg-slate-950/40">
            {showRaw ? (
              <pre className="h-full overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-200 dark:border-slate-700">
                {preview?.html || ''}
              </pre>
            ) : (
              <div
                className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700"
                style={{ width: frameWidth, maxWidth: '100%' }}
              >
                <iframe
                  title="Template preview"
                  srcDoc={preview?.html || ''}
                  sandbox=""
                  className="block min-h-[480px] w-full bg-white"
                />
              </div>
            )}
          </div>

          <aside className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:border-l md:border-t-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <Eye className="h-4 w-4" /> Sample data
            </div>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              These values replace the merge tags in the preview only — they
              are not saved with the template.
            </p>
            <div className="space-y-3">
              {MERGE_TAGS.map((m) => (
                <InputField
                  key={m.tag}
                  name={m.tag}
                  label={`{{${m.tag}}}`}
                  value={sample[m.tag] ?? ''}
                  onChange={(e) => setSampleField(m.tag, e.target.value)}
                  placeholder={m.sample}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
