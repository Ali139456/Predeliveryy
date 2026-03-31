-- Multi-tenant foundation (tenant isolation by tenant_id)
-- This migration introduces a tenants table and tenant_id columns for logical isolation.

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tenants_updated_at ON tenants;
CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Create a default tenant for existing data (idempotent)
INSERT INTO tenants (name)
VALUES ('Default')
ON CONFLICT (name) DO NOTHING;

-- Add tenant_id columns (nullable first for safe backfill)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Backfill tenant_id for existing rows
DO $$
DECLARE
  default_tenant UUID;
BEGIN
  SELECT id INTO default_tenant FROM tenants WHERE name = 'Default' LIMIT 1;
  IF default_tenant IS NULL THEN
    RAISE EXCEPTION 'Default tenant missing';
  END IF;

  UPDATE users SET tenant_id = default_tenant WHERE tenant_id IS NULL;
  UPDATE inspections SET tenant_id = default_tenant WHERE tenant_id IS NULL;
  UPDATE audit_logs SET tenant_id = default_tenant WHERE tenant_id IS NULL;
END $$;

-- Enforce NOT NULL going forward
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE inspections ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_tenant'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT fk_users_tenant
      FOREIGN KEY (tenant_id) REFERENCES tenants(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_inspections_tenant'
  ) THEN
    ALTER TABLE inspections
      ADD CONSTRAINT fk_inspections_tenant
      FOREIGN KEY (tenant_id) REFERENCES tenants(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_logs_tenant'
  ) THEN
    ALTER TABLE audit_logs
      ADD CONSTRAINT fk_audit_logs_tenant
      FOREIGN KEY (tenant_id) REFERENCES tenants(id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inspections_tenant ON inspections (tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_time ON audit_logs (tenant_id, timestamp DESC);

