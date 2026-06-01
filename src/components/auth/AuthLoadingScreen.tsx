'use client'

import { motion } from 'framer-motion'
import { SpinnerInline } from '@/components/ui/Spinner'
import { cn } from '@/lib'

type AuthLoadingScreenProps = {
  title?: string
  subtitle?: string
  className?: string
}

export function AuthLoadingScreen({
  title = 'Anmeldung wird vorbereitet …',
  subtitle = 'Einen Moment — du wirst gleich weitergeleitet.',
  className,
}: AuthLoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex min-h-svh w-full items-center justify-center bg-zinc-950 px-4',
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-8 py-10 text-center shadow-2xl shadow-violet-950/20 backdrop-blur-sm"
      >
        <div className="relative mb-6 flex size-16 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl"
            aria-hidden
          />
          <SpinnerInline size="lg" />
        </div>
        <p className="text-base font-semibold tracking-tight text-white">{title}</p>
        <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
        <div className="mt-8 flex w-full gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1 flex-1 rounded-full bg-zinc-800"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
