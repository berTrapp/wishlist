import type { SupabaseClient } from '@supabase/supabase-js'
import type { Deposit, ModelStatus, Offer, Priority, Profile, Shape, StoreName, Wish } from './types'

// Leitura e escrita no Supabase. As tabelas estão em supabase/migrations.

interface OfferRow {
  id: string
  store: StoreName
  url: string
  card: number
  pix: number
  shipping: number
  interest_free_installments: number
  updated_at: string
  price_history: { price: number; recorded_at: string }[]
}
interface WishRow {
  id: string
  name: string
  short: string
  category: string
  priority: Priority
  notes: string
  shape: Shape
  model_status: ModelStatus
  reserve_pct: number
  created_at: string
  offers: OfferRow[]
  deposits: { id: string; amount: number; deposited_at: string; note: string | null }[]
}

const n = (v: unknown) => Number(v)

function toOffer(r: OfferRow): Offer {
  const history = [...r.price_history].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at)).map((h) => n(h.price))
  return {
    store: r.store,
    url: r.url,
    card: n(r.card),
    pix: n(r.pix),
    shipping: n(r.shipping),
    interestFreeInstallments: r.interest_free_installments,
    updatedAt: r.updated_at.slice(0, 10),
    history: history.length ? history : [n(r.pix)],
  }
}

function toWish(r: WishRow): Wish {
  return {
    id: r.id,
    name: r.name,
    short: r.short,
    category: r.category,
    priority: r.priority,
    notes: r.notes,
    shape: r.shape,
    modelStatus: r.model_status,
    reservePct: r.reserve_pct,
    createdAt: r.created_at.slice(0, 10),
    offers: r.offers.map(toOffer),
    deposits: r.deposits
      .map<Deposit>((d) => ({ id: d.id, amount: n(d.amount), date: d.deposited_at, note: d.note ?? undefined }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

export async function fetchAll(db: SupabaseClient, userId: string): Promise<{ profile: Profile; wishes: Wish[] }> {
  const [p, w] = await Promise.all([
    db.from('profiles').select('name, monthly_surplus').eq('id', userId).maybeSingle(),
    db
      .from('wishes')
      .select(
        'id, name, short, category, priority, notes, shape, model_status, reserve_pct, created_at, offers(id, store, url, card, pix, shipping, interest_free_installments, updated_at, price_history(price, recorded_at)), deposits(id, amount, deposited_at, note)',
      )
      .eq('status', 'active')
      .order('created_at'),
  ])
  if (p.error) throw p.error
  if (w.error) throw w.error
  return {
    profile: { name: p.data?.name ?? 'Você', monthlySurplus: n(p.data?.monthly_surplus ?? 1800) },
    wishes: (w.data as unknown as WishRow[]).filter((r) => r.offers.length > 0).map(toWish),
  }
}

export async function saveSurplus(db: SupabaseClient, userId: string, value: number) {
  const { error } = await db.from('profiles').update({ monthly_surplus: value }).eq('id', userId)
  if (error) throw error
}

export async function saveReserve(db: SupabaseClient, wishId: string, pct: number) {
  const { error } = await db.from('wishes').update({ reserve_pct: pct }).eq('id', wishId)
  if (error) throw error
}

export async function saveModelStatus(db: SupabaseClient, wishIds: string[], status: ModelStatus) {
  const { error } = await db.from('wishes').update({ model_status: status }).in('id', wishIds)
  if (error) throw error
}

export async function insertDeposit(db: SupabaseClient, wishId: string, amount: number): Promise<Deposit> {
  const { data, error } = await db.from('deposits').insert({ wish_id: wishId, amount }).select('id, amount, deposited_at').single()
  if (error) throw error
  return { id: data.id, amount: n(data.amount), date: data.deposited_at }
}

/** Grava um desejo completo (com ofertas, histórico e depósitos). Usado ao criar e ao carregar os exemplos. */
export async function insertWish(db: SupabaseClient, w: Omit<Wish, 'id' | 'createdAt'>): Promise<string> {
  const { data: wish, error } = await db
    .from('wishes')
    .insert({
      name: w.name,
      short: w.short,
      category: w.category,
      priority: w.priority,
      notes: w.notes,
      shape: w.shape,
      model_status: w.modelStatus,
      reserve_pct: w.reservePct,
    })
    .select('id')
    .single()
  if (error) throw error

  for (const o of w.offers) {
    const { data: offer, error: e1 } = await db
      .from('offers')
      .insert({
        wish_id: wish.id,
        store: o.store,
        url: o.url,
        card: o.card,
        pix: o.pix,
        shipping: o.shipping,
        interest_free_installments: o.interestFreeInstallments,
      })
      .select('id')
      .single()
    if (e1) throw e1
    const today = new Date()
    const rows = o.history.map((price, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (o.history.length - 1 - i), 1)
      return { offer_id: offer.id, price, recorded_at: d.toISOString().slice(0, 10) }
    })
    const { error: e2 } = await db.from('price_history').insert(rows)
    if (e2) throw e2
  }
  if (w.deposits.length) {
    const { error: e3 } = await db.from('deposits').insert(w.deposits.map((d) => ({ wish_id: wish.id, amount: d.amount, deposited_at: d.date })))
    if (e3) throw e3
  }
  return wish.id
}
