'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { TrendFeedCard } from '@/components/dashboard/workspace/TrendFeedCard'
import { TrendFeedSkeleton } from '@/components/dashboard/workspace/WorkspaceSkeletons'
import { WorkspaceSection } from '@/components/dashboard/workspace/WorkspaceSection'
import { staggerContainer, useWorkspaceMotion } from '@/components/dashboard/workspace/motion'
import { fetchTrendIntelligenceFeed } from '@/lib/dashboard-workspace-mock'
import { getDemoTrendCatalog } from '@/lib/demo-trend-catalog'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import { useToast } from '@/context/ToastContext'
import type { DashboardToolId } from '@/lib'
import type { TrendFeedItem } from '@/types/dashboard-workspace'

type TrendIntelligenceFeedProps = {
  onNavigate?: (tool: DashboardToolId) => void
}

export function TrendIntelligenceFeed({ onNavigate }: TrendIntelligenceFeedProps) {
  const [items, setItems] = useState<TrendFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const { isSaved, toggleSave } = useSavedTrends()
  const { showToast } = useToast()
  const { reduced } = useWorkspaceMotion()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const feed = await fetchTrendIntelligenceFeed()
      setItems(feed)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function handleToggleSave(item: TrendFeedItem) {
    const full = getDemoTrendCatalog().find((t) => t.id === item.id)
    if (!full) return
    const nowSaved = toggleSave(full)
    showToast({
      type: 'success',
      title: nowSaved ? 'Trend gespeichert' : 'Trend entfernt',
      message: item.title,
    })
  }

  return (
    <WorkspaceSection
      id="workspace-trends"
      title="Trend Intelligence Feed"
      description="Live-Signale aus TikTok, Instagram & YouTube — sortiert nach Viral-Potenzial."
      action={
        onNavigate ? (
          <Button variant="ghost" size="sm" onClick={() => onNavigate('trend-intelligence')}>
            Vollansicht
          </Button>
        ) : null
      }
    >
      {loading ? (
        <TrendFeedSkeleton />
      ) : (
        <motion.div
          className="dashboard-ws-trend-scroll flex flex-col gap-4 max-md:overflow-x-hidden md:-mx-1 md:flex-row md:gap-3 md:overflow-x-auto md:overscroll-x-contain md:px-1 md:pb-1 md:snap-x md:snap-mandatory md:scrollbar-hide"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="visible"
        >
          {items.map((item) => (
            <div key={item.id} className="min-w-0 w-full md:snap-center md:w-auto md:shrink-0">
              <TrendFeedCard
                item={item}
                saved={isSaved(item.id)}
                onToggleSave={() => handleToggleSave(item)}
              />
            </div>
          ))}
          <span className="hidden w-4 shrink-0 snap-none md:block" aria-hidden />
        </motion.div>
      )}

      {!loading ? (
        <div className="dashboard-ws-trend-refresh mt-5 max-md:mt-4 md:mt-3 md:flex md:justify-end">
          <Button
            variant="secondary"
            size="sm"
            className="w-full max-md:min-h-11 md:w-auto"
            onClick={() => void load()}
          >
            Feed aktualisieren
          </Button>
        </div>
      ) : null}
    </WorkspaceSection>
  )
}
