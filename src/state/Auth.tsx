import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Sessão atual do Supabase. `undefined` enquanto carrega. */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(supabase ? undefined : null)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  return session
}

const DEMO_KEY = 'wishlist:demo'
export function getDemoChoice(): boolean {
  try {
    return sessionStorage.getItem(DEMO_KEY) === '1'
  } catch {
    return false
  }
}
export function setDemoChoice(on: boolean) {
  try {
    if (on) sessionStorage.setItem(DEMO_KEY, '1')
    else sessionStorage.removeItem(DEMO_KEY)
  } catch {
    /* ignora */
  }
}
