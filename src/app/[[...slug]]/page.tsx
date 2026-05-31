'use client'

import { StrictMode, useEffect } from 'react'
import App from '@/App'

export default function AppPage() {
  useEffect(() => {
    if (localStorage.getItem('nextrends_reduced_motion') === '1') {
      document.documentElement.classList.add('nex-reduced-motion')
    }
  }, [])

  return (
    <StrictMode>
      <App />
    </StrictMode>
  )
}
