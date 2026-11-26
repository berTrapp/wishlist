import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.tsx'
import { stashCapturedFromUrl } from './lib/bookmarklet'

// Produto enviado pelo botão "Salvar na WishList": guarda antes do login para não se perder
stashCapturedFromUrl()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
