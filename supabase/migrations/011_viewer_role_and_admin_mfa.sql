-- Client viewer role (read-only tenant access) + admin TOTP MFA

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('technician', 'manager', 'admin', 'viewer'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN users.mfa_secret IS 'Base32 TOTP secret; never expose to clients';
COMMENT ON COLUMN users.mfa_enabled IS 'When true, admin must pass MFA after password at login';
