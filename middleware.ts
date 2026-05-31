import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    console.error('[middleware] Unhandled error:', error)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    /*
     * Skip static assets, Next internals, and public files with extensions.
     * Prevents middleware from running on favicon, images, videos, etc.
     */
    '/((?!_next/static|_next/image|.*\\.[\\w]+$).*)',
  ],
}
