# Client compliance matrix (Pre Delivery)

Last updated: implementation pass for remaining security items.

| Requirement | Status | Notes |
|-------------|--------|--------|
| Multi-tenant isolation | **Done** | `tenant_id` on API; cross-tenant key prefix on files |
| RLS enforced | **Done** | Tables RLS on; `012` denies anon/authenticated direct access |
| Tenant ID DB + API | **Done** | |
| Hosting AWS Sydney | **Partial** | S3 `ap-southeast-2` ✅; app on Vercel; confirm Supabase region |
| JWT authentication | **Done** | |
| OAuth Google + Microsoft | **Done*** | *Requires env + OAuth app registration (`docs/OAUTH_SETUP.md`) |
| Admin MFA (TOTP) | **Done** | `ENFORCE_ADMIN_MFA` |
| RBAC Admin / Inspector / Client | **Done** | `admin` / `technician` / `viewer` (+ `manager`) |
| Audit: logins | **Done** | incl. OAuth |
| Audit: data access | **Done** | inspection view/list, file access, export |
| Audit immutable | **Done** | `004_audit_logs_immutable.sql` |
| Audit exportable | **Done** | Admin audit API |
| Encryption at rest | **Done** | Supabase + S3 AES-256 |
| TLS in transit | **Done** | HTTPS |
| Daily backup / 30-day / restore test | **Ops** | `docs/BACKUP_RESTORE_RUNBOOK.md` |
| Rate limiting | **Done** | |
| Input validation | **Done** | Zod |
| File upload scanning | **Done*** | VirusTotal optional; `UPLOAD_MALWARE_SCAN` + `VIRUSTOTAL_API_KEY` |
| Secure secrets | **Partial** | Vercel env; use AWS Secrets Manager for full compliance |
| Full app on AWS | **Planned** | Vercel → Amplify/ECS Sydney (Phase 2) |

## New migrations to run

- `012_rls_deny_anon.sql`

## New env vars

See `.env.local.example` for OAuth and malware scan.
