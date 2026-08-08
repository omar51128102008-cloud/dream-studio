-- 0004_delivery_type.sql
-- Per-photo delivery choice required when a client favors or adds a photo
-- to the album. Nullable by default; enforced at submission time.
alter table public.selections
  add column delivery_type text
    check (delivery_type is null or delivery_type in ('print', 'digital'));
