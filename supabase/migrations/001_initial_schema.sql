-- Pre-Delivery Inspection App: Initial Supabase (PostgreSQL) schema
-- Run this in Supabase Dashboard > SQL Editor, or via Supabase CLI.

-- Users (custom auth; not using Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('technician', 'manager', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_number TEXT NOT NULL UNIQUE,
  inspector_name TEXT NOT NULL,
  inspector_email TEXT NOT NULL,
  inspection_date TIMESTAMPTZ NOT NULL,
  location JSONB DEFAULT '{}',
  barcode TEXT,
  vehicle_info JSONB DEFAULT '{}',
  checklist JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  signatures JSONB DEFAULT '{}',
  privacy_consent BOOLEAN NOT NULL,
  data_retention_days INTEGER DEFAULT 365,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inspections_number ON inspections (inspection_number);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_email ON inspections (lower(inspector_email));
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections (inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections (status);
CREATE INDEX IF NOT EXISTS idx_inspections_created ON inspections (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_barcode ON inspections (barcode);
CREATE INDEX IF NOT EXISTS idx_inspections_vin ON inspections ((vehicle_info->>'vin'));
CREATE INDEX IF NOT EXISTS idx_inspections_license_plate ON inspections ((vehicle_info->>'licensePlate'));
CREATE INDEX IF NOT EXISTS idx_inspections_booking_number ON inspections ((vehicle_info->>'bookingNumber'));

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time ON audit_logs (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs (resource_type, resource_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);

-- Trigger to update updated_at on users and inspections
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS inspections_updated_at ON inspections;
CREATE TRIGGER inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
