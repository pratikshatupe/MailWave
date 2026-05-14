import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, FileText, FileSpreadsheet, FileType2 } from 'lucide-react';
import { EXPORT_FORMATS, exportRows } from '../../utils/export-utils.js';

const FORMAT_ICONS = {
  csv: FileSpreadsheet,
  pdf: FileText,
  docx: FileType2,
};

/**
 * ExportDropdown
 *
 * Dropdown that exposes CSV / PDF / Word DOCX export. The parent owns
 * the row set: when `selectedRows` is non-empty it is used, otherwise
 * `filteredRows` is exported. The parent passes `columns` (display
 * order) and a `moduleName` used for the filename and document title.
 *
 * Hidden entirely when `disabled` is true (use the permission flag at
 * the call site — `canExport(role, module)`).
 */
export default function ExportDropdown({
  selectedRows = [],
  filteredRows = [],
  columns = [],
  moduleName,
  disabled = false,
  onExported,
  label = 'Export',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (disabled) return null;

  const rows = selectedRows.length > 0 ? selectedRows : filteredRows;
  const scope = selectedRows.length > 0 ? `${selectedRows.length} selected` : `${filteredRows.length} filtered`;

  function handleFormat(format) {
    setOpen(false);
    const result = exportRows({ rows, columns, moduleName, format });
    onExported?.(result, format);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:border-slate-600 disabled:opacity-60"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download className="h-4 w-4" />
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500">
            {scope}
          </div>
          <div className="p-1.5">
            {EXPORT_FORMATS.map((f) => {
              const Icon = FORMAT_ICONS[f.value] || Download;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleFormat(f.value)}
                  disabled={rows.length === 0}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
