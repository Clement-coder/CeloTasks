-- 005_contract_fields.sql
-- Adds onchain tracking fields to the tasks table.
-- Run after 004_roles.sql

-- tx_hash: the transaction hash of the createTask() call on Celo
-- chain_task_id: the uint256 taskId returned by the smart contract
-- contract_address: which contract deployment this task belongs to

alter table tasks
  add column if not exists tx_hash         text,
  add column if not exists chain_task_id   text,
  add column if not exists contract_address text;

-- Index for fast lookup by chain task id
create index if not exists idx_tasks_chain_task_id on tasks(chain_task_id);

comment on column tasks.tx_hash          is 'Celo transaction hash of the createTask() contract call';
comment on column tasks.chain_task_id    is 'uint256 taskId returned by CeloTasks.createTask()';
comment on column tasks.contract_address is 'Address of the CeloTasks contract that holds the escrow';
