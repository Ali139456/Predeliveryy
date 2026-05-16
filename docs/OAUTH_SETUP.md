# Google & Microsoft SSO setup

## Google

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials**
2. Create **OAuth client ID** (Web application)
3. Authorized redirect URI:
   - `https://www.predelivery.ai/api/auth/oauth/google/callback`
   - `http://localhost:3000/api/auth/oauth/google/callback` (dev)
4. Vercel env:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## Microsoft (Azure AD)

1. [Azure Portal](https://portal.azure.com/) → **Microsoft Entra ID** → App registrations → **New registration**
2. Redirect URI (Web):
   - `https://www.predelivery.ai/api/auth/oauth/microsoft/callback`
3. Certificates & secrets → **New client secret**
4. API permissions: `openid`, `email`, `profile`, `User.Read`
5. Vercel env:
   - `AZURE_AD_CLIENT_ID`
   - `AZURE_AD_CLIENT_SECRET`
   - `AZURE_AD_TENANT_ID` = `common` (multi-tenant) or your tenant ID

## Rules

- User must **already exist** in `users` table (invite-only). Unknown emails are rejected and audited.
- **Admin** accounts still require **MFA** after SSO when `ENFORCE_ADMIN_MFA=true`.
