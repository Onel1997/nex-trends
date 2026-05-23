import { supabase } from '@/lib/supabase'

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}

export function scrollToLogin() {
  document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })
}
