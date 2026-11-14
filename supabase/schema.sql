-- Toma: Supabase schema. Paste into Supabase → SQL Editor → Run.

create table habits (
  id bigint generated always as identity primary key,
  title text not null, icon text, energy int not null default 10
);
create table habit_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  habit_id bigint not null references habits(id),
  log_date date not null default current_date,
  unique (user_id, habit_id, log_date)
);
create table moods (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  mood text not null, created_at timestamptz default now()
);
create table focus_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  category text not null, minutes int not null, created_at timestamptz default now()
);
create table garden_stats (
  user_id uuid primary key references auth.users(id) default auth.uid(),
  energy int not null default 0, updated_at timestamptz default now()
);

-- Row-level security: users only see their own rows
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table moods enable row level security;
alter table focus_sessions enable row level security;
alter table garden_stats enable row level security;

create policy "read habits" on habits for select to authenticated using (true);
create policy "own logs" on habit_logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own moods" on moods for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own focus" on focus_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own garden" on garden_stats for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Seed habits (ids 1-5 match the emoji icons in index.html)
insert into habits (title, energy) values
  ('Control carbohydrates', 10), ('Power walk 20 min', 15),
  ('Think of a good memory', 10), ('Drink 6 glasses of water', 10),
  ('Stretch for 5 minutes', 5);
