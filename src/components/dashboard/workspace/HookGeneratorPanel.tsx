'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HookErrorState, HookGeneratingSkeleton } from '@/components/hooks/HookResultsList'
import { HookEmptyStateAction, HookResultsEmptyState } from '@/components/hooks/HookEmptyStates'
import { HookCard } from '@/components/hooks/HookCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { WorkspaceSection } from '@/components/dashboard/workspace/WorkspaceSection'
import { fadeUp, useWorkspaceMotion } from '@/components/dashboard/workspace/motion'
import { useHookClipboard } from '@/hooks/useHookClipboard'
import { useHookGenerationFlow } from '@/hooks/useHookGenerationFlow'
import { useSavedHooks } from '@/hooks/useSavedHooks'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { useToast } from '@/context/ToastContext'
import { navigateToTool } from '@/lib/navigation'
import {
  HOOK_GENERATION_COST,
  HOOK_PLATFORM_OPTIONS,
  HOOK_TONE_OPTIONS,
  type HookPlatform,
  type HookTone,
} from '@/types/ai-generation'
import { formatHookDisplayText } from '@/lib/ai/parse-hooks-response'
import { cn } from '@/lib'

const PREVIEW_COUNT = 3

export function HookGeneratorPanel() {
  const { showToast } = useToast()
  const { isUsageLimitReached, unlimited, userPlan } = useUsageLimit()
  const { hooks, status, error, isGenerating, generate } = useHookGenerationFlow()
  const { copiedHook, copyHook } = useHookClipboard()
  const { isSaved, toggleSave } = useSavedHooks()
  const { reduced, transition } = useWorkspaceMotion()

  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<HookTone>('storytelling')
  const [platform, setPlatform] = useState<HookPlatform>('TikTok')
  const [savingHook, setSavingHook] = useState<string | null>(null)

  const canGenerate = topic.trim().length >= 2
  const displayHooks = hooks.map((h) => formatHookDisplayText(h)).filter(Boolean)
  const previewHooks = displayHooks.slice(0, PREVIEW_COUNT)
  const hasMore = displayHooks.length > PREVIEW_COUNT

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isGenerating) return

    const result = await generate({
      topic: topic.trim(),
      tone,
      platform,
    })

    if (result) {
      showToast({
        type: 'success',
        title: `${result.hooks.length} Hooks generiert`,
        message: unlimited ? undefined : `${HOOK_GENERATION_COST} Credits verbraucht`,
      })
    }
  }, [canGenerate, isGenerating, generate, topic, tone, platform, showToast, unlimited])

  const handleToggleSave = useCallback(
    async (hookText: string) => {
      setSavingHook(hookText)
      try {
        const action = await toggleSave({
          hookText,
          topic: topic.trim(),
          tone,
          platform,
        })
        showToast({
          type: 'success',
          title: action === 'saved' ? 'Hook gespeichert' : 'Entfernt',
        })
      } catch {
        showToast({ type: 'error', title: 'Speichern fehlgeschlagen' })
      } finally {
        setSavingHook(null)
      }
    },
    [toggleSave, topic, tone, platform, showToast],
  )

  return (
    <WorkspaceSection
      id="workspace-hooks"
      title="Hook Generator"
      description="10 virale TikTok & Instagram Scroll-Stopper — powered by OpenAI."
      delay={0.05}
      action={
        <Button variant="ghost" size="sm" onClick={() => navigateToTool('hook')}>
          Vollansicht →
        </Button>
      }
    >
      <div className="space-y-4">
        {isUsageLimitReached && userPlan === 'free' && !unlimited ? (
          <UsageLimitWarning />
        ) : null}

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Nische / Thema
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="z. B. Fitness, Skincare, AI Side Hustle"
              disabled={isGenerating}
            />
          </div>
          <SelectField
            label="Plattform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as HookPlatform)}
            disabled={isGenerating}
            options={HOOK_PLATFORM_OPTIONS.filter((o) =>
              ['TikTok', 'Instagram Reels', 'Universal'].includes(o.value),
            ).map((o) => ({ value: o.value, label: o.label }))}
          />
          <SelectField
            label="Ton"
            value={tone}
            onChange={(e) => setTone(e.target.value as HookTone)}
            disabled={isGenerating}
            options={HOOK_TONE_OPTIONS.slice(0, 4).map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
        </div>

        <Button
          variant="pro"
          onClick={() => void handleGenerate()}
          loading={isGenerating}
          disabled={!canGenerate || isGenerating}
          className="w-full sm:w-auto"
        >
          10 Hooks generieren · {HOOK_GENERATION_COST} Credits
        </Button>

        {isGenerating ? <HookGeneratingSkeleton count={3} /> : null}

        {error && !isGenerating ? (
          <HookErrorState message={error} onRetry={() => void handleGenerate()} />
        ) : null}

        <AnimatePresence mode="popLayout">
          {!isGenerating && !error && displayHooks.length === 0 ? (
            <motion.div key="empty" variants={fadeUp} transition={transition}>
              <HookResultsEmptyState
                action={
                  canGenerate ? (
                    <HookEmptyStateAction
                      label="Hooks generieren"
                      onClick={() => void handleGenerate()}
                    />
                  ) : undefined
                }
              />
            </motion.div>
          ) : null}

          {!isGenerating && previewHooks.length > 0 ? (
            <motion.ul
              key="results"
              className="space-y-2.5"
              initial={reduced ? false : 'hidden'}
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {previewHooks.map((hook, index) => (
                <motion.li key={`${index}-${hook.slice(0, 24)}`} variants={fadeUp} transition={transition}>
                  <HookCard
                    hook={hook}
                    index={index}
                    tone={tone}
                    platform={platform}
                    saved={isSaved(hook)}
                    saving={savingHook === hook}
                    copied={copiedHook === hook}
                    onCopy={() => copyHook(hook)}
                    onToggleSave={() => void handleToggleSave(hook)}
                    showIndex
                    variant="result"
                    className="dashboard-ws-hook-card !p-3.5"
                  />
                </motion.li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>

        {hasMore && !isGenerating ? (
          <p className={cn('text-center text-xs text-zinc-500')}>
            +{displayHooks.length - PREVIEW_COUNT} weitere Hooks in der{' '}
            <button
              type="button"
              onClick={() => navigateToTool('hook')}
              className="font-semibold text-violet-400 hover:text-violet-300"
            >
              Vollansicht
            </button>
          </p>
        ) : null}

        {status === 'checking' && (
          <p className="text-center text-xs text-violet-400/90" role="status">
            Credits werden geprüft …
          </p>
        )}
      </div>
    </WorkspaceSection>
  )
}
