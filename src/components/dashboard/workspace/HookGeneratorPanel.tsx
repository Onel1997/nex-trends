'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { GeneratorSkeleton } from '@/components/dashboard/workspace/WorkspaceSkeletons'
import { WorkspaceSection } from '@/components/dashboard/workspace/WorkspaceSection'
import { fadeUp, useWorkspaceMotion } from '@/components/dashboard/workspace/motion'
import { generateWorkspaceHooks } from '@/lib/dashboard-workspace-mock'
import { useToast } from '@/context/ToastContext'
import type { GeneratedHook, HookTone, WorkspacePlatform } from '@/types/dashboard-workspace'

const PLATFORMS: WorkspacePlatform[] = ['TikTok', 'Instagram', 'YouTube']
const TONES: { value: HookTone; label: string }[] = [
  { value: 'aggressive', label: 'Aggressiv' },
  { value: 'luxury', label: 'Premium' },
  { value: 'storytelling', label: 'Story' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
]

export function HookGeneratorPanel() {
  const [niche, setNiche] = useState('Skincare & Beauty')
  const [platform, setPlatform] = useState<WorkspacePlatform>('TikTok')
  const [tone, setTone] = useState<HookTone>('aggressive')
  const [hooks, setHooks] = useState<GeneratedHook[]>([])
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const { reduced, transition } = useWorkspaceMotion()

  async function handleGenerate() {
    setLoading(true)
    setHooks([])
    try {
      const result = await generateWorkspaceHooks(niche, platform, tone)
      setHooks(result)
    } finally {
      setLoading(false)
    }
  }

  async function copyHook(text: string) {
    try {
      await navigator.clipboard.writeText(text.replace(/^„|”$/g, '').replace(/ · .*$/, ''))
      showToast({ type: 'success', title: 'Hook kopiert' })
    } catch {
      showToast({ type: 'error', title: 'Kopieren fehlgeschlagen' })
    }
  }

  return (
    <WorkspaceSection
      id="workspace-hooks"
      title="Hook Generator"
      description="Scroll-stoppende Opener mit geschätztem CTR-Score."
      delay={0.05}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Nische
            </label>
            <Input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="z. B. Fitness, SaaS, Beauty"
            />
          </div>
          <SelectField
            label="Plattform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as WorkspacePlatform)}
            options={PLATFORMS.map((p) => ({ value: p, label: p }))}
          />
          <SelectField
            label="Ton"
            value={tone}
            onChange={(e) => setTone(e.target.value as HookTone)}
            options={TONES}
          />
        </div>

        <Button onClick={() => void handleGenerate()} loading={loading} className="w-full sm:w-auto">
          5 Hooks generieren
        </Button>

        {loading ? <GeneratorSkeleton rows={5} /> : null}

        <AnimatePresence mode="popLayout">
          {hooks.length > 0 ? (
            <motion.ul
              className="space-y-2.5"
              initial={reduced ? false : 'hidden'}
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {hooks.map((hook) => (
                <motion.li
                  key={hook.id}
                  variants={fadeUp}
                  transition={transition}
                  layout
                  className="dashboard-ws-hook-card flex flex-col gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-zinc-200">{hook.text}</p>
                    <p className="mt-1.5 text-[11px] font-semibold text-violet-400">
                      CTR-Score · {hook.ctrScore}/100
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => void copyHook(hook.text)}
                  >
                    Kopieren
                  </Button>
                </motion.li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>

        {!loading && hooks.length === 0 ? (
          <p className="text-center text-xs text-zinc-600">
            Nische wählen und Hooks generieren — Ergebnisse erscheinen hier.
          </p>
        ) : null}
      </div>
    </WorkspaceSection>
  )
}
