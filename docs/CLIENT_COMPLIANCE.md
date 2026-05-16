# Client compliance matrix (Pre Delivery)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Multi-tenant isolation (`tenant_id`) | Done | API filters by tenant; RLS on app tables |
| Roles: admin, technician, manager | Done | |
| Client viewer (read-only) | Done | Role `viewer` — tenant-wide view, no edits/uploads |
| Admin MFA (TOTP) | Done | Enable with `ENFORCE_ADMIN_MFA=true`; setup at first admin login |
| Private object storage | Partial | S3 module in `infra/terraform`; app also supports Supabase Storage |
| AWS Sydney (`ap-southeast-2`) | In progress | Terraform defaults to Sydney; point Supabase project to same region |
| Signed file URLs | Done | `/api/files/signed` |
| Audit logs (immutable) | Done | Migration `004_audit_logs_immutable.sql` |
| Rate limiting | Done | `lib/rateLimit` |
| Dev / staging / prod separation | Process | Separate Supabase projects + env vars per environment |
| Daily backups + restore test | Ops | Supabase/AWS backup policies + quarterly restore drill |
| Malware scan on uploads | Partial | MIME/size checks in `lib/secureUpload.ts`; add AV scanner (e.g. ClamAV/Lambda) for production |
| Field-level VIN encryption | Optional | Rely on DB-at-rest + tenant isolation unless client mandates app-level encryption |

## Deploy checklist

1. Run Supabase migration `011_viewer_role_and_admin_mfa.sql` on each environment.
2. Set `ENFORCE_ADMIN_MFA=true` in production when admins have enrolled MFA.
3. Apply `infra/terraform` for Sydney S3; wire bucket credentials into Vercel/hosting env.
4. Confirm Supabase project region is **Asia Pacific (Sydney)** or equivalent.
