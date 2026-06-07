import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HookErrorState,
  HookGeneratingSkeleton,
  HookGenerationMeta,
  HookGenerationProgress,
  HookResultsList,
} from '@/components/hooks/HookResultsList'
import {
  HookHistoryPanel,
  HookSavedPanel,
  HookTabRefreshButton,
} from '@/components/hooks/HookHistoryPanel'
import {
  HookEmptyStateAction,
  HookResultsEmptyState,
} from '@/components/hooks/HookEmptyStates'
import { HookInsightsBar } from '@/components/hooks/HookInsightsBar'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import {
  ArrowPathIcon,
  BoltIcon,
  ClockIcon,
  BookmarkIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useHookClipboard } from '@/hooks/useHookClipboard'
import { useHookGenerationFlow } from '@/hooks/useHookGenerationFlow'
import { useHookHistory } from '@/hooks/useHookHistory'
import { useHookInsights } from '@/hooks/useHookInsights'
import { useSavedHooks } from '@/hooks/useSavedHooks'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { recordHookGeneration } from '@/lib/hook-analytics'
import { consumeHookRegeneratePrefill } from '@/lib/hook-regenerate-session'
import { cn } from '@/lib'
import { trendToHookInput, type TrendHookStyle } from '@/lib/openai'
import {
  loadHookTrendContext,
  trendTopicFromIntelligence,
} from '@/lib/trend-session-storage'
import {
  HOOK_GENERATION_COST,
  HOOK_PLATFORM_OPTIONS,
  HOOK_TONE_OPTIONS,
  type GeneratedHooksRow,
  type HookPlatform,
  type HookTone,
} from '@/types/ai-generation'

type TabId = 'results' | 'history' | 'saved'

const JUST_SAVED_MS = 900

export function HookGeneratorTool() {
  const { showToast } = useToast()
  const { isUsageLimitReached, unlimited, userPlan } = useUsageLimit()
  const {
    hooks,
    generation,
    status,
    error,
    isGenerating,
    generate,
    loadFromHistory,
  } = useHookGenerationFlow()
  const {
    history,
    isLoading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
  } = useHookHistory()
  const {
    savedHooks,
    isLoading: savedLoading,
    error: savedError,
    toggleSave,
    removeSavedHook,
    refresh: refreshSaved,
    isSaved,
  } = useSavedHooks()

  const { copiedHook, copyHook, recentCopies } = useHookClipboard()
  const { mostSavedTone, savedCount } = useHookInsights(savedHooks)

  const sessionTrends = useMemo(() => loadHookTrendContext(), [])

  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<HookTone>('aggressive')
  const [platform, setPlatform] = useState<HookPlatform>('TikTok')
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('results')
  const [savingHook, setSavingHook] = useState<string | null>(null)
  const [justSavedHook, setJustSavedHook] = useState<string | null>(null)

  const selectedTrend = useMemo(
    () => sessionTrends.find((t) => t.id === selectedTrendId) ?? null,
    [sessionTrends, selectedTrendId],
  )

  const canGenerate = Boolean(selectedTrend || topic.trim().length >= 2)
  const isRegenerating = isGenerating && hooks.length > 0

  const displayTone = generation?.tone ?? tone
  const displayPlatform = generation?.platform ?? platform

  const generationIndex = useMemo(() => {
    if (!generation?.id) return undefined
    const idx = history.findIndex((h) => h.id === generation.id)
    return idx >= 0 ? history.length - idx : undefined
  }, [generation?.id, history])

  useEffect(() => {
    const prefill = consumeHookRegeneratePrefill()
    if (!prefill) return

    setTopic(prefill.topic)
    setTone(prefill.tone)
    setPlatform(prefill.platform)
    setSelectedTrendId(null)
    setActiveTab('results')

    if (prefill.autoGenerate) {
      void generate(
        {
          topic: prefill.topic,
          tone: prefill.tone,
          platform: prefill.platform,
        },
      ).then((result) => {
        if (result) {
          showToast({
            type: 'success',
            title: 'Hooks neu generiert',
            message: `${result.hooks.length} Varianten erstellt`,
          })
          void refreshHistory()
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for session prefill
  }, [])

  const handleTrendSelect = useCallback(
    (trendId: string) => {
      setSelectedTrendId((current) => {
        const next = current === trendId ? null : trendId
        if (next) {
          const trend = sessionTrends.find((t) => t.id === next)
          if (trend) setTopic(trendTopicFromIntelligence(trend))
        }
        return next
      })
    },
    [sessionTrends],
  )

  const buildRequest = useCallback(
    (overrides?: Partial<{ topic: string; tone: HookTone; platform: HookPlatform }>) => {
      const resolvedTone = overrides?.tone ?? tone
      const resolvedPlatform = overrides?.platform ?? platform
      const trimmedTopic = (overrides?.topic ?? topic).trim()

      if (selectedTrend && !overrides?.topic) {
        const input = trendToHookInput(
          selectedTrend,
          resolvedTone as TrendHookStyle,
          trimmedTopic || undefined,
        )
        const topicForRequest =
          trimmedTopic.length >= 2 ? trimmedTopic : input.niche

        return {
          topic: topicForRequest,
          tone: resolvedTone,
          platform: (input.platform as HookPlatform) || resolvedPlatform,
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
        tone: resolvedTone,
        platform: resolvedPlatform,
      }
    },
    [topic, tone, platform, selectedTrend],
  )

  const handleGenerate = useCallback(
    async (skipCreditCharge = false, overrides?: Partial<{ topic: string; tone: HookTone; platform: HookPlatform }>) => {
      if (!canGenerate && !overrides?.topic) return
      if (isGenerating) return

      const request = buildRequest(overrides)
      const result = await generate(request, { skipCreditCharge })

      if (result) {
        recordHookGeneration(request.topic, skipCreditCharge)
        showToast({
          type: 'success',
          title: skipCreditCharge ? 'Hooks neu generiert' : `${result.hooks.length} Hooks generiert`,
          message: skipCreditCharge || unlimited ? undefined : `${HOOK_GENERATION_COST} Credits verbraucht`,
        })
        setActiveTab('results')
        void refreshHistory()
        void refreshSaved()
      }
    },
    [canGenerate, isGenerating, generate, buildRequest, showToast, unlimited, refreshHistory, refreshSaved],
  )

  const handleRegenerateFromHistory = useCallback(
    (row: GeneratedHooksRow) => {
      setSelectedTrendId(null)
      setTopic(row.topic)
      setTone(row.tone as HookTone)
      setPlatform(row.platform as HookPlatform)
      void handleGenerate(false, {
        topic: row.topic,
        tone: row.tone as HookTone,
        platform: row.platform as HookPlatform,
      })
    },
    [handleGenerate],
  )

  const handleToggleSave = useCallback(
    async (hookText: string) => {
      setSavingHook(hookText)
      try {
        const action = await toggleSave({
          hookText,
          generationId: generation?.id,
          topic: generation?.topic ?? topic,
          tone: displayTone,
          platform: displayPlatform,
        })
        if (action === 'saved') {
          setJustSavedHook(hookText)
          window.setTimeout(() => setJustSavedHook(null), JUST_SAVED_MS)
        }
        showToast({
          type: 'success',
          title: action === 'saved' ? 'Hook gespeichert' : 'Aus Favoriten entfernt',
        })
        void refreshSaved()
      } catch {
        showToast({ type: 'error', title: 'Speichern fehlgeschlagen' })
      } finally {
        setSavingHook(null)
      }
    },
    [toggleSave, generation, topic, displayTone, displayPlatform, showToast, refreshSaved],
  )

  const tabs: { id: TabId; label: string; icon: typeof SparklesIcon; count?: number }[] = [
    { id: 'results', label: 'Ergebnisse', icon: SparklesIcon },
    { id: 'history', label: 'Verlauf', icon: ClockIcon, count: history.length || undefined },
    { id: 'saved', label: 'Gespeichert', icon: BookmarkIcon, count: savedHooks.length || undefined },
  ]

  const generateButtons = (
    <>
      <Button
        variant="pro"
        size="lg"
        fullWidth
        loading={isGenerating}
        disabled={isGenerating || !canGenerate}
        onClick={() => void handleGenerate(false)}
        className="min-h-12 sm:flex-1"
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
          fullWidth
          loading={isGenerating}
          disabled={isGenerating || !canGenerate}
          onClick={() => void handleGenerate(false)}
          className="min-h-12 sm:w-auto sm:min-w-[10rem]"
        >
          <ArrowPathIcon className="size-4" aria-hidden />
          Neu generieren
        </Button>
      )}
    </>
  )

  return (
    <AiToolLayout
      title="Hook Generator"
      description="Scroll-stoppende Hooks für Reels, TikToks und Ads — 10 virale Scroll-Stopper pro Generierung, optimiert für die ersten 3 Sekunden."
      creditCost={HOOK_GENERATION_COST}
      className="nex-tool-surface"
    >
      {sessionTrends.length > 0 && (
        <section className="hook-trend-context mb-5 overflow-x-clip">
          <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            <TrendingUpIcon className="size-3.5 text-violet-400/80" aria-hidden />
            Trend-Kontext
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
            {sessionTrends.slice(0, 12).map((trend) => (
              <button
                key={trend.id}
                type="button"
                onClick={() => handleTrendSelect(trend.id)}
                className={cn(
                  'shrink-0 max-w-[200px] min-h-11 rounded-xl border px-3 py-2 text-left transition-smooth touch-manipulation',
                  selectedTrendId === trend.id
                    ? 'border-violet-500/40 bg-violet-500/10 text-violet-100'
                    : 'border-zinc-800/80 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700',
                )}
              >
                <span className="block truncate text-xs font-semibold">{trend.title}</span>
                {trend.niche && (
                  <span className="block truncate text-[10px] text-zinc-500">{trend.niche}</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="hook-generator-form glass-card overflow-x-clip p-4 sm:p-7">
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
          placeholder="z. B. Fitness, Skincare, AI Side Hustle, Morning Routine — dein Video-Thema"
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

        <div className="mt-5 flex flex-col gap-2 sm:mt-4">
          <p className="mb-0.5 hidden items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600 sm:flex">
            <BoltIcon className="size-3.5 text-violet-400/80" aria-hidden />
            AI Generierung
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">{generateButtons}</div>
        </div>
      </div>

      <section
        className="hook-results-section mt-6 max-md:overflow-x-hidden max-md:pb-0 sm:pb-4"
        aria-busy={isGenerating}
      >
        <div className="hook-results-tabs sticky top-0 z-10 -mx-1 mb-5 flex flex-wrap items-center gap-2 border-b border-zinc-800/60 bg-zinc-950/92 px-1 pb-3.5 backdrop-blur-lg">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              type="button"
              disabled={isGenerating && id !== activeTab}
              onClick={() => setActiveTab(id)}
              className={cn(
                'hook-tab inline-flex items-center gap-1.5',
                activeTab === id && 'hook-tab--active',
                activeTab !== id && 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300',
                isGenerating && id !== activeTab && 'opacity-40',
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
              {count != null && count > 0 && (
                <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-400">
                  {count}
                </span>
              )}
            </button>
          ))}

          {activeTab === 'history' && (
            <HookTabRefreshButton
              onRefresh={() => void refreshHistory()}
              loading={historyLoading}
              className="ml-auto"
            />
          )}
          {activeTab === 'saved' && (
            <HookTabRefreshButton
              onRefresh={() => void refreshSaved()}
              loading={savedLoading}
              className="ml-auto"
            />
          )}
        </div>

        {activeTab === 'results' && (
          <div key="results" className="hook-results-panel animate-fade-in">
            {isUsageLimitReached && userPlan === 'free' && !unlimited ? (
              <UsageLimitWarning />
            ) : error ? (
              <HookErrorState
                message={error}
                onRetry={() => void handleGenerate(false)}
              />
            ) : (
              <>
                <HookInsightsBar
                  recentCopies={recentCopies}
                  mostSavedTone={mostSavedTone}
                  savedCount={savedCount}
                />

                {isGenerating && (
                  <HookGenerationProgress
                    isRegenerating={isRegenerating}
                    step={status === 'checking' ? 'checking' : 'generating'}
                  />
                )}

                {generation && hooks.length > 0 && !isGenerating && (
                  <HookGenerationMeta
                    topic={generation.topic}
                    tone={generation.tone}
                    platform={generation.platform}
                    createdAt={generation.created_at}
                    hookCount={hooks.length}
                    generationIndex={generationIndex}
                  />
                )}

                {isGenerating && !isRegenerating ? (
                  <HookGeneratingSkeleton count={10} />
                ) : hooks.length > 0 ? (
                  <div className="hook-results-panel__list relative">
                    <HookResultsList
                      hooks={hooks}
                      tone={displayTone}
                      platform={displayPlatform}
                      onCopy={copyHook}
                      onToggleSave={handleToggleSave}
                      isHookSaved={isSaved}
                      isSaving={savingHook}
                      justSavedHook={justSavedHook}
                      copiedHook={copiedHook}
                      dimmed={isRegenerating}
                    />
                    {isRegenerating && (
                      <div className="mt-4">
                        <HookGeneratingSkeleton count={3} />
                      </div>
                    )}
                  </div>
                ) : !isGenerating ? (
                  <HookResultsEmptyState
                    action={
                      <HookEmptyStateAction
                        label="Jetzt generieren"
                        onClick={() => void handleGenerate(false)}
                        disabled={isGenerating || !canGenerate}
                      />
                    }
                  />
                ) : null}
              </>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div key="history" className="hook-history-panel animate-fade-in">
          <HookHistoryPanel
            history={history}
            isLoading={historyLoading}
            error={historyError}
            activeId={generation?.id}
            onRefresh={() => void refreshHistory()}
            onSelect={(row) => {
              loadFromHistory(row)
              setSelectedTrendId(null)
              setTopic(row.topic)
              setTone(row.tone as HookTone)
              setPlatform(row.platform as HookPlatform)
              setActiveTab('results')
              showToast({ type: 'success', title: 'Generierung geladen' })
            }}
            onRegenerate={handleRegenerateFromHistory}
          />
          </div>
        )}

        {activeTab === 'saved' && (
          <div key="saved" className="hook-saved-panel animate-fade-in">
          <HookSavedPanel
            hooks={savedHooks}
            isLoading={savedLoading}
            error={savedError}
            copiedHook={copiedHook}
            onRefresh={() => void refreshSaved()}
            onCopy={copyHook}
            onRemove={async (id) => {
              try {
                await removeSavedHook(id)
                showToast({ type: 'success', title: 'Hook entfernt' })
              } catch {
                showToast({ type: 'error', title: 'Entfernen fehlgeschlagen' })
              }
            }}
          />
          </div>
        )}
      </section>
    </AiToolLayout>
  )
}
