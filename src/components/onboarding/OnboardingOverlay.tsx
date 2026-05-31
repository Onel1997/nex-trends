import { memo, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { BoltIcon, CreditIcon, SparklesIcon } from '@/components/ui/icons'
import { useOnboarding, type OnboardingStep } from '@/hooks/useOnboarding'
import type { DashboardToolId } from '@/lib'
import { cn } from '@/lib'

type OnboardingOverlayProps = {
  onNavigate: (tool: DashboardToolId) => void
}

const STEPS: {
  id: OnboardingStep
  title: string
  description: string
  icon: ReactNode
}[] = [
  {
    id: 'welcome',
    title: 'Willkommen bei NexTrends',
    description:
      'Dein AI Creator OS für virale Trends, Hooks, Ad Copy und SEO — alles an einem Ort, optimiert für Mobile.',
    icon: <SparklesIcon className="size-5 text-violet-300" aria-hidden />,
  },
  {
    id: 'credits',
    title: 'Credits verstehen',
    description:
      'Jede KI-Generierung verbraucht Credits. Free-Plan: monatliches Kontingent. Pro: unbegrenzt. Credits erneuern sich automatisch.',
    icon: <CreditIcon className="size-5 text-violet-300" aria-hidden />,
  },
  {
    id: 'tools',
    title: 'Deine Werkzeuge',
    description:
      'Trend Intelligence, Hook Generator, Ad Copy, SEO Titles, Landing Analyzer und AI Video Studio — starte mit dem Hook Generator.',
    icon: <BoltIcon className="size-5 text-violet-300" aria-hidden />,
  },
  {
    id: 'cta',
    title: 'Erste Generierung starten',
    description:
      'Erstelle deinen ersten scroll-stoppenden Hook in unter 30 Sekunden. Gespeicherte Ergebnisse findest du in deiner Library.',
    icon: <SparklesIcon className="size-5 text-fuchsia-300" aria-hidden />,
  },
]

function OnboardingOverlayInner({ onNavigate }: OnboardingOverlayProps) {
  const { state, isComplete, currentStepIndex, advance, skip } = useOnboarding()

  if (isComplete) return null

  const step = STEPS.find((s) => s.id === state.step) ?? STEPS[0]
  const isLast = state.step === 'cta'

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm animate-fade-in"
        aria-hidden
        onClick={skip}
      />

      <div className="nex-onboarding-card relative w-full max-w-md animate-toast-in rounded-3xl border border-violet-500/25 bg-zinc-950/90 p-6 shadow-[0_0_80px_-20px_rgba(139,92,246,0.65)] backdrop-blur-2xl sm:p-7">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
          aria-hidden
        />

        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i <= currentStepIndex ? 'w-6 bg-violet-500' : 'w-3 bg-zinc-700',
                )}
                aria-hidden
              />
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            className="text-xs text-zinc-500 transition-smooth hover:text-zinc-300"
          >
            Überspringen
          </button>
        </div>

        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 shadow-[0_0_32px_-10px_rgba(139,92,246,0.5)]">
          {step.icon}
        </div>

        <h2 id="onboarding-title" className="text-lg font-semibold tracking-tight text-white">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.description}</p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {isLast ? (
            <Button
              variant="pro"
              fullWidth
              className="btn-glow-pro btn-press"
              onClick={() => {
                advance()
                onNavigate('hook')
              }}
            >
              <SparklesIcon className="size-4" />
              Ersten Hook generieren
            </Button>
          ) : (
            <Button variant="primary" fullWidth className="btn-press" onClick={advance}>
              Weiter
            </Button>
          )}
          {!isLast && (
            <Button variant="ghost" fullWidth onClick={skip}>
              Später
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export const OnboardingOverlay = memo(OnboardingOverlayInner)
