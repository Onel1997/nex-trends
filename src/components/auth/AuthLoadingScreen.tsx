'use client'

import { motion } from 'framer-motion'
import { AuthPanelSkeleton } from '@/components/ui/loading-states'
import { cn } from '@/lib'

type AuthLoadingScreenProps = {
  title?: string
  subtitle?: string
  className?: string
}

export function AuthLoadingScreen({
  title = 'Anmeldung wird vorbereitet …',
  subtitle = 'Einen Moment — du wirst gleich weitergeleitet.',
  className,
}: AuthLoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
    >
      <AuthPanelSkeleton title={title} subtitle={subtitle} />
    </motion.div>
  )
}
