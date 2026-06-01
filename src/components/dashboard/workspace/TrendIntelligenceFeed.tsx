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
          className="dashboard-ws-trend-scroll -mx-1 flex gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1 scrollbar-hide snap-x snap-mandatory"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="visible"
        >
          {items.map((item) => (
            <div key={item.id} className="snap-center">
              <TrendFeedCard
                item={item}
                saved={isSaved(item.id)}
                onToggleSave={() => handleToggleSave(item)}
              />
            </div>
          ))}
          <span className="w-4 shrink-0 snap-none" aria-hidden />
        </motion.div>
      )}

      {!loading ? (
        <div className="mt-3 flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Feed aktualisieren
          </Button>
        </div>
      ) : null}
    </WorkspaceSection>
  )
}
