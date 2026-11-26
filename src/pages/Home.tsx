import { useMemo, useState } from 'react'
import { Alerts } from '../components/Alerts'
import { MonthSummary } from '../components/MonthSummary'
import { NextGoal } from '../components/NextGoal'
import { Timeline } from '../components/Timeline'
import { AddCard, WishCard } from '../components/WishCard'
import type { Priority } from '../data/types'
import { bestPrice, monthsLeft, priceTrend } from '../lib/finance'
import { useWishes } from '../state/WishStore'

type Sort = 'near' | 'cheap' | 'drop'
const PRIOS: { v: Priority | 'all'; label: string }[] = [
  { v: 'all', label: 'Todas' },
  { v: 'alta', label: 'Alta' },
  { v: 'media', label: 'Média' },
  { v: 'baixa', label: 'Baixa' },
]

export function Home({ onAdd }: { onAdd: () => void }) {
  const { wishes, profile, setSurplus } = useWishes()
  const surplus = profile.monthlySurplus
  const [prio, setPrio] = useState<Priority | 'all'>('all')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<Sort>('near')

  const categories = useMemo(() => [...new Set(wishes.map((w) => w.category))].sort(), [wishes])
  const next = useMemo(() => [...wishes].sort((a, b) => monthsLeft(a, surplus) - monthsLeft(b, surplus))[0], [wishes, surplus])

  const shown = wishes
    .filter((w) => (prio === 'all' || w.priority === prio) && (cat === 'all' || w.category === cat))
    .sort((a, b) =>
      sort === 'near' ? monthsLeft(a, surplus) - monthsLeft(b, surplus) : sort === 'cheap' ? bestPrice(a) - bestPrice(b) : priceTrend(a) - priceTrend(b),
    )

  return (
    <main className="page">
      <Timeline wishes={wishes} surplus={surplus} />

      <div className="home-top">
        <MonthSummary surplus={surplus} wishes={wishes} onSurplus={setSurplus} />
        <NextGoal wish={next} surplus={surplus} />
      </div>

      <section aria-labelledby="list-title" className="list">
        <div className="filters">
          <h2 id="list-title">Seus desejos</h2>
          <div className="filters__controls">
            <div className="seg" role="group" aria-label="Filtrar por prioridade">
              {PRIOS.map((p) => (
                <button key={p.v} aria-pressed={prio === p.v} onClick={() => setPrio(p.v)}>
                  {p.label}
                </button>
              ))}
            </div>
            <label className="select">
              <span className="sr-only">Categoria</span>
              <select value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="all">Todas as categorias</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="select">
              <span className="sr-only">Ordenar</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="near">Mais perto de comprar</option>
                <option value="cheap">Mais barato</option>
                <option value="drop">Maior queda de preço</option>
              </select>
            </label>
          </div>
        </div>
        <div className="grid">
          {shown.map((w) => (
            <WishCard key={w.id} wish={w} surplus={surplus} />
          ))}
          <AddCard onAdd={onAdd} />
        </div>
      </section>

      <Alerts wishes={wishes} />
    </main>
  )
}
