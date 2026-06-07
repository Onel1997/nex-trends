# Admin API Edge Function — Deployment Guide

Deploy the **`admin-api`** Supabase Edge Function so the NexTrends Admin Dashboard (`/admin`) can load users, analytics, trends, and global settings.

---

## Quick reference

| Item | Value |
|------|--------|
| **Function name** | `admin-api` (must match exactly) |
| **Config** | `supabase/config.toml` → `[functions.admin-api]` |
| **Client invoke** | `src/lib/admin-api.ts` → `invokeEdgeFunction('admin-api', …)` |
| **Entrypoint** | `supabase/functions/admin-api/index.ts` |
| **JWT verification** | `verify_jwt = true` |
| **Admin allowlist** | `supabase/functions/_shared/admin.ts` + `src/lib/admin.ts` |

---

## Prerequisites

1. **Supabase CLI** (v1.150+ recommended)

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

2. **Supabase account** with access to your project

```bash
supabase login
```

3. **Project linked** to this repo

```bash
cd /path/to/nex-trends
supabase link --project-ref YOUR_PROJECT_REF
```

Find `YOUR_PROJECT_REF` in the [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → General → **Reference ID**.

Verify link:

```bash
supabase projects list
cat supabase/.temp/project-ref 2>/dev/null || supabase status
```

---

## Step 1 — Environment variables (frontend)

Create `.env.local` in the project root (never commit secrets):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: verbose admin console logs in production builds
# VITE_ADMIN_DEBUG=true
```

| Variable | Where to find it |
|----------|------------------|
| `VITE_SUPABASE_URL` | Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Dashboard → Settings → API → `anon` `public` key |

Restart Vite after changing env:

```bash
npm run dev
```

---

## Step 2 — Database migrations

Admin features need `profiles.is_banned`, `app_settings`, and `analytics_events`:

```bash
supabase db push
```

Or run SQL manually in the SQL Editor from:

- `supabase/migrations/20250525110000_admin_dashboard.sql`
- `supabase/migrations/20250525120000_admin_dashboard_repair.sql`

Verify tables:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('is_banned', 'credit_balance');

SELECT to_regclass('public.app_settings');
SELECT to_regclass('public.analytics_events');
```

---

## Step 3 — Deploy the edge function

From the repo root:

```bash
supabase functions deploy admin-api
```

Deploy all related functions (recommended):

```bash
supabase functions deploy admin-api track-event usage-limit
```

Or use npm scripts:

```bash
npm run deploy:admin-api
# full admin stack (migrations + function)
npm run deploy:admin
```

---

## Step 4 — Verify deployment

### 4.1 List functions

```bash
supabase functions list
```

Expected line:

```
admin-api   …   ACTIVE
```

### 4.2 Dashboard check

Supabase Dashboard → **Edge Functions** → `admin-api` should appear with a recent deploy time.

### 4.3 HTTP smoke test (optional)

Replace placeholders and run after signing in as an **admin** user in your app (copy JWT from DevTools → Application → localStorage / session).

```bash
export SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
export SUPABASE_ANON_KEY="your_anon_key"
export ACCESS_TOKEN="your_user_jwt"

curl -s -X POST "$SUPABASE_URL/functions/v1/admin-api" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"overview"}' | jq .
```

Success response (example):

```json
{
  "totalUsers": 1,
  "activeUsers": 1,
  "totalGenerations": 0,
  "proUsers": 0,
  "revenuePlaceholder": "€ — Stripe Sync"
}
```

Errors:

| HTTP | Meaning |
|------|---------|
| **404** | Function not deployed or wrong name |
| **401** | Invalid/expired JWT |
| **403** | User email not in admin allowlist |
| **500** | Server error — check `supabase functions logs admin-api` |

### 4.4 Function logs

```bash
supabase functions logs admin-api --follow
```

---

## Environment variables (edge runtime)

These are **injected automatically** on Supabase hosted projects when you deploy. You do **not** set them in `.env.local` for the function.

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project API URL |
| `SUPABASE_ANON_KEY` | Validate user JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB + Auth Admin API (bypass RLS) |

Local serve (optional):

```bash
supabase functions serve admin-api --env-file supabase/.env.local
```

Create `supabase/.env.local` (gitignored) with service role key for local testing only.

---

## Permissions & security

### JWT (`verify_jwt = true`)

Configured in `supabase/config.toml`:

```toml
[functions.admin-api]
enabled = true
verify_jwt = true
entrypoint = "./functions/admin-api/index.ts"
```

Every request must include:

```
Authorization: Bearer <user_access_token>
apikey: <anon_key>
```

### Admin allowlist

Only these emails can call `admin-api` (normalized lowercase):

- Edit `supabase/functions/_shared/admin.ts`
- Keep in sync with `src/lib/admin.ts`

Default: `onilbashir97@gmail.com`

After changing the list, redeploy:

```bash
supabase functions deploy admin-api
```

### Service role

The function uses **service role** server-side to:

- List auth users (`auth.admin.listUsers`)
- Read/update all `profiles`
- Read/write `app_settings` and `analytics_events`

Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend.

### Database RLS

- `app_settings`: authenticated users can **SELECT** (public maintenance flag)
- `analytics_events`: no public policies — only service role via edge function
- `profiles`: standard user policies; admin updates go through service role

---

## Troubleshooting

### Dashboard shows “Edge Function offline”

1. Deploy: `supabase functions deploy admin-api`
2. Confirm project ref matches `.env` `VITE_SUPABASE_URL`
3. Open browser console → filter `[AdminAPI]` or `[EdgeFunction]`
4. Run `supabase functions logs admin-api`

### “Load failed” / 404

Function name mismatch. Client **must** call `admin-api`, not `admin_api` or `AdminApi`.

### 403 Keine Admin-Berechtigung

Add your email to both admin allowlist files and redeploy.

### Empty users but function works

Run `supabase db push` and ensure Auth has users. Overview still shows zeros safely.

### Enable debug logs in browser

```env
VITE_ADMIN_DEBUG=true
```

Reload `/admin` and check the console for `[AdminAPI]`, `[Admin]`, `[EdgeFunction]`.

---

## Offline / undeployed behavior

If `admin-api` is not deployed, the UI:

- Shows a **purple offline banner** with deploy commands
- Loads **empty KPIs** (0 users, 0 generations) — no crash
- Disables **write** actions (save settings, ban, credits) with a clear message
- Logs details to the console

After deploy, click **Erneut prüfen** on the banner or refresh the page.

---

## Checklist

- [ ] `supabase link --project-ref …`
- [ ] `.env.local` has `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- [ ] `supabase db push`
- [ ] `supabase functions deploy admin-api`
- [ ] `supabase functions list` shows `admin-api`
- [ ] Admin email in allowlist
- [ ] `/admin` loads KPIs (or zeros + no offline banner)
