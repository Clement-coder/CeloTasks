-- ============================================================
-- Migration 008: Replace calendar deadline with duration-based
--                delivery window (hours after accept)
-- ============================================================

-- 1. Add accepted_at: set when a worker is assigned to a task
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Add duration_hours: how many hours the worker has after accepting
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT NULL;

-- 3. Make the old deadline column nullable (kept for backwards compat)
ALTER TABLE tasks
  ALTER COLUMN deadline DROP NOT NULL;

-- 4. Index for fast lookup of in-progress tasks by accepted_at
CREATE INDEX IF NOT EXISTS idx_tasks_accepted_at
  ON tasks (accepted_at)
  WHERE status = 'in_progress';

-- 5. Backfill duration_hours from estimated_hours for existing rows
UPDATE tasks
  SET duration_hours = estimated_hours
  WHERE duration_hours IS NULL AND estimated_hours IS NOT NULL;
