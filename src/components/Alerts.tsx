import { Link } from 'react-router'
import type { Wish } from '../data/types'
import { brl, pixTotal } from '../lib/finance'

interface Alert {
  wish: Wish
  store: string
  from: number
  to: number
  kind: 'drop' | 'low'
}

/** Gera alertas a partir do histórico: queda de 3% ou mais no último mês, ou menor preço em 6 meses */
function buildAlerts(wishes: Wish[]): Alert[] {
  const out: Alert[] = []
  for (const w of wishes)
    for (const o of w.offers) {
      const h = o.history
      if (h.length < 2) continue
      const last = h[h.length - 1]
      const prev = h[h.length - 2]
      if (last <= prev * 0.97) out.push({ wish: w, store: o.store, from: prev + o.shipping, to: pixTotal(o), kind: 'drop' })
      else if (last <= Math.min(...h.slice(0, -1)) && last < prev) out.push({ wish: w, store: o.store, from: prev, to: last, kind: 'low' })
    }
  return out.sort((a, b) => (b.from - b.to) / b.from - (a.from - a.to) / a.from).slice(0, 4)
}

export function Alerts({ wishes }: { wishes: Wish[] }) {
  const alerts = buildAlerts(wishes)
  return (
    <section className="panel alerts" id="alertas" aria-labelledby="alerts-title">
      <div className="panel__head">
        <h2 id="alerts-title">Alertas de preço</h2>
        <span className="muted small">Último mês</span>
      </div>
      {alerts.length === 0 ? (
        <p className="muted">Nenhuma queda de preço no último mês.</p>
      ) : (
        <ul className="alerts__list">
          {alerts.map((a) => {
            const drop = (a.from - a.to) / a.from
            return (
              <li key={a.wish.id + a.store}>
                <span className="alerts__icon" aria-hidden="true">
                  ↓
                </span>
                <span className="alerts__text">
                  <Link to={`/item/${a.wish.id}`}>{a.wish.short}</Link> {a.kind === 'drop' ? 'caiu' : 'chegou ao menor preço'} no {a.store}
                  <span className="muted small"> {brl.format(a.from)} → {brl.format(a.to)}</span>
                </span>
                <b className="num ok">−{Math.round(drop * 100)}%</b>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
