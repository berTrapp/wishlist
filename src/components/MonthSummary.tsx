import { useEffect, useState } from 'react'
import type { Wish } from '../data/types'
import { bestPrice, brl, monthlyReserve, savedTotal } from '../lib/finance'
import { useCountUp } from '../lib/hooks'
import { colorFor } from '../lib/palette'

interface Props {
  surplus: number
  wishes: Wish[]
  onSurplus: (v: number) => void
}

export function MonthSummary({ surplus, wishes, onSurplus }: Props) {
  const [draft, setDraft] = useState(surplus.toLocaleString('pt-BR'))
  useEffect(() => setDraft(surplus.toLocaleString('pt-BR')), [surplus])

  const reserved = wishes.reduce((s, w) => s + monthlyReserve(w, surplus), 0)
  const reservedPct = wishes.reduce((s, w) => s + w.reservePct, 0)
  const listTotal = wishes.reduce((s, w) => s + bestPrice(w), 0)
  const saved = wishes.reduce((s, w) => s + savedTotal(w), 0)
  const animTotal = useCountUp(listTotal)
  const animSaved = useCountUp(saved)

  // Rosca: uma fatia por desejo + o que sobra livre
  const R = 52
  const C = 2 * Math.PI * R
  let acc = 0
  const slices = wishes.map((w, i) => {
    const frac = Math.min(w.reservePct, Math.max(0, 100 - acc)) / 100
    const s = { id: w.id, color: colorFor(i), len: frac * C, off: (acc / 100) * C, name: w.short, pct: w.reservePct }
    acc += w.reservePct
    return s
  })

  return (
    <section className="panel month" aria-labelledby="month-title">
      <div className="month__head">
        <div>
          <p className="eyebrow" id="month-title">
            Seu mês
          </p>
          <label className="money-field" htmlFor="surplus">
            <span className="money-field__label">Sobra do mês</span>
            <span className="money-field__row">
              <span className="money-field__cur">R$</span>
              <input
                id="surplus"
                inputMode="numeric"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  const v = parseInt(e.target.value.replace(/\D/g, ''), 10)
                  if (v >= 50) onSurplus(Math.min(v, 9_999_999))
                }}
                onBlur={() => setDraft(surplus.toLocaleString('pt-BR'))}
              />
            </span>
          </label>
        </div>
        <div className="donut" aria-label={`${reservedPct}% da sobra reservada para desejos`} role="img">
          <svg viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="16" />
            {slices.map((s) => (
              <circle
                key={s.id}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${Math.max(0, s.len - 2)} ${C}`}
                strokeDashoffset={-s.off}
                transform="rotate(-90 70 70)"
                className="donut__slice"
              >
                <title>
                  {s.name}: {s.pct}%
                </title>
              </circle>
            ))}
          </svg>
          <span className="donut__center">
            <b className="num">{Math.min(reservedPct, 999)}%</b>
            <small>reservado</small>
          </span>
        </div>
      </div>

      <ul className="month__legend">
        {slices.map((s) => (
          <li key={s.id}>
            <i style={{ background: s.color }} />
            {s.name}
            <span className="num">{s.pct}%</span>
          </li>
        ))}
        <li>
          <i style={{ background: 'var(--surface-2)' }} />
          Livre
          <span className="num">{Math.max(0, 100 - reservedPct)}%</span>
        </li>
      </ul>
      {reservedPct > 100 && <p className="warn">As reservas passam de 100% da sobra. Diminua o % de algum desejo.</p>}

      <dl className="kv">
        <dt>Guardando por mês</dt>
        <dd className="num">{brl.format(reserved)}</dd>
        <dt>Já guardado</dt>
        <dd className="num">{brl.format(animSaved)}</dd>
        <dt>Lista inteira</dt>
        <dd className="num">{brl.format(animTotal)}</dd>
      </dl>
    </section>
  )
}
