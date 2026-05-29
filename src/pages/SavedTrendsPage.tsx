import { useCallback, useEffect, useState } from 'react'
import { HookSavedPanel, HookTabRefreshButton } from '@/components/hooks/HookHistoryPanel'
import { HookEmptyStateAction } from '@/components/hooks/HookEmptyStates'
import { SavedTrendsPanel } from '@/components/trends'
import { BookmarkIcon, SparklesIcon, TrendingUpIcon } from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { useHookClipboard } from '@/hooks/useHookClipboard'
import { useSavedHooks } from '@/hooks/useSavedHooks'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import { setHookRegeneratePrefill } from '@/lib/hook-regenerate-session'
import { cn, type DashboardToolId } from '@/lib'
import type { HookPlatform, HookTone, SavedHookRow } from '@/types/ai-generation'

type LibraryTab = 'hooks' | 'trends'

type SavedTrendsPageProps = {
  onNavigate: (tool: DashboardToolId) => void
}

export function SavedTrendsPage({ onNavigate }: SavedTrendsPageProps) {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<LibraryTab>('hooks')

  const {
    savedHooks,
    isLoading: hooksLoading,
    error: hooksError,
    removeSavedHook,
    refresh: refreshHooks,
  } = useSavedHooks()

  const { copiedHook, copyHook } = useHookClipboard()
  const { savedTrends, isSaved, toggleSave, unsave } = useSavedTrends()

  useEffect(() => {
    void refreshHooks()
  }, [refreshHooks])

  const handleRegenerate = useCallback(
    (hook: SavedHookRow) => {
      const topic = hook.topic?.trim() || hook.hook_text.slice(0, 80)
      const tone = (hook.tone ?? 'aggressive') as HookTone
      const platform = (hook.platform ?? 'TikTok') as HookPlatform

      setHookRegeneratePrefill({
        topic,
        tone,
        platform,
        autoGenerate: true,
      })

      showToast({
        type: 'info',
        title: 'Hook Generator geöffnet',
        message: 'Neue Varianten werden generiert …',
      })
      onNavigate('hook')
    },
    [onNavigate, showToast],
  )

  const handleRemoveHook = useCallback(
    async (id: string) => {
      try {
        await removeSavedHook(id)
        showToast({ type: 'success', title: 'Hook entfernt' })
      } catch {
        showToast({ type: 'error', title: 'Entfernen fehlgeschlagen' })
      }
    },
    [removeSavedHook, showToast],
  )

  const tabs: { id: LibraryTab; label: string; count: number }[] = [
    { id: 'hooks', label: 'Saved Hooks', count: savedHooks.length },
    { id: 'trends', label: 'Saved Trends', count: savedTrends.length },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6 overflow-x-hidden">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <BookmarkIcon className="size-3.5" aria-hidden />
          Bibliothek
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Saved Trends
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {savedHooks.length} gespeicherte Hook{savedHooks.length === 1 ? '' : 's'} ·{' '}
          {savedTrends.length} Trend{savedTrends.length === 1 ? '' : 's'} — Hooks in Supabase, Trends lokal.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-zinc-800/60 pb-3">
        {tabs.map(({ id, label, count }) => {
          const Icon = id === 'hooks' ? SparklesIcon : TrendingUpIcon
          return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-smooth touch-manipulation',
              activeTab === id
                ? 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/20'
                : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300',
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
            {count > 0 && (
              <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-400">
                {count}
              </span>
            )}
          </button>
          )
        })}

        {activeTab === 'hooks' && (
          <HookTabRefreshButton
            onRefresh={() => void refreshHooks()}
            loading={hooksLoading}
            className="ml-auto"
          />
        )}
      </div>

      {activeTab === 'hooks' && (
        <HookSavedPanel
          hooks={savedHooks}
          isLoading={hooksLoading}
          error={hooksError}
          copiedHook={copiedHook}
          onRefresh={() => void refreshHooks()}
          onCopy={copyHook}
          onRemove={handleRemoveHook}
          onRegenerate={handleRegenerate}
          emptyTitle="No saved hooks yet"
          emptyDescription="Save hooks from the Hook Generator with the bookmark icon — they appear here instantly and persist across sessions."
          emptyAction={
            <HookEmptyStateAction
              label="Open Hook Generator"
              onClick={() => onNavigate('hook')}
            />
          }
        />
      )}

      {activeTab === 'trends' && (
        <SavedTrendsPanel
          trends={savedTrends}
          isSaved={isSaved}
          onToggleSave={toggleSave}
          onRemove={unsave}
        />
      )}
    </div>
  )
}
