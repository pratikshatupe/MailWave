/**
 * tag-manager.jsx
 *
 * Reusable mini-modal for either creating a new tag (used from the Tags
 * page) or attaching an existing tag to one or more contacts (used from
 * the Contacts page action menu).
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import InputField from '../ui/InputField.jsx';
import TextAreaField from '../ui/TextAreaField.jsx';
import { TAG_COLOURS } from '../../config/contact-fields.js';

export default function TagManager({
  open,
  mode = 'create', // 'create' | 'edit' | 'attach'
  initial,
  existingTags = [],
  onCancel,
  onSubmit,
}) {
  const [name, setName] = useState('');
  const [colour, setColour] = useState('indigo');
  const [description, setDescription] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setErrors({});
      return;
    }
    if (mode === 'edit' && initial) {
      setName(initial.name || '');
      setColour(initial.colour || 'indigo');
      setDescription(initial.description || '');
    } else if (mode === 'attach') {
      setSelectedTag('');
    } else {
      setName('');
      setColour('indigo');
      setDescription('');
    }
    setErrors({});
  }, [open, mode, initial]);

  if (!open) return null;

  function validate() {
    const next = {};
    if (mode === 'attach') {
      if (!selectedTag) next.selectedTag = 'Tag is required.';
    } else {
      const trimmed = name.trim();
      if (!trimmed) next.name = 'Tag Name is required.';
      else if (
        existingTags.some(
          (t) =>
            t.name.trim().toLowerCase() === trimmed.toLowerCase() &&
            t.id !== initial?.id
        )
      ) {
        next.name = 'Tag already exists.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (mode === 'attach') {
      onSubmit?.({ tagName: selectedTag });
    } else {
      onSubmit?.({
        name: name.trim(),
        colour,
        description: description.trim(),
      });
    }
  }

  const titles = {
    create: 'Create Tag',
    edit: 'Edit Tag',
    attach: 'Add Tag to Contact',
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {titles[mode]}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 p-6" noValidate>
          {mode === 'attach' ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Tag<span className="text-rose-600 dark:text-rose-400">*</span>
              </span>
              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setErrors((p) => ({ ...p, selectedTag: undefined }));
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Select a tag</option>
                {existingTags.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.selectedTag && (
                <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {errors.selectedTag}
                </p>
              )}
            </label>
          ) : (
            <>
              <InputField
                name="name"
                label="Tag Name"
                placeholder="Enter Tag Name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                error={errors.name}
              />
              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Tag Colour
                </span>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLOURS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColour(c.value)}
                      className={`h-9 w-9 cursor-pointer rounded-full border-2 transition ${
                        colour === c.value
                          ? 'border-slate-900 dark:border-white'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.label}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <TextAreaField
                name="description"
                label="Description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
            </>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update Tag' : mode === 'attach' ? 'Add Tag' : 'Create Tag'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
