import { useCallback } from 'react'
import { useToast } from '@/context/ToastContext'
import { startStripeCheckoutFlow } from '@/lib/stripe'

export function useStripeCheckout() {
  const { showToast } = useToast()

  return useCallback(async () => {
    try {
      await startStripeCheckoutFlow()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Checkout konnte nicht gestartet werden.'

      showToast({
        type: 'error',
        title: 'Checkout fehlgeschlagen',
        message,
        durationMs: 7000,
      })
    }
  }, [showToast])
}
