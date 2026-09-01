# JARVIS SOCIETY — Backend Setup

Everything behind the scenes lives in **Supabase** (Postgres + Auth + Storage) and
is reached through **Next.js route handlers**. This walks through the full setup:
project + keys, Google OAuth for the admin login, the database tables, file
uploads, and the API surface.

---

## 1. Architecture at a glance

```
Browser (Next.js)
 ├─ public site  ──────────────>  server components  ──getCoreMembers()/──>  Supabase (service_role)
 │  /teams, / projects                              getProjects()
 │
 ├─ /login (Google popup)  ─── anon key  ──────────>  Supabase Auth  ─>  Google OAuth
 │                                                    session back to /auth/callback
 │
 └─ /admin (panel)  ────────── fetch( )  ──────────>  /api/admin/* routes  ─>  Supabase
                                                      (service_role, server-only)
```

Two different Supabase clients exist on purpose:

| Client | Env vars | Where | Used for |
|---|---|---|---|
| `supabaseAdmin()` | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | server only (`lib/supabase.ts`) | all reads/writes, CRUD, uploads, verify |
| `supabaseBrowser()` | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser (`lib/supabase-browser.ts`) | Google OAuth sign-in only |

The `service_role` key **bypasses Row Level Security and must never** be inlined
into the browser bundle. That is why every privileged operation goes through a
server route handler.

---

## 2. Supabase project + keys

1. Create a project at <https://supabase.com> (note the **Project Ref** — it is
   the slug in your project URL, e.g. `https://abcdefghijklmnopqrst.supabase.co`).
2. Open **Project Settings → API**. You need:
   - **Project URL**
   - **anon / public key**
   - **service_role secret key** (reveal it; it is shown once)
3. Copy the values into your `.env` (see step 3). If you are porting the repo, the
   project must be reachable by the URLs in `.env`.

---

## 3. Environment variables

Copy `.env.example` → `.env` and fill it in:

```bash
cp .env.example .env
```

| Variable | Required | Value |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | same Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | service_role secret key (**server only**) |
| `SUPABASE_PASSWORD` | no | DB password, only for `psql` access |

`.env` is gitignored — never commit real keys.

---

## 4. Google OAuth (admin login)

The `/login` page lets an authorized email sign in with Google via a **popup**.

### 4a. Google Cloud Console (create the OAuth client)

1. Go to <https://console.cloud.google.com> → **APIs & Services → OAuth consent
   screen**. Configure your app name, logo, and support email. (optional)
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized redirect URIs** must include:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback` (required — Supabase
       completes the Google handshake at this URL)
     - `http://localhost:3000/auth/callback` (for local dev)
3. Copy the **Client ID** and **Client Secret** (the secret is only shown once).

> If Google shows a warning about a loopback/`localhost` redirect URI, it usually
> refers to an auto-created CLI client — delete that OAuth client or remove the
> unused `localhost` URIs from it. It does not come from this app.

### 4b. Supabase — enable the provider

1. **Authentication → Providers → Google → Enable**.
2. Paste the Client ID and Client Secret from step 4a. Save.
3. **Authentication → URL Configuration** and add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - (and your production URL’s `/auth/callback` when you deploy)

### 4c. How the flow works

```
/login  →  click "Sign in with Google"
        →  POST nothing; code asks Supabase for the OAuth URL (skipBrowserRedirect)
        →  opens a popup → Google account picker → allows → redirects inside the popup
        →  Supabase exchanges the code → sets the session for this origin
        →  /auth/callback picks up the session and closes the popup
        →  /login's onAuthStateChange fires SIGNED_IN → calls /api/admin/verify?email=…
        →  email found in `admins` table  ⇒  show "Enter dashboard"
```

The decision of *who is an admin* is made server-side by the
`/api/admin/verify` route against the `admins` table — the Google session alone
is not enough.

---

## 5. Database tables

### 5a. `cores` — core team (public `/teams` page + admin Team page)

Already in production. Observed schema (columns `name`, `team`, `position`,
`tenure`, `region`, `email` are **NOT NULL**):

```
id          uuid PK      default gen_random_uuid()
name        text         NOT NULL
team        text         NOT NULL   -- department keyword, e.g. 'electronics'
position    text         NOT NULL   -- 'President' | 'Vice President' | 'Team lead' | 'Core member'
tenure      text         NOT NULL   -- e.g. '2024–26'
region      text         NOT NULL   -- e.g. 'Chennai'
email       text         NOT NULL
image       text         nullable    -- public URL from uploads
linkedin    text         nullable
created_at  / updated_at timestamptz default now()
```

Seed a row:

```sql
insert into public."cores" (name, team, position, tenure, region, email)
values ('Ada Lovelace', 'electronics', 'Team lead', '2024–26', 'Chennai', 'ada@study.iitm.ac.in');
```

### 5b. `admins` — who can access `/admin`

An email in this table gets access; everyone else is denied. It is read only by
`/api/admin/verify`.

```sql
create table if not exists public."admins" (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz default now()
);

insert into public."admins" (email) values ('you@your-domain.com');
```

### 5c. `projects` — home page marquee + admin Projects page

Full script (table + seed of the 10 original demo projects) is in
**`seed-projects.sql`** at the repo root. Run it in the Supabase SQL editor.

```
id          text PK        -- stable slug, e.g. 'sentinelle'
name        text NOT NULL
domain      text           -- department label, e.g. 'Game Development & Designing'
blurb       text
status      text           -- 'In development' | 'Prototype' | 'Research' | 'Complete'
tags        text[]         -- tag chips, default '{}'
github      text           -- public repo URL or NULL
sort_order  integer        -- left-to-right order on the home page
created_at / updated_at timestamptz default now()
```

The home page is `force-dynamic` and reads this table on every request, so edits
in `/admin/projects` are reflected on the site immediately.

### 5d. Row Level Security

- `cores` has **RLS enabled**: the anon (browser) key sees nothing — the public
  `/teams` page and all admin routes use the `service_role` key server-side.
- `projects` and `admins` are read/written exclusively through `service_role`
  routes, so they can stay RLS-off (default). Keep it that way; never expose
  these to the anon key without real policies.

---

## 6. Storage — member image uploads

Member photos upload to the **`public-data`** bucket (`public: true`). The
browser never touches storage directly — it POSTs a file to `/api/admin/upload`
which writes it with the `service_role` key and returns the public URL, which is
stored in `cores.image`.

- Upload route enforces **WebP only**, checked three ways:
  1. MIME type `image/webp`,
  2. `.webp` file extension,
  3. magic bytes (`RIFF` + `WEBP` container header) — a renamed file is rejected.
- Size cap: **5 MB**.
- Objects land at `cores/<slug>-<timestamp>.webp` under `public-data`.
- Public URL shape:
  `https://<ref>.supabase.co/storage/v1/object/public/public-data/cores/<file>.webp`

Creating the bucket (one time):

```sql
-- run once, or via the Dashboard → Storage → New bucket
create or replace function create_public_data_bucket()
returns void language plpgsql as $$
begin
  insert into storage.buckets (id, name, public)
  values ('public-data', 'public-data', true)
  on conflict (id) do update set public = true;
end $$;
select create_public_data_bucket();
drop function create_public_data_bucket();
```

---

## 7. API routes

All routes run server-side with `supabaseAdmin()` (service role).

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/team` | GET, POST | list members (`cores`), add member |
| `/api/admin/team/[id]` | PATCH, DELETE | update / delete a member |
| `/api/admin/projects` | GET, POST | list projects, add project |
| `/api/admin/projects/[id]` | PATCH, DELETE | update / delete a project |
| `/api/admin/upload` | POST | upload a WebP to `public-data`, returns URL |
| `/api/admin/verify` | GET `?email=` | is this email in `admins`? |

Payload rules worth knowing:

- **Team create** requires `name`, `position`, `team`, `tenure`, `region`,
  `email` (all NOT NULL in the table). Blank optional fields (`image`,
  `linkedin`) are stored as `NULL`.
- **Project create**: `name` required; `id` is auto-slugged from the name when
  blank; `tags` accepts a comma-separated string and is stored as `text[]`.
- Every mutation re-fetches the list, so the admin tables refresh immediately.

---

## 8. Running locally

```bash
npm install
cp .env.example .env          # fill in real values
npm run dev                   # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

> Rendering note: three fonts (Sora, Space Grotesk, JetBrains Mono) are
> **self-hosted** as variable woff2 files in `app/fonts/`. No Google Fonts
> network call happens at build time, which keeps `next build` / `next dev`
> deterministic on machines that cannot reach Google Fonts.

---

## 9. Checklist for a fresh machine

- [ ] Supabase project exists; API URL + anon + service_role keys in `.env`
- [ ] Google OAuth client created; redirect `https://<ref>.supabase.co/auth/v1/callback` added
- [ ] Supabase Auth → Google provider enabled with those client ID/secret
- [ ] `auth/callback` added to Supabase **Redirect URLs** (localhost + prod)
- [ ] `cores` table seeded with team members
- [ ] `admins` table created and your Google email inserted
- [ ] `projects` table + seed created (`seed-projects.sql`)
- [ ] `public-data` bucket exists and is public