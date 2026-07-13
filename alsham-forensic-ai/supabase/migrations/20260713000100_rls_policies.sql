-- ============================================================================
-- ALSHAM Forensic AI — Row Level Security
-- Migration 2/3: enable RLS + policies on all seven tables.
--
-- Role model (Supabase):
--   anon          -> unauthenticated visitors (free analysis funnel)
--   authenticated -> logged-in users
--   service_role  -> server-side privileged (bypasses RLS entirely) — used by
--                    the Stripe webhook and any admin/back-office task.
--
-- Summary:
--   plans / institutions / normatives -> public read (anon + authenticated).
--   profiles / analyses / text_submission_history -> owner-scoped.
--   analyses additionally allows anonymous inserts (user_id IS NULL) so the
--     free teaser flow persists without breaking the paywall.
--   stripe_events -> no policies => only service_role can touch it.
-- ============================================================================

alter table public.plans                   enable row level security;
alter table public.profiles                enable row level security;
alter table public.institutions            enable row level security;
alter table public.normatives              enable row level security;
alter table public.analyses                enable row level security;
alter table public.text_submission_history enable row level security;
alter table public.stripe_events           enable row level security;

-- ----------------------------------------------------------------------------
-- plans — public read; writes only via service_role (no write policy).
-- ----------------------------------------------------------------------------
drop policy if exists plans_select_public on public.plans;
create policy plans_select_public
  on public.plans for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- institutions — public read (anon analyze flow + getInstitutions).
-- ----------------------------------------------------------------------------
drop policy if exists institutions_select_public on public.institutions;
create policy institutions_select_public
  on public.institutions for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- normatives — public read (consumed while building the forensic prompt).
-- ----------------------------------------------------------------------------
drop policy if exists normatives_select_public on public.normatives;
create policy normatives_select_public
  on public.normatives for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- profiles — a user may read/update only their own row. Inserts happen via the
-- SECURITY DEFINER auth trigger (migration 3); an explicit self-insert policy is
-- added for safety/idempotency. Subscription fields are written by the webhook
-- through service_role (bypasses RLS).
-- ----------------------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- analyses — owner reads own rows. Inserts allowed for the owner OR for an
-- anonymous visitor writing a row with user_id IS NULL (free-tier teaser).
-- Public certificate reads go through the SECURITY DEFINER RPC, not RLS.
-- ----------------------------------------------------------------------------
drop policy if exists analyses_select_own on public.analyses;
create policy analyses_select_own
  on public.analyses for select
  to authenticated
  using (user_id = auth.uid());

-- The anonymous analyze flow does `insert(...).select('id').single()`. Under RLS
-- an INSERT ... RETURNING requires the new row to be visible via a SELECT policy,
-- otherwise the statement errors and the free-teaser analysis breaks. Anonymous
-- rows (user_id IS NULL) are already public-by-CID via get_public_analysis_by_cid,
-- so exposing them to the anon role for read-back is an acceptable tradeoff and
-- keeps the funnel working. Authenticated users never match this (their rows have
-- a user_id) and are covered by analyses_select_own above.
drop policy if exists analyses_select_anon on public.analyses;
create policy analyses_select_anon
  on public.analyses for select
  to anon
  using (user_id is null);

drop policy if exists analyses_insert_self_or_anon on public.analyses;
create policy analyses_insert_self_or_anon
  on public.analyses for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- text_submission_history — owner-scoped. Only written for authenticated users;
-- the resubmission RPC reads it via SECURITY DEFINER.
-- ----------------------------------------------------------------------------
drop policy if exists tsh_select_own on public.text_submission_history;
create policy tsh_select_own
  on public.text_submission_history for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists tsh_insert_own on public.text_submission_history;
create policy tsh_insert_own
  on public.text_submission_history for insert
  to authenticated
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- stripe_events — intentionally NO policies. With RLS enabled and no policy,
-- anon/authenticated get zero access; only service_role (webhook) can read/write.
-- ----------------------------------------------------------------------------
