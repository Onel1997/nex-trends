import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";

export const SIGNUP_CREDITS = 10;
export const WEEKLY_REFILL_CREDITS = 5;
export const MAX_FREE_CREDITS = 15;
/** @deprecated Use MAX_FREE_CREDITS */
export const FREE_MONTHLY_AI_LIMIT = MAX_FREE_CREDITS;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type ProfileUsageRow = {
  id: string;
  is_pro: boolean;
  subscription_status: string | null;
  credit_balance: number | null;
  monthly_usage_count: number | null;
  last_weekly_refill_at: string | null;
  usage_reset_date: string | null;
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
};

const PROFILE_SELECT =
  "id, is_pro, subscription_status, credit_balance, monthly_usage_count, last_weekly_refill_at, usage_reset_date, is_banned, banned_at";

export function hasProAccess(profile: ProfileUsageRow): boolean {
  return profile.is_pro === true && profile.subscription_status === "active";
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
): Promise<ProfileUsageRow> {
  const { data: existing, error: selectError } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (existing && !selectError) {
    return existing as ProfileUsageRow;
  }

  const now = new Date();
  const nextRefill = getNextWeeklyRefillDate(now);

  const { data: created, error: insertError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: userId,
      credit_balance: SIGNUP_CREDITS,
      monthly_usage_count: 0,
      last_weekly_refill_at: now.toISOString(),
      usage_reset_date: nextRefill,
      is_pro: false,
      subscription_status: "inactive",
    })
    .select(PROFILE_SELECT)
    .single();

  if (created && !insertError) {
    console.log("Profil automatisch erstellt für:", userId);
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

  console.error("ensureProfile fehlgeschlagen:", insertError ?? retryError);
  throw insertError ?? retryError ?? new Error("Profil konnte nicht erstellt werden");
}

export async function ensureWeeklyRefill(
  supabaseAdmin: SupabaseClient,
  profile: ProfileUsageRow,
): Promise<ProfileUsageRow> {
  if (hasProAccess(profile)) {
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
    console.error("ensureWeeklyRefill fehlgeschlagen:", error);
    throw error ?? new Error("Profil nach Weekly Refill nicht gefunden");
  }

  console.log("Wöchentliche Credits aufgeladen:", {
    userId: profile.id,
    newBalance,
  });

  return data as ProfileUsageRow;
}

export function checkUsageLimit(profile: ProfileUsageRow): UsageLimitResult {
  const used = profile.monthly_usage_count ?? 0;
  const usageResetDate = profile.usage_reset_date ?? null;

  if (hasProAccess(profile)) {
    return {
      allowed: true,
      unlimited: true,
      used,
      remaining: null,
      limit: null,
      usageResetDate,
    };
  }

  const remaining = Math.max(0, profile.credit_balance ?? 0);

  return {
    allowed: remaining > 0,
    unlimited: false,
    used,
    remaining,
    limit: MAX_FREE_CREDITS,
    usageResetDate,
  };
}

export async function incrementUsage(
  supabaseAdmin: SupabaseClient,
  userId: string,
  profile: ProfileUsageRow,
  cost = 1,
): Promise<UsageLimitResult> {
  const safeCost = Math.max(1, Math.floor(cost));
  let current = await ensureWeeklyRefill(supabaseAdmin, profile);
  const check = checkUsageLimit(current);

  if (current.is_banned) {
    return { ...check, allowed: false, remaining: current.credit_balance ?? 0 };
  }

  if (check.unlimited) {
    console.log("Pro-User – unlimited usage:", userId);
    return check;
  }

  const balance = current.credit_balance ?? 0;

  if (balance < safeCost) {
    console.warn("Keine Credits mehr für Free-User:", userId, check);
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
    console.error("incrementUsage fehlgeschlagen:", error);
    throw error ?? new Error("Profil nach Increment nicht gefunden");
  }

  const snapshot = checkUsageLimit(data as ProfileUsageRow);
  console.log("Credits verbraucht:", { userId, cost: safeCost, snapshot });
  return { ...snapshot, allowed: true };
}
