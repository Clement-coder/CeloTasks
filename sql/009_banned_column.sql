-- ============================================================
-- Migration 009: Add banned column to profiles for proper
--                account suspension (separate from role)
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast filtering of banned users
CREATE INDEX IF NOT EXISTS idx_profiles_banned
  ON profiles (banned)
  WHERE banned = TRUE;

-- RLS: banned users cannot read or write tasks
-- (add to your existing RLS policies if enabled)
-- Example policy addition:
-- CREATE POLICY "banned_users_blocked" ON tasks
--   AS RESTRICTIVE
--   USING (
--     NOT EXISTS (
--       SELECT 1 FROM profiles
--       WHERE wallet = auth.uid()::text AND banned = TRUE
--     )
--   );
