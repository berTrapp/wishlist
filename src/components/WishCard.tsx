import { useRef, useState } from 'react'
import { Link } from 'react-router'
import type { Wish } from '../data/types'
import { bestOffer, bestPrice, brl, monthLabel, monthsLeft, pct, priceTrend, progress } from '../lib/finance'
import { prefersReducedMotion } from '../lib/hooks'
import { ProductModel } from '../three/ProductModel'

const PRIO = { alta: 'alta', media: 'média', baixa: 'baixa' } as const

export function WishCard({ wish, surplus }: { wish: Wish; surplus: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [hover, setHover] = useState(false)
  const m = monthsLeft(wish, surplus)
  const trend = priceTrend(wish)
  const prog = progress(wish)

  const onMove = (e: React.PointerEvent) => {
    if (prefersReducedMotion() || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`)
    ref.current.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`)
  }
  const onLeave = () => {
    setHover(false)
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }

  return (
    <Link
      ref={ref}
      to={`/item/${wish.id}`}
      className="card"
      onPointerEnter={() => setHover(true)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="card__stage">
        <ProductModel shape={wish.shape} status={wish.modelStatus} spin="hover" hovered={hover} className="card__model" />
        <span className={`chip chip--${wish.priority}`}>{PRIO[wish.priority]}</span>
        {trend <= -0.05 && <span className="chip chip--drop">{pct(trend)}</span>}
      </div>
      <div className="card__body">
        <p className="eyebrow">{wish.category}</p>
        <h3>{wish.name}</h3>
        <p className="card__price">
          <b className="num">{brl.format(bestPrice(wish))}</b>
          <span className="muted small">no {bestOffer(wish).store}</span>
        </p>
        <div className="progress progress--thin" aria-hidden="true">
          <span style={{ width: `${prog * 100}%` }} />
        </div>
        <p className="card__foot small">
          <span className="num">{pct(prog)} guardado</span>
          <span className={m === 0 ? 'ok' : 'muted'}>{m === 0 ? 'Pronto para comprar' : `${monthLabel(m)} · ${m} ${m === 1 ? 'mês' : 'meses'}`}</span>
        </p>
      </div>
    </Link>
  )
}

export function AddCard({ onAdd }: { onAdd: () => void }) {
  return (
    <button className="card card--add" onClick={onAdd}>
      <span className="card--add__plus" aria-hidden="true">
        +
      </span>
      <b>Novo desejo</b>
      <span className="muted small">Cole o link do produto ou preencha à mão</span>
    </button>
  )
}
