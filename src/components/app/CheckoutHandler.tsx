import { useEffect, useRef } from 'react'
import { useToast } from '@/context/ToastContext'
import { useSubscription } from '@/hooks/useSubscription'
import { clearCheckoutParams, readCheckoutParam } from '@/lib/navigation'

export function CheckoutHandler() {
  const { showToast } = useToast()
  const { session, hasProAccess, refreshProfile, closeUpgradeModal } = useSubscription()
  const handledCancelRef = useRef(false)
  const successPendingRef = useRef(false)
  const successToastShownRef = useRef(false)

  useEffect(() => {
    const checkout = readCheckoutParam()
    if (!checkout) return

    clearCheckoutParams()

    if (checkout === 'cancel') {
      if (!handledCancelRef.current) {
        handledCancelRef.current = true
        showToast({
          type: 'info',
          title: 'Checkout abgebrochen',
          message: 'Du kannst jederzeit wieder upgraden.',
        })
      }
      return
    }

    successPendingRef.current = true
    showToast({
      type: 'info',
      title: 'Zahlung erfolgreich',
      message: 'Dein Pro-Abo wird aktiviert …',
      durationMs: 6000,
    })
  }, [showToast])

  useEffect(() => {
    if (!successPendingRef.current || !session?.user?.id) return

    let attempts = 0
    const maxAttempts = 15
    let intervalId = 0

    const poll = async () => {
      attempts += 1
      await refreshProfile()
      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId)
      }
    }

    void poll()
    intervalId = window.setInterval(() => {
      void poll()
    }, 2000)

    return () => window.clearInterval(intervalId)
  }, [session?.user?.id, refreshProfile])

  useEffect(() => {
    if (!successPendingRef.current || !hasProAccess || successToastShownRef.current) {
      return
    }

    successToastShownRef.current = true
    successPendingRef.current = false
    closeUpgradeModal()

    showToast({
      type: 'success',
      title: 'Upgrade bestätigt! 🎉',
      message: 'NexTrends Pro ist jetzt aktiv. Alle Premium-Tools sind freigeschaltet.',
      durationMs: 7000,
    })
  }, [hasProAccess, showToast, closeUpgradeModal])

  return null
}
