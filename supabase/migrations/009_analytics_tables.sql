-- Flattened analytics for fast admin dashboards (fed when inspections complete).

CREATE TABLE IF NOT EXISTS analytics_inspection_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  inspection_id UUID NOT NULL UNIQUE,
  inspection_number TEXT NOT NULL,
  inspector_email TEXT,
  inspector_name TEXT,
  location_label TEXT NOT NULL DEFAULT 'Unknown',
  inspection_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  total_items INT NOT NULL DEFAULT 0,
  items_ok INT NOT NULL DEFAULT 0,
  items_repair INT NOT NULL DEFAULT 0,
  items_flagged INT NOT NULL DEFAULT 0,
  is_pass BOOLEAN NOT NULL DEFAULT true,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  photo_count INT NOT NULL DEFAULT 0,
  duration_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_tenant_completed
  ON analytics_inspection_summary (tenant_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_tenant_location
  ON analytics_inspection_summary (tenant_id, location_label);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_tenant_pass
  ON analytics_inspection_summary (tenant_id, is_pass, completed_at DESC);

CREATE TABLE IF NOT EXISTS analytics_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  inspection_id UUID NOT NULL,
  inspection_number TEXT NOT NULL,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  status TEXT NOT NULL,
  is_defect BOOLEAN NOT NULL DEFAULT false,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  photo_count INT NOT NULL DEFAULT 0,
  location_label TEXT NOT NULL DEFAULT 'Unknown',
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_items_tenant_completed
  ON analytics_checklist_items (tenant_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_items_tenant_category
  ON analytics_checklist_items (tenant_id, category, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_items_inspection
  ON analytics_checklist_items (inspection_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_items_unique
  ON analytics_checklist_items (inspection_id, category, item_name);

ALTER TABLE analytics_inspection_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_checklist_items ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS analytics_summary_updated_at ON analytics_inspection_summary;
CREATE TRIGGER analytics_summary_updated_at
  BEFORE UPDATE ON analytics_inspection_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
