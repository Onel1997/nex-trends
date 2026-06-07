'use client'

import { motion } from 'framer-motion'
import { TrendIntelligenceFeed } from '@/components/dashboard/workspace/TrendIntelligenceFeed'
import { HookGeneratorPanel } from '@/components/dashboard/workspace/HookGeneratorPanel'
import { AdCopyGeneratorPanel } from '@/components/dashboard/workspace/AdCopyGeneratorPanel'
import { SeoTitleGeneratorPanel } from '@/components/dashboard/workspace/SeoTitleGeneratorPanel'
import { SavedTrendsWorkspace } from '@/components/dashboard/workspace/SavedTrendsWorkspace'
import { fadeUp, useWorkspaceMotion } from '@/components/dashboard/workspace/motion'
import type { DashboardToolId } from '@/lib'

type DashboardWorkspaceProps = {
  onNavigate: (tool: DashboardToolId) => void
}

export function DashboardWorkspace({ onNavigate }: DashboardWorkspaceProps) {
  const { reduced, transition } = useWorkspaceMotion()

  return (
    <motion.div
      className="dashboard-workspace mt-5 flex flex-col gap-6 sm:mt-6 sm:gap-6"
      initial={reduced ? false : 'hidden'}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
    >
      <motion.div variants={fadeUp} transition={transition}>
        <TrendIntelligenceFeed onNavigate={onNavigate} />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <motion.div variants={fadeUp} transition={transition}>
          <HookGeneratorPanel />
        </motion.div>
        <motion.div variants={fadeUp} transition={transition}>
          <AdCopyGeneratorPanel />
        </motion.div>
        <motion.div variants={fadeUp} transition={transition}>
          <SeoTitleGeneratorPanel />
        </motion.div>
        <motion.div variants={fadeUp} transition={transition}>
          <SavedTrendsWorkspace onNavigate={onNavigate} />
        </motion.div>
      </div>
    </motion.div>
  )
}
