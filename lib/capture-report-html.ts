/**
 * Capture the on-screen inspection report markup (same DOM as Print Report).
 */
export function captureInspectionReportHtml(): string | null {
  if (typeof document === 'undefined') return null;
  const root = document.querySelector('.inspection-report-root');
  if (!root) return null;
  return root.outerHTML;
}
