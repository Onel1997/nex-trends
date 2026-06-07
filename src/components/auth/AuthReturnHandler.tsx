'use client'

import { useEffect, useRef, useState } from 'react'
import { AuthPanelSkeleton } from '@/components/ui/loading-states'
import {
  completeAuthCallback,
  formatAuthError,
  getPostAuthRedirectPath,
  redirectToLoginAfterAuthFailure,
} from '@/lib/auth'
import { syncUserProfile } from '@/lib/auth/profile'
import { supabase } from '@/lib/supabase'

function hasOAuthReturnParams(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.has('code') || params.has('error') || params.has('error_description')
}

function isMarketingHomePath(): boolean {
  const normalized = window.location.pathname.replace(/\/+$/, '') || '/'
  return normalized === '/'
}

/**
 * Handles Supabase OAuth when the provider returns to Site URL (`/?code=...`)
 * or `/auth/callback`. Exchanges the PKCE code in the browser (verifier lives
 * in client cookies) and redirects to the dashboard.
 */
export function AuthReturnHandler() {
  const [processing, setProcessing] = useState(() => hasOAuthReturnParams())
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    async function finishSignIn() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        try {
          await syncUserProfile(session.user)
        } catch {
          /* profile sync is best-effort */
        }
        window.location.replace(getPostAuthRedirectPath())
      }
    }

    async function run() {
      if (hasOAuthReturnParams()) {
        setProcessing(true)

        const {
          data: { session: existing },
        } = await supabase.auth.getSession()
        if (existing?.user) {
          await finishSignIn()
          return
        }

        const { error, message } = await completeAuthCallback()
        if (error) {
          const {
            data: { session: afterError },
          } = await supabase.auth.getSession()
          if (afterError?.user) {
            await finishSignIn()
            return
          }
          redirectToLoginAfterAuthFailure(message ?? formatAuthError(error))
          return
        }

        await finishSignIn()
        return
      }

      if (isMarketingHomePath()) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          window.location.replace(getPostAuthRedirectPath())
        }
      }
    }

    void run()
  }, [])

  if (!processing) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950">
      <AuthPanelSkeleton
        title="Anmeldung wird abgeschlossen …"
        subtitle="Einen Moment — dein Creator Workspace wird vorbereitet."
      />
    </div>
  )
}
