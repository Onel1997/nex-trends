import { NextResponse, type NextRequest } from 'next/server'

function readEnv(key: string): string | undefined {
  try {
    const value = process.env?.[key]
    return typeof value === 'string' && value.trim() ? value.trim() : undefined
  } catch {
    return undefined
  }
}

/**
 * Lightweight session refresh — inlined to keep the Edge bundle minimal.
 * Skips Supabase entirely when env vars are missing.
 */
export async function middleware(request: NextRequest) {
  try {
    const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL') ?? readEnv('VITE_SUPABASE_URL')
    const supabaseAnonKey =
      readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? readEnv('VITE_SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.next()
    }

    const { createServerClient } = await import('@supabase/ssr')

    let response = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          if (!cookiesToSet?.length) return
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    await supabase.auth.getUser()
    return response
  } catch (error) {
    console.error('[middleware] Unhandled error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.[\\w]+$).*)',
  ],
}
