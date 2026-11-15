-- Toma v6: profile (display + garden name) and delete-my-account. Run ONCE in Supabase -> SQL Editor.
alter table user_settings add column if not exists display_name text;
alter table user_settings add column if not exists garden_name text;

-- deleting an account must also delete everything it owns
alter table habit_logs     drop constraint if exists habit_logs_user_id_fkey,     add constraint habit_logs_user_id_fkey     foreign key (user_id) references auth.users(id) on delete cascade;
alter table moods          drop constraint if exists moods_user_id_fkey,          add constraint moods_user_id_fkey          foreign key (user_id) references auth.users(id) on delete cascade;
alter table focus_sessions drop constraint if exists focus_sessions_user_id_fkey, add constraint focus_sessions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
alter table garden_stats   drop constraint if exists garden_stats_user_id_fkey,   add constraint garden_stats_user_id_fkey   foreign key (user_id) references auth.users(id) on delete cascade;

create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public, auth as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
