'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { EmailLoginForm } from '@/components/landing/EmailLoginForm'
import { AUTH_ERROR_STORAGE_KEY, getPostAuthRedirectPath } from '@/lib/auth'
import { useSubscription } from '@/hooks/useSubscription'
import { useToast } from '@/context/ToastContext'

function readAuthErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('error')
}

function readNextPath(): string {
  if (typeof window === 'undefined') return getPostAuthRedirectPath()
  const next = new URLSearchParams(window.location.search).get('next')
  if (next && next.startsWith('/') && !next.startsWith('//')) return next
  return getPostAuthRedirectPath()
}

export default function AuthPage() {
  const router = useRouter()
  const { session, isAuthLoading } = useSubscription()
  const { showToast } = useToast()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const fromQuery = readAuthErrorFromUrl()
    if (fromQuery) {
      setAuthError(fromQuery)
      showToast({
        type: 'error',
        title: 'Anmeldung fehlgeschlagen',
        message: fromQuery,
        durationMs: 8000,
      })
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', `${url.pathname}${url.search}`)
      return
    }

    try {
      const stored = sessionStorage.getItem(AUTH_ERROR_STORAGE_KEY)
      if (stored) {
        setAuthError(stored)
        showToast({
          type: 'error',
          title: 'Anmeldung fehlgeschlagen',
          message: stored,
          durationMs: 8000,
        })
        sessionStorage.removeItem(AUTH_ERROR_STORAGE_KEY)
      }
    } catch {
      /* sessionStorage unavailable */
    }
  }, [showToast])

  useEffect(() => {
    if (isAuthLoading || !session?.user) return
    router.replace(readNextPath())
  }, [isAuthLoading, session?.user, router])

  if (!isAuthLoading && session?.user) {
    return null
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-black px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl"
      >
        <h1 className="mb-2 text-2xl font-bold text-white">NexTrends</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Logge dich ein, um dein Marketing-Dashboard zu starten.
        </p>

        {authError ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            role="alert"
          >
            {authError}
          </motion.p>
        ) : null}

        <GoogleSignInButton
          label="Mit Google anmelden"
          variant="white"
          size="md"
          className="!w-full"
          useToast
        />

        <p className="my-4 text-xs text-zinc-500">oder</p>

        <EmailLoginForm
          wrapperClassName="max-w-none"
          inputClassName="rounded-lg bg-zinc-950"
          buttonClassName="rounded-lg border border-zinc-700 bg-zinc-950 font-semibold hover:border-violet-500/50 hover:bg-zinc-800"
        />

        <p className="mt-8 text-center text-xs text-zinc-600">
          <a href="/" className="text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline">
            Zur Startseite
          </a>
        </p>
      </motion.div>
    </div>
  )
}
