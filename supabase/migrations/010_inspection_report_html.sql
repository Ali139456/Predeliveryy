-- Frozen HTML report snapshot for print/email parity (same layout as browser print).
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS report_html TEXT,
  ADD COLUMN IF NOT EXISTS report_html_at TIMESTAMPTZ;

COMMENT ON COLUMN inspections.report_html IS 'Full HTML document for inspection report (print/email PDF)';
COMMENT ON COLUMN inspections.report_html_at IS 'When report_html was last generated';
