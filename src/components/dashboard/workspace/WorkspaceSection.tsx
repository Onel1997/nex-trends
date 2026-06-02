'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib'
import { fadeUp, useWorkspaceMotion } from '@/components/dashboard/workspace/motion'

type WorkspaceSectionProps = {
  id?: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}

export function WorkspaceSection({
  id,
  title,
  description,
  action,
  children,
  className,
  delay = 0,
}: WorkspaceSectionProps) {
  const { reduced, transition } = useWorkspaceMotion()

  return (
    <motion.section
      id={id}
      className={cn('dashboard-ws-section', className)}
      initial={reduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-4% 0px' }}
      variants={fadeUp}
      transition={{ ...transition, delay }}
    >
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-2.5 sm:mb-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100 sm:text-[0.9375rem]">
            {title}
          </h2>
          {description ? (
            <p className="dashboard-os-muted mt-0.5 max-w-xl text-[11px] leading-relaxed sm:text-xs">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="dashboard-ws-panel nex-card-interactive rounded-2xl border border-zinc-800/60 bg-zinc-900/35 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(139,92,246,0.05)] backdrop-blur-xl sm:p-5">
        {children}
      </div>
    </motion.section>
  )
}
