'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GeneratorSkeleton } from '@/components/dashboard/workspace/WorkspaceSkeletons'
import { WorkspaceSection } from '@/components/dashboard/workspace/WorkspaceSection'
import { useWorkspaceMotion } from '@/components/dashboard/workspace/motion'
import { generateWorkspaceSeoTitle } from '@/lib/dashboard-workspace-mock'
import type { GeneratedSeoTitle } from '@/types/dashboard-workspace'

export function SeoTitleGeneratorPanel() {
  const [topic, setTopic] = useState('TikTok Marketing Trends')
  const [result, setResult] = useState<GeneratedSeoTitle | null>(null)
  const [loading, setLoading] = useState(false)
  const { reduced, transition } = useWorkspaceMotion()

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    try {
      setResult(await generateWorkspaceSeoTitle(topic))
    } finally {
      setLoading(false)
    }
  }

  return (
    <WorkspaceSection
      id="workspace-seo"
      title="SEO Title Generator"
      description="Viraler Titel mit SEO- und Keyword-Stärke."
      delay={0.1}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Thema / Keyword
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="z. B. AI Video Marketing"
          />
        </div>

        <Button onClick={() => void handleGenerate()} loading={loading} className="w-full sm:w-auto">
          Titel generieren
        </Button>

        {loading ? <GeneratorSkeleton rows={2} /> : null}

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="seo-result"
              className="rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/20 via-zinc-950/60 to-zinc-950/80 p-4 sm:p-5"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400/90">
                Viral Title
              </p>
              <p className="mt-2 text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                {result.title}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <ScoreMeter label="SEO Score" value={result.seoScore} tone="violet" />
                <ScoreMeter label="Keyword Strength" value={result.keywordStrength} tone="fuchsia" />
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Fokus-Keyword: <span className="font-medium text-zinc-400">{result.keyword}</span>
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </WorkspaceSection>
  )
}

function ScoreMeter({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'violet' | 'fuchsia'
}) {
  const bar = tone === 'violet' ? 'bg-violet-500' : 'bg-fuchsia-500'
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/50 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{label}</span>
        <span className="text-sm font-bold tabular-nums text-white">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className={`h-full rounded-full ${bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}
