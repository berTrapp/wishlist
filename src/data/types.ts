export type Priority = 'alta' | 'media' | 'baixa'
export type Shape = 'headphones' | 'camera' | 'keyboard' | 'chair' | 'generic'
export type ModelStatus = 'queued' | 'generating' | 'ready' | 'failed'
export type StoreName = 'Amazon' | 'Mercado Livre' | 'Shopee' | 'Magazine Luiza' | 'TikTok Shop'

export interface Offer {
  store: StoreName
  url: string
  card: number
  pix: number
  shipping: number
  interestFreeInstallments: number
  updatedAt: string
  /** Menor preço lido em cada um dos últimos meses, do mais antigo ao mais recente */
  history: number[]
}

export interface Deposit {
  id: string
  date: string
  amount: number
  note?: string
}

export interface Wish {
  id: string
  name: string
  short: string
  category: string
  priority: Priority
  notes: string
  shape: Shape
  modelStatus: ModelStatus
  /** Quanto da sobra mensal vai para este item, em % */
  reservePct: number
  offers: Offer[]
  deposits: Deposit[]
  createdAt: string
}

export interface Profile {
  name: string
  monthlySurplus: number
}
