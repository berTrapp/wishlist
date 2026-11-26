import { useEffect, useState } from 'react'
import { BrowserRouter, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { AddWishDialog } from './components/AddWishDialog'
import { Header } from './components/Header'
import { clearCaptured, peekCaptured, type Captured } from './lib/bookmarklet'
import { supabase } from './lib/supabase'
import { Bookmarklet } from './pages/Bookmarklet'
import { Home } from './pages/Home'
import { Item } from './pages/Item'
import { LegalLinks, Privacy, Terms } from './pages/Legal'
import { Login } from './pages/Login'
import { getDemoChoice, setDemoChoice, useSession } from './state/Auth'
import { WishProvider, useWishes } from './state/WishStore'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

interface ShellProps {
  email?: string
  onSignIn?: () => void
  onSignOut?: () => void
}

function Shell({ email, onSignIn, onSignOut }: ShellProps) {
  const [captured, setCaptured] = useState<Captured | null>(peekCaptured)
  const [adding, setAdding] = useState(captured !== null)
  const { mode, wishes, addWish, saveOffer, loadExamples, error, dismissError } = useWishes()
  const navigate = useNavigate()
  const open = () => setAdding(true)
  const close = () => {
    setAdding(false)
    setCaptured(null)
    clearCaptured()
  }

  return (
    <>
      <ScrollManager />
      <Header onAdd={open} email={email} onSignIn={onSignIn} onSignOut={onSignOut} />
      {error && (
        <div className="toast" role="alert">
          <span>{error}</span>
          <button className="icon-btn" onClick={dismissError} aria-label="Fechar aviso">
            ×
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home onAdd={open} />} />
        <Route path="/item/:id" element={<Item />} />
        <Route path="/botao" element={<Bookmarklet />} />
        <Route path="*" element={<Home onAdd={open} />} />
      </Routes>
      <footer className="foot small">
        {mode === 'demo' ? (
          <>
            <p>
              <b>Modo demonstração.</b> Preços, lojas e depósitos são exemplos salvos só neste navegador.
            </p>
            <button className="link-btn" onClick={loadExamples}>
              Restaurar exemplos
            </button>
          </>
        ) : (
          <p>Preços de exemplo até a busca automática nas lojas ficar pronta.</p>
        )}
        <LegalLinks />
      </footer>
      <AddWishDialog
        open={adding}
        captured={captured}
        wishes={wishes}
        onClose={close}
        onSubmit={async (w) => {
          try {
            const id = await addWish(w)
            close()
            navigate(`/item/${id}`)
          } catch (e) {
            return e instanceof Error ? e.message : 'Não foi possível salvar o desejo.'
          }
        }}
        onSubmitOffer={async (wishId, o) => {
          try {
            await saveOffer(wishId, o)
            close()
            navigate(`/item/${wishId}`)
          } catch (e) {
            return e instanceof Error ? e.message : 'Não foi possível salvar o preço.'
          }
        }}
      />
    </>
  )
}

/** Decide entre login, demonstração e a conta do usuário */
function Gate() {
  const session = useSession()
  const [demo, setDemo] = useState(getDemoChoice)

  if (!supabase) {
    return (
      <WishProvider mode="demo">
        <Shell />
      </WishProvider>
    )
  }
  if (session === undefined) return <div className="splash" aria-label="Carregando" />
  if (session) {
    return (
      <WishProvider key={session.user.id} mode="cloud" userId={session.user.id}>
        <Shell email={session.user.email} onSignOut={() => supabase?.auth.signOut()} />
      </WishProvider>
    )
  }
  if (demo) {
    return (
      <WishProvider mode="demo">
        <Shell
          onSignIn={() => {
            setDemoChoice(false)
            setDemo(false)
          }}
        />
      </WishProvider>
    )
  }
  return (
    <Login
      onDemo={() => {
        setDemoChoice(true)
        setDemo(true)
      }}
    />
  )
}

// Na prévia publicada como artifact não dá para usar o endereço do navegador; lá o roteador fica em memória.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Páginas públicas, abertas sem login (o Google exige para a tela de consentimento) */}
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="*" element={<Gate />} />
      </Routes>
    </Router>
  )
}
