import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { BoltIcon, CopyIcon, SparklesIcon } from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { generateTrendHooks, type TrendHookStyle } from '@/lib/openai'
import { cn } from '@/lib'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const STYLES: { id: TrendHookStyle; label: string; desc: string }[] = [
  { id: 'aggressive', label: 'Aggressiv', desc: 'Direkt & konfrontativ' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium & aspirational' },
  { id: 'storytelling', label: 'Storytelling', desc: 'Narrativ & emotional' },
  { id: 'faceless', label: 'Faceless', desc: 'Voice-over & Text' },
  { id: 'ugc', label: 'UGC', desc: 'Authentisch & raw' },
]

type TrendHookGeneratorProps = {
  trend: TrendIntelligence
  className?: string
}

export function TrendHookGenerator({ trend, className }: TrendHookGeneratorProps) {
  const { showToast } = useToast()
  const { hasProAccess, consumeUsage } = useUsageLimit()
  const [style, setStyle] = useState<TrendHookStyle>('aggressive')
  const [hooks, setHooks] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setError(null)
    setIsGenerating(true)

    try {
      if (!hasProAccess) {
        const result = await consumeUsage({
          tool: 'Hook-Generator',
          label: `Hooks: ${trend.title.slice(0, 30)}`,
        })
        if (!result.allowed) return
      }

      const generated = await generateTrendHooks(
        trend.title,
        trend.hookAnalysis.hookText,
        style,
        trend.niche,
      )
      setHooks(generated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generierung fehlgeschlagen.')
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

      <div className="flex flex-wrap gap-2" role="group" aria-label="Hook-Stil">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            className={cn(
              'rounded-xl border px-3 py-2 text-left transition-smooth',
              style === s.id
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-100'
                : 'border-zinc-800/80 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
            )}
          >
            <span className="block text-xs font-semibold">{s.label}</span>
            <span className="block text-[10px] text-zinc-500">{s.desc}</span>
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        size="md"
        loading={isGenerating}
        onClick={() => void handleGenerate()}
        className="w-full sm:w-auto"
      >
        <SparklesIcon className="size-4" aria-hidden />
        Hooks generieren
      </Button>

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      {hooks.length > 0 && (
        <ul className="space-y-2 animate-fade-in">
          {hooks.map((hook) => (
            <li
              key={hook}
              className="group flex items-start gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3"
            >
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-200">{hook}</p>
              <button
                type="button"
                onClick={() => void copyHook(hook)}
                className="shrink-0 rounded-lg p-2 text-zinc-500 opacity-0 transition-smooth hover:bg-zinc-800 hover:text-white group-hover:opacity-100"
                aria-label="Hook kopieren"
              >
                <CopyIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
