import type { ReactNode } from 'react'

type ProtectedToolProps = {
  children: ReactNode
  title?: string
  className?: string
}

/** @deprecated All tools are credit-gated; wrapper is a pass-through for compatibility. */
export function ProtectedTool({ children }: ProtectedToolProps) {
  return <>{children}</>
}
