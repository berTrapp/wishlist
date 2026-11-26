import type { StoreName } from '../data/types'

/** O que o botão "Salvar na WishList" lê da página da loja */
export interface Captured {
  store: StoreName
  url: string
  name?: string
  price?: number
  image?: string
}

const KEY = 'wishlist:captured'

/**
 * Roda na página da loja, no navegador da própria pessoa (as lojas bloqueiam leitura vinda de servidores).
 * Precisa ser autocontida: vira texto dentro do favorito.
 */
function capture(app: string) {
  const h = location.hostname
  const store = /amazon\.|amzn\./.test(h)
    ? 'Amazon'
    : /mercadoli(vre|bre)\./.test(h)
      ? 'Mercado Livre'
      : /shopee\./.test(h)
        ? 'Shopee'
        : /magazineluiza\.|magalu\./.test(h)
          ? 'Magazine Luiza'
          : /tiktok\./.test(h)
            ? 'TikTok Shop'
            : ''
  if (!store) {
    alert('Abra a página de um produto da Amazon, Mercado Livre, Shopee, Magalu ou TikTok Shop e clique de novo.')
    return
  }
  const txt = (sel: string) => (document.querySelector(sel) as HTMLElement | null)?.innerText?.trim() || ''
  const attr = (sel: string, a: string) => document.querySelector(sel)?.getAttribute(a) || ''
  const num = (v: unknown) => {
    if (typeof v === 'number') return v > 0 ? v : undefined
    const s = String(v || '').replace(/[^\d.,]/g, '')
    if (!s) return
    const n = /,\d{1,2}$/.test(s) ? parseFloat(s.replace(/\./g, '').replace(',', '.')) : parseFloat(s.replace(/,/g, ''))
    return n > 0 ? n : undefined
  }
  // 1) Dados estruturados que a maioria das lojas publica
  let product: any
  document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    if (product) return
    try {
      const stack = [JSON.parse(s.textContent || '')]
      while (stack.length && !product) {
        const d = stack.pop()
        if (!d || typeof d !== 'object') continue
        if (Array.isArray(d)) stack.push(...d)
        else if (d['@type'] === 'Product' || (Array.isArray(d['@type']) && d['@type'].includes('Product'))) product = d
        else if (d['@graph']) stack.push(d['@graph'])
      }
    } catch {
      /* bloco inválido */
    }
  })
  const offer = product && [product.offers].flat().filter(Boolean)[0]
  const img = product && [product.image].flat()[0]
  // 2) O que aparece na tela, loja por loja
  const name =
    txt('#productTitle') || txt('h1.ui-pdp-title') || (product && product.name) || attr('meta[property="og:title"]', 'content') || txt('h1') || document.title
  const price =
    num(txt('#corePrice_feature_div .a-offscreen')) ||
    num(txt('#corePriceDisplay_desktop_feature_div .a-offscreen')) ||
    num(attr('.ui-pdp-price__second-line meta[itemprop="price"]', 'content')) ||
    num(attr('meta[itemprop="price"]', 'content')) ||
    num(offer && (offer.lowPrice || offer.price)) ||
    num(attr('meta[property="product:price:amount"]', 'content')) ||
    num(txt('[data-testid="price-value"]'))
  const image =
    attr('#landingImage', 'src') || attr('.ui-pdp-gallery__figure img', 'src') || (typeof img === 'string' ? img : img && img.url) || attr('meta[property="og:image"]', 'content')
  const canon = attr('link[rel="canonical"]', 'href') || location.href.split('#')[0]
  const data = { store, url: canon, name: String(name).slice(0, 200), price, image }
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
  window.open(app + '/salvar?d=' + encodeURIComponent(b64), '_blank')
}

/** Texto do favorito, apontando para o endereço atual do app */
export function bookmarkletHref(origin = window.location.origin): string {
  // O navegador decodifica %XX em links javascript:, então o % do código precisa ir escapado
  return `javascript:(${capture.toString()})(${JSON.stringify(origin)});void 0`.replace(/%/g, '%25')
}

const STORES: StoreName[] = ['Amazon', 'Mercado Livre', 'Shopee', 'Magazine Luiza', 'TikTok Shop']

/** Lê o produto enviado pelo botão (rota /salvar?d=...) e guarda até a pessoa estar logada */
export function stashCapturedFromUrl() {
  if (typeof window === 'undefined' || window.location.pathname !== '/salvar') return
  const d = new URLSearchParams(window.location.search).get('d')
  try {
    if (d) {
      const raw = JSON.parse(decodeURIComponent(escape(atob(d))))
      if (STORES.includes(raw.store) && typeof raw.url === 'string' && /^https?:\/\//.test(raw.url)) {
        const c: Captured = {
          store: raw.store,
          url: raw.url.slice(0, 1000),
          name: typeof raw.name === 'string' ? raw.name.slice(0, 200) : undefined,
          price: typeof raw.price === 'number' && raw.price > 0 && raw.price < 1e7 ? raw.price : undefined,
          image: typeof raw.image === 'string' && /^https:\/\//.test(raw.image) ? raw.image.slice(0, 1000) : undefined,
        }
        sessionStorage.setItem(KEY, JSON.stringify(c))
      }
    }
  } catch {
    /* link quebrado: ignora */
  }
  window.history.replaceState(null, '', '/')
}

export function peekCaptured(): Captured | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearCaptured() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignora */
  }
}
