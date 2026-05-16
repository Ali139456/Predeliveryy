# Backup & restore runbook (Pre Delivery)

Client requirement: daily backups, 30-day retention, restore tested.

## Supabase (database)

1. **Dashboard** → Project → **Database** → **Backups**
2. Enable **Point in Time Recovery (PITR)** on Pro plan (recommended for production)
3. Confirm retention meets **30 days** (plan-dependent)
4. **Quarterly restore test:**
   - Create a staging Supabase project
   - Restore backup / branch from production snapshot
   - Run smoke test: login, list inspections, open one report
   - Record date + tester name in your compliance log

## Application files (S3 Sydney)

- Bucket: `predelivery-uploads-prod-119163973575` (versioning enabled via Terraform)
- Enable **S3 Versioning** lifecycle if 30-day non-current version expiry is required (add in AWS console or Terraform)

## Secrets

- Store production secrets only in **Vercel Environment Variables** (or AWS Secrets Manager if migrating)
- Rotate `JWT_SECRET`, AWS keys, and OAuth client secrets annually or after any leak

## Evidence for client audit

Keep a one-page record:

| Date | Test | Result | Tester |
|------|------|--------|--------|
| YYYY-MM-DD | Supabase restore to staging | Pass/Fail | Name |
