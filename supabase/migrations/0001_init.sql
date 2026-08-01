-- 0001_init.sql
-- Initial schema for Dream Studio

-- Studios
create table public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Weddings (belong to a studio)
create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  client_names text,
  event_date date,
  status text not null default 'upcoming',
  access_token text,
  created_at timestamptz not null default now()
);

create index weddings_studio_id_idx on public.weddings (studio_id);

-- Media (files belonging to a wedding)
create table public.media (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  category text,
  media_type text not null,
  storage_path text,
  preview_path text,
  created_at timestamptz not null default now()
);

create index media_wedding_id_idx on public.media (wedding_id);

-- Selections (client choices on media)
create table public.selections (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media(id) on delete cascade,
  favorited boolean not null default false,
  in_album boolean not null default false,
  client_note text,
  created_at timestamptz not null default now()
);

create index selections_media_id_idx on public.selections (media_id);

-- Staff (members of a studio)
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  role text,
  created_at timestamptz not null default now()
);

create index staff_studio_id_idx on public.staff (studio_id);
