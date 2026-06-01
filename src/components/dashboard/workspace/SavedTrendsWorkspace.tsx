'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { BookmarkIcon } from '@/components/ui/icons'
import { WorkspaceSection } from '@/components/dashboard/workspace/WorkspaceSection'
import { fadeUp, useWorkspaceMotion } from '@/components/dashboard/workspace/motion'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import type { DashboardToolId } from '@/lib'
import { cn } from '@/lib'

type SavedTrendsWorkspaceProps = {
  onNavigate?: (tool: DashboardToolId) => void
}

export function SavedTrendsWorkspace({ onNavigate }: SavedTrendsWorkspaceProps) {
  const { savedTrends, unsave } = useSavedTrends()
  const { reduced, transition } = useWorkspaceMotion()

  return (
    <WorkspaceSection
      id="workspace-saved"
      title="Saved Trends"
      description="Deine kuratierte Watchlist — jederzeit entfernen oder vertiefen."
      delay={0.12}
      action={
        onNavigate ? (
          <Button variant="ghost" size="sm" onClick={() => onNavigate('saved-trends')}>
            Alle anzeigen
          </Button>
        ) : null
      }
    >
      {savedTrends.length === 0 ? (
        <EmptyState
          variant="premium"
          size="compact"
          icon={<BookmarkIcon className="size-5 text-violet-400" />}
          title="Noch keine Trends gespeichert"
          description="Speichere Signale aus dem Trend Feed — sie erscheinen hier als deine persönliche Watchlist."
          action={
            onNavigate ? (
              <Button variant="secondary" size="sm" onClick={() => onNavigate('trend-intelligence')}>
                Trends entdecken
              </Button>
            ) : undefined
          }
        />
      ) : (
        <motion.ul
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          initial={reduced ? false : 'hidden'}
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence mode="popLayout">
            {savedTrends.map((trend) => (
              <motion.li
                key={trend.id}
                layout
                variants={fadeUp}
                transition={transition}
                exit={{ opacity: 0, scale: 0.96 }}
                className="dashboard-ws-saved-card flex flex-col rounded-xl border border-zinc-800/60 bg-zinc-950/55 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="muted" className="text-[9px]">
                    {trend.platform}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => unsave(trend.id)}
                    className="text-[11px] font-medium text-zinc-500 transition-colors hover:text-red-400"
                  >
                    Entfernen
                  </button>
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-zinc-100">{trend.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">{trend.niche ?? trend.hashtags[0]}</p>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/50 pt-3">
                  <span className="text-xs text-zinc-600">
                    Viral{' '}
                    <span className={cn('font-bold tabular-nums text-violet-300')}>
                      {trend.viralScore}
                    </span>
                  </span>
                  <span className="text-[10px] text-zinc-600">{trend.views} views</span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </WorkspaceSection>
  )
}
