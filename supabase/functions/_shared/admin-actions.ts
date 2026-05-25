/** Normalizes client action strings — supports legacy aliases after deploy skew. */
export function normalizeAdminAction(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const action = raw.trim().toLowerCase();
  if (!action) return null;

  const aliases: Record<string, string> = {
    analytics_dashboard: "analytics",
    get_analytics: "analytics",
    dashboard: "analytics",
    analytics_overview: "analytics",
    overview_stats: "overview",
    get_overview: "overview",
    users: "list_users",
    get_users: "list_users",
    listusers: "list_users",
    trends: "trend_stats",
    trend_stats_v2: "trend_stats",
    get_trend_stats: "trend_stats",
    settings: "get_settings",
    get_settings_v2: "get_settings",
    save_settings: "update_settings",
    ping: "health",
    probe: "health",
  };

  return aliases[action] ?? action;
}

export const KNOWN_ADMIN_ACTIONS = new Set([
  "overview",
  "analytics",
  "list_users",
  "update_user",
  "trend_stats",
  "get_settings",
  "update_settings",
  "reset_credits_global",
  "log_event",
  "health",
]);
