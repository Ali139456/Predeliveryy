-- Ravin AI integration state (OTL link, S3 submit status, webhook results)
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS ravin_integration JSONB DEFAULT NULL;

COMMENT ON COLUMN inspections.ravin_integration IS 'Ravin AI lifecycle: OTL URL, submit status, damage report summary';

CREATE INDEX IF NOT EXISTS idx_inspections_ravin_invitation
  ON inspections ((ravin_integration->>'invitationId'));
