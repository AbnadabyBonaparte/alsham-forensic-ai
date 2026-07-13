# ALSHAM Forensic AI — Go-Live / Provisioning

This document is the operational runbook to take the app from a fresh Supabase
project to a working production deploy. The database schema lives in
`supabase/migrations/` and `supabase/seed.sql`; applying them is the single hard
blocker for go-live (without them nothing persists).

---

## 1. Environment variables

Set these in Vercel (and locally in `.env.local`; see `.env.local.example`).

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public anon key (RLS-scoped) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Privileged key. Used by the Stripe webhook (`lib/supabase/admin.ts`) to write `stripe_events` and update `profiles`. Also the fallback HMAC secret for the anon usage cookie. **Never expose to the client.** |
| `ANTHROPIC_API_KEY` | server only | Primary forensic engine |
| `OPENAI_API_KEY` | server only | Ensemble calibrator (second opinion) |
| `TAVILY_API_KEY` | server only | Citation verification (optional; degrades gracefully) |
| `STRIPE_SECRET_KEY` | server only | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | server only | Verifies `/api/webhook/stripe` signatures |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | client | Stripe.js |
| `STRIPE_PRICE_ESTUDANTIL` | server | Price ID for the `estudantil` plan |
| `STRIPE_PRICE_PROFISSIONAL` | server | Price ID for the `profissional` plan |
| `STRIPE_PRICE_INSTITUCIONAL` | server | Price ID for the `institucional` plan |
| `RESEND_API_KEY` | server | Transactional email |
| `RESEND_FROM_EMAIL` | server | From address |
| `NEXT_PUBLIC_APP_URL` | client + server | Absolute base URL (Stripe redirects, auth callback) |
| `ANON_COOKIE_SECRET` | server (optional) | Explicit HMAC secret for the anonymous free-usage cookie. Falls back to the service-role key if unset. |

The app is written to **degrade, not crash**, when env vars are missing
(`lib/env.ts`, `lib/supabase/client.ts`, `middleware.ts`), so a partial config
will not blank the site — related features just fail lazily.

---

## 2. Apply migrations + seed (order matters)

The three migrations are numbered and must run in order. `seed.sql` runs last.

### Option A — Supabase CLI (recommended)

```bash
# from repo root
supabase link --project-ref <PROJECT_REF>
supabase db push          # applies supabase/migrations/* in timestamp order
psql "$SUPABASE_DB_URL" -f supabase/seed.sql   # or: supabase db execute --file supabase/seed.sql
```

### Option B — SQL editor (manual)

Paste and run, in this exact order:

1. `supabase/migrations/20260713000000_init_schema.sql`  (tables, PKs/FKs, indexes)
2. `supabase/migrations/20260713000100_rls_policies.sql` (enable RLS + policies)
3. `supabase/migrations/20260713000200_functions.sql`    (RPCs + auth trigger)
4. `supabase/seed.sql`                                    (plans, institutions, normatives)

### What gets created

- **Tables:** `plans`, `profiles`, `institutions`, `normatives`, `analyses`,
  `text_submission_history`, `stripe_events`.
- **Auth trigger:** `on_auth_user_created` → `handle_new_user()` provisions a
  `profiles` row (plan `free`) whenever a Supabase auth user signs up.
- **RPCs:** `get_public_analysis_by_cid(text)`, `check_resubmission(uuid,text)`,
  `increment_analyses_count(uuid)`.
- **Seed:** 4 plans, 11 institutions, ~25 normatives.

---

## 3. Stripe wiring

1. Create 3 recurring prices (BRL) and put their IDs in the `STRIPE_PRICE_*` vars.
   Suggested amounts (match `/pricing`): Estudantil R$29,90 · Profissional
   R$89,90 · Institucional R$497,00.
2. Add a webhook endpoint → `https://<app>/api/webhook/stripe` subscribed to:
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`. Copy the signing
   secret into `STRIPE_WEBHOOK_SECRET`.
3. The webhook writes back to `profiles` (`plan_id`, `subscription_status`,
   `stripe_subscription_id`) using the **service-role** client — this is why
   `SUPABASE_SERVICE_ROLE_KEY` is required in production.

> Note: `analyses_used_this_month` is incremented per analysis but has no
> automatic monthly reset in this schema. Add a scheduled job (pg_cron:
> `update public.profiles set analyses_used_this_month = 0;` on the 1st) before
> relying on monthly quotas long-term.

---

## 4. Smoke test (end to end)

1. **Anonymous analyze:** open the landing analyzer, submit ~200+ chars, pick an
   institution → returns a verdict + score. Repeat until the 4th attempt returns
   a `402 ANON_LIMIT_REACHED` paywall (free cap = 3, `lib/anon-limit.ts`).
2. **Sign up:** create an account → confirm email → a `profiles` row exists with
   `plan_id = 'free'` (verifies the auth trigger).
3. **Authenticated analyze → persist:** run an analysis while logged in → row
   appears in `/dashboard` "Análises Recentes" and `analyses_used_this_month`
   increments.
4. **Certificate PDF:** upgrade to `profissional` (or set `plan_id` manually for
   testing) → `POST /api/generate-report` with the analysis id returns a
   `CID-<code>.pdf`.
5. **Public verification:** open `/verify/<CID>` (from the analysis `cid_code`) →
   certificate renders via `get_public_analysis_by_cid`; pasting the original
   text yields a SHA-256 **match**.
6. **Billing loop:** complete a Stripe test checkout → webhook fires → the
   user's `profiles.plan_id` / `subscription_status` update; `stripe_events` has
   the event row with `processed = true`.

---

## 5. RLS model (summary)

| Table | anon | authenticated | notes |
| --- | --- | --- | --- |
| `plans` | read | read | writes via service-role only |
| `institutions` | read | read | public reference data |
| `normatives` | read | read | public reference data |
| `profiles` | — | read/update/insert **own** | subscription fields written by webhook (service-role) |
| `analyses` | insert `user_id IS NULL`; read `user_id IS NULL` | insert/read **own** | anon read is scoped to anonymous rows so `insert().select()` works; those rows are public-by-CID anyway |
| `text_submission_history` | — | insert/read **own** | read by `check_resubmission` (SECURITY DEFINER) |
| `stripe_events` | — | — | RLS on, no policies → **service-role only** |

Public certificate reads never touch the tables directly — they go through the
SECURITY DEFINER RPC `get_public_analysis_by_cid`, which returns only the
certificate fields.
