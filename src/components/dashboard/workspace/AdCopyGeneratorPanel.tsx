'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { GeneratorSkeleton } from '@/components/dashboard/workspace/WorkspaceSkeletons'
import { WorkspaceSection } from '@/components/dashboard/workspace/WorkspaceSection'
import { useWorkspaceMotion } from '@/components/dashboard/workspace/motion'
import { generateWorkspaceAdCopy } from '@/lib/dashboard-workspace-mock'
import type { GeneratedAdCopy, WorkspacePlatform } from '@/types/dashboard-workspace'

const PLATFORMS: WorkspacePlatform[] = ['TikTok', 'Instagram', 'YouTube']

export function AdCopyGeneratorPanel() {
  const [product, setProduct] = useState('AI Marketing Suite')
  const [audience, setAudience] = useState('Creator & DTC Brands')
  const [platform, setPlatform] = useState<WorkspacePlatform>('TikTok')
  const [result, setResult] = useState<GeneratedAdCopy | null>(null)
  const [loading, setLoading] = useState(false)
  const { reduced, transition } = useWorkspaceMotion()

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    try {
      const copy = await generateWorkspaceAdCopy(product, audience, platform)
      setResult(copy)
    } finally {
      setLoading(false)
    }
  }

  return (
    <WorkspaceSection
      id="workspace-ad-copy"
      title="AI Ad Copy"
      description="Kurze Ads, CTA und Caption — plattformoptimiert."
      delay={0.08}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Produkt / Service
            </label>
            <Input value={product} onChange={(e) => setProduct(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Zielgruppe
            </label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>
        </div>
        <SelectField
          label="Plattform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as WorkspacePlatform)}
          options={PLATFORMS.map((p) => ({ value: p, label: p }))}
        />

        <Button onClick={() => void handleGenerate()} loading={loading} className="w-full sm:w-auto">
          Ad Copy generieren
        </Button>

        {loading ? <GeneratorSkeleton rows={3} /> : null}

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="ad-result"
              className="space-y-3"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              <ResultBlock label="Short Ad" value={result.shortAd} />
              <ResultBlock label="CTA" value={result.cta} accent />
              <ResultBlock label="Caption" value={result.caption} multiline />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </WorkspaceSection>
  )
}

function ResultBlock({
  label,
  value,
  accent,
  multiline,
}: {
  label: string
  value: string
  accent?: boolean
  multiline?: boolean
}) {
  return (
    <div
      className={
        accent
          ? 'rounded-xl border border-violet-500/25 bg-violet-500/[0.06] p-3.5'
          : 'rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3.5'
      }
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{label}</p>
      <p
        className={
          multiline
            ? 'mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-300'
            : 'mt-1.5 text-sm font-medium text-zinc-100'
        }
      >
        {value}
      </p>
    </div>
  )
}
