import { Link } from 'react-router'
import type { Wish } from '../data/types'
import { bestPrice, brl, monthLabel, monthsLeft, progress, savedTotal } from '../lib/finance'
import { useCountUp } from '../lib/hooks'
import { ProductModel } from '../three/ProductModel'

export function NextGoal({ wish, surplus }: { wish: Wish | undefined; surplus: number }) {
  const p = useCountUp(wish ? progress(wish) * 100 : 0, 1200)
  if (!wish) {
    return (
      <section className="panel goal goal--empty">
        <p className="eyebrow">Próxima conquista</p>
        <p>Adicione um desejo para ver quando ele fica ao seu alcance.</p>
      </section>
    )
  }
  const m = monthsLeft(wish, surplus)
  const ready = m === 0
  return (
    <section className={`panel goal${ready ? ' goal--ready' : ''}`} aria-labelledby="goal-title">
      <ProductModel shape={wish.shape} status={wish.modelStatus} className="goal__model" label={`Modelo 3D: ${wish.short}`} />
      <div className="goal__body">
        <p className="eyebrow" id="goal-title">
          Próxima conquista
        </p>
        <h2>
          <Link to={`/item/${wish.id}`}>{wish.name}</Link>
        </h2>
        <div className="progress" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100} aria-label="Quanto já foi guardado">
          <span style={{ width: `${p}%` }} />
        </div>
        <p className="goal__meta">
          <b className="num">{brl.format(savedTotal(wish))}</b> de <span className="num">{brl.format(bestPrice(wish))}</span>
          <span className="dot-sep" />
          {ready ? <b className="ok">Pronto para comprar</b> : <>em {monthLabel(m)}</>}
        </p>
      </div>
    </section>
  )
}
