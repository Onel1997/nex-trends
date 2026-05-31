/** Keep in sync with src/lib/plans/definitions.ts */

import { STRIPE_CREATOR_MONTHLY_PRICE_ID } from "./stripe-prices.ts";

export type PlanId =
  | "free"
  | "creator"
  | "audio"
  | "pro_creator"
  | "studio"
  | "agency"
  | "founder";

export type BillingPeriod = "monthly" | "yearly";

export type UsageActionId =
  | "trend_search"
  | "hook_generation"
  | "seo_title"
  | "ad_copy"
  | "landing_analysis"
  | "ai_video"
  | "voiceover"
  | "captions";

export const CREDIT_COSTS: Record<UsageActionId, number> = {
  trend_search: 1,
  hook_generation: 2,
  seo_title: 2,
  ad_copy: 3,
  landing_analysis: 5,
  ai_video: 20,
  voiceover: 10,
  captions: 5,
};

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  creator: 1,
  audio: 2,
  pro_creator: 3,
  studio: 4,
  agency: 5,
  founder: 6,
};

export const UNLIMITED_CREDIT_PLANS: PlanId[] = ["agency", "founder"];

export const PAID_PLANS: PlanId[] = [
  "creator",
  "audio",
  "pro_creator",
  "studio",
  "agency",
];

export const PLAN_MONTHLY_CREDITS: Record<PlanId, number | null> = {
  free: 25,
  creator: 250,
  audio: 500,
  pro_creator: 1000,
  studio: 5000,
  agency: null,
  founder: null,
};

export function normalizePlanId(value: string | null | undefined): PlanId {
  if (!value) return "free";
  const v = value.trim().toLowerCase().replace(/-/g, "_");
  if (v === "admin") return "founder";
  if (
    v === "free" || v === "creator" || v === "audio" || v === "pro_creator" ||
    v === "studio" ||
    v === "agency" || v === "founder"
  ) {
    return v;
  }
  if (v === "pro") return "pro_creator";
  return "free";
}

export function isUnlimitedPlan(plan: PlanId): boolean {
  return UNLIMITED_CREDIT_PLANS.includes(plan);
}

export function planMonthlyCredits(plan: PlanId): number | null {
  return PLAN_MONTHLY_CREDITS[plan];
}

export function mapStripePriceToPlan(priceId: string): PlanId | null {
  const entries: [string, PlanId][] = [
    [STRIPE_CREATOR_MONTHLY_PRICE_ID, "creator"],
    [Deno.env.get("STRIPE_PRICE_CREATOR_YEARLY")?.trim() ?? "", "creator"],
    [Deno.env.get("STRIPE_PRICE_AUDIO_MONTHLY")?.trim() ?? "", "audio"],
    [Deno.env.get("STRIPE_PRICE_AUDIO_YEARLY")?.trim() ?? "", "audio"],
    [Deno.env.get("STRIPE_PRICE_PRO_CREATOR_MONTHLY")?.trim() ?? "", "pro_creator"],
    [Deno.env.get("STRIPE_PRICE_PRO_CREATOR_YEARLY")?.trim() ?? "", "pro_creator"],
    [Deno.env.get("STRIPE_PRICE_STUDIO_MONTHLY")?.trim() ?? "", "studio"],
    [Deno.env.get("STRIPE_PRICE_STUDIO_YEARLY")?.trim() ?? "", "studio"],
    [Deno.env.get("STRIPE_PRICE_AGENCY_MONTHLY")?.trim() ?? "", "agency"],
    [Deno.env.get("STRIPE_PRICE_AGENCY_YEARLY")?.trim() ?? "", "agency"],
    [Deno.env.get("STRIPE_PRICE_ID")?.trim() ?? "", "pro_creator"],
  ];

  for (const [envPrice, plan] of entries) {
    if (envPrice && envPrice === priceId) return plan;
  }
  return null;
}

export function resolveCheckoutPriceId(
  planId: PlanId,
  period: BillingPeriod,
): string | null {
  if (planId === "creator" && period === "monthly") {
    return STRIPE_CREATOR_MONTHLY_PRICE_ID;
  }

  const key = `STRIPE_PRICE_${planId.toUpperCase()}_${period.toUpperCase()}`;
  const direct = Deno.env.get(key)?.trim();
  if (direct) return direct;

  if (planId === "pro_creator" && period === "monthly") {
    return Deno.env.get("STRIPE_PRICE_ID")?.trim() ?? null;
  }

  return null;
}

export function canAccessRoute(plan: PlanId, routeId: string): boolean {
  if (plan === "founder") return true;

  const rank = PLAN_RANK[plan];

  if (routeId === "ai-studio") {
    return rank >= PLAN_RANK.studio;
  }

  if (routeId === "analyzer") {
    return rank >= PLAN_RANK.pro_creator;
  }

  if (
    routeId === "hook" || routeId === "ad-copy" || routeId === "seo" ||
    routeId === "saved-trends"
  ) {
    return rank >= PLAN_RANK.creator;
  }

  if (routeId === "trend-intelligence") {
    return true;
  }

  return true;
}

export function legacyIsPro(plan: PlanId, subscriptionStatus: string | null): boolean {
  if (plan === "founder") return true;
  if (!PAID_PLANS.includes(plan)) return false;
  return subscriptionStatus === "active";
}
