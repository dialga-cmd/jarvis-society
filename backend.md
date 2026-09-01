# JARVIS SOCIETY — Complete Setup Guide

This is a **fresh-deployment** guide. Nothing is pre-configured — you will
create every account, every table, and every credential yourself. Follow the
steps top to bottom on your own Supabase and Google accounts. There is no demo
data anywhere; all content is added later through the admin panel.

---

## What you need

| Thing | Why | Link |
|---|---|---|
| A **Supabase** account (free) | hosts the database, auth, storage | <https://supabase.com> |
| A **Google** account | sign-in for the admin panel + OAuth app | — |
| **Node.js 18.17+** and **npm** | runs the site | <https://nodejs.org> |
| The repo code | the site itself | — |

Start here, follow steps 1–7 in order.

---

## The big picture (7 steps)

1. Install the project and create your `.env` file
2. Create your Supabase project and copy its URL + keys
3. **Run the one database setup query** — creates every table, security, and the
   image bucket (nothing else to write)
4. Enable **Google sign-in** (one app in Google Cloud, one toggle in Supabase)
5. Fill `.env` with your keys
6. Start the site and add **your email** as an admin
7. Sign in to `/admin` and start adding content

---

## Step 1 — Install the project

```bash
# from the repo folder
npm install
cp .env.example .env
```

`.env` is where your secret keys go. It is git-ignored — never commit it.

---

## Step 2 — Create your Supabase project

1. Log in to <https://supabase.com> → **New project** → pick a name and region →
   set a database password → create it. Wait for it to finish provisioning.
2. Open **Project Settings → API** (left sidebar). Copy these into a scratch
   file for now (they all go into `.env` in Step 5):
   - **Project URL** — looks like `https://abcdefghijklm.supabase.co`
   - **anon / public** key — short, safe to make public
   - **service_role** key — the long secret one. **Reveal it now** (it is only
     shown once after you create it) and **store it privately**. Anyone with
     this key can do anything to your database.

> ❗ **Never** paste the `service_role` key into a public repo or a website.
> The site only ever uses it inside its own server; the browser never sees it.

Your **project REF** is the short slug in the Project URL (e.g. `abcdefghijklm`),
and also shown in **Project Settings → General**. You will need it in Step 4.

---

## Step 3 — Run the database setup query

This is the **one query** that sets up your entire database. It creates:

- `admins` — the allow-list of who may open the admin panel
- `cores` — team members (public `/teams` page + `/admin/team`)
- `projects` — the projects feed (home page marquee + `/admin/projects`)
- RLS security on all tables (see "Security notes" below)
- an automatic `updated_at` timestamp keeper
- the public storage bucket for member photos

It inserts **no data** — you add content through the admin panel later.

Open **Supabase → SQL Editor → New query**, paste the whole block below, and
hit **Run**. (The same file is at `database/setup.sql` in this repo.) If it
already exists, running it again is safe — the statements are all
"if not exists" or idempotent.

```sql
create extension if not exists pgcrypto;

-- 1. admins — who may access /admin (empty until you add yourself)
create table if not exists public."admins" (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

-- 2. cores — team members
--    team     = text[]   : one or more roles (focus areas / Secretary…)
--    position = text     : Heads | IoT & Electronics | Game Development |
--                          Immersive Technology | Linux Team
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

-- 3. projects — the public projects feed
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

drop trigger if exists set_projects_updated_at on public."projects";
create trigger set_projects_updated_at
  before update on public."projects"
  for each row execute function public.set_updated_at();

-- 5. ROW LEVEL SECURITY
alter table public."projects" enable row level security;
create policy "public read" on public."projects"
  for select to anon, authenticated using (true);

alter table public."cores" enable row level security;
alter table public."admins" enable row level security;

-- 6. STORAGE BUCKET for member images
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

Expected result: tables `admins`, `cores`, `projects` exist, RLS is on, and the
`public-data` bucket exists in **Storage**.

---

## Step 4 — Enable Google sign-in

There are two sides: Google gives you a credential pair, Supabase uses it to
log people in with Google.

### 4a. Google Cloud Console (create the app)

1. Go to <https://console.cloud.google.com> — you must be signed in with the
   Google account that will be the admin account.
2. **Create a project** (top of the page) if you don't have one — name it
   e.g. `jarvis-admin`.
3. **APIs & Services → OAuth consent screen** → user type **External** →
   fill in app name (e.g. `JARVIS Admin`) and your email → Save. You can
   publish it under "Publishing status" if asked.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs — add **both**:
     - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback`
     - (replace `<YOUR-PROJECT-REF>` with your project REF from Step 2)
   - Create. Copy the **Client ID** and **Client Secret** (the secret is only
     shown once).

> If Google shows a warning about a "loopback"/`localhost` redirect URI, it is
> about an auto-created CLI client, not your app — you can safely delete that
> stray client or ignore it. It does not affect this setup.

### 4b. Enable Google in Supabase

1. **Supabase → Authentication → Providers → Google → Enable**.
2. Paste the **Client ID** and **Client Secret** from 4a → **Save**.
3. **Authentication → URL Configuration** → under **Redirect URLs** add:
   - `http://localhost:3000/auth/callback`
   - (add your production URL + `/auth/callback` when you deploy later)

---

## Step 5 — Fill in `.env`

Open the `.env` you copied in Step 1 and fill in the values from
**Project Settings → API** (Step 2):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | your **Project URL** |
| `NEXT_PUBLIC_SUPABASE_URL` | the **same** Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your **anon / public** key |
| `SUPABASE_SERVICE_ROLE_KEY` | your **service_role** secret key (server only) |
| `SUPABASE_PASSWORD` | (optional) database password — only for manual `psql` access |

---

## Step 6 — First sign-in (add yourself as admin)

1. Start the site:
   ```bash
   npm run dev
   ```
2. Open <http://localhost:3000/login> and click **Sign in with Google**.
   It opens a popup; complete the Google login.
3. You will see **"your student id is not authorized"** — this is expected. The
   `admins` table is empty, so nobody can get in yet. Unlock yourself:
   ```sql
   -- run in Supabase → SQL Editor
   insert into public."admins" (email) values ('your-google-email@gmail.com');
   ```
4. Go back to `/login`, sign in again (or refresh) → you should now see
   **"Access granted" → Enter dashboard**.

> The email must match, character for character, the Google account you sign
> in with. Any team member who needs admin access gets an extra row:
> `insert into public."admins" (email) values ('other@example.com');`

---

## Run the site (dev / production)

```bash
npm run dev        # development server → http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

---

## How the admin area works

- **Login** — Google OAuth through a popup. The session is stored in cookies
  and verified by the server on every request.
- **Guarding** — `lib/admin-guard.ts` checks the signed-in session and matches
  the email against `admins`. `/admin/*` pages redirect to `/login` without
  permission; every `/api/admin/*` route answers `401 Unauthorized`.
- **API routes** (all server-side with the service-role key):

  | Route | Methods | Does |
  |---|---|---|
  | `/api/admin/team` | GET, POST | list members, add member |
  | `/api/admin/team/[id]` | PATCH, DELETE | update / delete a member |
  | `/api/admin/projects` | GET, POST | list projects, add project |
  | `/api/admin/projects/[id]` | PATCH, DELETE | update / delete a project |
  | `/api/admin/upload` | POST | upload a WebP photo (`public-data`) |
  | `/api/admin/verify` | GET | "is the signed-in email an admin?" |

- **Team form** — Position is a dropdown (Heads / IoT & Electronics / Game
  Development / Immersive Technology / Linux Team); the **Role(s)** field shows
  the matching focus areas and lets you assign several roles per person. Roles
  show on the site as `A & B` (2) or `A, B, C` (3+).

---

## Database reference (created in Step 3)

**`admins`** — only this is consulted for who may open `/admin`.

**`cores`** — every team member:

| column | type | notes |
|---|---|---|
| `id` | uuid | auto |
| `name` | text | required |
| `team` | text[] | role(s) such as `{Linux, "System Administration"}` |
| `position` | text | group, e.g. `Linux Team`, `Heads` |
| `tenure` | text | e.g. `2024–26` |
| `region` | text | e.g. `Chennai` |
| `email` | text | required |
| `image` | text | public photo URL (uploaded as WebP) |
| `linkedin` | text | `http(s)://` link |

**`projects`** — the home page marquee feed; ordering by `sort_order`.

All member/project edits you make in `/admin` write here immediately, and the
public site reflects them on next request.

---

## Security notes

- **Service-role key stays on the server.** The browser only ever holds the
  anon key; every privileged action goes through a route handler.
- **RLS is on** (from Step 3): the public anon key can *read* projects but
  cannot insert/update/delete anything. `admins` and `cores` are not readable
  by the anon key at all — the site reads them server-side.
- **Links are sanitized** — `linkedin`/`github` fields accept only `http(s)://`
  URLs (`javascript:` etc. are rejected).
- **Photo uploads** accept only real WebP files (checked three ways: MIME type,
  extension, and file bytes), max 5 MB.
- **Security headers** are set on all responses (no-sniff, frame-deny,
  referrer policy).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Popup blocked at `/login` | Allow popups for the site in the browser, retry |
| "Access denied" after Google sign-in | Your email isn't in `admins` yet — see Step 6 |
| `401 Unauthorized` from an API route | You're not signed in as an admin in that browser |
| "Could not reach the database" | Check `SUPABASE_URL` / keys in `.env` are correct |
| `EADDRINUSE` when starting | Port 3000 already busy: `lsof -ti:3000 | xargs kill`, retry |
| Stale build error after upgrading code | `rm -rf .next && npm run build && npm start` |
| Site runs but reflects old data | The project is cached; rebuild and restart |

---

## Final checklist

- [ ] `npm install` and `.env` created from `.env.example`
- [ ] Supabase project created; URL + keys copied
- [ ] Step 3 query run — `admins`, `cores`, `projects` tables + `public-data` bucket exist
- [ ] Google OAuth client created (Web app) with the two redirect URIs
- [ ] Supabase Auth → Google provider enabled with your Client ID/Secret
- [ ] `http://localhost:3000/auth/callback` added to Supabase Redirect URLs
- [ ] `.env` filled with **your** Project URL, anon key, service-role key
- [ ] Your email inserted into `admins`
- [ ] `/login` → Google → "Access granted" → dashboard works