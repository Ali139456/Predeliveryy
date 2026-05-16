# Dev / staging / production

Use **separate** Supabase projects and Vercel projects (or env targets) per environment.

| Environment | Supabase | Vercel | `NEXT_PUBLIC_APP_URL` |
|-------------|----------|--------|------------------------|
| Development | dev project | local / preview | `http://localhost:3000` |
| Staging | staging project | Preview branch | `https://staging.predelivery.ai` |
| Production | prod project | Production | `https://www.predelivery.ai` |

## Required env per environment

- `JWT_SECRET` (unique per env)
- `SUPABASE_*` keys for that project
- `ENFORCE_ADMIN_MFA=true` (production only, after admins enrolled)
- AWS S3 vars (separate bucket per env recommended)
- OAuth redirect URIs must include each env callback:
  - `https://<host>/api/auth/oauth/google/callback`
  - `https://<host>/api/auth/oauth/microsoft/callback`

## Migrations

Run all files in `supabase/migrations/` in order on **each** Supabase project when promoting releases.
