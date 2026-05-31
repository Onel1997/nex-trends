'use client'

import { StrictMode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/Spinner'

const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-svh items-center justify-center ambient-glow bg-zinc-950">
      <Spinner size="lg" label="NexTrends wird geladen …" />
    </div>
  ),
})

export default function AppPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem('nextrends_reduced_motion') === '1') {
      document.documentElement.classList.add('nex-reduced-motion')
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-svh items-center justify-center ambient-glow bg-zinc-950">
        <Spinner size="lg" label="NexTrends wird geladen …" />
      </div>
    )
  }

  return (
    <StrictMode>
      <App />
    </StrictMode>
  )
}
