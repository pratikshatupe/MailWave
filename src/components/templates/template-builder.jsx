/**
 * template-builder.jsx
 *
 * Drag-and-drop email template builder used inside the Templates module.
 * Layout:
 *   - Left:   Block library (drag tiles or click to add)
 *   - Center: Live canvas with reorder + select + delete
 *   - Right:  Block settings panel + merge tag helper
 *   - Top:    Template name, save buttons, desktop / mobile toggle
 *
 * Drag and drop uses the native HTML5 API — no extra dependency.
 *
 * Caller wires `onSaveDraft`, `onSavePublish`, `onPreview` to the parent
 * page so the page owns the network calls and toast feedback. The builder
 * keeps blocks in local state and emits the current shape on save.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Save,
  Send,
  Eye,
  Monitor,
  Smartphone,
  Layout,
  Trash2,
  Copy,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import InputField from '../ui/InputField.jsx';
import SelectField from '../ui/SelectField.jsx';
import TextAreaField from '../ui/TextAreaField.jsx';
import BlockLibrary from './block-library.jsx';
import BlockSettingsPanel from './block-settings-panel.jsx';
import MergeTagHelper from './merge-tag-helper.jsx';
import {
  makeEmptyBlock,
  makeBlockId,
  TEMPLATE_CATEGORIES,
  EDITOR_MODES,
} from '../../services/template-service.js';
import { validateRequired, validateDropdown } from '../../utils/validators.js';
import {
  renderBlocksToHtml,
  replaceMergeTags,
  DEFAULT_SAMPLE_DATA,
} from '../../utils/template-renderer.js';

const NAME_RULE = { max: 200 };
const SUBJECT_RULE = { max: 998 };
const PREVIEW_RULE = { max: 200 };

function validateTemplateName(v) {
  const base = validateRequired(v, 'Template name');
  if (base) return base;
  if (String(v).length > NAME_RULE.max) {
    return `Template name must be at most ${NAME_RULE.max} characters.`;
  }
  return '';
}

function validateSubjectLine(v) {
  const base = validateRequired(v, 'Subject line');
  if (base) return base;
  if (String(v).length > SUBJECT_RULE.max) {
    return `Subject line must be at most ${SUBJECT_RULE.max} characters.`;
  }
  return '';
}

function validatePreviewText(v) {
  if (!v) return '';
  if (String(v).length > PREVIEW_RULE.max) {
    return `Preview text must be at most ${PREVIEW_RULE.max} characters.`;
  }
  return '';
}

function validateCategory(v) {
  return validateDropdown(v, 'Category');
}

function validateForm(values) {
  const errors = {};
  const name = validateTemplateName(values.name);
  if (name) errors.name = name;
  const subject = validateSubjectLine(values.subject);
  if (subject) errors.subject = subject;
  const preview = validatePreviewText(values.previewText);
  if (preview) errors.previewText = preview;
  const category = validateCategory(values.category);
  if (category) errors.category = category;
  if (values.editorMode === 'drag_drop') {
    if (!Array.isArray(values.blocks) || values.blocks.length === 0) {
      errors.body = 'Email body cannot be empty. Add at least one block.';
    }
  } else if (!String(values.htmlContent || '').trim()) {
    errors.body = 'HTML content is required.';
  }
  return errors;
}

function blockPreview(block, viewport) {
  const html = renderBlocksToHtml([block], { title: block.type });
  return replaceMergeTags(html, DEFAULT_SAMPLE_DATA);
}

function ordered(blocks) {
  return blocks.map((b, i) => ({ ...b, order: i + 1 }));
}

export default function TemplateBuilder({
  initial,
  readOnly = false,
  isEditing = false,
  onSaveDraft,
  onSavePublish,
  onPreview,
  onCancel,
  saving = false,
}) {
  const [values, setValues] = useState(() => ({
    name: '',
    description: '',
    subject: '',
    previewText: '',
    category: 'newsletter',
    editorMode: 'drag_drop',
    status: 'draft',
    blocks: [],
    htmlContent: '',
    textContent: '',
    ...initial,
  }));
  const [errors, setErrors] = useState({});
  const [selectedBlockId, setSelectedBlockId] = useState(
    initial?.blocks?.[0]?.id || null
  );
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState(null);

  const lastFocusRef = useRef(null);

  // Track the last-focused input/textarea so the merge-tag helper can
  // insert into the field the user was just editing.
  useEffect(() => {
    function track(e) {
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        !target.readOnly &&
        !target.disabled
      ) {
        lastFocusRef.current = target;
      }
    }
    document.addEventListener('focusin', track);
    return () => document.removeEventListener('focusin', track);
  }, []);

  // Warn before navigating away with unsaved changes.
  useEffect(() => {
    if (!isDirty) return undefined;
    function onBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // Autosave snapshot indicator (visual only — persists nothing).
  useEffect(() => {
    if (!isDirty) return undefined;
    const t = window.setTimeout(() => setAutoSavedAt(new Date()), 1500);
    return () => window.clearTimeout(t);
  }, [values, isDirty]);

  function patch(next) {
    setValues((prev) => {
      const merged = typeof next === 'function' ? next(prev) : { ...prev, ...next };
      return merged;
    });
    setIsDirty(true);
  }

  function setField(name, value) {
    patch({ [name]: value });
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleAddBlock(type, atIndex) {
    if (readOnly) return;
    const block = makeEmptyBlock(type);
    patch((prev) => {
      const next = prev.blocks.slice();
      const idx = atIndex === undefined ? next.length : atIndex;
      next.splice(idx, 0, block);
      return { ...prev, blocks: ordered(next) };
    });
    setSelectedBlockId(block.id);
    setErrors((p) => ({ ...p, body: undefined }));
  }

  function handleUpdateBlock(updated) {
    patch((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === updated.id ? updated : b)),
    }));
  }

  function handleDeleteBlock(id) {
    if (readOnly) return;
    patch((prev) => ({
      ...prev,
      blocks: ordered(prev.blocks.filter((b) => b.id !== id)),
    }));
    setSelectedBlockId((prev) => (prev === id ? null : prev));
  }

  function handleDuplicateBlock(id) {
    if (readOnly) return;
    patch((prev) => {
      const idx = prev.blocks.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const original = prev.blocks[idx];
      const copy = {
        ...original,
        id: makeBlockId(),
        content: { ...(original.content || {}) },
        styles: { ...(original.styles || {}) },
      };
      const next = prev.blocks.slice();
      next.splice(idx + 1, 0, copy);
      return { ...prev, blocks: ordered(next) };
    });
  }

  function handleMove(id, direction) {
    if (readOnly) return;
    patch((prev) => {
      const idx = prev.blocks.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.blocks.length) return prev;
      const next = prev.blocks.slice();
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return { ...prev, blocks: ordered(next) };
    });
  }

  function handleReorderDrop(fromId, toIndex) {
    if (readOnly) return;
    patch((prev) => {
      const fromIndex = prev.blocks.findIndex((b) => b.id === fromId);
      if (fromIndex === -1) return prev;
      const next = prev.blocks.slice();
      const [item] = next.splice(fromIndex, 1);
      const insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex;
      next.splice(Math.max(0, insertAt), 0, item);
      return { ...prev, blocks: ordered(next) };
    });
  }

  function handleInsertMergeTag(tag) {
    if (readOnly) return;
    const el = lastFocusRef.current;
    if (!el || !document.body.contains(el)) {
      // Fall back: append tag to subject if it's empty, otherwise no-op.
      patch((prev) => ({ ...prev, subject: prev.subject + tag }));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const nextValue = before + tag + after;
    // Trigger the native React onChange path by dispatching an input event.
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    const setterTA = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    if (el.tagName === 'TEXTAREA' && setterTA) setterTA.call(el, nextValue);
    else if (setter) setter.call(el, nextValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    const caret = start + tag.length;
    requestAnimationFrame(() => {
      try {
        el.setSelectionRange(caret, caret);
        el.focus();
      } catch {
        /* ignore */
      }
    });
  }

  function attemptSave(kind) {
    const errs = validateForm(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsDirty(false);
    const payload = {
      ...values,
      blocks: ordered(values.blocks || []),
    };
    if (kind === 'publish') onSavePublish?.(payload);
    else onSaveDraft?.(payload);
  }

  const selectedBlock = useMemo(
    () => values.blocks.find((b) => b.id === selectedBlockId) || null,
    [values.blocks, selectedBlockId]
  );

  const previewWidth = viewport === 'mobile' ? 360 : 640;
  const totalMergeTags = useMemo(() => {
    const set = new Set();
    const sources = [
      values.subject,
      values.previewText,
      values.htmlContent,
      JSON.stringify(values.blocks || []),
    ];
    sources.forEach((s) => {
      const re = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
      let m;
      while ((m = re.exec(String(s || ''))) !== null) set.add(m[1]);
    });
    return Array.from(set);
  }, [values.subject, values.previewText, values.htmlContent, values.blocks]);

  /* ---------------------------- Render helpers ---------------------------- */

  function renderCanvas() {
    if (values.editorMode === 'html') return renderHtmlEditor();
    const blocks = values.blocks;
    return (
      <div className="space-y-3">
        <DropTarget
          index={0}
          onDropBlockType={(type) => handleAddBlock(type, 0)}
          onDropReorder={(id) => handleReorderDrop(id, 0)}
          active={dragOverIndex === 0}
          onActive={setDragOverIndex}
        />
        {blocks.map((block, i) => (
          <div key={block.id} className="space-y-3">
            <BlockCard
              block={block}
              viewport={viewport}
              selected={selectedBlockId === block.id}
              onSelect={() => setSelectedBlockId(block.id)}
              onDelete={() => handleDeleteBlock(block.id)}
              onDuplicate={() => handleDuplicateBlock(block.id)}
              onMoveUp={() => handleMove(block.id, 'up')}
              onMoveDown={() => handleMove(block.id, 'down')}
              isFirst={i === 0}
              isLast={i === blocks.length - 1}
              readOnly={readOnly}
            />
            <DropTarget
              index={i + 1}
              onDropBlockType={(type) => handleAddBlock(type, i + 1)}
              onDropReorder={(id) => handleReorderDrop(id, i + 1)}
              active={dragOverIndex === i + 1}
              onActive={setDragOverIndex}
            />
          </div>
        ))}
        {blocks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <Layout className="mx-auto h-8 w-8 text-slate-400" />
            <h4 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Drag blocks here
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Drop a block from the left panel, or click any tile to insert it.
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderHtmlEditor() {
    const preview = replaceMergeTags(values.htmlContent || '', DEFAULT_SAMPLE_DATA);
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            HTML source
          </label>
          <textarea
            value={values.htmlContent || ''}
            onChange={(e) => setField('htmlContent', e.target.value)}
            disabled={readOnly}
            spellCheck={false}
            placeholder="<!doctype html>..."
            className="h-[480px] w-full resize-y rounded-xl border border-slate-200 bg-slate-950/95 p-4 font-mono text-xs leading-relaxed text-emerald-200 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:border-slate-700"
          />
          {errors.body && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              {errors.body}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Live preview
          </label>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700">
            <iframe
              title="HTML preview"
              srcDoc={preview || '<!doctype html><body style="font-family:Arial;color:#94a3b8;padding:24px;">Paste HTML to see the preview here.</body>'}
              sandbox=""
              className="h-[480px] w-full bg-white"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="min-w-0 flex-1">
            <InputField
              name="name"
              label="Template name"
              required
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              error={errors.name}
              placeholder="Spring promo, Welcome flow…"
              maxLength={NAME_RULE.max}
              disabled={readOnly}
              validator={validateTemplateName}
              onValidate={(n, msg) =>
                setErrors((p) => ({ ...p, [n]: msg || undefined }))
              }
              trimOnBlur
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                viewport === 'desktop'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
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
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>
          <Button variant="ghost" onClick={() => onPreview?.(values)}>
            <Eye className="h-4 w-4" /> Preview
          </Button>
          {!readOnly && (
            <>
              <Button
                variant="outline"
                onClick={() => attemptSave('draft')}
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Draft'}
              </Button>
              <Button
                variant="primary"
                onClick={() => attemptSave('publish')}
                disabled={saving}
              >
                <Send className="h-4 w-4" />
                {isEditing && values.status === 'published'
                  ? 'Save & Publish'
                  : 'Publish'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <Badge tone={values.status === 'published' ? 'emerald' : values.status === 'archived' ? 'rose' : 'slate'}>
          {values.status || 'draft'}
        </Badge>
        {totalMergeTags.length > 0 && (
          <span>{totalMergeTags.length} merge tags</span>
        )}
        {isDirty ? (
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" /> Unsaved changes
          </span>
        ) : autoSavedAt ? (
          <span>
            Last edited{' '}
            {autoSavedAt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : null}
        {readOnly && <Badge tone="amber">Read only</Badge>}
      </div>

      {/* Meta fields */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2">
        <InputField
          name="subject"
          label="Subject line"
          required
          value={values.subject}
          onChange={(e) => setField('subject', e.target.value)}
          error={errors.subject}
          placeholder="Hi {{first_name}}, …"
          maxLength={SUBJECT_RULE.max}
          disabled={readOnly}
          validator={validateSubjectLine}
          onValidate={(n, msg) =>
            setErrors((p) => ({ ...p, [n]: msg || undefined }))
          }
          trimOnBlur
        />
        <InputField
          name="previewText"
          label="Preview text"
          value={values.previewText}
          onChange={(e) => setField('previewText', e.target.value)}
          error={errors.previewText}
          placeholder="A short line shown next to the subject in the inbox"
          maxLength={PREVIEW_RULE.max}
          disabled={readOnly}
          validator={validatePreviewText}
          onValidate={(n, msg) =>
            setErrors((p) => ({ ...p, [n]: msg || undefined }))
          }
        />
        <SelectField
          name="category"
          label="Category"
          required
          placeholder="Select category"
          value={values.category}
          onChange={(e) => setField('category', e.target.value)}
          options={TEMPLATE_CATEGORIES}
          error={errors.category}
          disabled={readOnly}
          validator={validateCategory}
          onValidate={(n, msg) =>
            setErrors((p) => ({ ...p, [n]: msg || undefined }))
          }
        />
        <SelectField
          name="editorMode"
          label="Editor mode"
          value={values.editorMode}
          onChange={(e) => setField('editorMode', e.target.value)}
          options={EDITOR_MODES}
          disabled={readOnly || isEditing}
        />
        <TextAreaField
          name="description"
          label="Description"
          value={values.description || ''}
          onChange={(e) => setField('description', e.target.value)}
          rows={2}
          maxLength={300}
          className="lg:col-span-2"
          disabled={readOnly}
        />
      </div>

      {/* Builder grid */}
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        {values.editorMode === 'drag_drop' && (
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <BlockLibrary onAdd={handleAddBlock} disabled={readOnly} />
            <div className="mt-5">
              <MergeTagHelper onInsert={handleInsertMergeTag} compact />
            </div>
          </aside>
        )}

        <section
          className={`min-w-0 rounded-2xl border border-slate-200 bg-slate-100/60 p-4 dark:border-slate-800 dark:bg-slate-950/40 ${
            values.editorMode === 'html' ? 'lg:col-span-2' : ''
          }`}
        >
          {values.editorMode === 'drag_drop' ? (
            <div
              className="mx-auto rounded-2xl bg-white shadow-card transition-all dark:bg-slate-900"
              style={{ maxWidth: previewWidth }}
            >
              <div className="px-4 py-5">{renderCanvas()}</div>
            </div>
          ) : (
            renderCanvas()
          )}
          {errors.body && values.editorMode === 'drag_drop' && (
            <p className="mt-3 text-center text-xs font-medium text-rose-600 dark:text-rose-400">
              {errors.body}
            </p>
          )}
        </section>

        {values.editorMode === 'drag_drop' && (
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <BlockSettingsPanel
              block={selectedBlock}
              onUpdate={handleUpdateBlock}
              onDelete={() =>
                selectedBlock && handleDeleteBlock(selectedBlock.id)
              }
              onDuplicate={() =>
                selectedBlock && handleDuplicateBlock(selectedBlock.id)
              }
              onMoveUp={() =>
                selectedBlock && handleMove(selectedBlock.id, 'up')
              }
              onMoveDown={() =>
                selectedBlock && handleMove(selectedBlock.id, 'down')
              }
              readOnly={readOnly}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Sub-components ---------------------------- */

function BlockCard({
  block,
  viewport,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  readOnly,
}) {
  function handleDragStart(e) {
    if (readOnly) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/x-block-id', block.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 bg-white transition focus:outline-none dark:bg-slate-900 ${
        selected
          ? 'border-indigo-500 shadow-glow'
          : 'border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/40'
      }`}
    >
      <div className="absolute left-2 top-2 z-10 flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        {!readOnly && (
          <button
            type="button"
            draggable
            onDragStart={handleDragStart}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:text-slate-700 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300"
            title="Drag to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
        <Badge tone="indigo">{block.type}</Badge>
      </div>

      {!readOnly && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <IconBtn
            title="Move up"
            disabled={isFirst}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn
            title="Move down"
            disabled={isLast}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn
            title="Delete"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      )}

      <iframe
        title={`${block.type} preview`}
        srcDoc={blockPreview(block, viewport)}
        sandbox=""
        scrolling="no"
        className="block w-full bg-white"
        style={{ height: blockHeight(block) }}
      />
    </div>
  );
}

function blockHeight(block) {
  switch (block.type) {
    case 'spacer':
      return Math.max(40, parseInt(block.styles?.height || '24', 10) + 20);
    case 'divider':
      return 60;
    case 'button':
      return 110;
    case 'header':
      return 180;
    case 'image':
      return 200;
    case 'social':
      return 90;
    case 'footer':
      return 160;
    case 'columns':
      return 220;
    default:
      return 180;
  }
}

function IconBtn({ children, onClick, title, disabled, variant = 'neutral' }) {
  const cls =
    variant === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20'
      : 'border-slate-200 bg-white/90 text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

function DropTarget({ index, onDropBlockType, onDropReorder, active, onActive }) {
  function handleOver(e) {
    if (
      e.dataTransfer.types.includes('text/x-block-type') ||
      e.dataTransfer.types.includes('text/x-block-id')
    ) {
      e.preventDefault();
      onActive?.(index);
    }
  }
  function handleLeave() {
    onActive?.(null);
  }
  function handleDrop(e) {
    e.preventDefault();
    const newType = e.dataTransfer.getData('text/x-block-type');
    const reorderId = e.dataTransfer.getData('text/x-block-id');
    if (newType) onDropBlockType?.(newType);
    else if (reorderId) onDropReorder?.(reorderId);
    onActive?.(null);
  }
  return (
    <div
      onDragOver={handleOver}
      onDragLeave={handleLeave}
      onDrop={handleDrop}
      className={`h-2 rounded-full transition ${
        active
          ? 'h-8 bg-indigo-100 outline outline-2 outline-dashed outline-indigo-400 dark:bg-indigo-500/20 dark:outline-indigo-500/60'
          : 'bg-transparent'
      }`}
      aria-hidden="true"
    />
  );
}
