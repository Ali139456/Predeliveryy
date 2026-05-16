-- Defense in depth: block direct PostgREST access via anon/authenticated JWT
-- (Next.js server uses service_role which bypasses RLS; API enforces tenant_id.)

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users', 'tenants', 'inspections', 'audit_logs', 'api_rate_limits']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS deny_anon_authenticated ON %I', t);
    EXECUTE format(
      'CREATE POLICY deny_anon_authenticated ON %I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      t
    );
  END LOOP;
END $$;
