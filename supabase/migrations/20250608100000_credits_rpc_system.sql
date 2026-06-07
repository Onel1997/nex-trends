-- Credits RPC system: usage_logs, profile columns, atomic consume/check/reset RPCs.
-- Matches supabase/functions/_shared/credits.ts and docs/CREDITS_USAGE.md.

-- ---------------------------------------------------------------------------
-- Profile columns
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS bonus_credits integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS workspace_id uuid;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- usage_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  action text NOT NULL,
  feature text NOT NULL,
  credits_used integer NOT NULL DEFAULT 0 CHECK (credits_used >= 0),
  balance_after integer,
  idempotency_key text,
  workspace_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_logs_user_created_idx
  ON public.usage_logs (user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS usage_logs_idempotency_unique_idx
  ON public.usage_logs (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'usage_logs'
      AND policyname = 'usage_logs_select_own'
  ) THEN
    CREATE POLICY usage_logs_select_own
      ON public.usage_logs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Placeholder tables (PAYG / team pools — prepared for future use)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  balance integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.plan_monthly_credit_allowance(p_plan text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(trim(coalesce(p_plan, 'free')))
    WHEN 'creator' THEN 250
    WHEN 'audio' THEN 500
    WHEN 'pro_creator' THEN 1000
    WHEN 'studio' THEN 5000
    ELSE 25
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_unlimited_credit_plan(p_plan text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(trim(coalesce(p_plan, 'free'))) IN ('agency', 'founder');
$$;

-- ---------------------------------------------------------------------------
-- maybe_reset_user_credits
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.maybe_reset_user_credits(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_reset_at timestamptz;
  v_allowance integer;
  v_next_reset timestamptz;
BEGIN
  SELECT plan, credits_reset_at
  INTO v_plan, v_reset_at
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF public.is_unlimited_credit_plan(v_plan) THEN
    RETURN;
  END IF;

  IF v_reset_at IS NULL OR v_reset_at > now() THEN
    RETURN;
  END IF;

  v_allowance := public.plan_monthly_credit_allowance(v_plan);
  v_next_reset := date_trunc('month', now()) + interval '1 month';

  UPDATE public.profiles
  SET
    credit_balance = v_allowance,
    monthly_usage_count = 0,
    credits_reset_at = v_next_reset,
    usage_reset_date = v_next_reset
  WHERE id = p_user_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- get_user_credit_status
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_credit_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_balance integer;
  v_bonus integer;
  v_used integer;
  v_limit integer;
  v_reset_at timestamptz;
  v_unlimited boolean;
  v_remaining integer;
BEGIN
  PERFORM public.maybe_reset_user_credits(p_user_id);

  SELECT
    coalesce(plan, 'free'),
    coalesce(credit_balance, 0),
    coalesce(bonus_credits, 0),
    coalesce(monthly_usage_count, 0),
    credits_reset_at
  INTO v_plan, v_balance, v_bonus, v_used, v_reset_at
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'profile_not_found'
    );
  END IF;

  v_unlimited := public.is_unlimited_credit_plan(v_plan);
  v_limit := public.plan_monthly_credit_allowance(v_plan);
  v_remaining := v_balance + v_bonus;

  RETURN jsonb_build_object(
    'ok', true,
    'allowed', v_unlimited OR v_remaining > 0,
    'unlimited', v_unlimited,
    'used', v_used,
    'remaining', CASE WHEN v_unlimited THEN null ELSE v_remaining END,
    'limit', CASE WHEN v_unlimited THEN null ELSE v_limit END,
    'usageResetDate', v_reset_at,
    'plan', v_plan,
    'bonusCredits', v_bonus
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- consume_user_credits
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_user_credits(
  p_user_id uuid,
  p_action text,
  p_credits integer,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_balance integer;
  v_bonus integer;
  v_used integer;
  v_limit integer;
  v_reset_at timestamptz;
  v_unlimited boolean;
  v_remaining integer;
  v_cost integer;
  v_from_balance integer;
  v_from_bonus integer;
  v_log_id uuid;
  v_existing_log public.usage_logs%ROWTYPE;
BEGIN
  v_cost := greatest(coalesce(p_credits, 1), 1);

  IF p_idempotency_key IS NOT NULL THEN
    SELECT *
    INTO v_existing_log
    FROM public.usage_logs
    WHERE user_id = p_user_id
      AND idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      SELECT
        coalesce(plan, 'free'),
        coalesce(credit_balance, 0),
        coalesce(bonus_credits, 0),
        coalesce(monthly_usage_count, 0),
        credits_reset_at
      INTO v_plan, v_balance, v_bonus, v_used, v_reset_at
      FROM public.profiles
      WHERE id = p_user_id;

      v_unlimited := public.is_unlimited_credit_plan(v_plan);
      v_limit := public.plan_monthly_credit_allowance(v_plan);
      v_remaining := v_balance + v_bonus;

      RETURN jsonb_build_object(
        'ok', true,
        'allowed', true,
        'unlimited', v_unlimited,
        'used', v_used,
        'remaining', CASE WHEN v_unlimited THEN null ELSE v_remaining END,
        'limit', CASE WHEN v_unlimited THEN null ELSE v_limit END,
        'usageResetDate', v_reset_at,
        'plan', v_plan,
        'bonusCredits', v_bonus,
        'cost', v_cost,
        'logId', v_existing_log.id
      );
    END IF;
  END IF;

  PERFORM public.maybe_reset_user_credits(p_user_id);

  SELECT
    coalesce(plan, 'free'),
    coalesce(credit_balance, 0),
    coalesce(bonus_credits, 0),
    coalesce(monthly_usage_count, 0),
    credits_reset_at
  INTO v_plan, v_balance, v_bonus, v_used, v_reset_at
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'profile_not_found'
    );
  END IF;

  v_unlimited := public.is_unlimited_credit_plan(v_plan);
  v_limit := public.plan_monthly_credit_allowance(v_plan);
  v_remaining := v_balance + v_bonus;

  IF v_unlimited THEN
    RETURN jsonb_build_object(
      'ok', true,
      'allowed', true,
      'unlimited', true,
      'used', v_used,
      'remaining', null,
      'limit', null,
      'usageResetDate', v_reset_at,
      'plan', v_plan,
      'bonusCredits', v_bonus,
      'cost', v_cost
    );
  END IF;

  IF v_remaining < v_cost THEN
    RETURN jsonb_build_object(
      'ok', false,
      'allowed', false,
      'unlimited', false,
      'used', v_used,
      'remaining', v_remaining,
      'limit', v_limit,
      'usageResetDate', v_reset_at,
      'plan', v_plan,
      'bonusCredits', v_bonus,
      'cost', v_cost,
      'error', 'insufficient_credits'
    );
  END IF;

  v_from_balance := least(v_balance, v_cost);
  v_from_bonus := v_cost - v_from_balance;

  UPDATE public.profiles
  SET
    credit_balance = v_balance - v_from_balance,
    bonus_credits = v_bonus - v_from_bonus,
    monthly_usage_count = v_used + v_cost
  WHERE id = p_user_id;

  v_remaining := (v_balance - v_from_balance) + (v_bonus - v_from_bonus);
  v_used := v_used + v_cost;

  INSERT INTO public.usage_logs (
    user_id,
    action,
    feature,
    credits_used,
    balance_after,
    idempotency_key,
    metadata
  )
  VALUES (
    p_user_id,
    p_action,
    p_action,
    v_cost,
    v_remaining,
    p_idempotency_key,
    coalesce(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_log_id;

  RETURN jsonb_build_object(
    'ok', true,
    'allowed', true,
    'unlimited', false,
    'used', v_used,
    'remaining', v_remaining,
    'limit', v_limit,
    'usageResetDate', v_reset_at,
    'plan', v_plan,
    'bonusCredits', v_bonus - v_from_bonus,
    'cost', v_cost,
    'logId', v_log_id
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Restrict RPC execution to service role
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.maybe_reset_user_credits(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_credit_status(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_user_credits(uuid, text, integer, jsonb, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.maybe_reset_user_credits(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_credit_status(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_user_credits(uuid, text, integer, jsonb, text) TO service_role;
