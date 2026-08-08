-- 0005_pin.sql
-- Optional access PIN for client galleries.
-- Nullable: existing weddings (no PIN) keep working without any changes.
alter table public.weddings
  add column pin text;
