'use client'

import { useReducedMotion } from 'framer-motion'

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
}

export function useWorkspaceMotion() {
  const reduced = useReducedMotion()
  const transition = reduced ? { duration: 0 } : { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const }
  const spring = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 32 }

  return { reduced, transition, spring }
}
