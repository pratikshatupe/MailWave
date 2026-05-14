/**
 * campaign-template-step.jsx
 *
 * Step 3: select a saved template. Reads templates from the central
 * service which automatically falls back to the existing template store.
 * Shows an EmptyState with a Create Template CTA when none exist.
 */

import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Plus } from 'lucide-react';
import EmptyState from '../ui/EmptyState.jsx';
import Button from '../ui/Button.jsx';
import { ROUTES } from '../../config/routes.js';
import { getTemplatesForTenant } from '../../services/campaign-service.js';

export default function CampaignTemplateStep({ values, errors, tenantId, onChange, onValidate }) {
  const navigate = useNavigate();
  const templates = useMemo(() => getTemplatesForTenant(tenantId), [tenantId]);
  const selected = templates.find((t) => t.id === values.templateId) || null;

  useEffect(() => {
    if (values.templateId) onValidate?.('templateId', '');
  }, [values.templateId, onValidate]);

  function pick(template) {
    onChange?.('templateId', template.id);
    onChange?.('templateName', template.name);
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={LayoutTemplate}
        title="No templates found."
        description="Create a template to launch your campaign."
        action={
          <Button onClick={() => navigate(ROUTES.templates)}>
            <Plus className="h-4 w-4" /> Create Template
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {errors.templateId && (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {errors.templateId}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const active = t.id === values.templateId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t)}
              className={`group flex h-full flex-col rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-indigo-300 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-cyan-500/5 ring-1 ring-indigo-300 dark:border-indigo-500/40 dark:from-indigo-500/15 dark:via-fuchsia-500/10 dark:to-cyan-500/10 dark:ring-indigo-500/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                    active
                      ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-glow'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <LayoutTemplate className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {t.name}
                  </div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {t.category || 'Custom'} · {t.status || 'draft'}
                  </div>
                </div>
              </div>
              {t.subject && (
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold uppercase tracking-wide text-slate-400">Subject:</span>{' '}
                  {t.subject}
                </div>
              )}
              {t.previewText && (
                <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {t.previewText}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Selected template
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{selected.name}</div>
          <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {selected.htmlContent ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: selected.htmlContent }}
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">{selected.textContent || 'Preview will render here once the template has content.'}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
