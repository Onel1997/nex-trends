import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";

export type SafeResult<T> = {
  data: T;
  warnings: string[];
};

type PostgrestError = {
  message?: string;
  code?: string;
  details?: string;
};

export function isSchemaError(error: PostgrestError | null | undefined): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";
  return (
    code === "42P01" ||
    code === "42703" ||
    code === "PGRST200" ||
    code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find") ||
    msg.includes("schema cache") ||
    msg.includes("column") && msg.includes("profiles")
  );
}

export function logAdminWarning(scope: string, error: unknown): void {
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error
    ? String((error as PostgrestError).message)
    : String(error);
  console.warn(`[admin-api] ${scope}:`, message);
}

export async function safeProfilesSelect(
  admin: SupabaseClient,
  selectFull: string,
  selectMinimal: string,
): Promise<SafeResult<Record<string, unknown>[]>> {
  const warnings: string[] = [];

  const full = await admin.from("profiles").select(selectFull);
  if (!full.error) {
    return { data: (full.data ?? []) as Record<string, unknown>[], warnings };
  }

  if (isSchemaError(full.error)) {
    logAdminWarning("profiles extended select", full.error);
    warnings.push(
      "Einige Profil-Felder fehlen in der DB (Migration ausführen: admin_dashboard).",
    );
    const minimal = await admin.from("profiles").select(selectMinimal);
    if (!minimal.error) {
      return { data: (minimal.data ?? []) as Record<string, unknown>[], warnings };
    }
    logAdminWarning("profiles minimal select", minimal.error);
    warnings.push(`profiles: ${minimal.error.message}`);
    return { data: [], warnings };
  }

  logAdminWarning("profiles select", full.error);
  warnings.push(`profiles: ${full.error.message}`);
  return { data: [], warnings };
}

export async function safeAnalyticsCount(
  admin: SupabaseClient,
  eventType: string,
): Promise<SafeResult<number>> {
  const warnings: string[] = [];
  const { count, error } = await admin
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("event_type", eventType);

  if (!error) return { data: count ?? 0, warnings };

  if (isSchemaError(error)) {
    logAdminWarning("analytics_events count", error);
    warnings.push(
      "analytics_events Tabelle fehlt — Migration 20250525110000_admin_dashboard ausführen.",
    );
    return { data: 0, warnings };
  }

  logAdminWarning("analytics_events count", error);
  warnings.push(`analytics_events: ${error.message}`);
  return { data: 0, warnings };
}

export async function safeAnalyticsEvents(
  admin: SupabaseClient,
  eventType: string,
  limit: number,
): Promise<SafeResult<{ payload: unknown; created_at: string; user_id?: string }[]>> {
  const warnings: string[] = [];
  const { data, error } = await admin
    .from("analytics_events")
    .select("payload, created_at, user_id")
    .eq("event_type", eventType)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!error) {
    return {
      data: (data ?? []) as { payload: unknown; created_at: string; user_id?: string }[],
      warnings,
    };
  }

  if (isSchemaError(error)) {
    logAdminWarning("analytics_events list", error);
    warnings.push("analytics_events nicht verfügbar — leere Trend-Statistik.");
    return { data: [], warnings };
  }

  logAdminWarning("analytics_events list", error);
  warnings.push(`analytics_events: ${error.message}`);
  return { data: [], warnings };
}

export async function safeAppSettings(
  admin: SupabaseClient,
): Promise<SafeResult<Record<string, unknown> | null>> {
  const warnings: string[] = [];
  const { data, error } = await admin
    .from("app_settings")
    .select("maintenance_mode, announcement, feature_flags, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (!error) return { data: data as Record<string, unknown> | null, warnings };

  if (isSchemaError(error)) {
    logAdminWarning("app_settings", error);
    warnings.push(
      "app_settings Tabelle fehlt — Standard-Einstellungen werden verwendet.",
    );
    return { data: null, warnings };
  }

  logAdminWarning("app_settings", error);
  warnings.push(`app_settings: ${error.message}`);
  return { data: null, warnings };
}

export async function safeListAuthUsers(
  admin: SupabaseClient,
): Promise<SafeResult<{ id: string; email?: string; created_at: string }[]>> {
  const warnings: string[] = [];
  const users: { id: string; email?: string; created_at: string }[] = [];

  try {
    let page = 1;
    const perPage = 200;

    while (page <= 10) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const batch = data.users ?? [];
      users.push(
        ...batch.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
        })),
      );
      if (batch.length < perPage) break;
      page += 1;
    }

    return { data: users, warnings };
  } catch (err) {
    logAdminWarning("auth.admin.listUsers", err);
    warnings.push(
      "Auth-Nutzerliste nicht verfügbar — Fallback auf profiles-Tabelle.",
    );
    return { data: users, warnings };
  }
}
