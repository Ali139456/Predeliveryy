-- Add organisation/business fields to tenants
alter table if exists tenants
  add column if not exists business_name text,
  add column if not exists abn text,
  add column if not exists business_address text,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_number text;

