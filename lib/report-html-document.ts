import 'server-only';

import fs from 'fs';
import path from 'path';

const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

export function readInspectionReportCss(): string {
  const cssPath = path.join(process.cwd(), 'components', 'inspection-report.css');
  return fs.readFileSync(cssPath, 'utf8');
}

const PRINT_EXTRAS = `
  @page { size: A4 portrait; margin: 6mm; }
  html, body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .inspection-report-root { padding: 0 !important; }
  .inspection-report-sheet { box-shadow: none !important; max-width: none !important; width: 100% !important; }
  .report-checklist-grid { column-count: 2 !important; column-gap: 4px !important; }
  @media (min-width: 1024px) {
    .report-checklist-grid { column-count: 4 !important; }
  }
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
