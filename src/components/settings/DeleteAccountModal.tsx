import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib'

const CONFIRM_TEXT = 'LÖSCHEN'

type DeleteAccountModalProps = {
  open: boolean
  onClose: () => void
  userEmail?: string | null
}

export function DeleteAccountModal({ open, onClose, userEmail }: DeleteAccountModalProps) {
  const { showToast } = useToast()
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_TEXT

  const handleClose = useCallback(() => {
    if (loading) return
    setConfirmText('')
    onClose()
  }, [loading, onClose])

  const handleDelete = useCallback(async () => {
    if (!canDelete) return
    setLoading(true)
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('nextrends_onboarding_v1')
      showToast({
        type: 'info',
        title: 'Abgemeldet',
        message: 'Für vollständige Kontolöschung kontaktiere support@nextrends.app.',
      })
      handleClose()
    } catch {
      showToast({ type: 'error', title: 'Abmeldung fehlgeschlagen' })
    } finally {
      setLoading(false)
    }
  }, [canDelete, showToast, handleClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div
        className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm animate-fade-in"
        aria-hidden
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md animate-toast-in rounded-2xl border border-red-500/25 bg-zinc-950/95 p-6 shadow-[0_0_60px_-16px_rgba(239,68,68,0.4)] backdrop-blur-2xl">
        <h2 id="delete-account-title" className="text-lg font-semibold text-white">
          Account löschen
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Diese Aktion meldet dich ab und entfernt lokale Daten. Gespeicherte Inhalte und
          Abonnements werden separat über{' '}
          <span className="text-zinc-300">{userEmail ?? 'deine E-Mail'}</span> bearbeitet.
        </p>

        <p className="mt-4 text-xs text-zinc-500">
          Tippe <span className="font-mono font-semibold text-red-300">{CONFIRM_TEXT}</span> zur
          Bestätigung:
        </p>

        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CONFIRM_TEXT}
          className="mt-2"
          autoComplete="off"
          disabled={loading}
        />

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            variant="primary"
            fullWidth
            disabled={!canDelete}
            loading={loading}
            onClick={() => void handleDelete()}
            className={cn(
              canDelete && 'border-red-500/40 bg-red-600 hover:bg-red-500',
            )}
          >
            Account löschen
          </Button>
          <Button variant="ghost" fullWidth onClick={handleClose} disabled={loading}>
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  )
}
