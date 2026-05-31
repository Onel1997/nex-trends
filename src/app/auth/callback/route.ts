import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { readEnv } from '@/lib/env'

const AUTH_LOGIN_PATH = '/login'
const AUTH_SUCCESS_PATH = '/dashboard'

function loginRedirect(origin: string, message?: string | null) {
  const url = new URL(AUTH_LOGIN_PATH, origin)
  if (message) {
    url.searchParams.set('error', message)
  }
  return NextResponse.redirect(url)
}

/**
 * Supabase OAuth callback — exchanges PKCE code for a session (cookie-based via @supabase/ssr).
 * Must be listed in Supabase Auth → URL Configuration → Redirect URLs.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = request.nextUrl

    const oauthError =
      searchParams.get('error_description') ?? searchParams.get('error')
    if (oauthError) {
      return loginRedirect(origin, oauthError)
    }

    const code = searchParams.get('code')
    if (!code) {
      return loginRedirect(origin, 'Kein Autorisierungscode erhalten.')
    }

    const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL')
    const supabaseAnonKey = readEnv(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_ANON_KEY',
    )

    if (!supabaseUrl || !supabaseAnonKey) {
      return loginRedirect(origin, 'Supabase ist nicht konfiguriert.')
    }

    let response = NextResponse.redirect(new URL(AUTH_SUCCESS_PATH, origin))

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet?.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return loginRedirect(origin, error.message)
    }

    return response
  } catch (error) {
    console.error('[auth/callback] OAuth exchange failed:', error)
    const origin = request.nextUrl.origin
    return loginRedirect(origin, 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.')
  }
}
