import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { isAdminEmail } from "../_shared/admin.ts";
import {
  aggregateFromGenerations,
  buildAnalyticsDashboard,
  safeAiGenerationsInPeriod,
} from "../_shared/admin-analytics.ts";
import {
  safeAnalyticsCount,
  safeAnalyticsEvents,
  safeAppSettings,
  safeListAuthUsers,
  safeProfilesSelect,
} from "../_shared/admin-db.ts";
import { KNOWN_ADMIN_ACTIONS, normalizeAdminAction } from "../_shared/admin-actions.ts";
import { SIGNUP_CREDITS } from "../_shared/credits.ts";
import {
  legacyIsPro,
  normalizePlanId,
  planMonthlyCredits,
  type PlanId,
} from "../_shared/plans.ts";
import { applyPlanToProfile, ensureProfile } from "../_shared/usage.ts";

const MAX_ADMIN_SET_CREDITS = planMonthlyCredits("studio") ?? 5000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const PROFILE_SELECT_FULL =
  "id, plan, is_pro, subscription_status, credit_balance, monthly_usage_count, is_banned, banned_at";
const PROFILE_SELECT_MINIMAL =
  "id, plan, is_pro, subscription_status, credit_balance, monthly_usage_count";
const PROFILE_SELECT_OVERVIEW =
  "id, plan, is_pro, subscription_status, monthly_usage_count, is_banned";

type AdminAction =
  | "overview"
  | "analytics"
  | "list_users"
  | "update_user"
  | "trend_stats"
  | "get_settings"
  | "update_settings"
  | "reset_credits_global"
  | "log_event"
  | "health";

type ProfileRow = {
  id: string;
  plan?: string | null;
  is_pro?: boolean;
  subscription_status?: string | null;
  credit_balance?: number | null;
  monthly_usage_count?: number | null;
  is_banned?: boolean | null;
  banned_at?: string | null;
};

const DEFAULT_SETTINGS = {
  maintenance_mode: false,
  announcement: "",
  feature_flags: {},
  updated_at: null as string | null,
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

function mergeWarnings(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const w of group) {
      if (!w || seen.has(w)) continue;
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

function asProfileRow(row: Record<string, unknown>): ProfileRow {
  return {
    id: String(row.id),
    plan: (row.plan as string | null) ?? "free",
    is_pro: row.is_pro === true,
    subscription_status: (row.subscription_status as string | null) ?? "inactive",
    credit_balance: typeof row.credit_balance === "number"
      ? row.credit_balance
      : null,
    monthly_usage_count: typeof row.monthly_usage_count === "number"
      ? row.monthly_usage_count
      : 0,
    is_banned: row.is_banned === true,
    banned_at: (row.banned_at as string | null) ?? null,
  };
}

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: errorResponse("Nicht authentifiziert", 401) };
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return { error: errorResponse("Supabase-Umgebungsvariablen fehlen", 500) };
  }

  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser(token);

  if (authError || !user?.email) {
    return { error: errorResponse("User nicht gefunden", 401) };
  }

  if (!isAdminEmail(user.email)) {
    return { error: errorResponse("Keine Admin-Berechtigung", 403) };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  return { user, supabaseAdmin };
}

function buildTrendStats(
  nicheEvents: { payload: unknown; created_at: string }[],
  genEvents: { payload: unknown; created_at: string }[],
) {
  const nicheCounts = new Map<string, number>();
  for (const row of nicheEvents) {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const niche = String(payload.niche ?? "Unknown").trim() || "Unknown";
    nicheCounts.set(niche, (nicheCounts.get(niche) ?? 0) + 1);
  }

  const platformCounts = new Map<string, number>();
  for (const row of nicheEvents) {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const platform = String(payload.platform ?? "Alle").trim() || "Alle";
    platformCounts.set(platform, (platformCounts.get(platform) ?? 0) + 1);
  }

  return {
    topNiches: [...nicheCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([niche, count]) => ({ niche, count })),
    topPlatforms: [...platformCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([platform, count]) => ({ platform, count })),
    recentGenerations: genEvents.map((e) => {
      const payload = (e.payload ?? {}) as Record<string, unknown>;
      return {
        tool: String(payload.tool ?? "—"),
        label: String(payload.label ?? "—"),
        created_at: e.created_at ?? new Date().toISOString(),
      };
    }),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await requireAdmin(req);
    if ("error" in auth && auth.error) return auth.error;

    const { user, supabaseAdmin } = auth;
    const body = await req.json().catch(() => ({}));
    const rawAction = body.action;
    const normalized = normalizeAdminAction(rawAction);

    console.log("[admin-api] action:", {
      raw: rawAction,
      normalized,
    });

    if (!normalized) {
      return errorResponse("Ungültige action", 400);
    }

    if (!KNOWN_ADMIN_ACTIONS.has(normalized)) {
      return errorResponse(
        `Unbekannte action: ${String(rawAction)} (normalisiert: ${normalized}). Bitte admin-api neu deployen.`,
        400,
      );
    }

    const action = normalized as AdminAction;

    if (action === "health") {
      return jsonResponse({
        ok: true,
        version: "20250526120000",
        actions: [...KNOWN_ADMIN_ACTIONS],
      });
    }

    if (action === "overview" || action === "analytics") {
      const period = body.period === "24h" || body.period === "7d" ||
          body.period === "30d"
        ? body.period
        : "7d";
      const warnings: string[] = [];

      const authResult = await safeListAuthUsers(supabaseAdmin);
      warnings.push(...authResult.warnings);

      const profilesResult = await safeProfilesSelect(
        supabaseAdmin,
        PROFILE_SELECT_OVERVIEW,
        PROFILE_SELECT_MINIMAL,
      );
      warnings.push(...profilesResult.warnings);

      const profileRows = profilesResult.data.map(asProfileRow);
      const authUsers = authResult.data;

      const totalUsers = Math.max(authUsers.length, profileRows.length);
      const proUsers = profileRows.filter((p) => {
        const plan = normalizePlanId(p.plan ?? "free");
        return legacyIsPro(plan, p.subscription_status ?? null);
      }).length;

      const planCounts: Record<string, number> = {
        free: 0,
        creator: 0,
        audio: 0,
        pro_creator: 0,
        studio: 0,
        agency: 0,
        founder: 0,
      };
      for (const p of profileRows) {
        const plan = normalizePlanId(p.plan ?? "free");
        planCounts[plan] = (planCounts[plan] ?? 0) + 1;
      }

      const gensResult = await safeAiGenerationsInPeriod(
        supabaseAdmin,
        period,
        5000,
      );
      warnings.push(...gensResult.warnings);

      const aggregated = aggregateFromGenerations(gensResult.data, period);

      const periodActiveUsers = aggregated.activeUsers;
      const totalGenerations = aggregated.totalGenerations;
      const creditsConsumed = aggregated.creditsConsumed;

      const eventCountResult = await safeAnalyticsCount(
        supabaseAdmin,
        "generation",
      );
      warnings.push(...eventCountResult.warnings);

      const overviewBase = {
        totalUsers,
        activeUsers: periodActiveUsers,
        totalGenerations: Math.max(totalGenerations, eventCountResult.data),
        proUsers,
        planCounts,
        creditsConsumed,
        revenuePlaceholder: "€ — Stripe Sync",
        period,
        _warnings: mergeWarnings(warnings),
      };

      if (action === "overview") {
        return jsonResponse(overviewBase);
      }

      const dashboard = await buildAnalyticsDashboard(supabaseAdmin, period);
      return jsonResponse({
        ...overviewBase,
        ...dashboard.data,
        _warnings: mergeWarnings(warnings, dashboard.warnings),
      });
    }

    if (action === "list_users") {
      const search = String(body.search ?? "").trim().toLowerCase();
      const warnings: string[] = [];

      const authResult = await safeListAuthUsers(supabaseAdmin);
      warnings.push(...authResult.warnings);

      const profilesResult = await safeProfilesSelect(
        supabaseAdmin,
        PROFILE_SELECT_FULL,
        PROFILE_SELECT_MINIMAL,
      );
      warnings.push(...profilesResult.warnings);

      const profileMap = new Map(
        profilesResult.data.map((row) => [String(row.id), asProfileRow(row)]),
      );

      const authUsers = authResult.data;
      const sourceUsers = authUsers.length > 0
        ? authUsers
        : profilesResult.data.map((row) => ({
          id: String(row.id),
          email: undefined as string | undefined,
          created_at: new Date(0).toISOString(),
        }));

      let users = sourceUsers.map((u) => {
        const profile = profileMap.get(u.id);
        const plan = normalizePlanId(profile?.plan ?? "free");
        return {
          id: u.id,
          email: u.email ?? "—",
          created_at: u.created_at ?? new Date(0).toISOString(),
          credit_balance: profile?.credit_balance ?? SIGNUP_CREDITS,
          monthly_usage_count: profile?.monthly_usage_count ?? 0,
          plan,
          is_pro: profile?.is_pro ?? legacyIsPro(plan, profile?.subscription_status ?? null),
          subscription_status: profile?.subscription_status ?? "inactive",
          is_banned: profile?.is_banned ?? false,
          banned_at: profile?.banned_at ?? null,
        };
      });

      if (search) {
        users = users.filter((u) => u.email.toLowerCase().includes(search));
      }

      users.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return jsonResponse({
        users: users.slice(0, 500),
        _warnings: mergeWarnings(warnings),
      });
    }

    if (action === "update_user") {
      const userId = String(body.userId ?? "");
      if (!userId) return errorResponse("userId fehlt", 400);

      const updates: Record<string, unknown> = {};
      let planApplied = false;
      let appliedPlanRow: ProfileRow | null = null;

      const authLookup = await supabaseAdmin.auth.admin.getUserById(userId);
      const targetEmail = authLookup.data.user?.email ?? null;

      if (typeof body.plan === "string" && body.plan.trim()) {
        const plan = normalizePlanId(body.plan) as PlanId;
        const subscriptionStatus = plan === "free" ? "inactive" : "active";

        await ensureProfile(supabaseAdmin, userId, targetEmail);
        const applied = await applyPlanToProfile(
          supabaseAdmin,
          userId,
          plan,
          subscriptionStatus,
        );
        appliedPlanRow = {
          id: userId,
          plan: applied.plan ?? plan,
          is_pro: applied.is_pro,
          subscription_status: applied.subscription_status,
          credit_balance: applied.credit_balance,
          monthly_usage_count: applied.monthly_usage_count,
        };
        planApplied = true;
        console.log("[admin-api] update_user plan", {
          userId,
          plan,
          subscriptionStatus,
          profile: appliedPlanRow,
        });
      } else if (typeof body.is_pro === "boolean") {
        const plan: PlanId = body.is_pro ? "pro_creator" : "free";
        await ensureProfile(supabaseAdmin, userId, targetEmail);
        const applied = await applyPlanToProfile(
          supabaseAdmin,
          userId,
          plan,
          body.is_pro ? "active" : "inactive",
        );
        appliedPlanRow = {
          id: userId,
          plan: applied.plan ?? plan,
          is_pro: applied.is_pro,
          subscription_status: applied.subscription_status,
          credit_balance: applied.credit_balance,
          monthly_usage_count: applied.monthly_usage_count,
        };
        planApplied = true;
        console.log("[admin-api] update_user is_pro", {
          userId,
          is_pro: body.is_pro,
          profile: appliedPlanRow,
        });
      }

      if (typeof body.credit_delta === "number") {
        const { data: current, error: fetchError } = await supabaseAdmin
          .from("profiles")
          .select("credit_balance")
          .eq("id", userId)
          .maybeSingle();
        if (fetchError) throw fetchError;
        const balance = current?.credit_balance ?? 0;
        updates.credit_balance = Math.min(
          MAX_ADMIN_SET_CREDITS,
          Math.max(0, balance + Math.floor(body.credit_delta)),
        );
      }

      if (typeof body.set_credits === "number") {
        updates.credit_balance = Math.min(
          MAX_ADMIN_SET_CREDITS,
          Math.max(0, Math.floor(body.set_credits)),
        );
      }

      if (typeof body.is_banned === "boolean") {
        updates.is_banned = body.is_banned;
        updates.banned_at = body.is_banned ? new Date().toISOString() : null;
      }

      if (Object.keys(updates).length === 0 && !planApplied) {
        return errorResponse("Keine Updates angegeben", 400);
      }

      let data = null;
      let error = null;

      if (Object.keys(updates).length > 0) {
        ({ data, error } = await supabaseAdmin
          .from("profiles")
          .update(updates)
          .eq("id", userId)
          .select(PROFILE_SELECT_FULL)
          .single());
      } else {
        ({ data, error } = await supabaseAdmin
          .from("profiles")
          .select(PROFILE_SELECT_FULL)
          .eq("id", userId)
          .single());
      }

      if (error && typeof body.is_banned === "boolean") {
        const { is_banned: _b, banned_at: _a, ...withoutBan } = updates;
        ({ data, error } = await supabaseAdmin
          .from("profiles")
          .update(withoutBan)
          .eq("id", userId)
          .select(PROFILE_SELECT_MINIMAL)
          .single());
        if (!error) {
          return errorResponse(
            "Ban-Felder fehlen in profiles — Migration admin_dashboard ausführen.",
            400,
          );
        }
      }

      if (error) throw error;

      if (body.is_banned === true) {
        try {
          await supabaseAdmin.auth.admin.signOut(userId, "global");
        } catch (signOutErr) {
          console.warn("[admin-api] signOut after ban:", signOutErr);
        }
      }

      const profileRow = asProfileRow(
        (data ?? appliedPlanRow ?? { id: userId }) as Record<string, unknown>,
      );
      const responseProfile = {
        ...profileRow,
        email: targetEmail ?? "—",
        created_at: authLookup.data.user?.created_at ?? new Date(0).toISOString(),
      };

      console.log("[admin-api] update_user ok", {
        userId,
        planApplied,
        profile: responseProfile,
      });

      return jsonResponse({ profile: responseProfile, ok: true });
    }

    if (action === "trend_stats") {
      const period = body.period === "24h" || body.period === "7d" ||
          body.period === "30d"
        ? body.period
        : "7d";
      const warnings: string[] = [];

      const gensResult = await safeAiGenerationsInPeriod(
        supabaseAdmin,
        period,
        500,
      );
      warnings.push(...gensResult.warnings);

      if (gensResult.data.length > 0) {
        const aggregated = aggregateFromGenerations(gensResult.data, period);
        return jsonResponse({
          topNiches: aggregated.topNiches,
          topPlatforms: aggregated.topPlatforms,
          topTools: aggregated.topTools,
          recentGenerations: aggregated.recentGenerations.map((r) => ({
            tool: r.tool_used,
            label: r.prompt || r.niche || r.email,
            email: r.email,
            niche: r.niche,
            platform: r.platform,
            credits_used: r.credits_used,
            created_at: r.created_at,
          })),
          creditsConsumed: aggregated.creditsConsumed,
          totalGenerations: aggregated.totalGenerations,
          period,
          _warnings: mergeWarnings(warnings),
        });
      }

      const nicheResult = await safeAnalyticsEvents(
        supabaseAdmin,
        "niche_search",
        200,
      );
      warnings.push(...nicheResult.warnings);

      const genResult = await safeAnalyticsEvents(
        supabaseAdmin,
        "generation",
        50,
      );
      warnings.push(...genResult.warnings);

      const stats = buildTrendStats(nicheResult.data, genResult.data);

      return jsonResponse({
        ...stats,
        topTools: [],
        creditsConsumed: 0,
        totalGenerations: stats.recentGenerations.length,
        period,
        _warnings: mergeWarnings(warnings),
      });
    }

    if (action === "get_settings") {
      const settingsResult = await safeAppSettings(supabaseAdmin);
      const settings = settingsResult.data ?? DEFAULT_SETTINGS;

      return jsonResponse({
        settings: {
          maintenance_mode: Boolean(settings.maintenance_mode),
          announcement: String(settings.announcement ?? ""),
          feature_flags: (settings.feature_flags as Record<string, unknown>) ??
            {},
          updated_at: (settings.updated_at as string | null) ?? null,
        },
        _warnings: mergeWarnings(settingsResult.warnings),
      });
    }

    if (action === "update_settings") {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (typeof body.maintenance_mode === "boolean") {
        updates.maintenance_mode = body.maintenance_mode;
      }
      if (typeof body.announcement === "string") {
        updates.announcement = body.announcement.slice(0, 2000);
      }
      if (body.feature_flags && typeof body.feature_flags === "object") {
        updates.feature_flags = body.feature_flags;
      }

      const { data, error } = await supabaseAdmin
        .from("app_settings")
        .upsert({ id: 1, ...updates })
        .select("maintenance_mode, announcement, feature_flags, updated_at")
        .single();

      if (error) {
        const msg = error.message ?? "Einstellungen konnten nicht gespeichert werden";
        if (msg.includes("does not exist") || msg.includes("Could not find")) {
          return errorResponse(
            "app_settings Tabelle fehlt — bitte Migration admin_dashboard ausführen.",
            503,
          );
        }
        throw error;
      }

      return jsonResponse({ settings: data });
    }

    if (action === "reset_credits_global") {
      const refillAmount = Math.min(
        MAX_ADMIN_SET_CREDITS,
        Math.max(0, Math.floor(Number(body.amount ?? SIGNUP_CREDITS))),
      );

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          credit_balance: refillAmount,
          last_weekly_refill_at: new Date().toISOString(),
        })
        .eq("is_pro", false);

      if (error) throw error;

      return jsonResponse({ ok: true, amount: refillAmount });
    }

    if (action === "log_event") {
      const eventType = String(body.event_type ?? "");
      if (!eventType) return errorResponse("event_type fehlt", 400);

      const { error } = await supabaseAdmin.from("analytics_events").insert({
        user_id: user.id,
        event_type: eventType,
        payload: body.payload ?? {},
      });

      if (error) {
        console.warn("[admin-api] log_event:", error.message);
        return jsonResponse({ ok: false, skipped: true });
      }

      return jsonResponse({ ok: true });
    }

    return errorResponse("Unbekannte action", 400);
  } catch (err) {
    console.error("[admin-api] FEHLER:", err);
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(message, 500);
  }
});
