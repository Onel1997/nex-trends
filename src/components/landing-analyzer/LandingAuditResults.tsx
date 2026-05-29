import { memo, useEffect, useState } from 'react'
import { LandingAuditCategoryGrid } from '@/components/landing-analyzer/LandingAuditCategoryGrid'
import { LandingAuditList } from '@/components/landing-analyzer/LandingAuditList'
import { LandingAuditScoreHero } from '@/components/landing-analyzer/LandingAuditScoreHero'
import type { LandingAuditResult } from '@/lib/landing-page-analyzer'

type LandingAuditResultsProps = {
  result: LandingAuditResult
}

function LandingAuditResultsInner({ result }: LandingAuditResultsProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [result.overallScore])

  return (
    <div className="lp-audit-results space-y-4 sm:space-y-5">
      <LandingAuditScoreHero result={result} />
      <LandingAuditCategoryGrid categories={result.categories} animate={animate} />
      <LandingAuditList
        title="Strengths"
        items={result.strengths}
        variant="success"
        index={0}
        animate={animate}
      />
      <LandingAuditList
        title="Improvements"
        items={result.improvements}
        variant="default"
        index={1}
        animate={animate}
      />
      <LandingAuditList
        title="Quick wins (24h)"
        items={result.quickWins}
        variant="accent"
        index={2}
        animate={animate}
      />
    </div>
  )
}

export const LandingAuditResults = memo(LandingAuditResultsInner)
