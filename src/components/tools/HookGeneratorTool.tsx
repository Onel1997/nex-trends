import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HookErrorState,
  HookGeneratingSkeleton,
  HookResultsList,
} from '@/components/hooks/HookResultsList'
import { HookHistoryPanel, HookSavedPanel } from '@/components/hooks/HookHistoryPanel'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  BoltIcon,
  ClockIcon,
  BookmarkIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useHookGenerationFlow } from '@/hooks/useHookGenerationFlow'
import { useHookHistory } from '@/hooks/useHookHistory'
import { useSavedHooks } from '@/hooks/useSavedHooks'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { cn } from '@/lib'
import { trendToHookInput, type TrendHookStyle } from '@/lib/openai'
import { loadTrendSession } from '@/lib/trend-session-storage'
import {
  HOOK_GENERATION_COST,
  HOOK_PLATFORM_OPTIONS,
  HOOK_TONE_OPTIONS,
  type HookPlatform,
  type HookTone,
} from '@/types/ai-generation'

type TabId = 'results' | 'history' | 'saved'

export function HookGeneratorTool() {
  const { showToast } = useToast()
  const { hasProAccess, isUsageLimitReached, unlimited } = useUsageLimit()
  const {
    hooks,
    generation,
    error,
    isGenerating,
    generate,
    loadFromHistory,
  } = useHookGenerationFlow()
  const { history, isLoading: historyLoading, refresh: refreshHistory } = useHookHistory()
  const {
    savedHooks,
    isLoading: savedLoading,
    saveHook,
    removeSavedHook,
    isSaved,
  } = useSavedHooks()

  const sessionTrends = useMemo(() => loadTrendSession()?.trends ?? [], [])
  const sessionNiche = useMemo(
    () => loadTrendSession()?.searchQuery?.trim() ?? '',
    [],
  )

  const [topic, setTopic] = useState(sessionNiche)
  const [tone, setTone] = useState<HookTone>('aggressive')
  const [platform, setPlatform] = useState<HookPlatform>('TikTok')
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(() =>
    sessionTrends[0]?.id ?? null,
  )
  const [activeTab, setActiveTab] = useState<TabId>('results')
  const [savingHook, setSavingHook] = useState<string | null>(null)

  const selectedTrend = useMemo(
    () => sessionTrends.find((t) => t.id === selectedTrendId) ?? null,
    [sessionTrends, selectedTrendId],
  )

  const canGenerate = Boolean(selectedTrend || topic.trim().length >= 2)
  const savedHookTexts = useMemo(
    () => new Set(savedHooks.map((h) => h.hook_text)),
    [savedHooks],
  )

  useEffect(() => {
    if (!selectedTrendId && sessionTrends[0]) {
      setSelectedTrendId(sessionTrends[0].id)
    }
  }, [sessionTrends, selectedTrendId])

  const buildRequest = useCallback(() => {
    const trimmedTopic = topic.trim()

    if (selectedTrend) {
      const input = trendToHookInput(selectedTrend, tone as TrendHookStyle, trimmedTopic || undefined)
      return {
        topic: input.niche,
        tone,
        platform: (input.platform as HookPlatform) || platform,
        context: [
          input.description,
          input.briefing,
          input.contentIdeas?.join(' | '),
        ]
          .filter(Boolean)
          .join('\n'),
        trendTitle: input.trendTitle,
        referenceHook: input.hookText,
      }
    }

    return {
      topic: trimmedTopic,
      tone,
      platform,
    }
  }, [topic, tone, platform, selectedTrend])

  const handleGenerate = useCallback(
    async (skipCreditCharge = false) => {
      if (!canGenerate) return

      const result = await generate(buildRequest(), { skipCreditCharge })

      if (result) {
        showToast({
          type: 'success',
          title: `${result.hooks.length} Hooks generiert`,
          message: unlimited ? undefined : `${HOOK_GENERATION_COST} Credits verbraucht`,
        })
        setActiveTab('results')
        void refreshHistory()
      }
    },
    [canGenerate, generate, buildRequest, showToast, unlimited, refreshHistory],
  )

  const handleSaveHook = useCallback(
    async (hookText: string) => {
      if (isSaved(hookText)) return

      setSavingHook(hookText)
      try {
        await saveHook({
          hookText,
          generationId: generation?.id,
          topic: generation?.topic ?? topic,
          tone: generation?.tone ?? tone,
          platform: generation?.platform ?? platform,
        })
        showToast({ type: 'success', title: 'Hook gespeichert' })
      } catch {
        showToast({ type: 'error', title: 'Speichern fehlgeschlagen' })
      } finally {
        setSavingHook(null)
      }
    },
    [isSaved, saveHook, generation, topic, tone, platform, showToast],
  )

  async function copyHook(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      showToast({ type: 'success', title: 'Hook kopiert' })
    } catch {
      showToast({ type: 'error', title: 'Kopieren fehlgeschlagen' })
    }
  }

  const tabs: { id: TabId; label: string; icon: typeof SparklesIcon }[] = [
    { id: 'results', label: 'Ergebnisse', icon: SparklesIcon },
    { id: 'history', label: 'Verlauf', icon: ClockIcon },
    { id: 'saved', label: 'Gespeichert', icon: BookmarkIcon },
  ]

  return (
    <AiToolLayout
      title="Hook Generator"
      description="Scroll-stoppende Hooks für Reels, TikToks und Ads — 10 virale Scroll-Stopper pro Generierung, optimiert für die ersten 3 Sekunden."
      creditCost={HOOK_GENERATION_COST}
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
          htmlFor="hook-generator-topic"
          className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
        >
          Thema / Nische
        </label>
        <Textarea
          id="hook-generator-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="z. B. Fitness, Productivity, Side Hustle — oder dein Video-Thema"
          disabled={isGenerating}
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Ton"
            value={tone}
            onChange={(e) => setTone(e.target.value as HookTone)}
            disabled={isGenerating}
            options={HOOK_TONE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            hint={HOOK_TONE_OPTIONS.find((o) => o.value === tone)?.desc}
          />
          <SelectField
            label="Plattform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as HookPlatform)}
            disabled={isGenerating}
            options={HOOK_PLATFORM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>

        <p className="mt-4 mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <BoltIcon className="size-3.5 text-violet-400/80" aria-hidden />
          AI Generierung
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="pro"
            size="lg"
            fullWidth
            loading={isGenerating}
            disabled={isGenerating || !canGenerate}
            onClick={() => void handleGenerate(false)}
            className="sm:flex-1"
          >
            <SparklesIcon className="size-4" aria-hidden />
            {isGenerating
              ? 'Generiert …'
              : `Hooks generieren · ${HOOK_GENERATION_COST} Credits`}
          </Button>
          {hooks.length > 0 && (
            <Button
              variant="secondary"
              size="lg"
              loading={isGenerating}
              disabled={isGenerating || !canGenerate}
              onClick={() => void handleGenerate(true)}
              className="sm:w-auto"
            >
              Neu generieren
            </Button>
          )}
        </div>
      </div>

      <section className="mt-6">
        <div className="mb-4 flex flex-wrap gap-2 border-b border-zinc-800/60 pb-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-smooth',
                activeTab === id
                  ? 'bg-violet-500/15 text-violet-200'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
              {id === 'saved' && savedHooks.length > 0 && (
                <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] tabular-nums">
                  {savedHooks.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'results' && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Ergebnis · 10 Hooks
            </p>

            {isUsageLimitReached && !hasProAccess && !unlimited ? (
              <UsageLimitWarning />
            ) : error ? (
              <HookErrorState
                message={error}
                onRetry={() => void handleGenerate(hooks.length === 0)}
              />
            ) : isGenerating ? (
              <HookGeneratingSkeleton count={10} />
            ) : hooks.length > 0 ? (
              <HookResultsList
                hooks={hooks}
                onCopy={(text) => void copyHook(text)}
                onSave={(text) => void handleSaveHook(text)}
                savedHooks={savedHookTexts}
                isSaving={savingHook}
              />
            ) : (
              <EmptyState
                title="Hooks generieren"
                description="Gib ein Thema ein, wähle Ton und Plattform — 10 virale Scroll-Stopper im Premium-Stil."
                icon={<SparklesIcon className="size-5 text-violet-400/70" aria-hidden />}
                size="compact"
                className="border-zinc-800/50"
              />
            )}
          </>
        )}

        {activeTab === 'history' && (
          <HookHistoryPanel
            history={history}
            isLoading={historyLoading}
            activeId={generation?.id}
            onSelect={(row) => {
              loadFromHistory(row)
              setActiveTab('results')
              showToast({ type: 'success', title: 'Generierung geladen' })
            }}
          />
        )}

        {activeTab === 'saved' && (
          <HookSavedPanel
            hooks={savedHooks}
            isLoading={savedLoading}
            onCopy={(text) => void copyHook(text)}
            onRemove={async (id) => {
              try {
                await removeSavedHook(id)
                showToast({ type: 'success', title: 'Hook entfernt' })
              } catch {
                showToast({ type: 'error', title: 'Entfernen fehlgeschlagen' })
              }
            }}
          />
        )}
      </section>
    </AiToolLayout>
  )
}
