import { useEffect, useRef, useState } from 'react'
import { LogoMark } from '../components/Logo'
import { bookmarkletHref } from '../lib/bookmarklet'

/** Página que ensina a instalar o botão "Salvar na WishList" na barra de favoritos */
export function Bookmarklet() {
  const link = useRef<HTMLAnchorElement>(null)
  const [copied, setCopied] = useState(false)
  const code = bookmarkletHref()

  // O React bloqueia links "javascript:" no href; o favorito precisa dele, então entra direto no elemento
  useEffect(() => {
    link.current?.setAttribute('href', code)
  }, [code])

  return (
    <main className="page bm">
      <section className="panel bm__hero">
        <p className="eyebrow">Salvar direto da loja</p>
        <h1>Botão Salvar na WishList</h1>
        <p className="muted">
          Na página de um produto da Amazon, Mercado Livre, Shopee, Magalu ou TikTok Shop, um clique nele traz nome, foto e preço para a sua lista. Se o
          produto já estiver na lista, ele entra na comparação de preços.
        </p>
        <div className="bm__drag">
          <a ref={link} className="bm__button" onClick={(e) => e.preventDefault()} draggable>
            <LogoMark size={22} />
            <span>Salvar</span>
          </a>
          <span className="muted small">⟵ arraste este botão para a barra de favoritos</span>
        </div>
      </section>

      <div className="duo">
        <section className="panel">
          <h2>No computador</h2>
          <ol className="bm__steps">
            <li>Mostre a barra de favoritos: Ctrl+Shift+B (no Mac, Cmd+Shift+B).</li>
            <li>Arraste o botão acima para a barra.</li>
            <li>Abra um produto numa das lojas e clique em <b>Salvar</b>.</li>
          </ol>
        </section>
        <section className="panel">
          <h2>No celular</h2>
          <ol className="bm__steps">
            <li>Copie o código do botão.</li>
            <li>Salve qualquer página nos favoritos, edite o favorito e cole o código no lugar do endereço. Dê o nome de Salvar.</li>
            <li>Na página do produto, digite Salvar na barra de endereço e toque no favorito.</li>
          </ol>
          <button
            className="btn btn--data"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code)
                setCopied(true)
                setTimeout(() => setCopied(false), 2500)
              } catch {
                /* sem permissão de área de transferência */
              }
            }}
          >
            {copied ? 'Copiado' : 'Copiar código do botão'}
          </button>
        </section>
      </div>
      <p className="muted small">
        A leitura acontece no seu navegador, com a página que você está vendo. Nada é enviado para outro lugar além da sua WishList.
      </p>
    </main>
  )
}
