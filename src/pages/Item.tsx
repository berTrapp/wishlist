import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PathChart } from '../components/item/PathChart'
import { PriceHistory } from '../components/item/PriceHistory'
import {
  CARD_INTEREST,
  bestOffer,
  bestPrice,
  brl,
  brl2,
  cardTotal,
  installment,
  loadOf,
  monthLabel,
  monthlyReserve,
  monthsLeft,
  pct,
  pixTotal,
  progress,
  savedTotal,
} from '../lib/finance'
import { useCountUp } from '../lib/hooks'
import { useWishes } from '../state/WishStore'

export function Item() {
  const { id } = useParams()
  const { wishes, profile, setReserve, addDeposit } = useWishes()
  const wish = wishes.find((w) => w.id === id)
  const surplus = profile.monthlySurplus
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositValue, setDepositValue] = useState('')
  const animPrice = useCountUp(wish ? bestPrice(wish) : 0)

  if (!wish) {
    return (
      <main className="page">
        <section className="panel">
          <h1>Desejo não encontrado</h1>
          <p className="muted">Ele pode ter sido removido.</p>
          <Link to="/" className="btn">
            Voltar para a lista
          </Link>
        </section>
      </main>
    )
  }

  const price = bestPrice(wish)
  const best = bestOffer(wish)
  const saved = savedTotal(wish)
  const m = monthsLeft(wish, surplus)
  const per = monthlyReserve(wish, surplus)
  const weight = price / surplus
  const sorted = [...wish.offers].sort((a, b) => pixTotal(a) - pixTotal(b))
  const maxTotal = pixTotal(sorted[sorted.length - 1])
  const all = wish.offers.map(pixTotal)

  // Cenário: esperar uma promoção de 10%
  const promoMonths = Math.max(0, Math.ceil((price * 0.9 - saved) / per))

  const payments = [
    { label: 'Pix à vista', sub: 'com desconto', n: 1, total: pixTotal(best) },
    { label: 'Cartão à vista', sub: '1x', n: 1, total: cardTotal(best) },
    ...(best.interestFreeInstallments > 1
      ? [{ label: `${best.interestFreeInstallments}x sem juros`, sub: 'no cartão', n: best.interestFreeInstallments, total: cardTotal(best) }]
      : []),
    ...(best.interestFreeInstallments < 12
      ? [{ label: '12x com juros', sub: '1,99% ao mês', n: 12, total: installment(cardTotal(best), 12, CARD_INTEREST) * 12 }]
      : []),
  ]

  return (
    <main className="page page--item">
      <nav className="crumbs small" aria-label="Você está em">
        <Link to="/">Lista</Link>
        <span aria-hidden="true">/</span>
        <span>{wish.category}</span>
        <span aria-hidden="true">/</span>
        <b>{wish.short}</b>
      </nav>

      <div className="item-top">
        <section className="panel item-chart" aria-labelledby="path-title">
          <div className="panel__head">
            <div>
              <p className="eyebrow">Caminho até o produto</p>
              <h1 id="path-title">{m === 0 ? 'Pronto para comprar' : m === 1 ? 'Dá para comprar no próximo mês' : `Faltam ${m} meses`}</h1>
              <p className="muted small">
                Guardando {brl.format(per)} por mês ({wish.reservePct}% da sobra){m > 0 ? `, você chega em ${brl.format(price)} em ${monthLabel(m)}.` : '.'}
              </p>
            </div>
          </div>
          <PathChart wish={wish} surplus={surplus} />
        </section>

        <aside className="panel item-summary" aria-live="polite">
          <div>
            <p className="eyebrow">{wish.category}</p>
            <h2>{wish.name}</h2>
            {wish.modelStatus !== 'ready' && <p className="pill-status">Modelo 3D sendo gerado. Ele aparece aqui quando ficar pronto.</p>}
          </div>
          <div className="big">
            <span className="eyebrow">Menor preço total</span>
            <span className="big__val num">{brl.format(animPrice)}</span>
            <span className="muted small">
              {best.store}, no Pix{best.shipping ? ', com frete' : ', frete grátis'}
            </span>
          </div>
          <div className="ratio">
            <div className="ratio__head">
              <span className="eyebrow">Peso na sobra do mês</span>
              <b className="num">{pct(weight)}</b>
            </div>
            <div className="ratio__bar">
              <span style={{ width: `${Math.min(100, weight * 100)}%` }} />
            </div>
            <small className="muted">
              {weight >= 1
                ? `Custa ${weight.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} vezes a sua sobra do mês.`
                : `Cabe em uma sobra só e ainda restam ${brl.format(surplus - price)}.`}
            </small>
          </div>
          <dl className="kv">
            <dt>Já guardado</dt>
            <dd className="num">
              {brl.format(saved)} <span className="muted">({pct(progress(wish))})</span>
            </dd>
            <dt>Pronto para comprar em</dt>
            <dd className="num">{m === 0 ? 'agora' : monthLabel(m)}</dd>
            <dt>Diferença entre lojas</dt>
            <dd className="num">{brl.format(Math.max(...all) - Math.min(...all))}</dd>
          </dl>
          {depositOpen ? (
            <form
              className="deposit"
              onSubmit={(e) => {
                e.preventDefault()
                const v = parseFloat(depositValue.replace(/\./g, '').replace(',', '.'))
                if (v > 0) {
                  addDeposit(wish.id, v)
                  setDepositValue('')
                  setDepositOpen(false)
                }
              }}
            >
              <label htmlFor="deposit">Quanto você guardou?</label>
              <div className="deposit__row">
                <span className="muted">R$</span>
                <input id="deposit" inputMode="decimal" autoFocus value={depositValue} onChange={(e) => setDepositValue(e.target.value)} placeholder="200" />
                <button className="btn btn--accent" type="submit">
                  Registrar
                </button>
                <button className="btn" type="button" onClick={() => setDepositOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button className="btn btn--data btn--block" onClick={() => setDepositOpen(true)}>
              Registrar dinheiro guardado
            </button>
          )}
        </aside>
      </div>

      <section className="panel sim" aria-labelledby="sim-title">
        <div className="panel__head">
          <h2 id="sim-title">Simulador</h2>
          <span className="muted small">Mexa e veja a data mudar</span>
        </div>
        <div className="sim__grid">
          <label className="sim__control" htmlFor="reserve">
            <span>Guardar por mês</span>
            <input id="reserve" type="range" min={5} max={100} step={5} value={wish.reservePct} onChange={(e) => setReserve(wish.id, +e.target.value)} />
            <span className="num sim__value">
              {wish.reservePct}% · {brl.format(per)}
            </span>
          </label>
          <div className="sim__card">
            <span className="eyebrow">No ritmo atual</span>
            <b className="num">{m === 0 ? 'agora' : monthLabel(m)}</b>
          </div>
          <div className="sim__card">
            <span className="eyebrow">Se cair 10% numa promoção</span>
            <b className="num">{promoMonths === 0 ? 'agora' : monthLabel(promoMonths)}</b>
            {promoMonths < m && <small className="ok">{m - promoMonths} {m - promoMonths === 1 ? 'mês' : 'meses'} antes</small>}
          </div>
        </div>
      </section>

      <div className="duo">
        <section className="panel" aria-labelledby="stores-title">
          <div className="panel__head">
            <h2 id="stores-title">Preço por loja</h2>
            <span className="muted small">Total com frete, no Pix</span>
          </div>
          <ul className="stores">
            {sorted.map((o) => {
              const t = pixTotal(o)
              const isBest = o === best
              return (
                <li key={o.store} className={`store${isBest ? ' store--best' : ''}`}>
                  <div className="store__name">
                    {o.store}
                    {isBest && <span className="chip chip--data">Menor preço</span>}
                  </div>
                  <div className="store__price num">{brl.format(t)}</div>
                  <div className="store__meta small">
                    <span>Cartão {brl.format(o.card)}</span>
                    <span>Pix {brl.format(o.pix)}</span>
                    <span>{o.shipping ? `Frete ${brl2.format(o.shipping)}` : 'Frete grátis'}</span>
                    <span>Até {o.interestFreeInstallments}x sem juros</span>
                    {!isBest && <span className="bad">+{brl.format(t - pixTotal(best))}</span>}
                  </div>
                  <div className="store__bar">
                    <span style={{ width: `${((t / maxTotal) * 100).toFixed(1)}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="muted small">Preços de exemplo, atualizados em {best.updatedAt.split('-').reverse().join('/')}.</p>
        </section>

        <section className="panel" aria-labelledby="pay-title">
          <div className="panel__head">
            <h2 id="pay-title">Formas de pagamento</h2>
            <span className="muted small">Em {best.store}</span>
          </div>
          <div className="table-scroll">
            <table className="pay">
              <thead>
                <tr>
                  <th>Opção</th>
                  <th>Por mês</th>
                  <th className="pay__total">Total</th>
                  <th>Da sobra</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const parcel = p.total / p.n
                  const share = parcel / surplus
                  return (
                    <tr key={p.label}>
                      <td>
                        {p.label}
                        <small>{p.sub}</small>
                      </td>
                      <td className="num">
                        {p.n > 1 ? `${p.n}x ` : ''}
                        {brl2.format(parcel)}
                      </td>
                      <td className="num pay__total">{brl.format(p.total)}</td>
                      <td className="num">
                        <span className={`load load--${loadOf(share)}`}>
                          <i />
                          {pct(share)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="muted small">Verde: a parcela cabe em até 30% da sobra. Amarela: até 60%. Vermelha: acima disso.</p>
        </section>
      </div>

      <div className="duo">
        <section className="panel" aria-labelledby="hist-title">
          <div className="panel__head">
            <h2 id="hist-title">Histórico de preço</h2>
            <span className="muted small">Últimos meses</span>
          </div>
          <PriceHistory wish={wish} />
        </section>
        <section className="panel" aria-labelledby="notes-title">
          <div className="panel__head">
            <h2 id="notes-title">Notas</h2>
          </div>
          <p>{wish.notes || 'Sem notas ainda.'}</p>
          {wish.deposits.length > 0 && (
            <>
              <h3 className="eyebrow deposits-title">Depósitos</h3>
              <ul className="deposits small">
                {[...wish.deposits].reverse().map((d) => (
                  <li key={d.id}>
                    <span>{d.date.split('-').reverse().join('/')}</span>
                    <b className="num">{brl.format(d.amount)}</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
