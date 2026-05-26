# Credits & Usage Tracking

Production credit system for NexTrends — server-authoritative balances, atomic deductions, monthly resets.

## Architecture

```
React tools
  → useCredits() / consumeCredits(feature)
  → consume-credits Edge Function
  → Postgres RPC consume_user_credits()
  → profiles.credit_balance + usage_logs

generate-video (create)
  → consume_user_credits(ai_video) before job insert
```

**Never trust client `credit_balance` for enforcement.** UI reads profile for display; all deductions go through the edge function + RPC.

## Plan monthly allowances

| Plan | Credits / month |
|------|-----------------|
| free | 25 |
| creator | 250 |
| pro_creator | 1,000 |
| studio | 5,000 |
| agency | unlimited |
| founder | unlimited |

Source of truth: `public.plans.credits` + `PLAN_MONTHLY_CREDITS` in `src/lib/plans/definitions.ts`.

## Feature costs

| Feature | Action ID | Cost |
|---------|-----------|------|
| Trend Search | `trend_search` | 1 |
| Hook Generator | `hook_generation` | 2 |
| SEO Generator | `seo_title` | 2 |
| Ad Copy | `ad_copy` | 3 |
| Landing Page Analyzer | `landing_analysis` | 5 |
| AI Video | `ai_video` | 20 |
| Voiceover | `voiceover` | 10 |
| Captions | `captions` | 5 |

## Folder structure

```
supabase/migrations/20250528000000_credits_usage_system.sql
supabase/functions/consume-credits/
supabase/functions/_shared/credits.ts
supabase/functions/_shared/plans.ts

src/lib/credits/
  balance.ts      # read-only client estimates
  consume.ts      # edge API wrappers
  index.ts

src/hooks/useCredits.ts
src/types/credits.ts
src/components/credits/
```

## Database

### Tables

- **profiles** — `credit_balance`, `bonus_credits`, `monthly_usage_count`, `credits_reset_at`, `workspace_id`
- **usage_logs** — audit trail with `feature`, `balance_after`, `idempotency_key`
- **credit_adjustments** — admin/PAYG grants (future)
- **credit_wallets** — team pools (placeholder)

### RPCs (service role only)

- `maybe_reset_user_credits(user_id)` — monthly refill when `credits_reset_at` passed
- `get_user_credit_status(user_id)` — check balance
- `consume_user_credits(user_id, action, credits, metadata, idempotency_key)` — atomic deduct + log

Race safety: row `FOR UPDATE`, conditional `UPDATE … WHERE credit_balance = expected`, unique idempotency index.

## Edge functions

| Function | Purpose |
|----------|---------|
| `consume-credits` | Primary API: `action: check \| consume`, `feature` required for consume |
| `usage-limit` | Legacy wrapper (analytics actions); increment/check use same RPCs |
| `generate-video` | Charges 20 credits on `create` before queueing |

Deploy:

```bash
supabase db push
supabase functions deploy consume-credits
supabase functions deploy usage-limit
supabase functions deploy generate-video
```

## Frontend usage

```ts
import { useCredits } from '@/hooks/useCredits'
import { consumeCredits, getRemainingCredits } from '@/lib/credits'

const { remaining, limit, consume, requireCredits } = useCredits()

if (!requireCredits(5)) return
const result = await consume('landing_analysis', { label: 'CRO audit' })
```

## Migration strategy

1. Apply `20250528000000_credits_usage_system.sql` on staging.
2. Deploy edge functions.
3. Verify free users reset to 25-cap logic; paid users get plan allowance on next Stripe period or immediate `applyPlanToProfile`.
4. Ship frontend; monitor `usage_logs` vs `ai_generations`.
5. Deprecate weekly refill UX copy (removed in favor of monthly).

## Future extensions (prepared)

- **PAYG** — `credit_adjustments` + `bonus_credits` (bonus spent after monthly balance in RPC)
- **Team workspaces** — `credit_wallets` + `profiles.workspace_id`
- **Admin grants** — insert `credit_adjustments`, bump `bonus_credits`
