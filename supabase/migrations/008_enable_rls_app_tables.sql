-- Enable Row Level Security on application tables (Supabase advisor: rls_disabled_in_public).
--
-- The Next.js app uses SUPABASE_SERVICE_ROLE_KEY only on the server; that role bypasses RLS,
-- so existing API behaviour is unchanged.
--
-- PostgREST (anon / authenticated JWT) will not read or write these tables until you add
-- explicit policies - which is safer than leaving tables open when RLS is disabled.

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_rate_limits ENABLE ROW LEVEL SECURITY;
