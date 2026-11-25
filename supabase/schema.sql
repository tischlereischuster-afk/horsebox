-- =====================================================================
-- Horsebox: Datenbank-Schema
-- Einmal komplett im Supabase SQL Editor ausführen (Dashboard -> SQL Editor -> New query)
-- =====================================================================

-- ---------- Pferde ----------
create table if not exists public.horses (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  slug          text not null unique,          -- Teil des Teilen-Links: /p/<slug>
  name          text not null,
  birth_year    int,
  sex           text,                          -- Stute / Wallach / Hengst
  color         text,                          -- Farbe
  breed         text,                          -- Rasse / Zuchtverband
  height_cm     int,                           -- Stockmaß
  sire          text,                          -- Vater
  dam           text,                          -- Mutter
  dam_sire      text,                          -- Muttervater
  description   text,
  price_info    text,                          -- z. B. "Preis auf Anfrage"
  rimondo_url  text,
  fn_url        text,                          -- FN / Abstammungs-Link
  is_public     boolean not null default true, -- false = Link funktioniert nicht
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists horses_owner_idx on public.horses(owner_id);

-- ---------- Medien (Videos, Fotos, Röntgen, Dokumente) ----------
do $$ begin
  create type public.media_category as enum ('video', 'photo', 'xray', 'document');
exception when duplicate_object then null; end $$;

create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  horse_id      uuid not null references public.horses(id) on delete cascade,
  category      public.media_category not null,
  file_name     text not null,
  storage_path  text not null unique,
  mime_type     text,
  size_bytes    bigint,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists media_horse_idx on public.media(horse_id);

-- ---------- Zugriffsregeln (Row Level Security) ----------
alter table public.horses enable row level security;
alter table public.media  enable row level security;

-- Verkäufer sieht und bearbeitet nur seine eigenen Pferde
drop policy if exists "owner manages horses" on public.horses;
create policy "owner manages horses" on public.horses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Jeder (auch ohne Login) darf veröffentlichte Pferde lesen
drop policy if exists "public reads public horses" on public.horses;
create policy "public reads public horses" on public.horses
  for select using (is_public = true);

drop policy if exists "owner manages media" on public.media;
create policy "owner manages media" on public.media
  for all using (
    exists (select 1 from public.horses h where h.id = horse_id and h.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.horses h where h.id = horse_id and h.owner_id = auth.uid())
  );

drop policy if exists "public reads media of public horses" on public.media;
create policy "public reads media of public horses" on public.media
  for select using (
    exists (select 1 from public.horses h where h.id = horse_id and h.is_public = true)
  );

-- updated_at automatisch setzen
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists horses_touch on public.horses;
create trigger horses_touch before update on public.horses
  for each row execute function public.touch_updated_at();

-- ---------- Verkäufer-Profil ----------
-- Name, Stall, Ort und Telefonnummer. Wird auf der Kundenseite angezeigt,
-- damit der Kunde den Verkäufer direkt per WhatsApp oder Telefon erreicht.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,                          -- z. B. "Axel Schuster"
  stable_name   text,                          -- z. B. "Pferdehof Sonnental"
  location      text,                          -- z. B. "Lüneburg"
  phone         text,                          -- Handynummer, auch für WhatsApp
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "owner manages profile" on public.profiles;
create policy "owner manages profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Kunden sehen das Profil nur von Verkäufern, die mindestens ein Pferd geteilt haben
drop policy if exists "public reads profile of sellers" on public.profiles;
create policy "public reads profile of sellers" on public.profiles
  for select using (
    exists (select 1 from public.horses h where h.owner_id = profiles.id and h.is_public = true)
  );

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------- Speicher (Storage Bucket) ----------
-- Privater Bucket: Dateien sind nur über zeitlich begrenzte Links erreichbar.
-- file_size_limit: max. Dateigröße pro Datei (hier 5 GB). Achtung: Im kostenlosen
-- Supabase-Tarif sind global nur 50 MB pro Datei erlaubt, siehe README.
insert into storage.buckets (id, name, public, file_size_limit)
values ('horse-media', 'horse-media', false, 5368709120)
on conflict (id) do nothing;
-- Hinweis: Für den Bucket braucht es keine weiteren Regeln. Hoch- und Herunterladen
-- läuft über signierte Links, die nur unser Server (mit dem service_role Schlüssel) erstellt.

-- Rechte für die Daten-API (neue Supabase-Projekte vergeben diese nicht automatisch)
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.horses, public.media, public.profiles to authenticated, service_role;
grant select on public.horses, public.media, public.profiles to anon;
