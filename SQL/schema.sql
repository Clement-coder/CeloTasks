-- ============================================================
-- CeloTasks — Full Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- One row per user. Created/updated on every login via Privy.
-- ============================================================
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  wallet        text unique not null,          -- wallet address (lowercase)
  privy_id      text unique,                   -- Privy user DID
  display_name  text,
  created_at    timestamptz default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists tasks (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text not null,
  reward           numeric(18,4) not null,
  currency         text not null default 'cUSD',   -- 'cUSD' | 'CELO'
  status           text not null default 'open',   -- open | in_progress | submitted | approved | paid | cancelled
  category         text not null,                  -- Writing | Design | Development | Testing | Marketing | Video
  difficulty       text not null default 'Quick',  -- Quick | Standard | Advanced
  creator_wallet   text not null references profiles(wallet) on delete cascade,
  acceptor_wallet  text references profiles(wallet) on delete set null,
  deadline         date not null,
  estimated_hours  numeric(6,1),
  deliverables     text[] not null default '{}',
  submission_guide text not null default '',
  tags             text[] not null default '{}',
  creator_feedback text,
  approved_at      timestamptz,
  paid_at          timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on tasks
  for each row execute procedure set_updated_at();

-- ============================================================
-- TASK APPLICATIONS
-- Workers apply to open tasks before being selected
-- ============================================================
create table if not exists task_applications (
  id             uuid primary key default gen_random_uuid(),
  task_id        uuid not null references tasks(id) on delete cascade,
  applicant      text not null references profiles(wallet) on delete cascade,
  note           text not null default '',
  applied_at     timestamptz default now(),
  unique(task_id, applicant)
);

-- ============================================================
-- TASK SUBMISSIONS
-- One active submission per task (upserted on resubmit)
-- ============================================================
create table if not exists task_submissions (
  id               uuid primary key default gen_random_uuid(),
  task_id          uuid not null references tasks(id) on delete cascade,
  worker_wallet    text not null references profiles(wallet) on delete cascade,
  proof_text       text not null,
  proof_link       text not null default '',
  attachment_name  text,
  attachment_url   text,
  submitted_at     timestamptz default now(),
  unique(task_id)   -- only one active submission per task
);

-- ============================================================
-- ACTIVITY FEED
-- Every state transition appends a row here
-- ============================================================
create table if not exists activity (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references tasks(id) on delete cascade,
  task_title  text not null,
  type        text not null,   -- created | accepted | submitted | revision_requested | approved | paid | cancelled
  actor       text not null,   -- wallet address
  note        text not null default '',
  at          timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles          enable row level security;
alter table tasks              enable row level security;
alter table task_applications  enable row level security;
alter table task_submissions   enable row level security;
alter table activity           enable row level security;

-- profiles: anyone can read, only owner can write their own row
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (true);
create policy "profiles_update" on profiles for update using (true);

-- tasks: anyone can read; anyone authenticated can insert; updates allowed for creator/acceptor
create policy "tasks_select"  on tasks for select using (true);
create policy "tasks_insert"  on tasks for insert with check (true);
create policy "tasks_update"  on tasks for update using (true);

-- applications: anyone can read; anyone can insert their own
create policy "applications_select" on task_applications for select using (true);
create policy "applications_insert" on task_applications for insert with check (true);

-- submissions: anyone can read; anyone can insert/update
create policy "submissions_select" on task_submissions for select using (true);
create policy "submissions_insert" on task_submissions for insert with check (true);
create policy "submissions_update" on task_submissions for update using (true);

-- activity: read-only for all; insert from app
create policy "activity_select" on activity for select using (true);
create policy "activity_insert" on activity for insert with check (true);

-- ============================================================
-- INDEXES for common query patterns
-- ============================================================
create index if not exists idx_tasks_status          on tasks(status);
create index if not exists idx_tasks_creator         on tasks(creator_wallet);
create index if not exists idx_tasks_acceptor        on tasks(acceptor_wallet);
create index if not exists idx_tasks_created_at      on tasks(created_at desc);
create index if not exists idx_applications_task     on task_applications(task_id);
create index if not exists idx_submissions_task      on task_submissions(task_id);
create index if not exists idx_activity_task         on activity(task_id);
create index if not exists idx_activity_at           on activity(at desc);
create index if not exists idx_activity_actor        on activity(actor);
