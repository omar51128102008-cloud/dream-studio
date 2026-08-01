-- 0003_auth.sql
-- Link staff members to Supabase auth users so dashboard actions
-- can resolve the logged-in user's studio.

alter table public.staff
  add column user_id uuid references auth.users(id) on delete cascade;

create unique index staff_user_id_key on public.staff (user_id);

create index staff_studio_id_idx on public.staff (studio_id);
