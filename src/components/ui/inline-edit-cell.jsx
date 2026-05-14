/**
 * inline-edit-cell.jsx
 *
 * Central inline-edit cell for AppTable. Behaviour:
 *  1. Normal mode shows the value.
 *  2. On hover, a pencil trigger appears.
 *  3. Clicking the trigger swaps the cell for an inline input/select.
 *  4. Save (✓) or Enter persists; Cancel (✕) or Escape reverts.
 *  5. Invalid values surface a small inline error pill.
 *  6. Dropdown edits auto-flip upward when there is no space below and
 *     right-align near the screen edge so they never get clipped.
 *  7. Multi-select editType opens a chip-picker popover so array fields
 *     such as Tags / Segments can be edited inline.
 *
 * The cell respects role permissions: if `disabled` is true the trigger
 * is hidden and the value is rendered read-only.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { validateField } from '../../utils/validators.js';
import { getColumnOptions } from '../../config/table-columns.js';

function buildValidator(column) {
  if (typeof column.validator === 'function') return column.validator;
  if (typeof column.validator === 'string') {
    return (value) => validateField(column.validator, value, {
      label: column.label,
      validationRule: column.validator,
      required: true,
    });
  }
  return null;
}

function formatDisplay(value, column) {
  if (value === null || value === undefined || value === '') return '—';
  if (column.editType === 'select') {
    const options = getColumnOptions(column.options);
    const found = options.find((o) => o.value === value);
    return found?.label ?? value;
  }
  if (column.editType === 'multiselect') {
    const list = Array.isArray(value) ? value : [];
    if (list.length === 0) return '—';
    return list.join(', ');
  }
  return value;
}

function resolveOptions(column, row) {
  if (column.editType !== 'select' && column.editType !== 'multiselect') return [];
  if (typeof column.getOptions === 'function') {
    const dyn = column.getOptions(row);
    return Array.isArray(dyn) ? dyn.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)) : [];
  }
  return getColumnOptions(column.options);
}

export default function InlineEditCell({
  value,
  column,
  rowId,
  row,
  disabled = false,
  onSave,
  renderDisplay,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const isMultiSelect = column.editType === 'multiselect';

  const options = useMemo(
    () =>
      column.editType === 'select' || isMultiSelect
        ? resolveOptions(column, row)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [column.editType, column.options, column.getOptions, row, isMultiSelect]
  );

  const validator = useMemo(() => buildValidator(column), [column]);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (!editing) return;
    if (column.editType === 'select' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 220);
    }
    const t = window.setTimeout(() => {
      inputRef.current?.focus?.();
      if (inputRef.current?.select) inputRef.current.select();
    }, 10);
    return () => window.clearTimeout(t);
  }, [editing, column.editType]);

  function startEdit() {
    if (disabled || !column.editable) return;
    if (isMultiSelect) {
      setDraft(Array.isArray(value) ? value.slice() : []);
    } else {
      setDraft(value ?? '');
    }
    setError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft(value);
    setError('');
  }

  function toggleMultiOption(opt) {
    setDraft((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt];
    });
  }

  function saveMulti() {
    const candidate = Array.isArray(draft) ? draft : [];
    if (typeof onSave === 'function') {
      const result = onSave(rowId, column.key, candidate);
      if (result && result.ok === false) {
        setError(result.error || 'Could not save value.');
        return;
      }
    }
    setError('');
    setEditing(false);
  }

  function save(nextRaw) {
    const candidate = nextRaw === undefined ? draft : nextRaw;
    if (validator) {
      const err = validator(candidate);
      if (err) {
        setError(err);
        return;
      }
    }
    if (typeof onSave === 'function') {
      const result = onSave(rowId, column.key, candidate);
      if (result && result.ok === false) {
        setError(result.error || 'Could not save value.');
        return;
      }
    }
    setError('');
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && column.editType !== 'textarea') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }

  if (!column.editable || disabled) {
    return (
      <span className="inline-edit-cell">
        {renderDisplay ? renderDisplay(value) : <span>{formatDisplay(value, column)}</span>}
      </span>
    );
  }

  if (!editing) {
    return (
      <span className="inline-edit-cell" ref={containerRef}>
        {renderDisplay ? renderDisplay(value) : <span>{formatDisplay(value, column)}</span>}
        <button
          type="button"
          className="inline-edit-trigger"
          onClick={startEdit}
          aria-label={`Edit ${column.label}`}
          title={`Edit ${column.label}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  if (isMultiSelect) {
    const selected = Array.isArray(draft) ? draft : [];
    return (
      <span
        className="inline-edit-cell inline-edit-block w-full"
        ref={containerRef}
      >
        <div
          className={`inline-edit-multiselect ${
            openUpward ? 'inline-edit-multiselect-up' : ''
          }`}
        >
          {options.length === 0 ? (
            <div className="inline-edit-multiselect-empty">No options available.</div>
          ) : (
            <div className="inline-edit-multiselect-options">
              {options.map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`inline-edit-multiselect-chip ${checked ? 'is-active' : ''}`}
                    onClick={() => toggleMultiOption(opt.value)}
                  >
                    {checked ? <Check className="h-3 w-3" /> : null}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
          <div className="inline-edit-multiselect-footer">
            <button
              type="button"
              className="inline-edit-action-button is-cancel"
              onClick={cancelEdit}
              aria-label="Cancel"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="inline-edit-action-button is-confirm"
              onClick={saveMulti}
              aria-label="Save"
              title="Save"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {error && <span className="inline-edit-error">{error}</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-edit-cell inline-edit-block ${
        column.editType === 'textarea' ? 'w-full' : ''
      }`}
      ref={containerRef}
    >
      {column.editType === 'select' ? (
        <select
          ref={inputRef}
          className={`inline-edit-select ${
            openUpward ? 'inline-edit-select-up' : ''
          }`}
          value={draft ?? ''}
          onChange={(e) => save(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => window.setTimeout(cancelEdit, 120)}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : column.editType === 'textarea' ? (
        <textarea
          ref={inputRef}
          className="inline-edit-input"
          rows={2}
          value={draft ?? ''}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <input
          ref={inputRef}
          type={
            column.editType === 'number' || column.editType === 'currency' || column.editType === 'percentage'
              ? 'number'
              : column.editType === 'date'
                ? 'date'
                : column.editType === 'time'
                  ? 'time'
                  : 'text'
          }
          className="inline-edit-input"
          value={draft ?? ''}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          inputMode={
            column.editType === 'contactNumber' || column.editType === 'number'
              ? 'numeric'
              : undefined
          }
        />
      )}
      {column.editType !== 'select' && (
        <span className="inline-edit-actions">
          <button
            type="button"
            className="inline-edit-action-button is-confirm"
            onClick={() => save()}
            aria-label="Save"
            title="Save"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="inline-edit-action-button is-cancel"
            onClick={cancelEdit}
            aria-label="Cancel"
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
      {error && <span className="inline-edit-error">{error}</span>}
    </span>
  );
}
