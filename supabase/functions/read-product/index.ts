// Lê nome, foto e preço de um produto a partir do link de uma das lojas suportadas.
// Usa os dados que a própria página publica (JSON-LD e meta tags) e, no Mercado Livre, a API de itens.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

type Store = 'Amazon' | 'Mercado Livre' | 'Shopee' | 'Magazine Luiza' | 'TikTok Shop'

interface Product {
  store: Store
  url: string
  name?: string
  image?: string
  price?: number
  currency?: string
  /** true quando faltou alguma informação e o usuário precisa completar */
  partial: boolean
}

const HOSTS: [RegExp, Store][] = [
  [/(^|\.)amazon\.com\.br$|(^|\.)amzn\.to$|(^|\.)a\.co$/, 'Amazon'],
  [/(^|\.)mercadoli(vre|bre)\.com(\.br)?$|(^|\.)mlb\.am$|(^|\.)meli\.la$/, 'Mercado Livre'],
  [/(^|\.)shopee\.com\.br$|(^|\.)shp\.ee$/, 'Shopee'],
  [/(^|\.)magazineluiza\.com\.br$|(^|\.)magalu\.com(\.br)?$|(^|\.)divulgador\.magalu\.com$/, 'Magazine Luiza'],
  [/(^|\.)tiktok\.com$/, 'TikTok Shop'],
]

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'

function storeOf(u: URL): Store | null {
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  for (const [re, s] of HOSTS) if (re.test(u.hostname.toLowerCase())) return s
  return null
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

/** Segue redirecionamentos só enquanto o destino continuar sendo uma das lojas (evita usar a função para buscar outros sites) */
async function fetchStorePage(start: URL): Promise<{ url: URL; html: string }> {
  let url = start
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9', Accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(12000),
    })
    const loc = res.headers.get('location')
    if (res.status >= 300 && res.status < 400 && loc) {
      await res.body?.cancel()
      const next = new URL(loc, url)
      if (!storeOf(next)) throw new Error('O link leva para fora das lojas suportadas.')
      url = next
      continue
    }
    if (!res.ok) throw new Error(`A loja respondeu ${res.status}.`)
    const html = (await res.text()).slice(0, 3_000_000)
    return { url, html }
  }
  throw new Error('Redirecionamentos demais.')
}

const num = (v: unknown): number | undefined => {
  if (typeof v === 'number' && v > 0) return v
  if (typeof v === 'string') {
    const s = v.trim()
    // aceita "1234.56", "1.234,56" e "1234,56"
    const n = /,\d{1,2}$/.test(s) ? parseFloat(s.replace(/\./g, '').replace(',', '.')) : parseFloat(s.replace(/,/g, ''))
    if (n > 0) return n
  }
}

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

function meta(html: string, key: string): string | undefined {
  const re = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${key}["'][^>]*>`, 'i')
  const tag = html.match(re)?.[0]
  const c = tag?.match(/content=["']([^"']*)["']/i)?.[1]
  return c ? decode(c) : undefined
}

/** Procura um objeto Product nos blocos JSON-LD da página */
function jsonLdProduct(html: string): Record<string, any> | undefined {
  const blocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const [, raw] of blocks) {
    let data: any
    try {
      data = JSON.parse(raw.trim())
    } catch {
      continue
    }
    const stack = [data]
    while (stack.length) {
      const d = stack.pop()
      if (!d || typeof d !== 'object') continue
      if (Array.isArray(d)) {
        stack.push(...d)
        continue
      }
      const t = d['@type']
      if (t === 'Product' || (Array.isArray(t) && t.includes('Product'))) return d
      if (d['@graph']) stack.push(d['@graph'])
    }
  }
}

function fromPage(html: string): Omit<Product, 'store' | 'url' | 'partial'> {
  const p = jsonLdProduct(html)
  let price: number | undefined
  let currency: string | undefined
  if (p) {
    const offers = [p.offers].flat().filter(Boolean)
    for (const o of offers) {
      price ??= num(o.lowPrice) ?? num(o.price) ?? num(o.priceSpecification?.price)
      currency ??= o.priceCurrency
    }
  }
  price ??= num(meta(html, 'product:price:amount')) ?? num(meta(html, 'og:price:amount')) ?? num(meta(html, 'price'))
  // Amazon não publica JSON-LD; o preço aparece neste campo escondido da página
  price ??= num(html.match(/class="a-offscreen">\s*R\$\s*([\d.,]+)/)?.[1])
  const image = [p?.image].flat()[0]
  return {
    name: (typeof p?.name === 'string' ? decode(p.name) : undefined) ?? meta(html, 'og:title') ?? (decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '') || undefined),
    image: (typeof image === 'string' ? image : image?.url) ?? meta(html, 'og:image'),
    price,
    currency: currency ?? meta(html, 'product:price:currency') ?? 'BRL',
  }
}

/** Mercado Livre: tenta a API de itens antes de ler a página */
async function mercadoLivre(u: URL) {
  const id = (u.pathname + u.search).match(/MLB-?(\d{6,})/i)?.[1]
  if (!id) return
  const token = Deno.env.get('ML_ACCESS_TOKEN')
  const res = await fetch(`https://api.mercadolibre.com/items/MLB${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(8000),
  }).catch(() => null)
  if (!res?.ok) return
  const it = await res.json()
  return { name: it.title, image: it.pictures?.[0]?.secure_url ?? it.thumbnail, price: num(it.price), currency: it.currency_id }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405)

  let url: URL
  try {
    const body = await req.json()
    url = new URL(String(body.url).trim())
  } catch {
    return json({ error: 'Link inválido.' }, 400)
  }
  const store = storeOf(url)
  if (!store) return json({ error: 'Por enquanto só links da Amazon, Mercado Livre, Shopee, Magalu e TikTok Shop.' }, 400)

  try {
    let data = store === 'Mercado Livre' ? await mercadoLivre(url) : undefined
    let finalUrl = url
    if (!data?.price) {
      const page = await fetchStorePage(url)
      finalUrl = page.url
      const fromHtml = fromPage(page.html)
      data = { ...fromHtml, ...Object.fromEntries(Object.entries(data ?? {}).filter(([, v]) => v)) }
      if (store === 'Mercado Livre' && !data.price) data = { ...data, ...((await mercadoLivre(finalUrl)) ?? {}) }
    }
    const out: Product = { store, url: finalUrl.toString(), ...data, partial: !(data.name && data.price) }
    return json(out)
  } catch (e) {
    return json({ store, url: url.toString(), partial: true, error: e instanceof Error ? e.message : 'Não foi possível ler a página.' }, 200)
  }
})
