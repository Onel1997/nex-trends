import { useState } from 'react'
import { HookErrorState, HookResultsList } from '@/components/hooks/HookResultsList'
import { HookStylePicker } from '@/components/hooks/HookStylePicker'
import { Button } from '@/components/ui/Button'
import { BoltIcon, SparklesIcon } from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { generateTrendHooks, trendToHookInput, type TrendHookStyle } from '@/lib/openai'
import { cn } from '@/lib'
import type { TrendIntelligence } from '@/types/trend-intelligence'

type TrendHookGeneratorProps = {
  trend: TrendIntelligence
  className?: string
}

export function TrendHookGenerator({ trend, className }: TrendHookGeneratorProps) {
  const { showToast } = useToast()
  const { requireCredits, consumeCreditAfterSuccess } = useUsageLimit()
  const [style, setStyle] = useState<TrendHookStyle>('aggressive')
  const [hooks, setHooks] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runGenerate(consumeCredit: boolean) {
    setError(null)
    setIsGenerating(true)

    try {
      if (consumeCredit && !requireCredits()) return

      const generated = await generateTrendHooks(trendToHookInput(trend, style))
      setHooks(generated)

      if (consumeCredit) {
        await consumeCreditAfterSuccess({
          tool: 'Hook-Generator',
          label: `Hooks: ${trend.title.slice(0, 30)}`,
          niche: trend.niche,
          platform: trend.platform,
          prompt: trend.title,
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

      <HookStylePicker value={style} onChange={setStyle} disabled={isGenerating} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="secondary"
          size="md"
          loading={isGenerating}
          onClick={() => void runGenerate(hooks.length === 0)}
          className="w-full sm:w-auto"
        >
          <SparklesIcon className="size-4" aria-hidden />
          {hooks.length > 0 ? 'Neu generieren' : 'Hooks generieren'}
        </Button>
      </div>

      {error && <HookErrorState message={error} onRetry={() => void runGenerate(false)} />}

      <HookResultsList hooks={hooks} onCopy={(text) => void copyHook(text)} />
    </section>
  )
}
