import { invokeEdgeFunction } from './edgeFunctions'
import { getAppOrigin } from './auth'
import { supabase } from './supabase'
import { pricingTierToPlanId, type BillingPeriod, type PlanId } from '@/lib/plans'

type CheckoutSessionResponse = {
  url?: string
  error?: string
}

type PortalSessionResponse = {
  url?: string
  error?: string
}

export type CheckoutOptions = {
  planId?: PlanId
  billingPeriod?: BillingPeriod
  successPath?: string
  cancelPath?: string
}

export async function openStripeCheckout(options: CheckoutOptions = {}): Promise<string> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error('Bitte melde dich an, bevor du ein Abo startest.')
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.id) {
    throw new Error('Benutzer konnte nicht geladen werden. Bitte erneut anmelden.')
  }

  const origin = getAppOrigin()
  const planId = options.planId ?? 'pro_creator'
  const billingPeriod = options.billingPeriod ?? 'monthly'

  const data = await invokeEdgeFunction<CheckoutSessionResponse>(
    'create-checkout-session',
    {
      planId,
      billingPeriod,
      successUrl: `${origin}${options.successPath ?? '/billing/success'}`,
      cancelUrl: `${origin}${options.cancelPath ?? '/billing/cancel'}`,
    },
  )

  const url = data.url
  if (!url) {
    throw new Error('Keine Checkout-URL von Stripe erhalten.')
  }

  return url
}

export async function startStripeCheckoutFlow(options: CheckoutOptions = {}): Promise<void> {
  const url = await openStripeCheckout(options)
  window.location.assign(url)
}

export async function openStripeCustomerPortal(): Promise<string> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error('Bitte melde dich an, um dein Abo zu verwalten.')
  }

  const origin = getAppOrigin()

  const data = await invokeEdgeFunction<PortalSessionResponse>(
    'create-portal-session',
    {
      returnUrl: `${origin}/dashboard/billing`,
    },
  )

  const url = data.url
  if (!url) {
    throw new Error('Keine Portal-URL von Stripe erhalten.')
  }

  return url
}

export async function startStripePortalFlow(): Promise<void> {
  const url = await openStripeCustomerPortal()
  window.location.assign(url)
}

/** Map UI pricing tier to SaaS plan id for checkout */
export function checkoutPlanFromTier(tier: string): PlanId {
  return pricingTierToPlanId(tier)
}
