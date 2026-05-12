/**
 * TextAreaField
 *
 * Multi-line input with bounded expansion (rows + maxRows from config).
 * Shows character count when maxLength is set.
 */

import { useEffect, useRef } from 'react';
import { FORM_FIELDS } from '../../config/formFields.js';

export default function TextAreaField({
  field,
  name,
  label,
  placeholder,
  required,
  value = '',
  onChange,
  onBlur,
  onValidate,
  validator,
  trimOnBlur = true,
  error,
  rows,
  maxRows,
  maxLength,
  disabled,
  className = '',
  id,
}) {
  const config = field ? FORM_FIELDS[field] : null;
  const resolvedName = name || config?.name;
  const resolvedLabel = label ?? config?.label;
  const resolvedPlaceholder = placeholder ?? config?.placeholder;
  const resolvedRequired = required ?? config?.required ?? false;
  const resolvedRows = rows ?? config?.rows ?? 4;
  const resolvedMaxRows = maxRows ?? config?.maxRows ?? 10;
  const resolvedMax = maxLength ?? config?.maxLength;
  const textareaId = id || resolvedName;
  const ref = useRef(null);

  // Auto-grow up to maxRows, then scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseInt(window.getComputedStyle(el).lineHeight, 10) || 20;
    const maxH = lineHeight * resolvedMaxRows + 16;
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
    el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
  }, [value, resolvedMaxRows]);

  return (
    <div className={`w-full ${className}`}>
      {resolvedLabel && (
        <label
          htmlFor={textareaId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          {resolvedLabel}
          {resolvedRequired && <span className="text-rose-600 dark:text-rose-400">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        name={resolvedName}
        rows={resolvedRows}
        value={value}
        onChange={onChange}
        onBlur={(e) => {
          let next = e.target.value;
          if (trimOnBlur) {
            const trimmed = next.replace(/^\s+|\s+$/g, '');
            if (trimmed !== next && typeof onChange === 'function') {
              onChange({ target: { name: resolvedName, value: trimmed } });
              next = trimmed;
            }
          }
          if (typeof validator === 'function' && typeof onValidate === 'function') {
            onValidate(resolvedName, validator(next) || '');
          }
          onBlur?.(e);
        }}
        disabled={disabled}
        placeholder={resolvedPlaceholder}
        maxLength={resolvedMax}
        className={`block w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-4 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/50'
            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      />
      <div className="mt-1.5 flex items-center justify-between">
        {error ? (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
        ) : (
          <span />
        )}
        {resolvedMax && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {String(value).length}/{resolvedMax}
          </span>
        )}
      </div>
    </div>
  );
}
