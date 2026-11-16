-- Toma v7: habit schedules and achievements. Run ONCE in Supabase -> SQL Editor.
-- days = weekdays a habit repeats on (0 = Sunday ... 6 = Saturday). null means every day.
alter table habits add column if not exists days int[];
alter table habits drop constraint if exists habits_days_valid;
alter table habits add constraint habits_days_valid check (days is null or days <@ array[0,1,2,3,4,5,6]);

-- earned achievements, saved per user
alter table user_settings add column if not exists badges jsonb;
