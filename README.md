# 🤖 JARVIS SOCIETY

Jarvis Society is a high-performance web application showcasing core team members, events, and an interactive playground. It is built with **Next.js 14**, **Supabase**, **GSAP**, and **Three.js**.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account
- A Google Cloud Console project (for OAuth login)

### 2. Local Development
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase keys (see "Environment Variables" below)

# Run development server
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🛠 Backend Setup Guide

The application uses Supabase for authentication, database, and file storage.

### 1. Environment Variables
Fill in your `.env` file with the following:

| Variable | Source | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase Project Settings → API | Your project URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API | Same as above |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API | The `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API | The `service_role` secret key (**Server-only!**) |

### 2. Database Schema
Run the following SQL script in the **Supabase SQL Editor** (Dashboard $\rightarrow$ SQL Editor $\rightarrow$ New Query). This script creates the necessary tables, enables Row Level Security (RLS), and sets up the storage bucket.

```sql
-- ============================================================================
-- JARVIS SOCIETY — complete database setup
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. admins — who is allowed to sign in to /admin
create table if not exists public."admins" (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

-- 2. cores — team members shown on the public /teams page
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

-- 3. events — scheduled events and sessions
create table if not exists public."events" (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  registration_link text,
  youtube_link      text,
  start_time        text,
  end_time          text,
  image             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 4. updated_at trigger
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

drop trigger if exists set_events_updated_at on public."events";
create trigger set_events_updated_at
  before update on public."events"
  for each row execute function public.set_updated_at();

-- 5. ROW LEVEL SECURITY
alter table public."cores" enable row level security;
alter table public."events" enable row level security;
create policy "public read events" on public."events"
  for select to anon, authenticated using (true);
alter table public."admins" enable row level security;

-- 6. STORAGE BUCKET
create or replace function public.create_public_data_bucket()
returns void language plpgsql as $$
begin
  insert into storage.buckets (id, name, public)
  values ('public-data', 'public-data', true)
  on conflict (id) do update set public = true;
end $$;

select public.create_public_data_bucket();
drop function public.create_public_data_bucket();
```

### 3. Authentication & Admin Access

#### Google OAuth Setup
1. Go to **Google Cloud Console** $\rightarrow$ **APIs & Services** $\rightarrow$ **OAuth consent screen** and configure it.
2. Create **OAuth client ID** (Web application).
3. **Authorized JavaScript origins**: `http://localhost:3000` and your production URL.
4. **Authorized redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
5. Copy the **Client ID** and **Client Secret** to **Supabase** $\rightarrow$ **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Google**.
6. In **Supabase** $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**, add `http://localhost:3000/auth/callback` to the Redirect URLs.

#### First Sign-In
The `/admin` panel is protected. To grant yourself access, run this in the Supabase SQL Editor:
```sql
insert into public."admins" (email) values ('your-google-email@gmail.com');
```

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Animations**: GSAP, Lenis (Smooth Scroll)
- **3D Rendering**: Three.js / React Three Fiber
- **Backend**: Supabase (Postgres, Auth, Storage)
- **Icons**: Phosphor Icons
