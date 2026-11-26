import type { Wish } from '../../data/types'
import { bestPrice, brl, monthLabel, monthLabelFromIso, monthlyReserve, savedTotal } from '../../lib/finance'
import { useWidth } from '../../lib/hooks'
import { ProductModel } from '../../three/ProductModel'

interface Col {
  key: string
  label: string
  value: number
  kind: 'past' | 'future' | 'goal'
}

/** Colunas do dinheiro guardado: meses com depósito (sólidas) e meses simulados (tracejadas) até o preço */
function buildColumns(w: Wish, surplus: number): Col[] {
  const price = bestPrice(w)
  const byMonth = new Map<string, number>()
  for (const d of [...w.deposits].sort((a, b) => a.date.localeCompare(b.date))) {
    const k = d.date.slice(0, 7)
    byMonth.set(k, (byMonth.get(k) ?? 0) + d.amount)
  }
  const cols: Col[] = []
  let acc = 0
  for (const [k, v] of byMonth) {
    acc += v
    cols.push({ key: k, label: monthLabelFromIso(k + '-01'), value: Math.min(acc, price), kind: acc >= price ? 'goal' : 'past' })
  }
  if (acc >= price) return cols
  const per = monthlyReserve(w, surplus)
  const need = Math.ceil((price - acc) / per)
  const step = Math.ceil(need / 16)
  for (let m = step; m < need; m += step) cols.push({ key: 'f' + m, label: monthLabel(m), value: acc + m * per, kind: 'future' })
  cols.push({ key: 'goal', label: monthLabel(need), value: price, kind: 'goal' })
  return cols
}

export function PathChart({ wish, surplus }: { wish: Wish; surplus: number }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const price = bestPrice(wish)
  const cols = buildColumns(wish, surplus)
  const narrow = W < 480
  const H = narrow ? 320 : 400
  const P = { l: narrow ? 44 : 58, r: narrow ? 40 : 72, t: narrow ? 130 : 160, b: 30 }
  const iw = Math.max(1, W - P.l - P.r)
  const ih = H - P.t - P.b
  const y = (v: number) => P.t + ih * (1 - v / price)
  const slot = iw / cols.length
  const bw = Math.max(5, Math.min(38, slot * 0.62))
  const x = (i: number) => P.l + slot * i + slot / 2
  const raw = price / 5
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const stepV = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((v) => v >= raw) ?? raw
  const ticks: number[] = []
  for (let v = 0; v < price * 0.92; v += stepV) ticks.push(v)
  const labelEvery = Math.ceil(cols.length / (narrow ? 5 : 9))
  const size = narrow ? 130 : 170
  const peakX = x(cols.length - 1)
  const left = Math.min(Math.max(peakX - size / 2, 0), Math.max(0, W - size))
  const compact = (v: number) => (v >= 1000 ? (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : String(Math.round(v)))

  return (
    <div className="path" ref={ref} style={{ height: H }}>
      {W > 0 && (
        <>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Caminho até ${brl.format(price)}: ${savedTotal(wish) > 0 ? 'já guardado ' + brl.format(savedTotal(wish)) : 'começando agora'}`}>
            <defs>
              <linearGradient id="col-past" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="var(--data)" stopOpacity=".3" />
                <stop offset="1" stopColor="var(--data)" stopOpacity=".95" />
              </linearGradient>
              <linearGradient id="col-goal" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="var(--accent)" stopOpacity=".25" />
                <stop offset="1" stopColor="var(--accent)" />
              </linearGradient>
              <radialGradient id="col-glow">
                <stop offset="0" stopColor="var(--accent)" stopOpacity=".45" />
                <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
              </radialGradient>
            </defs>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={P.l} x2={W - P.r + 8} y1={y(v)} y2={y(v)} stroke="var(--line)" />
                <text x={P.l - 8} y={y(v) + 4} textAnchor="end" className="axis-text">
                  {compact(v)}
                </text>
              </g>
            ))}
            <line x1={P.l} x2={W - P.r + 8} y1={y(price)} y2={y(price)} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5 5" />
            {cols.map((c, i) => {
              const top = y(c.value)
              const h = P.t + ih - top
              const common = { x: x(i) - bw / 2, y: top, width: bw, height: h, rx: Math.min(8, bw / 3), style: { animationDelay: `${i * 45}ms` } }
              return (
                <g key={c.key}>
                  {c.kind === 'future' ? (
                    <rect {...common} className="path__col" fill="var(--data-soft)" stroke="var(--data)" strokeOpacity=".55" strokeDasharray="4 3" />
                  ) : (
                    <rect {...common} className="path__col" fill={`url(#${c.kind === 'goal' ? 'col-goal' : 'col-past'})`} />
                  )}
                  <title>
                    {c.label}: {brl.format(c.value)} {c.kind === 'future' ? '(simulado)' : ''}
                  </title>
                  {(i % labelEvery === 0 || i === cols.length - 1) && (
                    <text x={x(i)} y={H - 8} textAnchor="middle" className={`axis-text${c.kind === 'goal' ? ' axis-text--accent' : ''}`}>
                      {c.label}
                    </text>
                  )}
                </g>
              )
            })}
            <ellipse cx={peakX} cy={y(price) - 4} rx={Math.min(90, W * 0.14)} ry="18" fill="url(#col-glow)" />
          </svg>
          <div className="path__model" style={{ left, top: y(price) - size + 6, width: size, height: size }}>
            <ProductModel shape={wish.shape} status={wish.modelStatus} draggable label={`Modelo 3D: ${wish.short}. Arraste para girar.`} />
          </div>
          <span className="path__tag num" style={{ left: left - 4, top: y(price) - size * 0.45 }} hidden={left < 90}>
            {brl.format(price)}
          </span>
          <div className="path__legend small">
            <span>
              <i className="sw sw--past" />
              Guardado
            </span>
            <span>
              <i className="sw sw--future" />
              Simulado
            </span>
            <span>
              <i className="sw sw--goal" />
              Preço
            </span>
          </div>
        </>
      )}
    </div>
  )
}
