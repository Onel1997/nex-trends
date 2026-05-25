import { useCallback, useEffect, useMemo, useState } from 'react'
import { HookErrorState, HookResultsList } from '@/components/hooks/HookResultsList'
import { HookStylePicker } from '@/components/hooks/HookStylePicker'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BoltIcon, SparklesIcon, TrendingUpIcon } from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { cn } from '@/lib'
import {
  generateTrendHooks,
  trendToHookInput,
  type GenerateHooksInput,
  type TrendHookStyle,
} from '@/lib/openai'
import { loadTrendSession } from '@/lib/trend-session-storage'
import { fetchTrendsByNiche } from '@/lib/trends-api'
import { getDemoUserSeed } from '@/lib/demo-trend-seed'

export function HookGeneratorTool() {
  const { showToast } = useToast()
  const {
    hasProAccess,
    isUsageLimitReached,
    requireCredits,
    consumeCreditAfterSuccess,
  } = useUsageLimit()

  const sessionTrends = useMemo(() => loadTrendSession()?.trends ?? [], [])
  const sessionNiche = useMemo(
    () => loadTrendSession()?.searchQuery?.trim() ?? '',
    [],
  )

  const [style, setStyle] = useState<TrendHookStyle>('aggressive')
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(() =>
    sessionTrends[0]?.id ?? null,
  )
  const [briefing, setBriefing] = useState(sessionNiche)
  const [hooks, setHooks] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedTrend = useMemo(
    () => sessionTrends.find((t) => t.id === selectedTrendId) ?? null,
    [sessionTrends, selectedTrendId],
  )

  const canGenerate = Boolean(
    selectedTrend || briefing.trim().length >= 2,
  )

  useEffect(() => {
    if (!selectedTrendId && sessionTrends[0]) {
      setSelectedTrendId(sessionTrends[0].id)
    }
  }, [sessionTrends, selectedTrendId])

  const buildInput = useCallback(async (): Promise<GenerateHooksInput | null> => {
      const trimmedBriefing = briefing.trim()

      if (selectedTrend) {
        return trendToHookInput(selectedTrend, style, trimmedBriefing || undefined)
      }

      if (trimmedBriefing.length < 2) return null

      const nicheTrends = await fetchTrendsByNiche(trimmedBriefing, {
        userSeed: getDemoUserSeed(),
        limit: 1,
        delayMs: 0,
      })
      const trend = nicheTrends[0]
      if (trend) {
        return trendToHookInput(
          { ...trend, niche: trend.niche ?? trimmedBriefing },
          style,
          trimmedBriefing,
        )
      }

      return {
        style,
        niche: trimmedBriefing,
        briefing: trimmedBriefing,
      }
    },
    [briefing, selectedTrend, style],
  )

  const runGenerate = useCallback(
    async (options: { consumeCredit: boolean }) => {
      if (!canGenerate) return

      setError(null)
      setIsGenerating(true)

      try {
        if (options.consumeCredit && !requireCredits()) return

        const input = await buildInput()
        if (!input) {
          setError('Bitte wähle einen Trend oder gib eine Nische ein (mind. 2 Zeichen).')
          return
        }

        const generated = await generateTrendHooks(input)
        setHooks(generated)

        if (options.consumeCredit) {
          await consumeCreditAfterSuccess({
            tool: 'Hook Generator',
            label: `Hooks: ${(selectedTrend?.title ?? briefing).slice(0, 40)}`,
            niche: selectedTrend?.niche ?? briefing,
            platform: selectedTrend?.platform ?? '',
            prompt: selectedTrend?.title ?? briefing,
          })
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Generierung fehlgeschlagen. Bitte versuche es erneut.',
        )
      } finally {
        setIsGenerating(false)
      }
    },
    [
      briefing,
      buildInput,
      canGenerate,
      consumeCreditAfterSuccess,
      requireCredits,
      hasProAccess,
      selectedTrend,
    ],
  )

  async function handleGenerate() {
    await runGenerate({ consumeCredit: true })
  }

  async function handleRegenerate() {
    await runGenerate({ consumeCredit: false })
  }

  function handleRetry() {
    void runGenerate({ consumeCredit: hooks.length === 0 })
  }

  async function copyHook(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      showToast({ type: 'success', title: 'Hook kopiert' })
    } catch {
      showToast({ type: 'error', title: 'Kopieren fehlgeschlagen' })
    }
  }

  return (
    <AiToolLayout
      title="Hook Generator"
      description="Scroll-stoppende Hooks für Reels, TikToks und Shorts — optimiert für die ersten 3 Sekunden. Nutzt deine aktuellen Trend-Daten als Kontext."
    >
      {sessionTrends.length > 0 && (
        <section className="mb-5">
          <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            <TrendingUpIcon className="size-3.5 text-violet-400/80" aria-hidden />
            Trend-Kontext
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
            {sessionTrends.slice(0, 12).map((trend) => (
              <button
                key={trend.id}
                type="button"
                onClick={() =>
                  setSelectedTrendId((id) => (id === trend.id ? null : trend.id))
                }
                className={cn(
                  'shrink-0 max-w-[200px] rounded-xl border px-3 py-2 text-left transition-smooth',
                  selectedTrendId === trend.id
                    ? 'border-violet-500/40 bg-violet-500/10 text-violet-100'
                    : 'border-zinc-800/80 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700',
                )}
              >
                <span className="block truncate text-xs font-semibold">{trend.title}</span>
                {trend.niche && (
                  <span className="block truncate text-[10px] text-zinc-500">
                    {trend.niche}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Aus deiner letzten Trend Intelligence Session — optional, ergänzt das Briefing.
          </p>
        </section>
      )}

      <div className="glass-card p-5 sm:p-7">
        <label
          htmlFor="hook-generator-briefing"
          className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
        >
          Nische / Thema
        </label>
        <Textarea
          id="hook-generator-briefing"
          value={briefing}
          onChange={(e) => setBriefing(e.target.value)}
          rows={3}
          placeholder="z. B. Fitness, Productivity, Side Hustle — oder dein Video-Thema"
          disabled={isGenerating}
        />

        <p className="mt-4 mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <BoltIcon className="size-3.5 text-violet-400/80" aria-hidden />
          Hook-Stil
        </p>
        <HookStylePicker
          value={style}
          onChange={setStyle}
          disabled={isGenerating}
        />

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="pro"
            size="lg"
            fullWidth
            loading={isGenerating}
            disabled={isGenerating || !canGenerate}
            onClick={() => void handleGenerate()}
            className="sm:flex-1"
          >
            <SparklesIcon className="size-4" aria-hidden />
            {isGenerating ? 'Generiert …' : 'Hooks generieren · 1 Credit'}
          </Button>
          {hooks.length > 0 && (
            <Button
              variant="secondary"
              size="lg"
              loading={isGenerating}
              disabled={isGenerating || !canGenerate}
              onClick={() => void handleRegenerate()}
              className="sm:w-auto"
            >
              Neu generieren
            </Button>
          )}
        </div>
      </div>

      <section className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Ergebnis · 4 Hooks
        </p>

        {isUsageLimitReached && !hasProAccess ? (
          <UsageLimitWarning />
        ) : error ? (
          <HookErrorState message={error} onRetry={handleRetry} />
        ) : isGenerating ? (
          <div className="glass-card space-y-3 p-5">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : hooks.length > 0 ? (
          <HookResultsList hooks={hooks} onCopy={(text) => void copyHook(text)} />
        ) : (
          <EmptyState
            title="Hooks generieren"
            description="Wähle einen Trend aus deiner Session oder gib eine Nische ein — 4 virale Scroll-Stopper im gewählten Stil."
            icon={<SparklesIcon className="size-5 text-violet-400/70" aria-hidden />}
            size="compact"
            className={cn('border-zinc-800/50')}
          />
        )}
      </section>
    </AiToolLayout>
  )
}
