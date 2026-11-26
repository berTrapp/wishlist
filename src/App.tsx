import { useEffect, useState } from 'react'
import { BrowserRouter, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { AddWishDialog } from './components/AddWishDialog'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Item } from './pages/Item'
import { WishProvider, useWishes } from './state/WishStore'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Shell() {
  const [adding, setAdding] = useState(false)
  const { addWish, resetDemo } = useWishes()
  const navigate = useNavigate()
  const open = () => setAdding(true)

  return (
    <>
      <ScrollManager />
      <Header onAdd={open} />
      <Routes>
        <Route path="/" element={<Home onAdd={open} />} />
        <Route path="/item/:id" element={<Item />} />
        <Route path="*" element={<Home onAdd={open} />} />
      </Routes>
      <footer className="foot small">
        <p>
          <b>Modo demonstração.</b> Preços, lojas e depósitos são exemplos salvos só neste navegador.
        </p>
        <button className="link-btn" onClick={resetDemo}>
          Restaurar exemplos
        </button>
      </footer>
      <AddWishDialog
        open={adding}
        onClose={() => setAdding(false)}
        onSubmit={(w) => {
          const id = addWish(w)
          setAdding(false)
          navigate(`/item/${id}`)
        }}
      />
    </>
  )
}

// Na prévia publicada como artifact não dá para usar o endereço do navegador; lá o roteador fica em memória.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

export default function App() {
  return (
    <WishProvider>
      <Router>
        <Shell />
      </Router>
    </WishProvider>
  )
}
