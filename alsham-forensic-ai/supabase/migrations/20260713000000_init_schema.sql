-- ============================================================================
-- ALSHAM Forensic AI — Core schema
-- Migration 1/3: tables, primary keys, foreign keys, defaults, indexes
--
-- Every column/table here is derived from what the application code already
-- reads/writes (see docs/GO-LIVE.md for the field-by-field provenance).
-- RLS + policies live in migration 2; RPC functions + auth trigger in migration 3.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- plans — subscription tiers. Referenced via profiles.plan_id and the
-- `profiles.select('*, plans(*)')` join used across the dashboard.
-- Columns match lib/../types/index.ts `Plan` and the reads in
-- app/(dashboard)/analyze/page.tsx (analyses_per_month, max_chars_per_analysis,
-- pdf_reports, name_pt) and app/api/generate-report (pdf_reports).
-- id values are the plan keys the Stripe webhook / PLAN_MAP writes back:
-- 'free' | 'estudantil' | 'profissional' | 'institucional'.
-- ----------------------------------------------------------------------------
create table if not exists public.plans (
  id                     text primary key,
  name                   text not null,          -- internal english slug
  name_pt                text not null,          -- shown in UI
  price_brl              integer not null default 0,   -- in cents (informational; UI has its own copy)
  analyses_per_month     integer not null default 3,   -- -1 = unlimited
  max_chars_per_analysis integer not null default 2000,
  pdf_reports            boolean not null default false,
  api_access             boolean not null default false,
  scholar_links          boolean not null default false,
  created_at             timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- profiles — 1:1 with auth.users. Created by the on_auth_user_created trigger
-- (migration 3). The Stripe webhook writes plan_id / stripe_subscription_id /
-- subscription_status / stripe_customer_id; settings page writes full_name.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,
  email                     text,
  full_name                 text,
  institution               text,
  plan_id                   text not null default 'free' references public.plans(id),
  analyses_used_this_month  integer not null default 0,
  subscription_status       text not null default 'inactive',
  stripe_customer_id        text,
  stripe_subscription_id    text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists profiles_plan_id_idx on public.profiles(plan_id);
-- webhook: .eq('stripe_customer_id', customerId)
create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);

-- ----------------------------------------------------------------------------
-- institutions — public reference data. Read anonymously in the analyze flow
-- and by getInstitutions(). Selected columns:
--   id, name, name_short, country, strictness_level, ai_tolerance_pct, active
-- id is a slug ('cnpq', 'usp', ...) matching the option values in AnalyzeForm.
-- ----------------------------------------------------------------------------
create table if not exists public.institutions (
  id                text primary key,
  name              text not null,
  name_short        text,
  country           text,
  strictness_level  text,                -- MÁXIMO | ALTO | MÉDIO | PADRÃO
  ai_tolerance_pct  integer,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists institutions_active_idx on public.institutions(active);

-- ----------------------------------------------------------------------------
-- normatives — per-institution compliance rules. Read in getInstitutionNormatives:
--   .eq('institution_id', ...).eq('active', true).order('severity', desc)
-- Detector consumes code, document, description, severity.
-- ----------------------------------------------------------------------------
create table if not exists public.normatives (
  id              uuid primary key default gen_random_uuid(),
  institution_id  text not null references public.institutions(id) on delete cascade,
  code            text not null,
  document        text,
  description     text,
  severity        text not null default 'info',   -- e.g. info | MÉDIO | ALTO | CRÍTICO
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists normatives_institution_active_idx
  on public.normatives(institution_id, active);

-- ----------------------------------------------------------------------------
-- analyses — one row per forensic analysis. Insert in app/api/analyze;
-- read back by dashboard/analyze pages, generate-report, and the public
-- verify RPC. user_id is NULL for anonymous analyses (free-tier funnel).
-- JSON payloads (paragraphs/stylometric/citations/flags) stored as jsonb.
-- ----------------------------------------------------------------------------
create table if not exists public.analyses (
  id                            uuid primary key default gen_random_uuid(),
  user_id                       uuid references auth.users(id) on delete cascade,  -- NULL = anonymous
  text_hash                     text not null,
  text_preview                  text,
  text_length                   integer,
  word_count                    integer,
  institution_id                text references public.institutions(id),
  overall_ai_score              integer,
  verdict                       text,
  detected_model                text,
  confidence                    numeric,
  paragraphs                    jsonb default '[]'::jsonb,
  stylometric                   jsonb default '{}'::jsonb,
  citations                     jsonb default '[]'::jsonb,
  flags                         jsonb default '[]'::jsonb,
  compliance_verdict            text,
  compliance_risk               text,
  paste_detected                boolean default false,
  reverse_translation_detected  boolean default false,
  analysis_engine               text,
  processing_time_ms            integer,
  cid_code                      text not null,
  created_at                    timestamptz not null default now()
);

-- Public certificate lookups (verify/[cid]) go through cid_code.
create unique index if not exists analyses_cid_code_key on public.analyses(cid_code);
-- Dashboard/analyze list: .eq('user_id', ...).order('created_at' desc)
create index if not exists analyses_user_created_idx
  on public.analyses(user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- text_submission_history — resubmission tracking for authenticated users.
-- Insert in app/api/analyze; read by the check_resubmission RPC (migration 3).
-- ----------------------------------------------------------------------------
create table if not exists public.text_submission_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  text_hash    text not null,
  analysis_id  uuid references public.analyses(id) on delete set null,
  ai_score     integer,
  created_at   timestamptz not null default now()
);

-- check_resubmission filters by (user_id, text_hash), ordered by created_at.
create index if not exists tsh_user_hash_idx
  on public.text_submission_history(user_id, text_hash, created_at desc);

-- ----------------------------------------------------------------------------
-- stripe_events — webhook idempotency log. Upsert on id (event.id) with
-- ignoreDuplicates, then flipped processed=true. Service-role only (see RLS).
-- ----------------------------------------------------------------------------
create table if not exists public.stripe_events (
  id          text primary key,        -- Stripe event id (evt_...)
  type        text,
  payload     jsonb,
  processed   boolean not null default false,
  created_at  timestamptz not null default now()
);
