import { Link } from 'react-router'
import type { Wish } from '../data/types'
import { bestPrice, brl, monthLabel, monthsLeft } from '../lib/finance'
import { useWidth } from '../lib/hooks'
import { colorFor } from '../lib/palette'
import { ProductModel } from '../three/ProductModel'

/**
 * Linha do tempo de compras: um relevo de montanhas em que cada pico é um desejo,
 * posicionado no mês em que ele fica ao alcance e com altura proporcional ao preço.
 */
export function Timeline({ wishes, surplus }: { wishes: Wish[]; surplus: number }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const narrow = W < 560
  const H = narrow ? 230 : 290
  const pad = { l: 24, r: narrow ? 40 : 56, b: 34 }
  const model = narrow ? 70 : 96
  const base = H - pad.b

  const items = wishes
    .map((w, i) => ({ w, i, m: monthsLeft(w, surplus), price: bestPrice(w) }))
    .sort((a, b) => a.m - b.m)
  const maxM = Math.max(4, ...items.map((x) => x.m)) + 1
  const maxPrice = Math.max(...items.map((x) => x.price), 1)
  const iw = Math.max(1, W - pad.l - pad.r)
  const x = (m: number) => pad.l + iw * ((m + 0.5) / maxM)
  const peakMax = base - model - 26
  const h = (price: number) => peakMax * (0.38 + 0.62 * (price / maxPrice))
  const sigma = Math.max(28, iw / (maxM * 1.4))

  // Desejos no mesmo mês ficam lado a lado no mesmo vale, sem se sobrepor
  const sameMonth = (m: number) => items.filter((it) => it.m === m)
  const peaks = items.map((it) => {
    const group = sameMonth(it.m)
    const k = group.indexOf(it)
    const spread = Math.min(model * 0.95, iw / Math.max(1, items.length))
    const px = Math.min(W - pad.r, Math.max(pad.l, x(it.m) + (k - (group.length - 1) / 2) * spread))
    return { ...it, px, ph: h(it.price) }
  })
  const yAt = (xx: number) => base - Math.max(0, ...peaks.map((p) => p.ph * Math.exp(-(((xx - p.px) / sigma) ** 2))))

  let d = `M0 ${base}`
  for (let xx = 0; xx <= W; xx += 4) d += ` L${xx} ${yAt(xx).toFixed(1)}`
  d += ` L${W} ${base} Z`

  const tickEvery = Math.ceil(maxM / (narrow ? 4 : 8))
  const ticks = Array.from({ length: maxM }, (_, m) => m).filter((m) => m % tickEvery === 0)

  return (
    <section className="panel timeline" id="linha-do-tempo" aria-labelledby="tl-title">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Linha do tempo de compras</p>
          <h2 id="tl-title">Quando cada desejo fica ao seu alcance</h2>
        </div>
        <p className="muted small">Altura do pico = preço. Toque num produto para abrir.</p>
      </div>
      <div className="timeline__stage" ref={ref} style={{ height: H }}>
        {W > 0 && (
          <>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              <defs>
                <linearGradient id="tl-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--data)" stopOpacity=".34" />
                  <stop offset="1" stopColor="var(--data)" stopOpacity=".02" />
                </linearGradient>
              </defs>
              {ticks.map((m) => (
                <g key={m}>
                  <line x1={x(m)} x2={x(m)} y1={base} y2={base + 5} stroke="var(--line)" />
                  <text x={x(m)} y={H - 10} textAnchor="middle" className="axis-text">
                    {m === 0 ? 'agora' : monthLabel(m)}
                  </text>
                </g>
              ))}
              <line x1="0" x2={W} y1={base} y2={base} stroke="var(--line)" />
              <path d={d} fill="url(#tl-fill)" stroke="var(--data)" strokeWidth="1.6" className="timeline__ridge" />
              {peaks.map((p) => (
                <circle key={p.w.id} cx={p.px} cy={base - p.ph} r="4" fill={colorFor(p.i)} className="timeline__dot" />
              ))}
            </svg>
            {peaks.map((p, k) => (
              <Link
                key={p.w.id}
                to={`/item/${p.w.id}`}
                className="timeline__peak"
                style={{ left: p.px - model / 2, top: base - p.ph - model - 6, width: model, animationDelay: `${k * 140}ms` }}
                aria-label={`${p.w.name}: ${brl.format(p.price)}, ${p.m === 0 ? 'pronto agora' : 'em ' + monthLabel(p.m)}`}
              >
                <span className="timeline__model" style={{ width: model, height: model }}>
                  <ProductModel shape={p.w.shape} status={p.w.modelStatus} spin="hover" />
                </span>
                <span className="timeline__tag num" style={{ borderColor: colorFor(p.i) }}>
                  {brl.format(p.price)}
                </span>
              </Link>
            ))}
          </>
        )}
      </div>
    </section>
  )
}
