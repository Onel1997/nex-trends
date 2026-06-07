'use client'

import { AuthReturnHandler } from '@/components/auth/AuthReturnHandler'

/** @deprecated Vite SPA route — Next.js uses app/auth/callback/page.tsx */
export function AuthCallbackPage() {
  return <AuthReturnHandler />
}
