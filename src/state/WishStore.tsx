import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { sampleProfile, sampleWishes } from '../data/sample'
import type { Profile, Shape, StoreName, Wish } from '../data/types'

// Estado local da fase 1 (dados de exemplo salvos no navegador).
// Na fase 2 este módulo passa a ler e gravar no Supabase com a mesma interface.

const KEY = 'wishlist:v1'
/** Tempo simulado de geração do modelo 3D na demonstração */
const MODEL_GEN_MS = 9000

interface NewWish {
  name: string
  category: string
  priority: Wish['priority']
  store: StoreName
  price: number
}

interface Store {
  profile: Profile
  wishes: Wish[]
  setSurplus: (v: number) => void
  setReserve: (id: string, pct: number) => void
  addDeposit: (id: string, amount: number) => void
  addWish: (w: NewWish) => string
  resetDemo: () => void
}

const Ctx = createContext<Store | null>(null)

function load(): { profile: Profile; wishes: Wish[] } {
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

export function WishProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignora */
    }
  }, [state])

  // Simula a fila de geração de modelos 3D em segundo plano
  const pending = state.wishes.filter((w) => w.modelStatus === 'queued' || w.modelStatus === 'generating').map((w) => w.id).join(',')
  useEffect(() => {
    if (!pending) return
    const ids = pending.split(',')
    const toGen = setTimeout(() => {
      setState((s) => ({ ...s, wishes: s.wishes.map((w) => (ids.includes(w.id) && w.modelStatus === 'queued' ? { ...w, modelStatus: 'generating' } : w)) }))
    }, 1200)
    const toReady = setTimeout(() => {
      setState((s) => ({ ...s, wishes: s.wishes.map((w) => (ids.includes(w.id) ? { ...w, modelStatus: 'ready' } : w)) }))
    }, MODEL_GEN_MS)
    return () => {
      clearTimeout(toGen)
      clearTimeout(toReady)
    }
  }, [pending])

  const setSurplus = useCallback((v: number) => setState((s) => ({ ...s, profile: { ...s.profile, monthlySurplus: v } })), [])
  const setReserve = useCallback(
    (id: string, pct: number) => setState((s) => ({ ...s, wishes: s.wishes.map((w) => (w.id === id ? { ...w, reservePct: pct } : w)) })),
    [],
  )
  const addDeposit = useCallback(
    (id: string, amount: number) =>
      setState((s) => ({
        ...s,
        wishes: s.wishes.map((w) =>
          w.id === id
            ? { ...w, deposits: [...w.deposits, { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), amount }] }
            : w,
        ),
      })),
    [],
  )
  const addWish = useCallback((n: NewWish) => {
    const id = n.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
    const today = new Date().toISOString().slice(0, 10)
    const wish: Wish = {
      id,
      name: n.name,
      short: n.name.split(' ').slice(0, 2).join(' '),
      category: n.category || 'Outros',
      priority: n.priority,
      notes: '',
      shape: guessShape(n.category, n.name),
      modelStatus: 'queued',
      reservePct: 20,
      createdAt: today,
      deposits: [],
      offers: [
        { store: n.store, url: '', card: n.price, pix: n.price, shipping: 0, interestFreeInstallments: 1, updatedAt: today, history: [n.price] },
      ],
    }
    setState((s) => ({ ...s, wishes: [...s.wishes, wish] }))
    return id
  }, [])
  const resetDemo = useCallback(() => setState({ profile: sampleProfile, wishes: sampleWishes }), [])

  const value = useMemo<Store>(
    () => ({ ...state, setSurplus, setReserve, addDeposit, addWish, resetDemo }),
    [state, setSurplus, setReserve, addDeposit, addWish, resetDemo],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWishes(): Store {
  const v = useContext(Ctx)
  if (!v) throw new Error('useWishes precisa estar dentro de <WishProvider>')
  return v
}
