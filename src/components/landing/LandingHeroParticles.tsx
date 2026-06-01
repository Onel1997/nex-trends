'use client'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const PARTICLES = [
  { top: '14%', left: '10%', delay: '0s', size: 'sm' as const },
  { top: '58%', left: '18%', delay: '-2.5s', size: 'xs' as const },
  { top: '24%', left: '72%', delay: '-5s', size: 'sm' as const },
  { top: '68%', left: '82%', delay: '-7s', size: 'xs' as const, accent: true },
  { top: '38%', left: '48%', delay: '-9s', size: 'xs' as const },
  { top: '78%', left: '6%', delay: '-11s', size: 'sm' as const },
] as const

/** Lightweight hero particles — transform/opacity only for GPU-friendly motion. */
export function LandingHeroParticles() {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) return null

  return (
    <div className="landing-hero-particles pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={[
            'landing-hero-particle',
            p.size === 'xs' && 'landing-hero-particle--xs',
            'accent' in p && p.accent && 'landing-hero-particle--accent',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            top: p.top,
            left: p.left,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
