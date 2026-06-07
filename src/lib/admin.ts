import type { UsageLimitResult } from '@/types/usage'

/**
 * Allowlisted admin accounts (normalized lowercase).
 * Keep in sync with supabase/functions/_shared/admin.ts
 */
const ADMIN_EMAILS = ['onilbashir97@gmail.com'] as const

export function normalizeAdminEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? ''
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeAdminEmail(email)
  if (!normalized) return false
  return (ADMIN_EMAILS as readonly string[]).includes(normalized)
}

/** Unlimited usage snapshot for admin accounts */
export function getAdminUsageResult(
  used = 0,
  usageResetDate: string | null = null,
): UsageLimitResult {
  return {
    allowed: true,
    unlimited: true,
    used,
    remaining: null,
    limit: null,
    usageResetDate,
  }
}
