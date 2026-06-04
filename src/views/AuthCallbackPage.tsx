import { useEffect, useRef } from 'react'
import { AuthPanelSkeleton } from '@/components/ui/loading-states'
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
        window.location.replace(`${window.location.origin}/dashboard`)
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
    <div className="ambient-glow min-h-svh bg-zinc-950">
      <AuthPanelSkeleton
        title="Anmeldung wird abgeschlossen …"
        subtitle="Einen Moment — dein Creator Workspace wird vorbereitet."
      />
    </div>
  )
}
