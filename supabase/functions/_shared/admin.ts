/**
 * Allowlisted admin accounts (normalized lowercase).
 * Keep in sync with src/lib/admin.ts
 */
const ADMIN_EMAILS = ["onilbashir97@gmail.com"] as const;

export function normalizeAdminEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? "";
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeAdminEmail(email);
  if (!normalized) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(normalized);
}
