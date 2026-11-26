import type { Offer, Wish } from '../data/types'

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const brl2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Juros do cartão parcelado com juros usados na simulação (1,99% a.m.) */
export const CARD_INTEREST = 0.0199

export const pixTotal = (o: Offer) => o.pix + o.shipping
export const cardTotal = (o: Offer) => o.card + o.shipping

export function bestOffer(w: Wish): Offer {
  return w.offers.reduce((best, o) => (pixTotal(o) < pixTotal(best) ? o : best), w.offers[0])
}

export const bestPrice = (w: Wish) => pixTotal(bestOffer(w))
export const savedTotal = (w: Wish) => w.deposits.reduce((s, d) => s + d.amount, 0)
export const monthlyReserve = (w: Wish, surplus: number) => Math.max(1, (surplus * w.reservePct) / 100)

export function monthsLeft(w: Wish, surplus: number): number {
  const missing = bestPrice(w) - savedTotal(w)
  if (missing <= 0) return 0
  return Math.ceil(missing / monthlyReserve(w, surplus))
}

export function progress(w: Wish): number {
  return Math.min(1, savedTotal(w) / bestPrice(w))
}

export function monthLabel(offset: number, from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth() + offset, 1)
  return `${MONTHS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
}

export function monthLabelFromIso(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]}/${String(y).slice(2)}`
}

/** Parcela fixa (tabela Price) */
export function installment(pv: number, n: number, rate: number): number {
  return (pv * rate) / (1 - Math.pow(1 + rate, -n))
}

/** Variação do menor preço entre o primeiro e o último mês do histórico */
export function priceTrend(w: Wish): number {
  const o = bestOffer(w)
  const h = o.history
  return (h[h.length - 1] - h[0]) / h[0]
}

export function pct(v: number): string {
  const n = v * 100
  return n.toLocaleString('pt-BR', { maximumFractionDigits: n < 10 ? 1 : 0 }) + '%'
}

export type Load = 'ok' | 'mid' | 'hi'
/** Peso de uma parcela na sobra: verde até 30%, amarelo até 60%, vermelho acima */
export const loadOf = (share: number): Load => (share <= 0.3 ? 'ok' : share <= 0.6 ? 'mid' : 'hi')
