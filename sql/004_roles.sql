-- Add role to profiles table
alter table profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin'));

-- To make a wallet an admin, run:
-- update profiles set role = 'admin' where wallet = '0xyourwallethere';
