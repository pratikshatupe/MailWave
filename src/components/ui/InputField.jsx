/**
 * InputField
 *
 * Generic input wired to the central config:
 *  - Accepts a `field` prop (entry from config/formFields.js) and pulls
 *    label, placeholder, icon, validation rule, max length, allowOnly.
 *  - Shows a red asterisk attached with no space (Name*).
 *  - Renders error below the field.
 *  - Blocks invalid keystrokes when `allowOnly` is set ('lettersSpaces',
 *    'digits', 'alphanumeric', 'decimal', 'email', 'any').
 *  - Calls `validator` on blur and surfaces the returned message via
 *    `onValidate(name, errorMessage)` so the parent stores the error.
 *  - Trims on blur when `trimOnBlur` is set.
 */

import { forwardRef } from 'react';
import { FORM_FIELDS } from '../../config/formFields.js';

const FILTERS = {
  lettersSpaces: /[^A-Za-z ]/g,
  digits: /[^0-9]/g,
  alphanumeric: /[^A-Za-z0-9 ]/g,
  // Allow digits and at most one decimal point. We strip everything else;
  // the validator catches multi-dot input on blur/submit.
  decimal: /[^0-9.]/g,
  email: null,
  any: null,
};

function applyFilter(value, mode) {
  if (!mode || !FILTERS[mode]) return value;
  return String(value).replace(FILTERS[mode], '');
}

const InputField = forwardRef(function InputField(
  {
    field,
    name,
    label,
    placeholder,
    type,
    required,
    icon,
    error,
    rightSlot,
    value,
    onChange,
    onBlur,
    onValidate,
    validator,
    allowOnly,
    trimOnBlur,
    pattern,
    inputMode,
    className = '',
    autoComplete,
    disabled,
    readOnly,
    maxLength,
    minLength,
    id,
    ...rest
  },
  ref
) {
  const config = field ? FORM_FIELDS[field] : null;
  const resolvedName = name || config?.name;
  const resolvedLabel = label ?? config?.label;
  const resolvedPlaceholder = placeholder ?? config?.placeholder;
  const resolvedType = type ?? config?.type ?? 'text';
  const resolvedRequired = required ?? config?.required ?? false;
  const Icon = icon ?? config?.icon;
  const resolvedMax = maxLength ?? config?.maxLength;
  const resolvedMin = minLength ?? config?.minLength;
  const resolvedAllowOnly = allowOnly ?? config?.allowOnly;
  const resolvedInputMode = inputMode ?? config?.inputMode;
  const resolvedTrim = trimOnBlur ?? config?.trimOnBlur ?? false;
  const inputId = id || resolvedName;

  function emitChange(nextValue) {
    if (typeof onChange === 'function') {
      onChange({ target: { name: resolvedName, value: nextValue } });
    }
  }

  function handleChange(e) {
    const raw = e.target.value;
    const filtered = applyFilter(raw, resolvedAllowOnly);
    // Respect maxLength for filtered chars (browsers don't enforce on paste
    // when the input attribute is missing for some types).
    const next = resolvedMax ? filtered.slice(0, resolvedMax) : filtered;
    if (next !== raw) {
      emitChange(next);
      return;
    }
    onChange?.(e);
  }

  function handleBlur(e) {
    let next = e.target.value;
    if (resolvedTrim) {
      const trimmed = next.replace(/^\s+|\s+$/g, '');
      if (trimmed !== next) {
        next = trimmed;
        emitChange(trimmed);
      }
    }
    if (typeof validator === 'function') {
      const err = validator(next);
      if (typeof onValidate === 'function') onValidate(resolvedName, err || '');
    } else if (typeof onValidate === 'function') {
      onValidate(resolvedName, undefined);
    }
    onBlur?.(e);
  }

  return (
    <div className={`w-full ${className}`}>
      {resolvedLabel && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          {resolvedLabel}
          {resolvedRequired && <span className="required-marker text-rose-600 dark:text-rose-400">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        )}
        <input
          id={inputId}
          name={resolvedName}
          ref={ref}
          type={resolvedType}
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={resolvedPlaceholder}
          autoComplete={autoComplete}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={resolvedMax}
          minLength={resolvedMin}
          inputMode={resolvedInputMode}
          pattern={pattern}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-xl border bg-white text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-4 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 ${
            Icon ? 'pl-10' : 'pl-4'
          } ${rightSlot ? 'pr-11' : 'pr-4'} py-3 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/50 dark:focus:border-rose-400 dark:focus:ring-rose-500/20'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20'
          } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default InputField;
