import 'server-only';

import fs from 'fs';
import path from 'path';

const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

export function readInspectionReportCss(): string {
  const cssPath = path.join(process.cwd(), 'components', 'inspection-report.css');
  return fs.readFileSync(cssPath, 'utf8');
}

const PRINT_EXTRAS = `
  @page { size: A4 portrait; margin: 5mm; }
  html, body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .inspection-report-root { padding: 0 !important; margin: 0 !important; }
  .inspection-report-sheet { box-shadow: none !important; border: none !important; max-width: none !important; width: 100% !important; }
  .report-section-tight { padding: 0.3rem 0.45rem !important; }
  .report-checklist-grid { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 3px !important; width: 100% !important; }
  .report-checklist-category ul { font-size: 7.5px !important; }
  .report-photos-grid { grid-template-columns: repeat(8, minmax(0, 1fr)) !important; gap: 2px !important; }
  .report-badge-evidence-panel, [id^="report-badge-detail-"], .report-badge-evidence { display: none !important; }
  .report-page-1, .report-vehicle-result-row { break-inside: avoid; page-break-inside: avoid; }
`;

/** Wrap report body (from server builder or browser capture) in a full printable HTML document. */
export function wrapReportHtmlDocument(bodyHtml: string, title: string): string {
  const css = readInspectionReportCss();
  const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <script src="${TAILWIND_CDN}"></script>
  <style>${css}\n${PRINT_EXTRAS}</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

/** If client sent only the report root fragment, wrap it the same way. */
export function normalizeStoredReportHtml(stored: string, title: string): string {
  const trimmed = stored.trim();
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
    return trimmed;
  }
  return wrapReportHtmlDocument(trimmed, title);
}
