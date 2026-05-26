import { useState } from 'react'
import {
  HookErrorState,
  HookGeneratingSkeleton,
  HookResultsList,
} from '@/components/hooks/HookResultsList'
import { SelectField } from '@/components/ui/SelectField'
import { Button } from '@/components/ui/Button'
import { BoltIcon, SparklesIcon } from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useHookGenerationFlow } from '@/hooks/useHookGenerationFlow'
import { useSavedHooks } from '@/hooks/useSavedHooks'
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

export function TrendHookGenerator({ trend, className }: TrendHookGeneratorProps) {
  const { showToast } = useToast()
  const { hooks, error, isGenerating, generate } = useHookGenerationFlow()
  const { saveHook, isSaved, savedHooks } = useSavedHooks()
  const [tone, setTone] = useState<HookTone>('aggressive')
  const [platform, setPlatform] = useState<HookPlatform>(
    (trend.platform as HookPlatform) || 'TikTok',
  )
  const [savingHook, setSavingHook] = useState<string | null>(null)

  const savedHookTexts = new Set(savedHooks.map((h) => h.hook_text))

  async function runGenerate(skipCreditCharge: boolean) {
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
      showToast({
        type: 'success',
        title: `${result.hooks.length} Hooks generiert`,
      })
    }
  }

  async function handleSaveHook(hookText: string) {
    if (isSaved(hookText)) return
    setSavingHook(hookText)
    try {
      await saveHook({
        hookText,
        topic: trend.niche ?? trend.title,
        tone,
        platform,
      })
      showToast({ type: 'success', title: 'Hook gespeichert' })
    } catch {
      showToast({ type: 'error', title: 'Speichern fehlgeschlagen' })
    } finally {
      setSavingHook(null)
    }
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
    <section className={cn('space-y-4', className)}>
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="secondary"
          size="md"
          loading={isGenerating}
          onClick={() => void runGenerate(hooks.length > 0)}
          className="w-full sm:w-auto"
        >
          <SparklesIcon className="size-4" aria-hidden />
          {hooks.length > 0
            ? 'Neu generieren'
            : `Hooks generieren · ${HOOK_GENERATION_COST} Credits`}
        </Button>
      </div>

      {error && (
        <HookErrorState message={error} onRetry={() => void runGenerate(false)} />
      )}

      {isGenerating && <HookGeneratingSkeleton count={5} />}

      {!isGenerating && (
        <HookResultsList
          hooks={hooks}
          onCopy={(text) => void copyHook(text)}
          onSave={(text) => void handleSaveHook(text)}
          savedHooks={savedHookTexts}
          isSaving={savingHook}
        />
      )}
    </section>
  )
}
