import { useCallback, useMemo, useState } from 'react'
import {
  SeoTitleErrorState,
  SeoTitleGeneratingSkeleton,
  SeoTitleGenerationMeta,
  SeoTitleGenerationProgress,
  SeoTitleResultsList,
} from '@/components/seo-title/SeoTitleResultsList'
import {
  SeoTitleHistoryPanel,
  SeoTitleSavedPanel,
  SeoTitleTabRefreshButton,
} from '@/components/seo-title/SeoTitleHistoryPanel'
import { SeoTitleCopyToast } from '@/components/seo-title/SeoTitleCopyToast'
import {
  SeoTitleEmptyStateAction,
  SeoTitleResultsEmptyState,
} from '@/components/seo-title/SeoTitleEmptyStates'
import { SeoTitleInsightsBar } from '@/components/seo-title/SeoTitleInsightsBar'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import {
  ArrowPathIcon,
  BoltIcon,
  BookmarkIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useSeoTitleClipboard } from '@/hooks/useSeoTitleClipboard'
import { useSeoTitleGenerationFlow } from '@/hooks/useSeoTitleGenerationFlow'
import { useSeoTitleHistory } from '@/hooks/useSeoTitleHistory'
import { useSeoTitleInsights } from '@/hooks/useSeoTitleInsights'
import { useSavedSeoTitles } from '@/hooks/useSavedSeoTitles'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { recordSeoTitleGeneration } from '@/lib/seo-title-analytics'
import { cn } from '@/lib'
import {
  SEO_SEARCH_INTENT_OPTIONS,
  SEO_TITLE_GENERATION_COST,
  SEO_TITLE_PLATFORM_OPTIONS,
  type SeoSearchIntent,
  type SeoTitleGenerationBatch,
  type SeoTitlePlatform,
  type SeoTitleVariantWithId,
} from '@/types/seo-title-generation'

type TabId = 'results' | 'history' | 'saved'

const JUST_SAVED_MS = 900

export function SeoTitleGeneratorTool() {
  const { showToast } = useToast()
  const { hasProAccess, isUsageLimitReached, unlimited } = useUsageLimit()
  const {
    variants,
    generation,
    status,
    error,
    isGenerating,
    generate,
    loadFromHistory,
    updateVariantSaved,
  } = useSeoTitleGenerationFlow()
  const {
    history,
    isLoading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
  } = useSeoTitleHistory()
  const {
    savedTitles,
    isLoading: savedLoading,
    error: savedError,
    toggleSave,
    removeSavedTitle,
    refresh: refreshSaved,
  } = useSavedSeoTitles()

  const { copiedKey, copyVariant, recentCopies, copyToastVisible } = useSeoTitleClipboard()
  const { mostSavedIntent, savedCount } = useSeoTitleInsights(savedTitles)

  const [briefing, setBriefing] = useState('')
  const [keyword, setKeyword] = useState('')
  const [platform, setPlatform] = useState<SeoTitlePlatform>('Google Search')
  const [searchIntent, setSearchIntent] = useState<SeoSearchIntent>('informational')
  const [activeTab, setActiveTab] = useState<TabId>('results')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [justSavedId, setJustSavedId] = useState<string | null>(null)

  const canGenerate = briefing.trim().length >= 2
  const isRegenerating = isGenerating && variants.length > 0

  const savedVariantIds = useMemo(
    () => new Set(savedTitles.map((t) => t.id)),
    [savedTitles],
  )

  const displayPlatform = generation?.platform ?? platform
  const displayKeyword = generation?.keyword ?? keyword

  const generationIndex = useMemo(() => {
    if (!generation?.id) return undefined
    const idx = history.findIndex((h) => h.id === generation.id)
    return idx >= 0 ? history.length - idx : undefined
  }, [generation?.id, history])

  const handleGenerate = useCallback(
    async (
      skipCreditCharge = false,
      overrides?: Partial<{
        briefing: string
        keyword: string
        platform: SeoTitlePlatform
        searchIntent: SeoSearchIntent
      }>,
    ) => {
      if (!canGenerate && !overrides?.briefing) return
      if (isGenerating) return

      const request = {
        briefing: (overrides?.briefing ?? briefing).trim(),
        keyword: (overrides?.keyword ?? keyword).trim() || undefined,
        platform: overrides?.platform ?? platform,
        searchIntent: overrides?.searchIntent ?? searchIntent,
      }

      const result = await generate(request, { skipCreditCharge })

      if (result) {
        recordSeoTitleGeneration(request.briefing, skipCreditCharge)
        showToast({
          type: 'success',
          title: skipCreditCharge
            ? 'SEO-Titel neu generiert'
            : `${result.variants.length} SEO-Titel generiert`,
          message:
            skipCreditCharge || unlimited ? undefined : `${SEO_TITLE_GENERATION_COST} Credits verbraucht`,
        })
        setActiveTab('results')
        void refreshHistory()
      }
    },
    [
      canGenerate,
      isGenerating,
      generate,
      briefing,
      keyword,
      platform,
      searchIntent,
      showToast,
      unlimited,
      refreshHistory,
    ],
  )

  const handleRegenerateFromHistory = useCallback(
    (batch: SeoTitleGenerationBatch) => {
      setBriefing(batch.briefing)
      setKeyword(batch.keyword)
      setPlatform(batch.platform as SeoTitlePlatform)
      setSearchIntent((batch.search_intent as SeoSearchIntent) || 'informational')
      void handleGenerate(true, {
        briefing: batch.briefing,
        keyword: batch.keyword,
        platform: batch.platform as SeoTitlePlatform,
        searchIntent: (batch.search_intent as SeoSearchIntent) || 'informational',
      })
    },
    [handleGenerate],
  )

  const handleToggleSave = useCallback(
    async (variant: SeoTitleVariantWithId) => {
      setSavingId(variant.id)
      try {
        const action = await toggleSave(variant)
        updateVariantSaved(variant.id, action === 'saved')
        if (action === 'saved') {
          setJustSavedId(variant.id)
          window.setTimeout(() => setJustSavedId(null), JUST_SAVED_MS)
        }
        showToast({
          type: 'success',
          title: action === 'saved' ? 'Titel gespeichert' : 'Aus Favoriten entfernt',
        })
        void refreshSaved()
      } catch {
        showToast({ type: 'error', title: 'Speichern fehlgeschlagen' })
      } finally {
        setSavingId(null)
      }
    },
    [toggleSave, updateVariantSaved, showToast, refreshSaved],
  )

  const tabs: { id: TabId; label: string; icon: typeof MagnifyingGlassIcon; count?: number }[] = [
    { id: 'results', label: 'Ergebnisse', icon: MagnifyingGlassIcon },
    { id: 'history', label: 'Verlauf', icon: ClockIcon, count: history.length || undefined },
    { id: 'saved', label: 'Gespeichert', icon: BookmarkIcon, count: savedTitles.length || undefined },
  ]

  const generateButtons = (
    <>
      <Button
        variant="pro"
        size="lg"
        fullWidth
        loading={isGenerating && !isRegenerating}
        disabled={isGenerating || !canGenerate}
        onClick={() => void handleGenerate(false)}
        className="min-h-12 sm:flex-1"
      >
        <MagnifyingGlassIcon className="size-4" aria-hidden />
        {isGenerating && !isRegenerating
          ? 'Generiert …'
          : `SEO-Titel generieren · ${SEO_TITLE_GENERATION_COST} Credits`}
      </Button>
      {variants.length > 0 && (
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          loading={isRegenerating}
          disabled={isGenerating || !canGenerate}
          onClick={() => void handleGenerate(true)}
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
      title="SEO Title Generator"
      description="CTR-optimierte Titel für Blogposts, Landing Pages und SERP — mit SEO-Score, Lesbarkeit und Suchintention."
      creditCost={SEO_TITLE_GENERATION_COST}
      className="nex-tool-surface"
    >
      <div className="glass-card overflow-x-hidden p-4 sm:p-7">
        <label
          htmlFor="seo-title-briefing"
          className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
        >
          Keyword / Thema
        </label>
        <Textarea
          id="seo-title-briefing"
          value={briefing}
          onChange={(e) => setBriefing(e.target.value)}
          rows={3}
          placeholder="z. B. nachhaltige Mode, capsule wardrobe, Zielgruppe Gen Z"
          disabled={isGenerating}
        />

        <div className="mt-4">
          <label
            htmlFor="seo-title-keyword"
            className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
          >
            Fokus-Keyword (optional)
          </label>
          <Input
            id="seo-title-keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="z. B. capsule wardrobe"
            disabled={isGenerating}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Plattform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as SeoTitlePlatform)}
            disabled={isGenerating}
            options={SEO_TITLE_PLATFORM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <SelectField
            label="Suchintention"
            value={searchIntent}
            onChange={(e) => setSearchIntent(e.target.value as SeoSearchIntent)}
            disabled={isGenerating}
            options={SEO_SEARCH_INTENT_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            hint={SEO_SEARCH_INTENT_OPTIONS.find((o) => o.value === searchIntent)?.desc}
          />
        </div>

        <p className="mt-4 mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <BoltIcon className="size-3.5 text-cyan-400/80" aria-hidden />
          AI Generierung
        </p>

        <div className="hidden flex-col gap-2 sm:flex sm:flex-row sm:items-stretch">
          {generateButtons}
        </div>
      </div>

      <div
        className={cn(
          'hook-mobile-sticky-actions fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800/80 bg-zinc-950/95 p-3 backdrop-blur-xl sm:hidden',
          'pb-[max(0.875rem,env(safe-area-inset-bottom,0px))]',
        )}
      >
        <div className="flex flex-col gap-2">{generateButtons}</div>
      </div>

      <SeoTitleCopyToast visible={copyToastVisible} />

      <section
        className="seo-title-results-section mt-6 overflow-x-hidden pb-[max(7.5rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))] sm:pb-2"
        aria-busy={isGenerating}
      >
        <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap items-center gap-2 border-b border-zinc-800/60 bg-zinc-950/92 px-1 pb-3 backdrop-blur-lg">
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
            <SeoTitleTabRefreshButton
              onRefresh={() => void refreshHistory()}
              loading={historyLoading}
              className="ml-auto"
            />
          )}
          {activeTab === 'saved' && (
            <SeoTitleTabRefreshButton
              onRefresh={() => void refreshSaved()}
              loading={savedLoading}
              className="ml-auto"
            />
          )}
        </div>

        {activeTab === 'results' && (
          <div key="results" className="animate-fade-in">
            {isUsageLimitReached && !hasProAccess && !unlimited ? (
              <UsageLimitWarning />
            ) : error ? (
              <SeoTitleErrorState
                message={error}
                onRetry={() => void handleGenerate(variants.length > 0)}
              />
            ) : (
              <>
                <SeoTitleInsightsBar
                  recentCopies={recentCopies}
                  mostSavedIntent={mostSavedIntent}
                  savedCount={savedCount}
                />

                {isGenerating && (
                  <SeoTitleGenerationProgress
                    isRegenerating={isRegenerating}
                    step={status === 'checking' ? 'checking' : 'generating'}
                    active={isGenerating}
                  />
                )}

                {generation && variants.length > 0 && !isGenerating && (
                  <SeoTitleGenerationMeta
                    briefing={generation.briefing}
                    keyword={displayKeyword}
                    platform={generation.platform}
                    createdAt={generation.created_at}
                    variantCount={variants.length}
                    generationIndex={generationIndex}
                  />
                )}

                {isGenerating && !isRegenerating ? (
                  <SeoTitleGeneratingSkeleton count={5} />
                ) : variants.length > 0 ? (
                  <>
                    <SeoTitleResultsList
                      variants={variants}
                      platform={displayPlatform}
                      onCopy={copyVariant}
                      onToggleSave={handleToggleSave}
                      savedIds={savedVariantIds}
                      savingId={savingId}
                      justSavedId={justSavedId}
                      copiedKey={copiedKey}
                      dimmed={isRegenerating}
                    />
                    {isRegenerating && (
                      <div className="mt-4">
                        <SeoTitleGeneratingSkeleton count={3} />
                      </div>
                    )}
                  </>
                ) : !isGenerating ? (
                  <SeoTitleResultsEmptyState
                    hint="Thema oben eingeben und auf Generieren tippen."
                    action={
                      <SeoTitleEmptyStateAction
                        label="Jetzt generieren"
                        onClick={() => void handleGenerate(false)}
                      />
                    }
                  />
                ) : null}
              </>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div key="history" className="animate-fade-in">
            <SeoTitleHistoryPanel
              history={history}
              isLoading={historyLoading}
              error={historyError}
              activeId={generation?.id}
              onRefresh={() => void refreshHistory()}
              emptyAction={
                <SeoTitleEmptyStateAction
                  label="Erste Titel generieren"
                  onClick={() => {
                    setActiveTab('results')
                    void handleGenerate(false)
                  }}
                />
              }
              emptyHint="Generierungen erscheinen hier nach jeder AI-Anfrage."
              onSelect={(row) => {
                loadFromHistory(row)
                setBriefing(row.briefing)
                setKeyword(row.keyword)
                setPlatform(row.platform as SeoTitlePlatform)
                setSearchIntent((row.search_intent as SeoSearchIntent) || 'informational')
                setActiveTab('results')
                showToast({ type: 'success', title: 'Generierung geladen' })
              }}
              onRegenerate={handleRegenerateFromHistory}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <div key="saved" className="animate-fade-in">
            <SeoTitleSavedPanel
              titles={savedTitles}
              isLoading={savedLoading}
              error={savedError}
              copiedKey={copiedKey}
              onRefresh={() => void refreshSaved()}
              emptyAction={
                <SeoTitleEmptyStateAction
                  label="Zu den Ergebnissen"
                  onClick={() => setActiveTab('results')}
                />
              }
              emptyHint="Speichere Titel mit dem Lesezeichen im Ergebnis-Tab."
              onCopy={copyVariant}
              onRemove={async (id) => {
                try {
                  await removeSavedTitle(id)
                  updateVariantSaved(id, false)
                  showToast({ type: 'success', title: 'Titel entfernt' })
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
