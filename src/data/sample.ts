import type { Profile, Wish } from './types'

// Dados de exemplo para a fase 1. Na fase 2 eles saem daqui e passam a vir do Supabase.

export const sampleProfile: Profile = { name: 'Você', monthlySurplus: 1800 }

const upd = '2026-11-26'

export const sampleWishes: Wish[] = [
  {
    id: 'fone-anc',
    name: 'Fone over-ear com cancelamento de ruído',
    short: 'Fone ANC',
    category: 'Áudio',
    priority: 'alta',
    notes: 'Para trabalhar focado e ouvir música no ônibus.',
    shape: 'headphones',
    modelStatus: 'ready',
    reservePct: 35,
    createdAt: '2026-08-10',
    deposits: [
      { id: 'd1', date: '2026-09-05', amount: 400 },
      { id: 'd2', date: '2026-10-05', amount: 450 },
      { id: 'd3', date: '2026-11-05', amount: 500 },
    ],
    offers: [
      { store: 'Amazon', url: 'https://www.amazon.com.br', card: 2199, pix: 2089, shipping: 0, interestFreeInstallments: 10, updatedAt: upd, history: [2499, 2449, 2399, 2299, 2349, 2199] },
      { store: 'Mercado Livre', url: 'https://www.mercadolivre.com.br', card: 2149, pix: 2149, shipping: 29.9, interestFreeInstallments: 12, updatedAt: upd, history: [2399, 2399, 2299, 2249, 2199, 2149] },
      { store: 'Magazine Luiza', url: 'https://www.magazineluiza.com.br', card: 2249, pix: 2024, shipping: 0, interestFreeInstallments: 10, updatedAt: upd, history: [2599, 2499, 2449, 2399, 2299, 2249] },
      { store: 'Shopee', url: 'https://shopee.com.br', card: 2299, pix: 2299, shipping: 19.9, interestFreeInstallments: 6, updatedAt: upd, history: [2499, 2499, 2399, 2399, 2349, 2299] },
    ],
  },
  {
    id: 'teclado-75',
    name: 'Teclado mecânico 75% sem fio',
    short: 'Teclado 75%',
    category: 'Setup',
    priority: 'media',
    notes: 'Upgrade do setup de programação.',
    shape: 'keyboard',
    modelStatus: 'ready',
    reservePct: 15,
    createdAt: '2026-10-01',
    deposits: [{ id: 'd4', date: '2026-11-05', amount: 150 }],
    offers: [
      { store: 'Amazon', url: 'https://www.amazon.com.br', card: 649, pix: 617, shipping: 0, interestFreeInstallments: 6, updatedAt: upd, history: [749, 729, 699, 719, 689, 649] },
      { store: 'Mercado Livre', url: 'https://www.mercadolivre.com.br', card: 629, pix: 629, shipping: 0, interestFreeInstallments: 10, updatedAt: upd, history: [699, 699, 679, 669, 649, 629] },
      { store: 'TikTok Shop', url: 'https://www.tiktok.com', card: 599, pix: 599, shipping: 24.9, interestFreeInstallments: 3, updatedAt: upd, history: [689, 669, 659, 649, 629, 599] },
    ],
  },
  {
    id: 'camera-mirrorless',
    name: 'Câmera mirrorless 24 MP com lente 18-55',
    short: 'Câmera',
    category: 'Foto e vídeo',
    priority: 'media',
    notes: 'Para fotos de viagem e vídeos do portfólio.',
    shape: 'camera',
    modelStatus: 'ready',
    reservePct: 30,
    createdAt: '2026-07-20',
    deposits: [
      { id: 'd5', date: '2026-08-05', amount: 300 },
      { id: 'd6', date: '2026-09-05', amount: 500 },
      { id: 'd7', date: '2026-10-05', amount: 540 },
      { id: 'd8', date: '2026-11-05', amount: 540 },
    ],
    offers: [
      { store: 'Amazon', url: 'https://www.amazon.com.br', card: 5899, pix: 5604, shipping: 0, interestFreeInstallments: 10, updatedAt: upd, history: [6299, 6499, 6199, 5999, 6099, 5899] },
      { store: 'Mercado Livre', url: 'https://www.mercadolivre.com.br', card: 5749, pix: 5749, shipping: 0, interestFreeInstallments: 12, updatedAt: upd, history: [6199, 6099, 5999, 5899, 5799, 5749] },
      { store: 'Magazine Luiza', url: 'https://www.magazineluiza.com.br', card: 6199, pix: 5579, shipping: 0, interestFreeInstallments: 12, updatedAt: upd, history: [6499, 6499, 6299, 6299, 6199, 6199] },
    ],
  },
  {
    id: 'cadeira-ergonomica',
    name: 'Cadeira ergonômica com apoio lombar',
    short: 'Cadeira',
    category: 'Setup',
    priority: 'baixa',
    notes: 'Para aguentar as horas de código.',
    shape: 'chair',
    modelStatus: 'generating',
    reservePct: 10,
    createdAt: '2026-11-25',
    deposits: [],
    offers: [
      { store: 'Mercado Livre', url: 'https://www.mercadolivre.com.br', card: 1899, pix: 1804, shipping: 0, interestFreeInstallments: 10, updatedAt: upd, history: [2099, 1999, 1999, 1949, 1899, 1899] },
      { store: 'Shopee', url: 'https://shopee.com.br', card: 1799, pix: 1799, shipping: 49.9, interestFreeInstallments: 6, updatedAt: upd, history: [1899, 1899, 1849, 1849, 1799, 1799] },
    ],
  },
]
