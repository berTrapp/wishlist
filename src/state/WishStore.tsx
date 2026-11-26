import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as remote from '../data/remote'
import { sampleProfile, sampleWishes } from '../data/sample'
import type { Profile, Shape, StoreName, Wish } from '../data/types'
import { supabase } from '../lib/supabase'

// Estado dos desejos. Dois modos com a mesma interface:
// - demo: dados de exemplo salvos só no navegador (vitrine do portfólio, sem conta);
// - cloud: dados do usuário logado no Supabase.

const KEY = 'wishlist:v1'
/** Tempo simulado de geração do modelo 3D (a geração real entra na fase 3) */
const MODEL_GEN_MS = 9000

export type Mode = 'demo' | 'cloud'

export interface NewWish {
  name: string
  category: string
  priority: Wish['priority']
  store: StoreName
  price: number
}

interface Store {
  mode: Mode
  loading: boolean
  error: string | null
  profile: Profile
  wishes: Wish[]
  setSurplus: (v: number) => void
  setReserve: (id: string, pct: number) => void
  addDeposit: (id: string, amount: number) => Promise<void>
  addWish: (w: NewWish) => Promise<string>
  /** Demo: volta aos exemplos. Cloud: grava os exemplos na conta. */
  loadExamples: () => Promise<void>
  dismissError: () => void
}

const Ctx = createContext<Store | null>(null)

function loadLocal(): { profile: Profile; wishes: Wish[] } {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* sem armazenamento: usa os exemplos */
  }
  return { profile: sampleProfile, wishes: sampleWishes }
}

function guessShape(category: string, name: string): Shape {
  const t = (category + ' ' + name).toLowerCase()
  if (/fone|headphone|áudio|audio/.test(t)) return 'headphones'
  if (/câmera|camera|foto/.test(t)) return 'camera'
  if (/teclado|keyboard/.test(t)) return 'keyboard'
  if (/cadeira|chair/.test(t)) return 'chair'
  return 'generic'
}

function newWishFrom(n: NewWish): Omit<Wish, 'id' | 'createdAt'> {
  const today = new Date().toISOString().slice(0, 10)
  return {
    name: n.name,
    short: n.name.split(' ').slice(0, 2).join(' '),
    category: n.category || 'Outros',
    priority: n.priority,
    notes: '',
    shape: guessShape(n.category, n.name),
    modelStatus: 'queued',
    reservePct: 20,
    deposits: [],
    offers: [{ store: n.store, url: '', card: n.price, pix: n.price, shipping: 0, interestFreeInstallments: 1, updatedAt: today, history: [n.price] }],
  }
}

const message = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String(e.message) : 'Erro desconhecido')

export function WishProvider({ mode, userId, children }: { mode: Mode; userId?: string; children: ReactNode }) {
  const db = mode === 'cloud' ? supabase : null
  const [state, setState] = useState(() => (mode === 'demo' ? loadLocal() : { profile: sampleProfile, wishes: [] as Wish[] }))
  const [loading, setLoading] = useState(mode === 'cloud')
  const [error, setError] = useState<string | null>(null)
  const fail = useCallback((e: unknown) => setError(`Não foi possível salvar: ${message(e)}`), [])

  // Carrega do Supabase
  const reload = useCallback(async () => {
    if (!db || !userId) return
    try {
      setState(await remote.fetchAll(db, userId))
      setError(null)
    } catch (e) {
      setError(`Não foi possível carregar seus desejos: ${message(e)}`)
    } finally {
      setLoading(false)
    }
  }, [db, userId])
  useEffect(() => {
    reload()
  }, [reload])

  // Salva a demonstração no navegador
  useEffect(() => {
    if (mode !== 'demo') return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignora */
    }
  }, [state, mode])

  // Simula a fila de geração de modelos 3D em segundo plano
  const pending = state.wishes
    .filter((w) => w.modelStatus === 'queued' || w.modelStatus === 'generating')
    .map((w) => w.id)
    .join(',')
  useEffect(() => {
    if (!pending) return
    const ids = pending.split(',')
    const toGen = setTimeout(() => {
      setState((s) => ({ ...s, wishes: s.wishes.map((w) => (ids.includes(w.id) && w.modelStatus === 'queued' ? { ...w, modelStatus: 'generating' } : w)) }))
    }, 1200)
    const toReady = setTimeout(() => {
      setState((s) => ({ ...s, wishes: s.wishes.map((w) => (ids.includes(w.id) ? { ...w, modelStatus: 'ready' } : w)) }))
      if (db) remote.saveModelStatus(db, ids, 'ready').catch(fail)
    }, MODEL_GEN_MS)
    return () => {
      clearTimeout(toGen)
      clearTimeout(toReady)
    }
  }, [pending, db, fail])

  // A sobra é digitada; grava no banco só depois de uma pausa
  const surplusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const setSurplus = useCallback(
    (v: number) => {
      setState((s) => ({ ...s, profile: { ...s.profile, monthlySurplus: v } }))
      if (!db || !userId) return
      clearTimeout(surplusTimer.current)
      surplusTimer.current = setTimeout(() => remote.saveSurplus(db, userId, v).catch(fail), 600)
    },
    [db, userId, fail],
  )

  const reserveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const setReserve = useCallback(
    (id: string, pct: number) => {
      setState((s) => ({ ...s, wishes: s.wishes.map((w) => (w.id === id ? { ...w, reservePct: pct } : w)) }))
      if (!db) return
      clearTimeout(reserveTimers.current.get(id))
      reserveTimers.current.set(
        id,
        setTimeout(() => remote.saveReserve(db, id, pct).catch(fail), 400),
      )
    },
    [db, fail],
  )

  const addDeposit = useCallback(
    async (id: string, amount: number) => {
      const local = { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), amount }
      const dep = db ? await remote.insertDeposit(db, id, amount).catch((e) => (fail(e), null)) : local
      if (!dep) return
      setState((s) => ({ ...s, wishes: s.wishes.map((w) => (w.id === id ? { ...w, deposits: [...w.deposits, dep] } : w)) }))
    },
    [db, fail],
  )

  const addWish = useCallback(
    async (n: NewWish) => {
      const base = newWishFrom(n)
      if (db) {
        const id = await remote.insertWish(db, base)
        await reload()
        return id
      }
      const id = n.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
      setState((s) => ({ ...s, wishes: [...s.wishes, { ...base, id, createdAt: new Date().toISOString().slice(0, 10) }] }))
      return id
    },
    [db, reload],
  )

  const loadExamples = useCallback(async () => {
    if (!db) {
      setState({ profile: sampleProfile, wishes: sampleWishes })
      return
    }
    setLoading(true)
    try {
      for (const w of sampleWishes) await remote.insertWish(db, w)
    } catch (e) {
      fail(e)
    }
    await reload()
  }, [db, reload, fail])

  const value = useMemo<Store>(
    () => ({ mode, loading, error, ...state, setSurplus, setReserve, addDeposit, addWish, loadExamples, dismissError: () => setError(null) }),
    [mode, loading, error, state, setSurplus, setReserve, addDeposit, addWish, loadExamples],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWishes(): Store {
  const v = useContext(Ctx)
  if (!v) throw new Error('useWishes precisa estar dentro de <WishProvider>')
  return v
}
