import { useState } from 'react'
import { signInWithEmail } from '@/lib/auth'
import { formControlClassName } from '@/lib/form-field-styles'
import { cn } from '@/lib'

type EmailLoginFormProps = {
  inputClassName?: string
  buttonClassName?: string
  wrapperClassName?: string
}

export function EmailLoginForm({
  inputClassName,
  buttonClassName,
  wrapperClassName,
}: EmailLoginFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleEmailSignIn() {
    const trimmed = email.trim()
    if (!trimmed) {
      setStatus('error')
      setErrorMessage('Bitte eine E-Mail-Adresse eingeben.')
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    const { error, message } = await signInWithEmail(trimmed)

    if (error) {
      setStatus('error')
      setErrorMessage(message)
      return
    }

    setStatus('sent')
  }

  return (
    <div className={cn('w-full max-w-sm', wrapperClassName)}>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (status === 'error') {
            setStatus('idle')
            setErrorMessage(null)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleEmailSignIn()
        }}
        placeholder="E-Mail eingeben"
        autoComplete="email"
        className={cn(formControlClassName, 'min-h-11 border-zinc-700 bg-zinc-900 py-3', inputClassName)}
      />

      <button
        type="button"
        onClick={() => void handleEmailSignIn()}
        disabled={status === 'loading'}
        className={cn(
          'nex-btn nex-btn--secondary mt-3 w-full min-h-[2.625rem] rounded-[10px] px-4 py-2.5 text-sm font-semibold disabled:opacity-60',
          buttonClassName,
        )}
      >
        {status === 'loading' ? 'Wird gesendet…' : 'Mit E-Mail anmelden'}
      </button>

      {status === 'sent' && (
        <p className="mt-3 text-sm text-emerald-400">
          Prüfe dein Postfach für den Login-Link.
        </p>
      )}
      {status === 'error' && errorMessage && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
