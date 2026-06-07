import { useCallback, useMemo, useState } from 'react'
import {
  HookErrorState,
  HookGeneratingSkeleton,
  HookGenerationProgress,
  HookResultsList,
} from '@/components/hooks/HookResultsList'
import { HookResultsEmptyState } from '@/components/hooks/HookEmptyStates'
import { SelectField } from '@/components/ui/SelectField'
import { Button } from '@/components/ui/Button'
import { ArrowPathIcon, BoltIcon, SparklesIcon } from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useHookClipboard } from '@/hooks/useHookClipboard'
import { useHookGenerationFlow } from '@/hooks/useHookGenerationFlow'
import { useSavedHooks } from '@/hooks/useSavedHooks'
import { recordHookGeneration } from '@/lib/hook-analytics'
import { cn } from '@/lib'
import {
  HOOK_GENERATION_COST,
  HOOK_PLATFORM_OPTIONS,
  HOOK_TONE_OPTIONS,
  type HookPlatform,
  type HookTone,
} from '@/types/ai-generation'
import type { TrendIntelligence } from '@/types/trend-intelligence'

type TrendHookGeneratorProps = {
  trend: TrendIntelligence
  className?: string
}

const JUST_SAVED_MS = 900

export function TrendHookGenerator({ trend, className }: TrendHookGeneratorProps) {
  const { showToast } = useToast()
  const { hooks, generation, status, error, isGenerating, generate } = useHookGenerationFlow()
  const { savedHooks, toggleSave, refresh: refreshSaved, isSaved } = useSavedHooks()
  const { copiedHook, copyHook } = useHookClipboard()

  const [tone, setTone] = useState<HookTone>('aggressive')
  const [platform, setPlatform] = useState<HookPlatform>(
    (trend.platform as HookPlatform) || 'TikTok',
  )
  const [savingHook, setSavingHook] = useState<string | null>(null)
  const [justSavedHook, setJustSavedHook] = useState<string | null>(null)

  const savedHookTexts = useMemo(
    () => new Set(savedHooks.map((h) => h.hook_text.trim())),
    [savedHooks],
  )
  const isRegenerating = isGenerating && hooks.length > 0
  const displayTone = generation?.tone ?? tone
  const displayPlatform = generation?.platform ?? platform

  const runGenerate = useCallback(
    async (skipCreditCharge: boolean) => {
      if (isGenerating) return

      const result = await generate(
        {
          topic: trend.niche?.trim() || trend.title,
          tone,
          platform,
          context: trend.description,
          trendTitle: trend.title,
          referenceHook: trend.hookAnalysis?.hookText,
        },
        { skipCreditCharge },
      )

      if (result) {
        recordHookGeneration(trend.title, skipCreditCharge)
        showToast({
          type: 'success',
          title: skipCreditCharge ? 'Hooks neu generiert' : `${result.hooks.length} Hooks generiert`,
        })
        void refreshSaved()
      }
    },
    [isGenerating, generate, trend, tone, platform, showToast, refreshSaved],
  )

  const handleToggleSave = useCallback(
    async (hookText: string) => {
      setSavingHook(hookText)
      try {
        const action = await toggleSave({
          hookText,
          generationId: generation?.id,
          topic: trend.niche ?? trend.title,
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
      } catch {
        showToast({ type: 'error', title: 'Speichern fehlgeschlagen' })
      } finally {
        setSavingHook(null)
      }
    },
    [toggleSave, generation, trend, displayTone, displayPlatform, showToast],
  )

  return (
    <section className={cn('hook-results-section space-y-4 overflow-x-clip', className)}>
      <div className="flex items-center gap-2">
        <BoltIcon className="size-4 text-violet-400" aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-violet-400/90">
          AI Hook Generator
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          label="Ton"
          value={tone}
          onChange={(e) => setTone(e.target.value as HookTone)}
          disabled={isGenerating}
          options={HOOK_TONE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <SelectField
          label="Plattform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as HookPlatform)}
          disabled={isGenerating}
          options={HOOK_PLATFORM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
      </div>

      <Button
        variant="secondary"
        size="md"
        fullWidth
        loading={isGenerating}
        disabled={isGenerating}
        onClick={() => void runGenerate(hooks.length > 0)}
        className="min-h-12"
      >
        {hooks.length > 0 ? (
          <ArrowPathIcon className="size-4" aria-hidden />
        ) : (
          <SparklesIcon className="size-4" aria-hidden />
        )}
        {hooks.length > 0
          ? 'Neu generieren'
          : `Hooks generieren · ${HOOK_GENERATION_COST} Credits`}
      </Button>

      {error && (
        <HookErrorState
          message={error}
          onRetry={() => void runGenerate(hooks.length > 0)}
        />
      )}

      {isGenerating && (
        <HookGenerationProgress
          isRegenerating={isRegenerating}
          step={status === 'checking' ? 'checking' : 'generating'}
        />
      )}

      {isGenerating && !isRegenerating && <HookGeneratingSkeleton count={5} />}

      {!isGenerating && hooks.length === 0 && !error && (
        <HookResultsEmptyState />
      )}

      {hooks.length > 0 && (
        <div className="relative">
          <HookResultsList
            hooks={hooks}
            tone={displayTone}
            platform={displayPlatform}
            onCopy={copyHook}
            onToggleSave={handleToggleSave}
            savedHooks={savedHookTexts}
            isHookSaved={isSaved}
            isSaving={savingHook}
            justSavedHook={justSavedHook}
            copiedHook={copiedHook}
            dimmed={isRegenerating}
          />
          {isRegenerating && (
            <div className="mt-3">
              <HookGeneratingSkeleton count={2} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
