-- 007_ratings.sql
-- Worker ratings left by task creators after payment.

create table if not exists ratings (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references tasks(id) on delete cascade,
  rater_wallet  text not null,
  ratee_wallet  text not null,
  stars         smallint not null check (stars between 1 and 5),
  comment       text,
  created_at    timestamptz default now(),
  unique (task_id, rater_wallet)
);

alter table ratings enable row level security;

create policy "ratings_select" on ratings for select using (true);
create policy "ratings_insert" on ratings for insert with check (true);
create policy "ratings_update" on ratings for update using (auth.uid()::text = rater_wallet);

create index if not exists idx_ratings_ratee on ratings(ratee_wallet);
create index if not exists idx_ratings_task  on ratings(task_id);

comment on table ratings is 'Star ratings left by task creators for workers after payment.';
