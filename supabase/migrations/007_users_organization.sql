-- Optional per-user organisation label (e.g. department); complements tenant / business_name
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization text;
