-- ============================================================================
-- ALSHAM Forensic AI — Functions & triggers
-- Migration 3/3: the three RPCs the app calls plus the profile-provisioning
-- trigger. All are SECURITY DEFINER with a pinned search_path so they run with
-- the owner's privileges regardless of the (possibly anon) caller.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- handle_new_user — provision a profiles row when a Supabase auth user is
-- created. signUp() only passes { full_name } in user metadata and never
-- inserts a profile itself, so this trigger is what makes profiles exist.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, plan_id)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- increment_analyses_count — called after a successful authenticated analysis
-- (app/api/analyze). Bumps the monthly usage counter used for quota checks.
-- ----------------------------------------------------------------------------
create or replace function public.increment_analyses_count(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set analyses_used_this_month = coalesce(analyses_used_this_month, 0) + 1,
         updated_at = now()
   where id = p_user_id;
$$;

-- ----------------------------------------------------------------------------
-- check_resubmission — detects whether an authenticated user has submitted the
-- same text (by hash) before, returning the shape the analyze route reads:
--   { is_resubmission, submission_count, score_trend }.
-- score_trend compares the newest prior score against the one before it.
-- ----------------------------------------------------------------------------
create or replace function public.check_resubmission(p_user_id uuid, p_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count      integer;
  v_last       integer;
  v_prev       integer;
  v_trend      text := 'FIRST_SUBMISSION';
begin
  select count(*) into v_count
    from public.text_submission_history
   where user_id = p_user_id and text_hash = p_hash;

  if v_count = 0 then
    return jsonb_build_object(
      'is_resubmission', false,
      'submission_count', 0,
      'score_trend', 'FIRST_SUBMISSION'
    );
  end if;

  -- Two most recent prior scores for this text, newest first.
  select ai_score into v_last
    from public.text_submission_history
   where user_id = p_user_id and text_hash = p_hash
   order by created_at desc
   limit 1;

  select ai_score into v_prev
    from public.text_submission_history
   where user_id = p_user_id and text_hash = p_hash
   order by created_at desc
   offset 1 limit 1;

  if v_prev is null or v_last is null then
    v_trend := 'STABLE';
  elsif v_last > v_prev then
    v_trend := 'INCREASING';
  elsif v_last < v_prev then
    v_trend := 'DECREASING';
  else
    v_trend := 'STABLE';
  end if;

  return jsonb_build_object(
    'is_resubmission', true,
    'submission_count', v_count,
    'score_trend', v_trend
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- get_public_analysis_by_cid — public certificate lookup for /verify/[cid].
-- Returns a single jsonb object with exactly the fields VerifyResult reads,
-- or NULL when the CID is unknown (page then 404s). SECURITY DEFINER so anon
-- callers can read this one certificate without exposing the analyses table.
-- ----------------------------------------------------------------------------
create or replace function public.get_public_analysis_by_cid(p_cid text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'cid_code',           a.cid_code,
    'overall_ai_score',   a.overall_ai_score,
    'verdict',            a.verdict,
    'detected_model',     coalesce(a.detected_model, 'Indeterminado'),
    'compliance_verdict', coalesce(a.compliance_verdict, 'CONFORME'),
    'compliance_risk',    coalesce(a.compliance_risk, 'BAIXO'),
    'institution_name',   coalesce(i.name, 'N/A'),
    'text_hash',          a.text_hash,
    'text_preview',       a.text_preview,
    'created_at',         a.created_at,
    'analysis_engine',    coalesce(a.analysis_engine, 'alsham-forensic-ensemble-v1')
  )
  from public.analyses a
  left join public.institutions i on i.id = a.institution_id
  where a.cid_code = p_cid
  limit 1;
$$;

-- ----------------------------------------------------------------------------
-- Execute grants. get_public_analysis_by_cid is reachable anonymously; the
-- other two are only invoked from authenticated server code.
-- ----------------------------------------------------------------------------
grant execute on function public.get_public_analysis_by_cid(text) to anon, authenticated, service_role;
grant execute on function public.check_resubmission(uuid, text)   to authenticated, service_role;
grant execute on function public.increment_analyses_count(uuid)   to authenticated, service_role;
