import { NextResponse, type NextRequest } from 'next/server'

/** Passthrough only — no Supabase session refresh (avoids Edge/runtime crashes). */
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.[\\w]+$).*)',
  ],
}
