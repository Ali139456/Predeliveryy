-- Blue Slip / Pink Slip inspection types + customer-facing inspection bookings.

-- 1) inspections: add type, AIS station, licence number, overall result.
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS inspection_type TEXT NOT NULL DEFAULT 'pdi';

ALTER TABLE inspections DROP CONSTRAINT IF EXISTS inspections_type_check;
ALTER TABLE inspections
  ADD CONSTRAINT inspections_type_check
  CHECK (inspection_type IN ('pdi', 'blue_slip', 'pink_slip'));

ALTER TABLE inspections ADD COLUMN IF NOT EXISTS ais_station TEXT;
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS inspector_licence_no TEXT;
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS result TEXT;

ALTER TABLE inspections DROP CONSTRAINT IF EXISTS inspections_result_check;
ALTER TABLE inspections
  ADD CONSTRAINT inspections_result_check
  CHECK (result IS NULL OR result IN ('pass', 'fail'));

CREATE INDEX IF NOT EXISTS idx_inspections_type ON inspections (inspection_type);
CREATE INDEX IF NOT EXISTS idx_inspections_result ON inspections (result);

COMMENT ON COLUMN inspections.inspection_type IS 'pdi | blue_slip | pink_slip';
COMMENT ON COLUMN inspections.ais_station IS 'Authorised Inspection Station name (Blue/Pink slip)';
COMMENT ON COLUMN inspections.inspector_licence_no IS 'Inspector AUVIS/AIS licence number (Blue/Pink slip)';
COMMENT ON COLUMN inspections.result IS 'Overall pass/fail for Blue/Pink slip submissions';

-- 2) users: flag authorised AUVIS/AIS inspectors and capture their licence number.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_authorised_inspector BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS inspector_licence_no TEXT;

COMMENT ON COLUMN users.is_authorised_inspector IS 'True if user may submit Blue/Pink slip inspections.';
COMMENT ON COLUMN users.inspector_licence_no IS 'AUVIS/AIS licence number for this inspector.';

-- 3) Customer-facing inspection bookings table.
CREATE TABLE IF NOT EXISTS inspection_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('pdi', 'blue_slip', 'pink_slip')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year TEXT,
  vehicle_rego TEXT,
  vehicle_vin TEXT,
  preferred_date DATE,
  preferred_time_slot TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'cancelled')),
  inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status_created
  ON inspection_bookings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_type
  ON inspection_bookings (inspection_type);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant
  ON inspection_bookings (tenant_id);

DROP TRIGGER IF EXISTS bookings_updated_at ON inspection_bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON inspection_bookings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- 4) Lock direct PostgREST access; all CRUD goes through Next.js (service role).
ALTER TABLE inspection_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_anon_authenticated ON inspection_bookings;
CREATE POLICY deny_anon_authenticated ON inspection_bookings
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
