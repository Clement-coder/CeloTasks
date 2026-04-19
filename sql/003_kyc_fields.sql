-- Add KYC fields to profiles table
alter table profiles
  add column if not exists is_verified     boolean default false,
  add column if not exists verification_id text;
