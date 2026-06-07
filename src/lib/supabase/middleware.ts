import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { readEnv } from '@/lib/env'

const AUTH_LOGIN_PATH = '/login'
const AUTH_CALLBACK_PATH = '/auth/callback'
const DASHBOARD_PREFIX = '/dashboard'

const PROTECTED_APP_PATHS = ['/ai-studio', '/my-videos'] as const

function isProtectedPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return (
    normalized === DASHBOARD_PREFIX ||
    normalized.startsWith(`${DASHBOARD_PREFIX}/`) ||
    PROTECTED_APP_PATHS.some((p) => normalized === p || normalized.startsWith(`${p}/`)) ||
    normalized === '/billing/success' ||
    normalized === '/billing/cancel'
  )
}

function isPublicAuthPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return normalized === AUTH_LOGIN_PATH || normalized === AUTH_CALLBACK_PATH
}

/** OAuth returned to Site URL (`/?code=`) — forward to `/auth/callback` for session exchange. */
function shouldForwardOAuthToCallback(
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized === AUTH_CALLBACK_PATH) return false
  return (
    searchParams.has('code') ||
    searchParams.has('error') ||
    searchParams.has('error_description')
  )
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname

  // Always forward OAuth params — does not require Supabase env on the Edge.
  if (shouldForwardOAuthToCallback(pathname, request.nextUrl.searchParams)) {
    const callbackUrl = request.nextUrl.clone()
    callbackUrl.pathname = AUTH_CALLBACK_PATH
    return NextResponse.redirect(callbackUrl)
  }

  const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL')
  const supabaseAnonKey = readEnv(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_ANON_KEY',
  )

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          if (!cookiesToSet?.length) return

          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isProtectedPath(pathname) && !user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = AUTH_LOGIN_PATH
      loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
      loginUrl.searchParams.delete('code')
      loginUrl.searchParams.delete('state')
      return NextResponse.redirect(loginUrl)
    }

    if (user && (pathname.replace(/\/$/, '') || '/') === '/') {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = DASHBOARD_PREFIX
      dashboardUrl.search = ''
      return NextResponse.redirect(dashboardUrl)
    }

    if (user && pathname.replace(/\/$/, '') === AUTH_LOGIN_PATH) {
      const next = request.nextUrl.searchParams.get('next')
      const destination =
        next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = destination.split('?')[0] ?? '/dashboard'
      dashboardUrl.search = ''
      return NextResponse.redirect(dashboardUrl)
    }
  } catch (error) {
    console.error('[middleware] Supabase session refresh failed:', error)

    if (isProtectedPath(pathname) && !isPublicAuthPath(pathname)) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = AUTH_LOGIN_PATH
      return NextResponse.redirect(loginUrl)
    }
  }

  return supabaseResponse
}
