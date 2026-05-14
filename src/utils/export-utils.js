/**
 * export-utils.js
 *
 * Zero-dependency exporters for CSV, PDF and Word DOCX. The PDF path
 * opens a print-ready window (user picks "Save as PDF") so we avoid
 * adding jsPDF / jspdf-autotable to the bundle. DOCX is emitted as a
 * minimal WordprocessingML XML document wrapped in a .docx-friendly
 * Blob — Word, LibreOffice and Google Docs all accept this shape.
 *
 * Usage:
 *   exportRows({ rows, columns, moduleName, format })
 *
 * `columns` is an array of { key, header } in display order.
 * `rows` is an array of plain objects whose values are stringifiable.
 */

function todayStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function safeFilename(moduleName, ext) {
  const slug = (moduleName || 'export')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug}-export-${todayStamp()}.${ext}`;
}

function toCell(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeCsv(value) {
  const s = toCell(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function escapeHtml(value) {
  return toCell(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value) {
  return toCell(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------ CSV ------------------------------ */

export function exportCsv({ rows, columns, moduleName }) {
  const headerLine = columns.map((c) => escapeCsv(c.header)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsv(getCellValue(row, c))).join(',')
  );
  const csv = '﻿' + [headerLine, ...lines].join('\r\n');
  downloadBlob(
    safeFilename(moduleName, 'csv'),
    new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  );
}

/* ------------------------------ PDF ------------------------------ */

export function exportPdf({ rows, columns, moduleName }) {
  const title = moduleName || 'Export';
  const stamp = new Date().toLocaleString();
  const head = columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('');
  const body = rows
    .map(
      (row, i) =>
        `<tr><td>${i + 1}</td>${columns
          .map((c) => `<td>${escapeHtml(getCellValue(row, c))}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 600; }
  tr:nth-child(even) td { background: #f8fafc; }
  @media print { body { margin: 12mm; } }
</style></head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">Generated ${escapeHtml(stamp)} &middot; ${rows.length} rows</div>
  <table>
    <thead><tr><th>Sr. No.</th>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 250); });</script>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) {
    downloadBlob(
      safeFilename(moduleName, 'html'),
      new Blob([html], { type: 'text/html;charset=utf-8;' })
    );
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/* ------------------------------ DOCX ----------------------------- */

function docxParagraph(text, opts = {}) {
  const bold = opts.bold ? '<w:rPr><w:b/></w:rPr>' : '';
  return `<w:p><w:r>${bold}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function docxCell(text, opts = {}) {
  return `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>${docxParagraph(text, opts)}</w:tc>`;
}

export function exportDocx({ rows, columns, moduleName }) {
  const title = moduleName || 'Export';
  const stamp = new Date().toLocaleString();

  const headerRow =
    '<w:tr>' +
    docxCell('Sr. No.', { bold: true }) +
    columns.map((c) => docxCell(c.header, { bold: true })).join('') +
    '</w:tr>';

  const bodyRows = rows
    .map(
      (row, i) =>
        '<w:tr>' +
        docxCell(String(i + 1)) +
        columns.map((c) => docxCell(toCell(getCellValue(row, c)))).join('') +
        '</w:tr>'
    )
    .join('');

  const tableBorders =
    '<w:tblPr><w:tblW w:w="0" w:type="auto"/>' +
    '<w:tblBorders>' +
    ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
      .map((p) => `<w:${p} w:val="single" w:sz="4" w:color="CBD5E1"/>`)
      .join('') +
    '</w:tblBorders></w:tblPr>';

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${docxParagraph(title, { bold: true })}
    ${docxParagraph(`Generated ${stamp} - ${rows.length} rows`)}
    <w:tbl>${tableBorders}${headerRow}${bodyRows}</w:tbl>
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>
  </w:body>
</w:document>`;

  // Word accepts a single-part WordprocessingML XML as a .docx; for max
  // compatibility we set the standard MIME type.
  downloadBlob(
    safeFilename(moduleName, 'doc'),
    new Blob([documentXml], { type: 'application/msword' })
  );
}

/* ------------------------------ API ------------------------------ */

function getCellValue(row, column) {
  if (typeof column.value === 'function') return column.value(row);
  return row[column.key];
}

export function exportRows({ rows, columns, moduleName, format }) {
  if (!rows || rows.length === 0) {
    return { ok: false, reason: 'empty' };
  }
  switch (format) {
    case 'csv':
      exportCsv({ rows, columns, moduleName });
      break;
    case 'pdf':
      exportPdf({ rows, columns, moduleName });
      break;
    case 'docx':
      exportDocx({ rows, columns, moduleName });
      break;
    default:
      return { ok: false, reason: 'unknown-format' };
  }
  return { ok: true, count: rows.length };
}

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'pdf', label: 'PDF (print)' },
  { value: 'docx', label: 'Word (.doc)' },
];
