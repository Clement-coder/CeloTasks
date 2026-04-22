-- 006_onchain_payments.sql
-- Audit table for every onchain payment event emitted by CeloTasks.sol.
-- Populated by a backend listener watching PaymentReleased events.

create table if not exists onchain_payments (
  id               uuid primary key default gen_random_uuid(),
  task_id          uuid not null references tasks(id) on delete cascade,
  chain_task_id    text not null,
  tx_hash          text not null unique,
  from_address     text not null,   -- creator wallet
  to_address       text not null,   -- worker wallet
  amount_wei       text not null,   -- uint256 as string to avoid numeric overflow
  amount_cusd      numeric(18,4),   -- human-readable cUSD amount
  block_number     bigint,
  confirmed_at     timestamptz default now()
);

alter table onchain_payments enable row level security;

create policy "onchain_payments_select" on onchain_payments for select using (true);
create policy "onchain_payments_insert" on onchain_payments for insert with check (true);

create index if not exists idx_onchain_payments_task    on onchain_payments(task_id);
create index if not exists idx_onchain_payments_to      on onchain_payments(to_address);
create index if not exists idx_onchain_payments_tx_hash on onchain_payments(tx_hash);

comment on table onchain_payments is 'Immutable audit log of every PaymentReleased event from CeloTasks.sol';
