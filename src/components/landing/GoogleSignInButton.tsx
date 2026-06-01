'use client'

import { useState } from 'react'
import { cn } from '@/lib'
import { signInWithGoogle } from '@/lib/auth'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-4 shrink-0 sm:size-[1.125rem]', className)}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

type GoogleSignInButtonProps = {
  label?: string
  variant?: 'gradient' | 'white' | 'outline'
  className?: string
  size?: 'md' | 'lg'
  /** Compact hero CTA — sizing comes from `.landing-hero-cta` */
  layout?: 'default' | 'hero'
}

export function GoogleSignInButton({
  label = 'Kostenlos mit Google starten',
  variant = 'gradient',
  className,
  size = 'lg',
  layout = 'default',
}: GoogleSignInButtonProps) {
  const isHero = layout === 'hero'
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    setErrorMessage(null)

    const { error, message } = await signInWithGoogle()

    if (error) {
      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={isLoading}
        className={cn(
          'nex-btn inline-flex items-center justify-center whitespace-nowrap font-semibold tracking-[-0.01em] disabled:opacity-60',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/50',
          isHero
            ? 'w-full gap-2 leading-none sm:w-auto'
            : 'w-full justify-center gap-2.5 rounded-[10px] sm:w-auto',
          !isHero && size === 'lg' && 'min-h-[2.625rem] px-5 py-2.5 text-sm',
          !isHero && size === 'md' && 'min-h-[2.375rem] px-4 py-2 text-sm',
          !isHero && variant === 'gradient' && 'nex-btn--primary',
          !isHero &&
            variant === 'white' &&
            'border border-zinc-700/60 bg-white text-zinc-900 hover:border-zinc-600 hover:bg-zinc-50',
          !isHero && variant === 'outline' && 'nex-btn--secondary',
          className,
        )}
      >
        <GoogleIcon className={isHero ? 'landing-hero-cta__icon' : undefined} />
        {isLoading ? 'Weiterleitung…' : label}
      </button>
      {errorMessage && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
    </>
  )
}
