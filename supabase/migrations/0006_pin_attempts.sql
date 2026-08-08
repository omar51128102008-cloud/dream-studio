-- 0006_pin_attempts.sql
-- Failed PIN verification attempts, used for brute-force lockout.
-- Only failed attempts are recorded; a successful PIN clears the counter.
create table public.pin_attempts (
  id uuid primary key default gen_random_uuid(),
  access_token text not null,
  attempted_at timestamptz not null default now()
);

create index pin_attempts_token_time_idx on public.pin_attempts (access_token, attempted_at);

-- Only the service role (admin client) may touch this table, so the exposed
-- anon key cannot be used to read or reset the lockout counter.
alter table public.pin_attempts enable row level security;
