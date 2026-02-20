# Supabase Storage bucket for inspection photos

Photo uploads use **Supabase Storage**. Create the bucket once in the Supabase Dashboard:

1. Open your project → **Storage** in the left sidebar.
2. Click **New bucket**.
3. **Name:** `inspections`
4. Enable **Public bucket** (so inspection images can be viewed and embedded in PDFs).
5. Click **Create bucket**.

Optional: to allow uploads from the app without extra RLS, use the default policies or add a policy that allows authenticated/service role uploads. The app uses `SUPABASE_SERVICE_ROLE_KEY`, which can write to Storage when the bucket exists.
