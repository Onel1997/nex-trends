import { invokeEdgeFunction } from './edgeFunctions'
import { getAppOrigin } from './auth'
import { supabase } from './supabase'

type CheckoutSessionResponse = {
  url?: string
  error?: string
}

export async function openStripeCheckout(): Promise<string> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error('Bitte melde dich an, bevor du ein Pro-Abo startest.')
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.id) {
    throw new Error('Benutzer konnte nicht geladen werden. Bitte erneut anmelden.')
  }

  const origin = getAppOrigin()

  const data = await invokeEdgeFunction<CheckoutSessionResponse>(
    'create-checkout-session',
    {
      successUrl: `${origin}/?checkout=success`,
      cancelUrl: `${origin}/?checkout=cancel`,
    },
  )

  const url = data.url
  if (!url) {
    throw new Error('Keine Checkout-URL von Stripe erhalten.')
  }

  return url
}

export async function startStripeCheckoutFlow(): Promise<void> {
  const url = await openStripeCheckout()
  window.location.assign(url)
}
