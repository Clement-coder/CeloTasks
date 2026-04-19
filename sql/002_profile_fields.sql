-- Add profile fields to the profiles table
alter table profiles
  add column if not exists display_name text,
  add column if not exists email        text,
  add column if not exists avatar_url   text,
  add column if not exists updated_at   timestamptz default now();
