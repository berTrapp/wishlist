import { useEffect, useState } from 'react'
import { BrowserRouter, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { AddWishDialog } from './components/AddWishDialog'
import { Header } from './components/Header'
import { supabase } from './lib/supabase'
import { Home } from './pages/Home'
import { Item } from './pages/Item'
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
  const [adding, setAdding] = useState(false)
  const { mode, addWish, loadExamples, error, dismissError } = useWishes()
  const navigate = useNavigate()
  const open = () => setAdding(true)

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
      </footer>
      <AddWishDialog
        open={adding}
        onClose={() => setAdding(false)}
        onSubmit={async (w) => {
          try {
            const id = await addWish(w)
            setAdding(false)
            navigate(`/item/${id}`)
          } catch (e) {
            return e instanceof Error ? e.message : 'Não foi possível salvar o desejo.'
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
      <Gate />
    </Router>
  )
}
