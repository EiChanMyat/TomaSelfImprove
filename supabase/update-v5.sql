-- Toma v5: to-do list. Run ONCE in Supabase -> SQL Editor.
create table if not exists todos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  text text not null check (char_length(text) between 1 and 120),
  done boolean not null default false,
  created_at timestamptz default now()
);
alter table todos enable row level security;
drop policy if exists "own todos" on todos;
create policy "own todos" on todos for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
