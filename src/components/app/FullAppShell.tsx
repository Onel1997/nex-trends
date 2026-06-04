'use client'

import { StrictMode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { AppBootstrapSkeleton } from '@/components/ui/loading-states'

const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => <AppBootstrapSkeleton />,
})

/** Full NexTrends SPA — opt-in via NEXT_PUBLIC_FULL_APP=true */
export default function FullAppShell() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (localStorage.getItem('nextrends_reduced_motion') === '1') {
        document.documentElement.classList.add('nex-reduced-motion')
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [])

  if (!mounted) {
    return <AppBootstrapSkeleton />
  }

  return (
    <StrictMode>
      <App />
    </StrictMode>
  )
}
