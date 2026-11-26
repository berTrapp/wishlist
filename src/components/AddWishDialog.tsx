import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { Priority, StoreName, Wish } from '../data/types'
import type { Captured } from '../lib/bookmarklet'
import { brl2 } from '../lib/finance'

const STORES: StoreName[] = ['Amazon', 'Mercado Livre', 'Shopee', 'Magazine Luiza', 'TikTok Shop']

export interface NewWishInput {
  name: string
  category: string
  priority: Priority
  store: StoreName
  price: number
  url?: string
  imageUrl?: string
}

interface Props {
  open: boolean
  onClose: () => void
  /** Produto que veio pelo botão "Salvar na WishList" */
  captured?: Captured | null
  wishes: Wish[]
  onSubmit: (w: NewWishInput) => Promise<string | void>
  onSubmitOffer: (wishId: string, o: { store: StoreName; url: string; price: number }) => Promise<string | void>
}

const parsePrice = (v: string) => parseFloat(v.replace(/[^\d.,]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'))
const fmt = (n?: number) => (n ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')

export function AddWishDialog({ open, onClose, captured, wishes, onSubmit, onSubmitOffer }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [target, setTarget] = useState('new')

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  // Novo produto capturado: começa como desejo novo
  useEffect(() => {
    setTarget('new')
    setError('')
  }, [captured])

  const toExisting = target !== 'new'

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-labelledby="add-title">
      <form
        key={captured?.url ?? 'manual'}
        method="dialog"
        className="dialog__form"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const f = new FormData(form)
          const name = String(f.get('name') || '').trim()
          const price = parsePrice(String(f.get('price') || ''))
          const store = f.get('store') as StoreName
          if (!toExisting && !name) return setError('Dê um nome ao desejo.')
          if (!(price > 0)) return setError('Informe o preço, por exemplo 2.199,90.')
          setError('')
          setBusy(true)
          const err = toExisting
            ? await onSubmitOffer(target, { store, url: captured?.url ?? '', price })
            : await onSubmit({
                name,
                category: String(f.get('category') || ''),
                priority: f.get('priority') as Priority,
                store,
                price,
                url: captured?.url,
                imageUrl: captured?.image,
              })
          setBusy(false)
          if (err) return setError(err)
          form.reset()
        }}
      >
        <header className="dialog__head">
          <h2 id="add-title">{captured ? 'Salvar produto' : 'Novo desejo'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        {captured ? (
          <div className="captured">
            {captured.image ? <img src={captured.image} alt="" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /> : <span className="captured__noimg" aria-hidden="true" />}
            <div>
              <span className="chip chip--data">{captured.store}</span>
              <p className="captured__name">{captured.name || 'Produto sem nome'}</p>
              <b className="num">{captured.price ? brl2.format(captured.price) : 'Preço não encontrado, preencha abaixo'}</b>
            </div>
          </div>
        ) : (
          <p className="muted small dialog__tip">
            Dica: com o{' '}
            <Link to="/botao" onClick={onClose}>
              botão Salvar na WishList
            </Link>{' '}
            você adiciona um produto direto da página da loja, com nome, foto e preço.
          </p>
        )}

        {captured && wishes.length > 0 && (
          <label className="field">
            <span>Salvar em</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="new">Um desejo novo</option>
              <optgroup label="Comparar com um desejo da lista">
                {wishes.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        )}

        {!toExisting && (
          <>
            <label className="field">
              <span>Nome</span>
              <input name="name" defaultValue={captured?.name} placeholder="Ex.: Monitor 27 polegadas 4K" autoComplete="off" required />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Categoria</span>
                <input name="category" placeholder="Ex.: Setup" />
              </label>
              <label className="field">
                <span>Prioridade</span>
                <select name="priority" defaultValue="media">
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </label>
            </div>
          </>
        )}
        <div className="field-row">
          <label className="field">
            <span>Loja</span>
            <select name="store" defaultValue={captured?.store ?? 'Mercado Livre'}>
              {STORES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Preço (R$)</span>
            <input name="price" inputMode="decimal" defaultValue={fmt(captured?.price)} placeholder="2.199,90" />
          </label>
        </div>
        {toExisting && <p className="muted small">O preço desta loja entra na comparação do desejo e no histórico.</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {!toExisting && <p className="muted small">O modelo 3D é gerado em segundo plano e aparece quando ficar pronto.</p>}
        <footer className="dialog__foot">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent" disabled={busy}>
            {busy ? 'Salvando…' : toExisting ? 'Salvar preço' : 'Adicionar e simular'}
          </button>
        </footer>
      </form>
    </dialog>
  )
}
