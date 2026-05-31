import { useCallback, useMemo, useState } from 'react'
import {
  AdCopyErrorState,
  AdCopyGeneratingSkeleton,
  AdCopyGenerationMeta,
  AdCopyGenerationProgress,
  AdCopyResultsList,
} from '@/components/ad-copy/AdCopyResultsList'
import {
  AdCopyHistoryPanel,
  AdCopySavedPanel,
  AdCopyTabRefreshButton,
} from '@/components/ad-copy/AdCopyHistoryPanel'
import { AdCopyCopyToast } from '@/components/ad-copy/AdCopyCopyToast'
import {
  AdCopyEmptyStateAction,
  AdCopyResultsEmptyState,
} from '@/components/ad-copy/AdCopyEmptyStates'
import { AdCopyInsightsBar } from '@/components/ad-copy/AdCopyInsightsBar'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import {
  ArrowPathIcon,
  BoltIcon,
  BookmarkIcon,
  ClockIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useAdCopyClipboard } from '@/hooks/useAdCopyClipboard'
import { useAdCopyGenerationFlow } from '@/hooks/useAdCopyGenerationFlow'
import { useAdCopyHistory } from '@/hooks/useAdCopyHistory'
import { useAdCopyInsights } from '@/hooks/useAdCopyInsights'
import { useSavedAdCopy } from '@/hooks/useSavedAdCopy'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { recordAdCopyGeneration } from '@/lib/ad-copy-analytics'
import { cn } from '@/lib'
import {
  AD_COPY_GENERATION_COST,
  AD_COPY_PLATFORM_OPTIONS,
  AD_COPY_TONE_OPTIONS,
  type AdCopyGenerationBatch,
  type AdCopyPlatform,
  type AdCopyTone,
  type AdCopyVariantWithId,
} from '@/types/ad-copy-generation'

type TabId = 'results' | 'history' | 'saved'

const JUST_SAVED_MS = 900

export function AdCopyGeneratorTool() {
  const { showToast } = useToast()
  const { isUsageLimitReached, unlimited, userPlan } = useUsageLimit()
  const {
    variants,
    generation,
    status,
    error,
    isGenerating,
    generate,
    loadFromHistory,
    updateVariantSaved,
  } = useAdCopyGenerationFlow()
  const {
    history,
    isLoading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
  } = useAdCopyHistory()
  const {
    savedAds,
    isLoading: savedLoading,
    error: savedError,
    toggleSave,
    removeSavedAd,
    refresh: refreshSaved,
  } = useSavedAdCopy()

  const { copiedKey, copyVariant, recentCopies, copyToastVisible } = useAdCopyClipboard()
  const { mostSavedTone, savedCount } = useAdCopyInsights(savedAds)

  const [briefing, setBriefing] = useState('')
  const [tone, setTone] = useState<AdCopyTone>('aggressive')
  const [platform, setPlatform] = useState<AdCopyPlatform>('Meta Ads')
  const [activeTab, setActiveTab] = useState<TabId>('results')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [justSavedId, setJustSavedId] = useState<string | null>(null)

  const canGenerate = briefing.trim().length >= 2
  const isRegenerating = isGenerating && variants.length > 0

  const savedVariantIds = useMemo(
    () => new Set(savedAds.map((a) => a.id)),
    [savedAds],
  )

  const displayTone = generation?.tone ?? tone
  const displayPlatform = generation?.platform ?? platform

  const generationIndex = useMemo(() => {
    if (!generation?.id) return undefined
    const idx = history.findIndex((h) => h.id === generation.id)
    return idx >= 0 ? history.length - idx : undefined
  }, [generation?.id, history])

  const handleGenerate = useCallback(
    async (
      skipCreditCharge = false,
      overrides?: Partial<{ briefing: string; tone: AdCopyTone; platform: AdCopyPlatform }>,
    ) => {
      if (!canGenerate && !overrides?.briefing) return
      if (isGenerating) return

      const request = {
        briefing: (overrides?.briefing ?? briefing).trim(),
        tone: overrides?.tone ?? tone,
        platform: overrides?.platform ?? platform,
      }

      const result = await generate(request, { skipCreditCharge })

      if (result) {
        recordAdCopyGeneration(request.briefing, skipCreditCharge)
        showToast({
          type: 'success',
          title: skipCreditCharge
            ? 'Ad Copy neu generiert'
            : `${result.variants.length} Ad Copy Varianten generiert`,
          message:
            skipCreditCharge || unlimited ? undefined : `${AD_COPY_GENERATION_COST} Credits verbraucht`,
        })
        setActiveTab('results')
        void refreshHistory()
      }
    },
    [canGenerate, isGenerating, generate, briefing, tone, platform, showToast, unlimited, refreshHistory],
  )

  const handleRegenerateFromHistory = useCallback(
    (batch: AdCopyGenerationBatch) => {
      setBriefing(batch.briefing)
      setTone(batch.tone as AdCopyTone)
      setPlatform(batch.platform as AdCopyPlatform)
      void handleGenerate(true, {
        briefing: batch.briefing,
        tone: batch.tone as AdCopyTone,
        platform: batch.platform as AdCopyPlatform,
      })
    },
    [handleGenerate],
  )

  const handleToggleSave = useCallback(
    async (variant: AdCopyVariantWithId) => {
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
          title: action === 'saved' ? 'Ad gespeichert' : 'Aus Favoriten entfernt',
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

  const tabs: { id: TabId; label: string; icon: typeof SparklesIcon; count?: number }[] = [
    { id: 'results', label: 'Ergebnisse', icon: SparklesIcon },
    { id: 'history', label: 'Verlauf', icon: ClockIcon, count: history.length || undefined },
    { id: 'saved', label: 'Gespeichert', icon: BookmarkIcon, count: savedAds.length || undefined },
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
        <SparklesIcon className="size-4" aria-hidden />
        {isGenerating && !isRegenerating
          ? 'Generiert …'
          : `Ad Copy generieren · ${AD_COPY_GENERATION_COST} Credits`}
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
      title="AI Ad Copy Generator"
      description="Erstelle werbetaugliche Headlines, Primary Text und CTAs für Paid Social — 5 conversion-starke Varianten pro Generierung."
      creditCost={AD_COPY_GENERATION_COST}
      className="nex-tool-surface"
    >
      <div className="glass-card overflow-x-hidden p-4 sm:p-7">
        <label
          htmlFor="ad-copy-briefing"
          className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
        >
          Briefing
        </label>
        <Textarea
          id="ad-copy-briefing"
          value={briefing}
          onChange={(e) => setBriefing(e.target.value)}
          rows={4}
          placeholder="z. B. Friseursalon in München, Fokus Balayage, Zielgruppe Frauen 25–40, Ziel: Terminbuchungen"
          disabled={isGenerating}
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Ton"
            value={tone}
            onChange={(e) => setTone(e.target.value as AdCopyTone)}
            disabled={isGenerating}
            options={AD_COPY_TONE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            hint={AD_COPY_TONE_OPTIONS.find((o) => o.value === tone)?.desc}
          />
          <SelectField
            label="Plattform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as AdCopyPlatform)}
            disabled={isGenerating}
            options={AD_COPY_PLATFORM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>

        <p className="mt-4 mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <BoltIcon className="size-3.5 text-violet-400/80" aria-hidden />
          AI Generierung
        </p>

        <div className="hidden flex-col gap-2 sm:flex sm:flex-row sm:items-stretch">
          {generateButtons}
        </div>
      </div>

      <div
        className={cn(
          'hook-mobile-sticky-actions fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800/80 bg-zinc-950/95 p-3 backdrop-blur-xl transition-smooth sm:hidden',
          'pb-[max(0.875rem,env(safe-area-inset-bottom,0px))]',
        )}
      >
        <div className="flex flex-col gap-2">{generateButtons}</div>
      </div>

      <AdCopyCopyToast visible={copyToastVisible} />

      <section
        className="ad-copy-results-section mt-6 overflow-x-hidden pb-[max(7.5rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))] sm:pb-2"
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
            <AdCopyTabRefreshButton
              onRefresh={() => void refreshHistory()}
              loading={historyLoading}
              className="ml-auto"
            />
          )}
          {activeTab === 'saved' && (
            <AdCopyTabRefreshButton
              onRefresh={() => void refreshSaved()}
              loading={savedLoading}
              className="ml-auto"
            />
          )}
        </div>

        {activeTab === 'results' && (
          <div key="results" className="animate-fade-in">
            {isUsageLimitReached && userPlan === 'free' && !unlimited ? (
              <UsageLimitWarning />
            ) : error ? (
              <AdCopyErrorState
                message={error}
                onRetry={() => void handleGenerate(variants.length > 0)}
              />
            ) : (
              <>
                <AdCopyInsightsBar
                  recentCopies={recentCopies}
                  mostSavedTone={mostSavedTone}
                  savedCount={savedCount}
                />

                {isGenerating && (
                  <AdCopyGenerationProgress
                    isRegenerating={isRegenerating}
                    step={status === 'checking' ? 'checking' : 'generating'}
                    active={isGenerating}
                  />
                )}

                {generation && variants.length > 0 && !isGenerating && (
                  <AdCopyGenerationMeta
                    briefing={generation.briefing}
                    tone={generation.tone}
                    platform={generation.platform}
                    createdAt={generation.created_at}
                    variantCount={variants.length}
                    generationIndex={generationIndex}
                  />
                )}

                {isGenerating && !isRegenerating ? (
                  <AdCopyGeneratingSkeleton count={5} />
                ) : variants.length > 0 ? (
                  <>
                    <AdCopyResultsList
                      variants={variants}
                      tone={displayTone}
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
                        <AdCopyGeneratingSkeleton count={3} />
                      </div>
                    )}
                  </>
                ) : !isGenerating ? (
                  <AdCopyResultsEmptyState
                    hint="Briefing oben ausfüllen und auf Generieren tippen."
                    action={
                      <AdCopyEmptyStateAction
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
            <AdCopyHistoryPanel
              history={history}
              isLoading={historyLoading}
              error={historyError}
              activeId={generation?.id}
              onRefresh={() => void refreshHistory()}
              emptyAction={
                <AdCopyEmptyStateAction
                  label="Erste Ad generieren"
                  onClick={() => {
                    setActiveTab('results')
                    void handleGenerate(false)
                  }}
                />
              }
              emptyHint="Generierungen erscheinen hier automatisch nach jeder AI-Anfrage."
              onSelect={(row) => {
                loadFromHistory(row)
                setBriefing(row.briefing)
                setTone(row.tone as AdCopyTone)
                setPlatform(row.platform as AdCopyPlatform)
                setActiveTab('results')
                showToast({ type: 'success', title: 'Generierung geladen' })
              }}
              onRegenerate={handleRegenerateFromHistory}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <div key="saved" className="animate-fade-in">
            <AdCopySavedPanel
              ads={savedAds}
              isLoading={savedLoading}
              error={savedError}
              copiedKey={copiedKey}
              onRefresh={() => void refreshSaved()}
              emptyAction={
                <AdCopyEmptyStateAction
                  label="Zu den Ergebnissen"
                  onClick={() => setActiveTab('results')}
                />
              }
              emptyHint="Speichere Ads aus dem Ergebnis-Tab mit dem Lesezeichen."
              onCopy={copyVariant}
              onRemove={async (id) => {
                try {
                  await removeSavedAd(id)
                  updateVariantSaved(id, false)
                  showToast({ type: 'success', title: 'Ad entfernt' })
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
