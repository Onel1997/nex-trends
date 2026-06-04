import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminEmail } from "./admin.ts";
import {
  CREDIT_COSTS,
  isUnlimitedPlan,
  normalizePlanId,
  planMonthlyCredits,
  type PlanId,
  type UsageActionId,
} from "./plans.ts";

export const SIGNUP_CREDITS = 25;

export type CreditStatusResult = {
  allowed: boolean;
  unlimited: boolean;
  used: number;
  remaining: number | null;
  limit: number | null;
  usageResetDate: string | null;
  plan: PlanId;
  bonusCredits?: number;
  cost?: number;
  logId?: string;
  error?: string;
};

export type ConsumeCreditsOptions = {
  feature: UsageActionId | string;
  cost?: number;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  email?: string | null;
};

function formatRpcError(value: unknown): string {
  if (value == null) return "unknown_error";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
    try {
      return JSON.stringify(value);
    } catch {
      return "unknown_error";
    }
  }
  return String(value);
}

function mapRpcToResult(
  row: Record<string, unknown>,
  email?: string | null,
): CreditStatusResult {
  const plan = normalizePlanId(String(row.plan ?? "free"));

  if (isAdminEmail(email)) {
    return {
      allowed: true,
      unlimited: true,
      used: Number(row.used ?? 0),
      remaining: null,
      limit: null,
      usageResetDate: row.usageResetDate != null
        ? String(row.usageResetDate)
        : null,
      plan: "founder",
      bonusCredits: Number(row.bonusCredits ?? 0),
      cost: row.cost != null ? Number(row.cost) : undefined,
      logId: row.logId != null ? String(row.logId) : undefined,
    };
  }

  const unlimited = row.unlimited === true || isUnlimitedPlan(plan);

  return {
    allowed: row.allowed === true,
    unlimited,
    used: Number(row.used ?? 0),
    remaining: unlimited ? null : Number(row.remaining ?? 0),
    limit: unlimited ? null : (row.limit != null ? Number(row.limit) : null),
    usageResetDate: row.usageResetDate != null
      ? String(row.usageResetDate)
      : null,
    plan,
    bonusCredits: Number(row.bonusCredits ?? 0),
    cost: row.cost != null ? Number(row.cost) : undefined,
    logId: row.logId != null ? String(row.logId) : undefined,
    error: row.error != null ? formatRpcError(row.error) : undefined,
  };
}

export function resolveFeatureCost(
  feature: string,
  explicitCost?: number,
): number {
  if (typeof explicitCost === "number" && explicitCost > 0) {
    return Math.floor(explicitCost);
  }
  if (feature in CREDIT_COSTS) {
    return CREDIT_COSTS[feature as UsageActionId];
  }
  return 1;
}

export async function getCreditStatus(
  supabaseAdmin: SupabaseClient,
  userId: string,
  email?: string | null,
): Promise<CreditStatusResult> {
  if (isAdminEmail(email)) {
    return {
      allowed: true,
      unlimited: true,
      used: 0,
      remaining: null,
      limit: null,
      usageResetDate: null,
      plan: "founder",
    };
  }

  const { data, error } = await supabaseAdmin.rpc("get_user_credit_status", {
    p_user_id: userId,
  });

  if (error) {
    console.error("[credits] get_user_credit_status:", error.message);
    throw error;
  }

  const payload = data as Record<string, unknown> | null;
  if (!payload?.ok) {
    throw new Error(String(payload?.error ?? "credit_status_failed"));
  }

  return mapRpcToResult(payload, email);
}

export async function consumeCredits(
  supabaseAdmin: SupabaseClient,
  userId: string,
  options: ConsumeCreditsOptions,
): Promise<CreditStatusResult> {
  const feature = options.feature;
  const cost = resolveFeatureCost(feature, options.cost);

  if (isAdminEmail(options.email)) {
    return {
      allowed: true,
      unlimited: true,
      used: 0,
      remaining: null,
      limit: null,
      usageResetDate: null,
      plan: "founder",
      cost,
    };
  }

  const { data, error } = await supabaseAdmin.rpc("consume_user_credits", {
    p_user_id: userId,
    p_action: feature,
    p_credits: cost,
    p_metadata: options.metadata ?? {},
    p_idempotency_key: options.idempotencyKey ?? null,
  });

  if (error) {
    console.error("[credits] consume_user_credits:", error.message);
    throw error;
  }

  const payload = data as Record<string, unknown> | null;
  if (!payload?.ok && payload?.error !== "insufficient_credits") {
    throw new Error(String(payload?.error ?? "consume_failed"));
  }

  return mapRpcToResult(payload ?? {}, options.email);
}

/** Apply plan after Stripe — sets monthly allowance (not 999999 sentinel) */
export async function applyPlanCredits(
  supabaseAdmin: SupabaseClient,
  userId: string,
  plan: PlanId,
  subscriptionStatus: "active" | "inactive",
  periodEnd?: string | null,
): Promise<void> {
  const allowance = planMonthlyCredits(plan);
  const update: Record<string, unknown> = {};

  if (subscriptionStatus === "active") {
    if (!isUnlimitedPlan(plan) && allowance !== null) {
      update.credit_balance = allowance;
    }
    update.credits_reset_at = periodEnd ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    update.usage_reset_date = update.credits_reset_at;
    update.monthly_usage_count = 0;
  } else if (plan !== "founder") {
    const freeAllowance = planMonthlyCredits("free") ?? SIGNUP_CREDITS;
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("credit_balance")
      .eq("id", userId)
      .maybeSingle();
    const current = (data?.credit_balance as number | null) ?? SIGNUP_CREDITS;
    update.credit_balance = Math.min(current, freeAllowance);
    update.plan = "free";
  }

  if (Object.keys(update).length === 0) return;

  const { error } = await supabaseAdmin
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (error) {
    console.error("[applyPlanCredits]", error);
    throw error;
  }
}
