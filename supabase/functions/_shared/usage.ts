import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { isAdminEmail } from "./admin.ts";
import {
  consumeCredits,
  getCreditStatus,
  SIGNUP_CREDITS,
  type CreditStatusResult,
} from "./credits.ts";
import {
  isUnlimitedPlan,
  legacyIsPro,
  normalizePlanId,
  planMonthlyCredits,
  type PlanId,
} from "./plans.ts";
import { resolveFeatureCost } from "./credits.ts";

/** @deprecated Weekly refill removed — use monthly reset via RPC */
export const WEEKLY_REFILL_CREDITS = 0;
export const MAX_FREE_CREDITS = 25;
export { SIGNUP_CREDITS };

export type ProfileUsageRow = {
  id: string;
  plan?: string | null;
  is_pro: boolean;
  subscription_status: string | null;
  credit_balance: number | null;
  monthly_usage_count: number | null;
  bonus_credits?: number | null;
  last_weekly_refill_at: string | null;
  usage_reset_date: string | null;
  credits_reset_at?: string | null;
  is_banned?: boolean | null;
  banned_at?: string | null;
  workspace_id?: string | null;
};

export type UsageLimitResult = CreditStatusResult;

const PROFILE_SELECT =
  "id, plan, is_pro, subscription_status, credit_balance, bonus_credits, monthly_usage_count, last_weekly_refill_at, usage_reset_date, credits_reset_at, is_banned, banned_at, workspace_id";

export function resolvePlan(
  profile: ProfileUsageRow,
  email?: string | null,
): PlanId {
  if (isAdminEmail(email)) return "founder";
  return normalizePlanId(profile.plan);
}

export function hasProAccess(profile: ProfileUsageRow): boolean {
  const plan = normalizePlanId(profile.plan);
  return legacyIsPro(plan, profile.subscription_status);
}

export async function ensureProfile(
  supabaseAdmin: SupabaseClient,
  userId: string,
  email?: string | null,
): Promise<ProfileUsageRow> {
  const { data: existing, error: selectError } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (existing && !selectError) {
    const row = existing as ProfileUsageRow;
    if (isAdminEmail(email)) {
      await supabaseAdmin.from("profiles").update({
        plan: "founder",
        is_pro: true,
        subscription_status: "active",
      }).eq("id", userId);
      return { ...row, plan: "founder", is_pro: true, subscription_status: "active" };
    }
    return row;
  }

  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const plan: PlanId = isAdminEmail(email) ? "founder" : "free";

  const { data: created, error: insertError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: userId,
      email: email ?? null,
      plan,
      credit_balance: SIGNUP_CREDITS,
      bonus_credits: 0,
      monthly_usage_count: 0,
      last_weekly_refill_at: now.toISOString(),
      usage_reset_date: nextReset,
      credits_reset_at: nextReset,
      is_pro: plan === "founder",
      subscription_status: plan === "founder" ? "active" : "inactive",
    })
    .select(PROFILE_SELECT)
    .single();

  if (created && !insertError) {
    return created as ProfileUsageRow;
  }

  const { data: retry, error: retryError } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .single();

  if (retry && !retryError) {
    return retry as ProfileUsageRow;
  }

  throw insertError ?? retryError ?? new Error("Profil konnte nicht erstellt werden");
}

/** No-op: monthly reset handled in Postgres RPC */
export async function ensureWeeklyRefill(
  supabaseAdmin: SupabaseClient,
  profile: ProfileUsageRow,
  _email?: string | null,
): Promise<ProfileUsageRow> {
  await supabaseAdmin.rpc("maybe_reset_user_credits", { p_user_id: profile.id });
  const { data } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", profile.id)
    .single();
  return (data ?? profile) as ProfileUsageRow;
}

export async function logUsage(
  supabaseAdmin: SupabaseClient,
  userId: string,
  action: string,
  creditsUsed: number,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabaseAdmin.from("usage_logs").insert({
    user_id: userId,
    action,
    feature: action,
    credits_used: creditsUsed,
    metadata,
  });

  if (error) {
    console.warn("[usage] usage_logs insert failed:", error.message);
  }
}

export { resolveFeatureCost as resolveCreditCost };

export async function checkUsageLimit(
  supabaseAdmin: SupabaseClient,
  userId: string,
  email?: string | null,
): Promise<UsageLimitResult> {
  return getCreditStatus(supabaseAdmin, userId, email);
}

export async function incrementUsage(
  supabaseAdmin: SupabaseClient,
  userId: string,
  _profile: ProfileUsageRow,
  cost = 1,
  options?: {
    action?: string;
    metadata?: Record<string, unknown>;
    email?: string | null;
    idempotencyKey?: string;
  },
): Promise<UsageLimitResult> {
  const feature = options?.action ?? "generation";
  return consumeCredits(supabaseAdmin, userId, {
    feature,
    cost: resolveFeatureCost(feature, cost),
    metadata: options?.metadata,
    email: options?.email,
    idempotencyKey: options?.idempotencyKey,
  });
}

/** Apply plan after Stripe subscription sync */
export async function applyPlanToProfile(
  supabaseAdmin: SupabaseClient,
  userId: string,
  plan: PlanId,
  subscriptionStatus: "active" | "inactive",
  stripeIds?: {
    customerId?: string | null;
    subscriptionId?: string | null;
    periodEnd?: string | null;
  },
): Promise<void> {
  const isActive = subscriptionStatus === "active";
  const monthlyCredits = planMonthlyCredits(plan);

  const update: Record<string, unknown> = {
    plan,
    subscription_status: subscriptionStatus,
    is_pro: legacyIsPro(plan, subscriptionStatus),
  };

  if (stripeIds?.customerId) {
    update.stripe_customer_id = stripeIds.customerId;
  }
  if (stripeIds?.subscriptionId) {
    update.stripe_subscription_id = stripeIds.subscriptionId;
  }

  if (isActive) {
    if (!isUnlimitedPlan(plan) && monthlyCredits !== null) {
      update.credit_balance = monthlyCredits;
      update.monthly_usage_count = 0;
    }
    update.credits_reset_at = stripeIds?.periodEnd ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    update.usage_reset_date = update.credits_reset_at;
  }

  if (!isActive && plan !== "founder") {
    update.plan = "free";
    update.is_pro = false;
    const freeAllowance = planMonthlyCredits("free") ?? SIGNUP_CREDITS;
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("credit_balance")
      .eq("id", userId)
      .maybeSingle();
    const current = (data?.credit_balance as number | null) ?? SIGNUP_CREDITS;
    update.credit_balance = Math.min(current, freeAllowance);
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (error) {
    console.error("[applyPlanToProfile]", error);
    throw error;
  }
}
