import { useEffect, useRef, useState } from 'react'
import type { Priority, StoreName } from '../data/types'

const STORES: StoreName[] = ['Amazon', 'Mercado Livre', 'Shopee', 'Magazine Luiza', 'TikTok Shop']

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (w: { name: string; category: string; priority: Priority; store: StoreName; price: number }) => Promise<string | void>
}

export function AddWishDialog({ open, onClose, onSubmit }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-labelledby="add-title">
      <form
        method="dialog"
        className="dialog__form"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const f = new FormData(form)
          const name = String(f.get('name') || '').trim()
          const price = parseFloat(String(f.get('price') || '').replace(/\./g, '').replace(',', '.'))
          if (!name) return setError('Dê um nome ao desejo.')
          if (!(price > 0)) return setError('Informe o preço, por exemplo 2.199,90.')
          setError('')
          setBusy(true)
          const err = await onSubmit({
            name,
            category: String(f.get('category') || ''),
            priority: f.get('priority') as Priority,
            store: f.get('store') as StoreName,
            price,
          })
          setBusy(false)
          if (err) return setError(err)
          form.reset()
        }}
      >
        <header className="dialog__head">
          <h2 id="add-title">Novo desejo</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        <label className="field">
          <span>Link do produto</span>
          <input name="url" type="url" placeholder="https://..." disabled aria-describedby="url-hint" />
          <small id="url-hint" className="muted">
            A busca automática pelo link chega na fase de preços. Por enquanto, preencha à mão.
          </small>
        </label>
        <label className="field">
          <span>Nome</span>
          <input name="name" placeholder="Ex.: Monitor 27 polegadas 4K" autoComplete="off" required />
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
        <div className="field-row">
          <label className="field">
            <span>Loja</span>
            <select name="store" defaultValue="Mercado Livre">
              {STORES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Preço (R$)</span>
            <input name="price" inputMode="decimal" placeholder="2.199,90" />
          </label>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="muted small">O modelo 3D é gerado em segundo plano e aparece quando ficar pronto.</p>
        <footer className="dialog__foot">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent" disabled={busy}>
            {busy ? 'Salvando…' : 'Adicionar e simular'}
          </button>
        </footer>
      </form>
    </dialog>
  )
}
