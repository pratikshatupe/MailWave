/**
 * import-contacts-modal.jsx
 *
 * Multi-step CSV importer. Operates entirely in the browser:
 *   1. Upload CSV file
 *   2. Preview first 10 rows
 *   3. Map columns to contact fields
 *   4. Validate rows
 *   5. Show import summary
 *   6. Confirm import → write to localStorage
 */

import { useMemo, useRef, useState } from 'react';
import {
  Upload,
  ArrowLeft,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Button from '../ui/Button.jsx';
import {
  parseCsv,
  validateImportRow,
  importContacts,
} from '../../services/contact-service.js';
import { CONTACT_IMPORT_FIELDS } from '../../config/contact-fields.js';

const DUPLICATE_OPTIONS = [
  { value: 'skip', label: 'Skip duplicates', hint: 'Existing contacts are left alone.' },
  { value: 'update', label: 'Update existing', hint: 'Merge new data into existing contacts.' },
  { value: 'createNew', label: 'Create new only', hint: 'Add even if duplicates exist.' },
];

const STEPS = [
  'Upload CSV file',
  'Preview rows',
  'Map columns',
  'Validate',
  'Summary',
];

function autoMap(headers) {
  const map = {};
  CONTACT_IMPORT_FIELDS.forEach((field) => {
    const target = field.label.toLowerCase();
    const fallback = field.key.toLowerCase();
    const match = headers.find((h) => {
      const lowered = h.toLowerCase().trim();
      return lowered === target || lowered === fallback;
    });
    if (match) map[field.key] = match;
  });
  return map;
}

export default function ImportContactsModal({
  open,
  tenantId,
  organisationName,
  onCancel,
  onCompleted,
}) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [duplicateMode, setDuplicateMode] = useState('skip');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  function reset() {
    setStep(0);
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setDuplicateMode('skip');
    setSummary(null);
    setError('');
  }

  function handleCancel() {
    reset();
    onCancel?.();
  }

  function handleFile(file) {
    setError('');
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      setError('Please upload a .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const { header, rows: parsed } = parseCsv(String(evt.target?.result || ''));
        if (header.length === 0 || parsed.length === 0) {
          setError('CSV file appears to be empty.');
          return;
        }
        setFileName(file.name);
        setHeaders(header);
        setRows(parsed);
        setMapping(autoMap(header));
        setStep(1);
      } catch {
        setError('We could not read this CSV file.');
      }
    };
    reader.readAsText(file);
  }

  const mappedRows = useMemo(() => {
    if (rows.length === 0) return [];
    return rows.map((row) => {
      const obj = {};
      CONTACT_IMPORT_FIELDS.forEach((field) => {
        const colName = mapping[field.key];
        if (!colName) return;
        const colIdx = headers.indexOf(colName);
        if (colIdx === -1) return;
        obj[field.key] = (row[colIdx] || '').trim();
      });
      return obj;
    });
  }, [rows, mapping, headers]);

  const validation = useMemo(() => {
    if (mappedRows.length === 0) {
      return { valid: 0, invalid: 0, invalidDetails: [] };
    }
    let valid = 0;
    let invalid = 0;
    const invalidDetails = [];
    mappedRows.forEach((row, idx) => {
      const errors = validateImportRow(row);
      if (errors.length === 0) {
        valid += 1;
      } else {
        invalid += 1;
        invalidDetails.push({ row: idx + 1, emailId: row.emailId, reason: errors[0] });
      }
    });
    return { valid, invalid, invalidDetails };
  }, [mappedRows]);

  function handleConfirm() {
    const result = importContacts(mappedRows, duplicateMode, {
      tenantId,
      organisationName,
    });
    setSummary(result);
    setStep(4);
  }

  function handleFinish() {
    reset();
    onCompleted?.(summary);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={handleCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Import Contacts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-6 py-5">
          {/* Stepper */}
          <ol className="mb-6 flex flex-wrap gap-2 text-xs">
            {STEPS.map((label, idx) => (
              <li
                key={label}
                className={`flex items-center gap-1 rounded-full border px-3 py-1 ${
                  idx === step
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : idx < step
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                <span className="font-semibold">{idx + 1}.</span> {label}
              </li>
            ))}
          </ol>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <Upload className="mx-auto h-10 w-10 text-indigo-500" />
              <h4 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                Upload a CSV file
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your CSV should include columns for Full Name and Email ID.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="mt-5">
                <Button onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Choose CSV file
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                Showing first 10 of {rows.length} rows from <strong>{fileName}</strong>.
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2">SR. No.</th>
                      {headers.map((h) => (
                        <th key={h} className="px-3 py-2">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.slice(0, 10).map((r, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-slate-500">{idx + 1}.</td>
                        {headers.map((h, ci) => (
                          <td
                            key={h}
                            className="whitespace-normal break-words px-3 py-2 text-slate-700 dark:text-slate-200"
                          >
                            {r[ci] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Map each contact field to a column from your CSV. Required
                fields are marked with an asterisk.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {CONTACT_IMPORT_FIELDS.map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      {field.label}
                      {field.required && (
                        <span className="text-rose-600 dark:text-rose-400">*</span>
                      )}
                    </span>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) =>
                        setMapping((p) => ({ ...p, [field.key]: e.target.value }))
                      }
                      className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="">— Skip this field —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryStat label="Total Rows" value={mappedRows.length} tone="indigo" />
                <SummaryStat label="Valid Rows" value={validation.valid} tone="emerald" />
                <SummaryStat label="Invalid Rows" value={validation.invalid} tone="rose" />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Duplicate handling
                </h4>
                <div className="grid gap-2 sm:grid-cols-3">
                  {DUPLICATE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-xl border px-3 py-3 text-sm transition ${
                        duplicateMode === opt.value
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="duplicate-mode"
                          value={opt.value}
                          checked={duplicateMode === opt.value}
                          onChange={() => setDuplicateMode(opt.value)}
                          className="h-4 w-4 cursor-pointer accent-indigo-600"
                        />
                        <span className="font-semibold">{opt.label}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {opt.hint}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
              {validation.invalid > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Invalid rows
                  </h4>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                        <tr>
                          <th className="px-3 py-2">Row</th>
                          <th className="px-3 py-2">Email ID</th>
                          <th className="px-3 py-2">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {validation.invalidDetails.slice(0, 10).map((d) => (
                          <tr key={`${d.row}-${d.emailId}`}>
                            <td className="px-3 py-2 text-slate-500">{d.row}.</td>
                            <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                              {d.emailId || '—'}
                            </td>
                            <td className="px-3 py-2 text-rose-600 dark:text-rose-400">
                              {d.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && summary && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                Contacts imported successfully.
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryStat label="Total Rows" value={summary.total} tone="indigo" />
                <SummaryStat label="Valid Rows" value={summary.valid} tone="emerald" />
                <SummaryStat label="Invalid Rows" value={summary.invalid} tone="rose" />
                <SummaryStat label="Duplicates" value={summary.duplicates} tone="amber" />
                <SummaryStat label="Imported" value={summary.imported} tone="emerald" />
                <SummaryStat label="Skipped" value={summary.skipped} tone="slate" />
              </div>
              {summary.failed && summary.failed.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Failed rows
                  </h4>
                  <ul className="space-y-1 text-xs text-rose-600 dark:text-rose-400">
                    {summary.failed.slice(0, 6).map((f) => (
                      <li key={`${f.row}-${f.emailId}`}>
                        Row {f.row}: {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/95">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {fileName && `File: ${fileName}`}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            {step > 0 && step < 4 && (
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step === 1 && (
              <Button onClick={() => setStep(2)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === 2 && (
              <Button
                disabled={!mapping.fullName || !mapping.emailId}
                onClick={() => setStep(3)}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === 3 && (
              <Button
                disabled={validation.valid === 0}
                onClick={handleConfirm}
              >
                Confirm Import <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === 4 && <Button onClick={handleFinish}>Done</Button>}
          </div>
        </footer>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, tone = 'indigo' }) {
  const toneClass = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    slate: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  }[tone];
  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
}
