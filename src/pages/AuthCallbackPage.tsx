import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { completeAuthCallback, formatAuthError } from '@/lib/auth'
import { getPathForTool } from '@/lib/routes'

export function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function handleCallback() {
      const { error, message } = await completeAuthCallback()
      if (!mounted) return

      if (error) {
        setErrorMessage(message ?? formatAuthError(error))
        return
      }

      window.location.replace(getPathForTool('dashboard'))
    }

    void handleCallback()

    return () => {
      mounted = false
    }
  }, [])

  if (errorMessage) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <h1 className="text-lg font-semibold text-white">Anmeldung fehlgeschlagen</h1>
          <p className="mt-3 text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
          <a
            href="/"
            className="mt-6 inline-flex rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-smooth hover:bg-zinc-700"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center ambient-glow bg-zinc-950">
      <Spinner size="lg" label="Anmeldung wird abgeschlossen …" />
    </div>
  )
}
