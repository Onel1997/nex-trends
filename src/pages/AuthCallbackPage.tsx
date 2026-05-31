import { useEffect, useRef } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import {
  completeAuthCallback,
  formatAuthError,
  getPostAuthRedirectPath,
  redirectToHomeAfterAuthFailure,
} from '@/lib/auth'
import { supabase } from '@/lib/supabase'

/**
 * OAuth callback handler for `/auth/callback`.
 * Vite SPA route — served via Vercel rewrite to index.html (see vercel.json).
 */
export function AuthCallbackPage() {
  const redirectStarted = useRef(false)

  useEffect(() => {
    let mounted = true

    function redirectToDashboard() {
      if (redirectStarted.current) return
      redirectStarted.current = true
      window.location.replace(getPostAuthRedirectPath())
    }

    async function handleCallback() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!mounted) return

      if (session) {
        redirectToDashboard()
        return
      }

      const { error, message } = await completeAuthCallback()
      if (!mounted) return

      if (error) {
        const {
          data: { session: sessionAfterError },
        } = await supabase.auth.getSession()
        if (!mounted) return

        if (sessionAfterError) {
          redirectToDashboard()
          return
        }

        redirectToHomeAfterAuthFailure(message ?? formatAuthError(error))
        return
      }

      redirectToDashboard()
    }

    void handleCallback()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center ambient-glow bg-zinc-950">
      <Spinner size="lg" label="Anmeldung wird abgeschlossen …" />
    </div>
  )
}
