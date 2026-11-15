-- Toma update: custom habits. Run ONCE in Supabase -> SQL Editor (after schema.sql).
-- The 5 starter habits keep user_id = null and stay shared; habits users add belong to them.

alter table habits add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- keep reasonable values (stops anyone sending huge rewards)
alter table habits drop constraint if exists habits_energy_range;
alter table habits add constraint habits_energy_range check (energy between 1 and 20);
alter table habits drop constraint if exists habits_title_length;
alter table habits add constraint habits_title_length check (char_length(title) between 1 and 60);

-- deleting a habit also deletes its check-in history
alter table habit_logs drop constraint if exists habit_logs_habit_id_fkey;
alter table habit_logs add constraint habit_logs_habit_id_fkey
  foreign key (habit_id) references habits(id) on delete cascade;

-- row-level security: see the shared starters + your own; change only your own
drop policy if exists "read habits" on habits;
drop policy if exists "add own habits" on habits;
drop policy if exists "edit own habits" on habits;
drop policy if exists "delete own habits" on habits;
create policy "read habits" on habits for select to authenticated using (user_id is null or user_id = auth.uid());
create policy "add own habits" on habits for insert to authenticated with check (user_id = auth.uid());
create policy "edit own habits" on habits for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own habits" on habits for delete to authenticated using (user_id = auth.uid());
