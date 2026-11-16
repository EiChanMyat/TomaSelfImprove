-- Toma v8: money tracker (income and expenses). Run ONCE in Supabase -> SQL Editor.
create table if not exists transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0 and amount <= 999999999),
  label text not null check (char_length(label) between 1 and 20),
  note text check (note is null or char_length(note) <= 60),
  tx_date date not null default current_date,
  created_at timestamptz default now()
);
create index if not exists transactions_user_date on transactions (user_id, tx_date desc);
alter table transactions enable row level security;
drop policy if exists "own transactions" on transactions;
create policy "own transactions" on transactions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- the user's own saved labels and currency
alter table user_settings add column if not exists money jsonb;
