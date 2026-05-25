import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { isAdminEmail } from "./admin.ts";
import {
  CREDIT_COSTS,
  isUnlimitedPlan,
  legacyIsPro,
  normalizePlanId,
  planMonthlyCredits,
  type PlanId,
  type UsageActionId,
} from "./plans.ts";

export const SIGNUP_CREDITS = 10;
export const WEEKLY_REFILL_CREDITS = 5;
export const MAX_FREE_CREDITS = 15;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type ProfileUsageRow = {
  id: string;
  plan?: string | null;
  is_pro: boolean;
  subscription_status: string | null;
  credit_balance: number | null;
  monthly_usage_count: number | null;
  last_weekly_refill_at: string | null;
  usage_reset_date: string | null;
  credits_reset_at?: string | null;
  is_banned?: boolean | null;
  banned_at?: string | null;
};

export type UsageLimitResult = {
  allowed: boolean;
  unlimited: boolean;
  used: number;
  remaining: number | null;
  limit: number | null;
  usageResetDate: string | null;
  plan: PlanId;
};

const PROFILE_SELECT =
  "id, plan, is_pro, subscription_status, credit_balance, monthly_usage_count, last_weekly_refill_at, usage_reset_date, credits_reset_at, is_banned, banned_at";

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

export function getNextWeeklyRefillDate(from = new Date()): string {
  return new Date(from.getTime() + WEEK_MS).toISOString();
}

export function shouldWeeklyRefill(
  lastWeeklyRefillAt: string | null | undefined,
): boolean {
  if (!lastWeeklyRefillAt) return true;
  return Date.now() - new Date(lastWeeklyRefillAt).getTime() >= WEEK_MS;
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
  const nextRefill = getNextWeeklyRefillDate(now);
  const plan: PlanId = isAdminEmail(email) ? "founder" : "free";

  const { data: created, error: insertError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: userId,
      email: email ?? null,
      plan,
      credit_balance: SIGNUP_CREDITS,
      monthly_usage_count: 0,
      last_weekly_refill_at: now.toISOString(),
      usage_reset_date: nextRefill,
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

export async function ensureWeeklyRefill(
  supabaseAdmin: SupabaseClient,
  profile: ProfileUsageRow,
  email?: string | null,
): Promise<ProfileUsageRow> {
  const plan = resolvePlan(profile, email);

  if (isUnlimitedPlan(plan) || plan === "creator") {
    return profile;
  }

  if (!shouldWeeklyRefill(profile.last_weekly_refill_at)) {
    return profile;
  }

  const now = new Date();
  const currentBalance = profile.credit_balance ?? SIGNUP_CREDITS;
  const newBalance = Math.min(
    MAX_FREE_CREDITS,
    currentBalance + WEEKLY_REFILL_CREDITS,
  );
  const nextRefill = getNextWeeklyRefillDate(now);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      credit_balance: newBalance,
      last_weekly_refill_at: now.toISOString(),
      usage_reset_date: nextRefill,
    })
    .eq("id", profile.id)
    .select(PROFILE_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Profil nach Weekly Refill nicht gefunden");
  }

  return data as ProfileUsageRow;
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
    credits_used: creditsUsed,
    metadata,
  });

  if (error) {
    console.warn("[usage] usage_logs insert failed:", error.message);
  }
}

export function resolveCreditCost(
  action?: string,
  explicitCost?: number,
): number {
  if (typeof explicitCost === "number" && explicitCost > 0) {
    return Math.floor(explicitCost);
  }
  if (action && action in CREDIT_COSTS) {
    return CREDIT_COSTS[action as UsageActionId];
  }
  return 1;
}

export function checkUsageLimit(
  profile: ProfileUsageRow,
  email?: string | null,
): UsageLimitResult {
  const plan = resolvePlan(profile, email);
  const used = profile.monthly_usage_count ?? 0;
  const usageResetDate = profile.usage_reset_date ?? null;

  if (isAdminEmail(email) || isUnlimitedPlan(plan)) {
    return {
      allowed: true,
      unlimited: true,
      used,
      remaining: null,
      limit: null,
      usageResetDate,
      plan,
    };
  }

  const monthlyAllowance = planMonthlyCredits(plan);
  const remaining = Math.max(0, profile.credit_balance ?? 0);
  const limit = plan === "free" ? MAX_FREE_CREDITS : (monthlyAllowance ?? MAX_FREE_CREDITS);

  return {
    allowed: remaining > 0,
    unlimited: false,
    used,
    remaining,
    limit,
    usageResetDate,
    plan,
  };
}

export async function incrementUsage(
  supabaseAdmin: SupabaseClient,
  userId: string,
  profile: ProfileUsageRow,
  cost = 1,
  options?: {
    action?: string;
    metadata?: Record<string, unknown>;
    email?: string | null;
  },
): Promise<UsageLimitResult> {
  const safeCost = resolveCreditCost(options?.action, cost);
  let current = await ensureWeeklyRefill(supabaseAdmin, profile, options?.email);
  const plan = resolvePlan(current, options?.email);
  const check = checkUsageLimit(current, options?.email);

  if (current.is_banned) {
    return { ...check, allowed: false, remaining: current.credit_balance ?? 0 };
  }

  if (check.unlimited) {
    await logUsage(supabaseAdmin, userId, options?.action ?? "generation", safeCost, {
      ...options?.metadata,
      plan,
      unlimited: true,
    });
    return check;
  }

  const balance = current.credit_balance ?? 0;

  if (balance < safeCost) {
    return { ...check, allowed: false, remaining: balance };
  }

  const newBalance = balance - safeCost;
  const nextUsed = (current.monthly_usage_count ?? 0) + safeCost;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      credit_balance: newBalance,
      monthly_usage_count: nextUsed,
    })
    .eq("id", userId)
    .select(PROFILE_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Profil nach Increment nicht gefunden");
  }

  await logUsage(supabaseAdmin, userId, options?.action ?? "generation", safeCost, {
    ...options?.metadata,
    plan,
  });

  const snapshot = checkUsageLimit(data as ProfileUsageRow, options?.email);
  return { ...snapshot, allowed: true };
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

  if (isActive && monthlyCredits !== null) {
    update.credit_balance = monthlyCredits;
    update.credits_reset_at = new Date().toISOString();
  }

  if (isActive && isUnlimitedPlan(plan)) {
    update.credit_balance = 999999;
  }

  if (!isActive && plan !== "founder") {
    update.plan = "free";
    update.is_pro = false;
    update.credit_balance = Math.min(
      MAX_FREE_CREDITS,
      (await supabaseAdmin.from("profiles").select("credit_balance").eq("id", userId)
        .maybeSingle()).data?.credit_balance ?? SIGNUP_CREDITS,
    );
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
