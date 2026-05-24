import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";

export const FREE_MONTHLY_AI_LIMIT = 10;

export type ProfileUsageRow = {
  id: string;
  is_pro: boolean;
  subscription_status: string | null;
  monthly_usage_count: number | null;
  usage_reset_date: string | null;
};

export type UsageLimitResult = {
  allowed: boolean;
  unlimited: boolean;
  used: number;
  remaining: number | null;
  limit: number | null;
  usageResetDate: string | null;
};

export function hasProAccess(profile: ProfileUsageRow): boolean {
  return profile.is_pro === true && profile.subscription_status === "active";
}

export function getNextResetDate(from = new Date()): string {
  const next = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );
  return next.toISOString();
}

export function shouldResetMonthlyUsage(
  usageResetDate: string | null | undefined,
): boolean {
  if (!usageResetDate) return true;
  return Date.now() >= new Date(usageResetDate).getTime();
}

export async function resetMonthlyUsage(
  supabaseAdmin: SupabaseClient,
  userId: string,
): Promise<ProfileUsageRow> {
  const usageResetDate = getNextResetDate();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      monthly_usage_count: 0,
      usage_reset_date: usageResetDate,
    })
    .eq("id", userId)
    .select(
      "id, is_pro, subscription_status, monthly_usage_count, usage_reset_date",
    )
    .single();

  if (error || !data) {
    console.error("resetMonthlyUsage fehlgeschlagen:", error);
    throw error ?? new Error("Profil nach Reset nicht gefunden");
  }

  console.log("Monatliches Usage-Limit zurückgesetzt für:", userId);
  return data as ProfileUsageRow;
}

export async function ensureUsagePeriod(
  supabaseAdmin: SupabaseClient,
  profile: ProfileUsageRow,
): Promise<ProfileUsageRow> {
  if (!shouldResetMonthlyUsage(profile.usage_reset_date)) {
    return profile;
  }
  return resetMonthlyUsage(supabaseAdmin, profile.id);
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

  const remaining = Math.max(0, FREE_MONTHLY_AI_LIMIT - used);

  return {
    allowed: remaining > 0,
    unlimited: false,
    used,
    remaining,
    limit: FREE_MONTHLY_AI_LIMIT,
    usageResetDate,
  };
}

export async function incrementUsage(
  supabaseAdmin: SupabaseClient,
  userId: string,
  profile: ProfileUsageRow,
): Promise<UsageLimitResult> {
  const current = await ensureUsagePeriod(supabaseAdmin, profile);
  const check = checkUsageLimit(current);

  if (check.unlimited) {
    console.log("Pro-User – unlimited usage:", userId);
    return check;
  }

  if (!check.allowed) {
    console.warn("Usage-Limit erreicht für Free-User:", userId, check);
    return check;
  }

  const nextCount = (current.monthly_usage_count ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ monthly_usage_count: nextCount })
    .eq("id", userId)
    .select(
      "id, is_pro, subscription_status, monthly_usage_count, usage_reset_date",
    )
    .single();

  if (error || !data) {
    console.error("incrementUsage fehlgeschlagen:", error);
    throw error ?? new Error("Profil nach Increment nicht gefunden");
  }

  const updated = data as ProfileUsageRow;
  const result = checkUsageLimit(updated);

  console.log("Usage incrementiert:", { userId, result });
  return result;
}
