-- Toma v4 update. Run ONCE in Supabase -> SQL Editor (after schema.sql and update-custom-habits.sql).
-- 1) every habit is editable/deletable  2) custom focus timers  3) one mood per day (calendar)

-- ---- 1) Starter habits become per-user copies ----
update habits set icon = case title
  when 'Control carbohydrates' then '🥗' when 'Power walk 20 min' then '🚶‍♀️'
  when 'Think of a good memory' then '💭' when 'Drink 6 glasses of water' then '💧'
  when 'Stretch for 5 minutes' then '🧘' else icon end
where user_id is null;

-- give every existing user their own copy of the starters
insert into habits (title, energy, icon, user_id)
select t.title, t.energy, t.icon, u.id from habits t cross join auth.users u
where t.user_id is null
  and not exists (select 1 from habits h where h.user_id = u.id and h.title = t.title);

-- move existing check-ins onto the user's own copy
update habit_logs l set habit_id = h.id
from habits t, habits h
where l.habit_id = t.id and t.user_id is null and h.user_id = l.user_id and h.title = t.title;

-- new accounts get their own copy automatically
create or replace function public.seed_user_habits() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.habits (title, energy, icon, user_id)
  select title, energy, icon, new.id from public.habits where user_id is null;
  return new;
end; $$;
drop trigger if exists on_auth_user_created_seed_habits on auth.users;
create trigger on_auth_user_created_seed_habits after insert on auth.users
  for each row execute function public.seed_user_habits();

-- users now only see their own habits (the shared starters stay as hidden templates)
drop policy if exists "read habits" on habits;
create policy "read habits" on habits for select to authenticated using (user_id = auth.uid());

-- ---- 2) Custom focus timers (stored per user as JSON) ----
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  focus_types jsonb, updated_at timestamptz default now()
);
alter table user_settings enable row level security;
drop policy if exists "own settings" on user_settings;
create policy "own settings" on user_settings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- 3) One mood per day ----
alter table moods add column if not exists mood_date date;
update moods set mood_date = created_at::date where mood_date is null;
delete from moods a using moods b where a.user_id = b.user_id and a.mood_date = b.mood_date and a.id < b.id;
alter table moods alter column mood_date set not null;
alter table moods drop constraint if exists moods_user_day_key;
alter table moods add constraint moods_user_day_key unique (user_id, mood_date);
