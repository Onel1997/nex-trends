'use client'

import { AppProviders } from '@/components/app/AppProviders'
import { HomePage } from '@/views/HomePage'

export default function App() {
  return (
    <AppProviders>
      <HomePage />
    </AppProviders>
  )
}
