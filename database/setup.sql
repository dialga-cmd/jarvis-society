-- ============================================================================
-- JARVIS SOCIETY — complete database setup
-- ----------------------------------------------------------------------------
-- Run this ENTIRE block once in the Supabase SQL editor (Dashboard → SQL
-- Editor → New query → paste → Run). It creates every table, enables RLS on
-- all of them, and creates the image bucket. It is safe to run on a fresh
-- project. It does NOT insert any data — content is added later through the
-- admin panel.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. admins — who is allowed to sign in to /admin
--    (only a service-role call from the server can read this; empty until you
--     add your own email — see "First sign-in" in backend.md)
-- ----------------------------------------------------------------------------
create table if not exists public."admins" (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

comment on table public."admins" is 'Allow-list of emails allowed to access the admin panel.';

-- ----------------------------------------------------------------------------
-- 2. cores — team members shown on the public /teams page and in /admin/team
--    - team     = text[]   : one or more roles (focus areas / Secretary…)
--    - position = text     : Heads | IoT & Electronics | Game Development |
--                            Immersive Technology | Linux Team
-- ----------------------------------------------------------------------------
create table if not exists public."cores" (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  team       text[] not null default '{}',
  position   text not null,
  tenure     text not null,
  region     text not null,
  email      text not null,
  image      text,
  linkedin   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public."cores" is 'Core team members. Public reads happen via the app; anon key gets nothing (RLS enforced).';

-- ----------------------------------------------------------------------------
-- 3. projects — shown in the home page marquee and in /admin/projects
-- ----------------------------------------------------------------------------
create table if not exists public."projects" (
  id         text primary key,
  name       text not null,
  domain     text,
  blurb      text,
  status     text,
  tags       text[] not null default '{}',
  github     text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public."projects" is 'Projects feed. Anyone may read; only the server may write.';

-- ----------------------------------------------------------------------------
-- 4. updated_at trigger (keeps updated_at current on every UPDATE)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_cores_updated_at on public."cores";
create trigger set_cores_updated_at
  before update on public."cores"
  for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public."projects";
create trigger set_projects_updated_at
  before update on public."projects"
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- The anon key is public (it ships in the browser). RLS is what stops anyone
-- from tampering through it. The app's server uses the service-role key,
-- which bypasses all of this, so the app keeps working normally.

-- projects: everyone may read (public data), nobody may write via anon.
alter table public."projects" enable row level security;
create policy "public read" on public."projects"
  for select to anon, authenticated using (true);

-- cores: no anon policies → the anon key cannot read or write. The public
-- /teams page is rendered server-side, so this is safe.
alter table public."cores" enable row level security;

-- admins: no anon policies → only the server (service-role key) can read it.
alter table public."admins" enable row level security;

-- ----------------------------------------------------------------------------
-- 6. STORAGE BUCKET — member profile images live in the public "public-data"
-- bucket. This creates it and marks it public so uploaded .webp files get a
-- shareable URL.
-- ----------------------------------------------------------------------------
create or replace function public.create_public_data_bucket()
returns void language plpgsql as $$
begin
  insert into storage.buckets (id, name, public)
  values ('public-data', 'public-data', true)
  on conflict (id) do update set public = true;
end $$;

select public.create_public_data_bucket();
drop function public.create_public_data_bucket();

-- ============================================================================
-- DONE. Tables: admins, cores, projects. Bucket: public-data.
-- Next steps (see backend.md):
--   1. enable the Google OAuth provider with your credentials
--   2. add your email to admins so you can sign in:
--        insert into public."admins" (email) values ('you@gmail.com');
-- ============================================================================