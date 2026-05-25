import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { isSchemaError, logAdminWarning, type SafeResult } from "./admin-db.ts";
import { periodToSince, type AnalyticsPeriod } from "./analytics.ts";

export type AiGenerationRow = {
  id?: string;
  user_id?: string | null;
  email: string;
  tool_used: string;
  niche: string;
  platform: string;
  prompt: string;
  credits_used: number;
  created_at: string;
};

function normalizePeriod(raw: unknown): AnalyticsPeriod {
  if (raw === "24h" || raw === "7d" || raw === "30d") return raw;
  return "7d";
}

export async function safeAiGenerationsInPeriod(
  admin: SupabaseClient,
  period: AnalyticsPeriod,
  limit = 500,
): Promise<SafeResult<AiGenerationRow[]>> {
  const warnings: string[] = [];
  const since = periodToSince(period);

  const { data, error } = await admin
    .from("ai_generations")
    .select(
      "id, user_id, email, tool_used, niche, platform, prompt, credits_used, created_at",
    )
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!error) {
    return {
      data: (data ?? []) as AiGenerationRow[],
      warnings,
    };
  }

  if (isSchemaError(error)) {
    logAdminWarning("ai_generations list", error);
    warnings.push(
      "ai_generations Tabelle fehlt — Migration 20250526100000_analytics_tracking ausführen.",
    );
    return { data: [], warnings };
  }

  logAdminWarning("ai_generations list", error);
  warnings.push(`ai_generations: ${error.message}`);
  return { data: [], warnings };
}

export async function safeAnalyticsDaily(
  admin: SupabaseClient,
  period: AnalyticsPeriod,
): Promise<SafeResult<{ day: string; total_generations: number; credits_consumed: number; active_users: number }[]>> {
  const warnings: string[] = [];
  const since = periodToSince(period).slice(0, 10);

  const { data, error } = await admin
    .from("analytics_daily")
    .select("day, total_generations, credits_consumed, active_users")
    .gte("day", since)
    .order("day", { ascending: true });

  if (!error) {
    return {
      data: (data ?? []).map((r) => ({
        day: String(r.day),
        total_generations: Number(r.total_generations ?? 0),
        credits_consumed: Number(r.credits_consumed ?? 0),
        active_users: Number(r.active_users ?? 0),
      })),
      warnings,
    };
  }

  if (isSchemaError(error)) {
    logAdminWarning("analytics_daily", error);
    warnings.push("analytics_daily nicht verfügbar — Charts aus Rohdaten.");
    return { data: [], warnings };
  }

  logAdminWarning("analytics_daily", error);
  warnings.push(`analytics_daily: ${error.message}`);
  return { data: [], warnings };
}

export async function safePlatformStats(
  admin: SupabaseClient,
): Promise<SafeResult<{ platform: string; generation_count: number; credits_consumed: number }[]>> {
  const warnings: string[] = [];

  const { data, error } = await admin
    .from("platform_stats")
    .select("platform, generation_count, credits_consumed")
    .order("generation_count", { ascending: false })
    .limit(12);

  if (!error) {
    return {
      data: (data ?? []).map((r) => ({
        platform: String(r.platform),
        generation_count: Number(r.generation_count ?? 0),
        credits_consumed: Number(r.credits_consumed ?? 0),
      })),
      warnings,
    };
  }

  if (isSchemaError(error)) {
    logAdminWarning("platform_stats", error);
    return { data: [], warnings };
  }

  logAdminWarning("platform_stats", error);
  warnings.push(`platform_stats: ${error.message}`);
  return { data: [], warnings };
}

export function aggregateFromGenerations(
  rows: AiGenerationRow[],
  period: AnalyticsPeriod,
) {
  const toolCounts = new Map<string, number>();
  const nicheCounts = new Map<string, number>();
  const platformCounts = new Map<string, number>();
  const usersByDay = new Map<string, Set<string>>();
  const gensByDay = new Map<string, { generations: number; credits: number }>();
  let creditsConsumed = 0;
  const activeUserIds = new Set<string>();

  for (const row of rows) {
    creditsConsumed += row.credits_used ?? 0;
    const tool = row.tool_used || "unknown";
    toolCounts.set(tool, (toolCounts.get(tool) ?? 0) + 1);

    const niche = (row.niche ?? "").trim();
    if (niche) nicheCounts.set(niche, (nicheCounts.get(niche) ?? 0) + 1);

    const platform = (row.platform ?? "").trim();
    if (platform) platformCounts.set(platform, (platformCounts.get(platform) ?? 0) + 1);

    if (row.user_id) activeUserIds.add(row.user_id);

    const day = row.created_at?.slice(0, 10) ?? "";
    if (day) {
      const dayBucket = gensByDay.get(day) ?? { generations: 0, credits: 0 };
      dayBucket.generations += 1;
      dayBucket.credits += row.credits_used ?? 0;
      gensByDay.set(day, dayBucket);

      if (row.user_id) {
        const set = usersByDay.get(day) ?? new Set<string>();
        set.add(row.user_id);
        usersByDay.set(day, set);
      }
    }
  }

  const dailySeries = [...gensByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      generations: v.generations,
      credits: v.credits,
      activeUsers: usersByDay.get(date)?.size ?? 0,
    }));

  return {
    period,
    totalGenerations: rows.length,
    creditsConsumed,
    activeUsers: activeUserIds.size,
    topTools: [...toolCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tool, count]) => ({ tool, count })),
    topNiches: [...nicheCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([niche, count]) => ({ niche, count })),
    topPlatforms: [...platformCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([platform, count]) => ({ platform, count })),
    dailySeries,
    recentGenerations: rows.slice(0, 40).map((r) => ({
      id: r.id,
      email: r.email,
      tool_used: r.tool_used,
      niche: r.niche,
      platform: r.platform,
      prompt: r.prompt?.slice(0, 120) ?? "",
      credits_used: r.credits_used,
      created_at: r.created_at,
    })),
  };
}

export async function buildAnalyticsDashboard(
  admin: SupabaseClient,
  rawPeriod: unknown,
): Promise<{ data: Record<string, unknown>; warnings: string[] }> {
  const period = normalizePeriod(rawPeriod);
  const warnings: string[] = [];

  const [gensResult, dailyResult, platformResult, h24, h7, h30] = await Promise.all([
    safeAiGenerationsInPeriod(admin, period, 800),
    safeAnalyticsDaily(admin, period),
    safePlatformStats(admin),
    safeAiGenerationsInPeriod(admin, "24h", 2000),
    safeAiGenerationsInPeriod(admin, "7d", 5000),
    safeAiGenerationsInPeriod(admin, "30d", 10000),
  ]);

  warnings.push(
    ...gensResult.warnings,
    ...dailyResult.warnings,
    ...platformResult.warnings,
  );

  const aggregated = aggregateFromGenerations(gensResult.data, period);

  const dailySeries = dailyResult.data.length > 0
    ? dailyResult.data.map((d) => ({
      date: d.day,
      generations: d.total_generations,
      credits: d.credits_consumed,
      activeUsers: d.active_users,
    }))
    : aggregated.dailySeries;

  const topPlatforms = platformResult.data.length > 0
    ? platformResult.data.map((p) => ({
      platform: p.platform,
      count: p.generation_count,
    }))
    : aggregated.topPlatforms;

  return {
    data: {
      period,
      ...aggregated,
      dailySeries,
      topPlatforms,
      platformStats: platformResult.data,
      liveCounters: {
        last24h: h24.data.length,
        last7d: h7.data.length,
        last30d: h30.data.length,
      },
    },
    warnings,
  };
}
