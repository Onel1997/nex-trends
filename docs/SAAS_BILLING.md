# NexTrends SaaS Billing Architecture

> **Stack:** Vite + React SPA, Supabase (Auth + Postgres + Edge Functions), Stripe Checkout + Customer Portal.

This is not Next.js App Router — route protection is client-side (`ToolAccessGate`) plus server-side enforcement in Edge Functions (`usage-limit`, `generate-video`, etc.).

## Database

Run migration:

```bash
supabase db push
```

Tables:


| Table                     | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `plans`                   | Catalog (free → founder) with credits + features JSON |
| `profiles.plan`           | Current tier synced from Stripe / admin               |
| `profiles.credit_balance` | Remaining credits                                     |
| `subscriptions`           | Stripe subscription mirror                            |
| `usage_logs`              | Per-action credit audit trail                         |


## Plans


| Plan          | Credits                      | Notes                 |
| ------------- | ---------------------------- | --------------------- |
| `free`        | 10 (+ weekly refill, max 15) | Watermarked exports   |
| `creator`     | 50 / period                  | HD, hooks, SEO        |
| `pro_creator` | Unlimited                    | AI Video Studio       |
| `studio`      | Unlimited                    | Team features         |
| `agency`      | Unlimited                    | API, white-label      |
| `founder`     | Unlimited                    | Admin email allowlist |


## Credit costs

Defined in `src/lib/plans/definitions.ts` and `supabase/functions/_shared/plans.ts`:

- Trend search: 1
- Hook / SEO / Ad copy: 1
- Landing analysis: 2
- AI video: 5
- Voiceover: 2
- Captions: 1

Deduction runs in `usage-limit` Edge Function → writes `usage_logs`.

## Stripe environment variables

Set in Supabase Edge Function secrets:

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=                    # legacy → pro_creator monthly
STRIPE_PRICE_CREATOR_MONTHLY=price_1TbP85FspTFcULBiLP1rb8hM
STRIPE_PRICE_CREATOR_YEARLY=
STRIPE_PRICE_PRO_CREATOR_MONTHLY=
STRIPE_PRICE_PRO_CREATOR_YEARLY=
STRIPE_PRICE_STUDIO_MONTHLY=
STRIPE_PRICE_STUDIO_YEARLY=
STRIPE_PRICE_AGENCY_MONTHLY=
STRIPE_PRICE_AGENCY_YEARLY=
SITE_URL=https://your-domain.com
```

Deploy functions:

```bash
supabase functions deploy create-checkout-session create-portal-session stripe-webhook usage-limit
```

## Routes


| Path                 | Page                              |
| -------------------- | --------------------------------- |
| `/dashboard/pricing` | Plan comparison + checkout CTAs   |
| `/dashboard/billing` | Subscription, credits, usage logs |
| `/billing/success`   | Post-checkout confirmation        |
| `/billing/cancel`    | Checkout canceled                 |


## Client modules

- `src/lib/plans/` — plan definitions, access matrix, credit costs
- `src/lib/billing/` — Supabase queries for logs + subscriptions
- `src/lib/stripe.ts` — checkout + portal
- `src/hooks/usePlanAccess.ts` — route/feature gating
- `src/components/billing/ToolAccessGate.tsx` — UI guard

## Webhook flow

1. `checkout.session.completed` → resolve plan from metadata / price ID
2. Upsert `subscriptions` row
3. `applyPlanToProfile()` → set `plan`, credits, `is_pro` legacy flag

## Adding a new gated tool

1. Add minimum plan in `src/lib/plans/access.ts` (`ROUTE_MIN_PLAN`)
2. Wrap page with `<ProtectedTool toolId="…" />`
3. Map tool slug in `tool-actions.ts` for credit deduction

