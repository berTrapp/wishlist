import type { Wish } from '../../data/types'
import { bestOffer, brl, monthLabel } from '../../lib/finance'
import { useWidth } from '../../lib/hooks'

const STORE_COLORS: Record<string, string> = {
  Amazon: '#ffc65c',
  'Mercado Livre': '#4fd8c4',
  Shopee: '#ff7eb6',
  'Magazine Luiza': '#a99bff',
  'TikTok Shop': '#ff6a3d',
}

/** Preço de cada loja nos últimos meses, com o menor preço marcado */
export function PriceHistory({ wish }: { wish: Wish }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const H = 200
  const P = { l: 68, r: 30, t: 14, b: 26 }
  const series = wish.offers.filter((o) => o.history.length > 1)
  const n = Math.max(...series.map((o) => o.history.length), 2)
  const all = series.flatMap((o) => o.history)
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const pad = (hi - lo) * 0.15 || hi * 0.05
  const y0 = lo - pad
  const y1 = hi + pad
  const x = (i: number) => P.l + ((W - P.l - P.r) * i) / (n - 1)
  const y = (v: number) => P.t + (H - P.t - P.b) * (1 - (v - y0) / (y1 - y0))
  const best = bestOffer(wish)

  if (series.length === 0) return <p className="muted">O histórico aparece depois das primeiras leituras de preço.</p>

  return (
    <div>
      <div ref={ref} className="history">
        {W > 0 && (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Histórico de preço por loja nos últimos ${n} meses`}>
            {[y0 + (y1 - y0) * 0.2, y0 + (y1 - y0) * 0.5, y0 + (y1 - y0) * 0.8].map((v) => (
              <g key={v}>
                <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
                <text x={P.l - 8} y={y(v) + 4} textAnchor="end" className="axis-text">
                  {brl.format(v)}
                </text>
              </g>
            ))}
            {Array.from({ length: n }, (_, i) => (
              <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="axis-text">
                {monthLabel(i - (n - 1))}
              </text>
            ))}
            {series.map((o) => {
              const c = STORE_COLORS[o.store] ?? 'var(--muted)'
              const off = n - o.history.length
              const pts = o.history.map((v, i) => `${x(i + off)},${y(v)}`).join(' ')
              const lastV = o.history[o.history.length - 1]
              return (
                <g key={o.store} opacity={o === best ? 1 : 0.75}>
                  <polyline points={pts} fill="none" stroke={c} strokeWidth={o === best ? 2.4 : 1.6} strokeLinejoin="round" />
                  <circle cx={x(n - 1)} cy={y(lastV)} r={o === best ? 4.5 : 3} fill={c} />
                </g>
              )
            })}
          </svg>
        )}
      </div>
      <ul className="history__legend small">
        {series.map((o) => (
          <li key={o.store}>
            <i style={{ background: STORE_COLORS[o.store] }} />
            {o.store}
            {o === best && <b className="ok"> menor agora</b>}
          </li>
        ))}
      </ul>
    </div>
  )
}
