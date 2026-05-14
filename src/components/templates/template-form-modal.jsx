/**
 * template-form-modal.jsx
 *
 * Modal used to capture the metadata for a brand-new template (Name,
 * Description, Subject, Preview text, Category, Editor mode). On submit it
 * hands the values to the parent so the parent can persist them and then
 * navigate to the builder. We keep the heavy lifting (blocks, HTML) inside
 * the dedicated builder route — the modal exists so users can quickly
 * stand up a template without leaving the listing page.
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import InputField from '../ui/InputField.jsx';
import SelectField from '../ui/SelectField.jsx';
import TextAreaField from '../ui/TextAreaField.jsx';
import Button from '../ui/Button.jsx';
import { validateRequired, validateDropdown } from '../../utils/validators.js';
import { TEMPLATE_CATEGORIES, EDITOR_MODES } from '../../services/template-service.js';

const TEMPLATE_NAME_MAX = 200;
const SUBJECT_MAX = 998;
const PREVIEW_MAX = 200;
const DESCRIPTION_MAX = 300;

function validateTemplateName(v) {
  const base = validateRequired(v, 'Template name');
  if (base) return base;
  if (String(v).length > TEMPLATE_NAME_MAX) {
    return `Template name must be at most ${TEMPLATE_NAME_MAX} characters.`;
  }
  return '';
}

function validateSubjectLine(v) {
  const base = validateRequired(v, 'Subject line');
  if (base) return base;
  if (String(v).length > SUBJECT_MAX) {
    return `Subject line must be at most ${SUBJECT_MAX} characters.`;
  }
  return '';
}

function validatePreviewText(v) {
  if (!v) return '';
  if (String(v).length > PREVIEW_MAX) {
    return `Preview text must be at most ${PREVIEW_MAX} characters.`;
  }
  return '';
}

function validateCategory(v) {
  return validateDropdown(v, 'Category');
}

const EMPTY = {
  name: '',
  description: '',
  subject: '',
  previewText: '',
  category: 'newsletter',
  editorMode: 'drag_drop',
};

function validate(values) {
  const errors = {};
  const name = validateTemplateName(values.name);
  if (name) errors.name = name;
  const subject = validateSubjectLine(values.subject);
  if (subject) errors.subject = subject;
  const preview = validatePreviewText(values.previewText);
  if (preview) errors.previewText = preview;
  const category = validateCategory(values.category);
  if (category) errors.category = category;
  return errors;
}

export default function TemplateFormModal({ open, onCancel, onSubmit }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(EMPTY);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  function setField(name, value) {
    setValues((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleChange(e) {
    setField(e.target.name, e.target.value);
  }

  function setError(name, msg) {
    setErrors((p) => ({ ...p, [name]: msg || undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
        style={{ maxHeight: 'min(90vh, 720px)' }}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              New Template
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set the basics. You can edit the design on the next screen.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <InputField
              name="name"
              label="Template name"
              required
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              maxLength={TEMPLATE_NAME_MAX}
              placeholder="Spring promo, Welcome flow…"
              validator={validateTemplateName}
              onValidate={setError}
              trimOnBlur
            />
            <TextAreaField
              name="description"
              label="Description"
              value={values.description}
              onChange={handleChange}
              rows={2}
              maxLength={DESCRIPTION_MAX}
              placeholder="What is this template for?"
            />
            <InputField
              name="subject"
              label="Subject line"
              required
              value={values.subject}
              onChange={handleChange}
              error={errors.subject}
              maxLength={SUBJECT_MAX}
              placeholder="Hi {{first_name}}, your offer is inside"
              validator={validateSubjectLine}
              onValidate={setError}
              trimOnBlur
            />
            <InputField
              name="previewText"
              label="Preview text"
              value={values.previewText}
              onChange={handleChange}
              error={errors.previewText}
              maxLength={PREVIEW_MAX}
              placeholder="Shown next to the subject in the inbox"
              validator={validatePreviewText}
              onValidate={setError}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                name="category"
                label="Category"
                required
                placeholder="Select category"
                value={values.category}
                onChange={handleChange}
                options={TEMPLATE_CATEGORIES}
                error={errors.category}
                validator={validateCategory}
                onValidate={setError}
              />
              <SelectField
                name="editorMode"
                label="Editor mode"
                value={values.editorMode}
                onChange={handleChange}
                options={EDITOR_MODES}
              />
            </div>
          </div>
          <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Continue to builder'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
