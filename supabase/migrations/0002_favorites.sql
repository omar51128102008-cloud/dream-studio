-- 0002_favorites.sql
-- Enable upserting a single selection row per media item.
create unique index selections_media_id_key on public.selections (media_id);
