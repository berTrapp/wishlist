import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** Cliente do Supabase, ou null quando o app roda só em modo demonstração (sem variáveis de ambiente) */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null
